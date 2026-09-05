import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { fulfillOrderMockById } from "@/lib/mock-fulfillment";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";
import { sendInternalOrderNotification } from "@/lib/internal-order-notification";
import { sendPaymentConfirmationEmail } from "@/lib/payment-confirmation-email";
import { trackCustomerEvent } from "@/lib/customer-events";
import { sendRefundConfirmationEmail } from "@/lib/refund-confirmation-email";
import { addMonths } from "@/lib/esim-lifecycle";
import { wasOrderEsimDelivered } from "@/lib/order-delivery";
import { getEsimGoReadiness } from "@/lib/providers/esim-go/config";
import { fulfillPaidOrderWithEsimGo } from "@/lib/providers/esim-go/fulfillment";
import { getCheckoutCustomerEmailKind } from "@/lib/checkout-email-routing";
import { paymentMatchesOrder, automaticPurchaseAllowed } from "@/lib/purchase-safety";

export const runtime = "nodejs";

async function markOrderPaid(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId || null;
  const stripeSessionId = session.id;
  const paymentStatus = session.payment_status;

  if (!orderId) {
    console.warn("Stripe webhook checkout.session.completed without orderId", {
      stripeSessionId,
    });

    return {
      updated: false,
      reason: "missing_order_id",
    };
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    console.warn("Stripe webhook order not found", {
      orderId,
      stripeSessionId,
    });

    return {
      updated: false,
      reason: "order_not_found",
    };
  }

  if (paymentStatus !== "paid") {
    console.warn("Stripe webhook session completed but payment not paid", {
      orderId,
      stripeSessionId,
      paymentStatus,
    });

    return {
      updated: false,
      reason: "payment_not_paid",
    };
  }

  const stripePaymentIntentId =
    // Only a matching signed payment can advance this order.
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const paidAt = order.paidAt || new Date();
  if (!paymentMatchesOrder(order, session)) {
    throw new Error("Stripe payment does not match the stored order, session, amount or currency.");
  }
  const updateResult = await prisma.order.updateMany({
    where: {
      id: order.id,
      payment: {
        in: ["Pending", "Failed"],
      },
    },
    data: {
      payment: "Paid",
      amount:
        order.amount ??
        (typeof session.amount_total === "number"
          ? session.amount_total / 100
          : null),
      currency: order.currency || session.currency?.toUpperCase() || "USD",
      stripeSessionId: order.stripeSessionId || session.id,
      stripePaymentIntentId:
        order.stripePaymentIntentId || stripePaymentIntentId,
      paidAt,
      activationDeadlineAt:
        order.activationDeadlineAt || addMonths(paidAt, 6),
      fulfillment:
        order.fulfillment === "pending_manual" || order.fulfillment === "Waiting"
          ? "pending_manual"
          : order.fulfillment,
      esimStatus: order.esimStatus || "pending",
    },
  });

  if (updateResult.count !== 1) {
    return {
      updated: false,
      reason: "order_already_finalized",
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  }

  const updatedOrder = await prisma.order.findUnique({
    where: { id: order.id },
  });

  if (!updatedOrder) {
    return {
      updated: false,
      reason: "order_not_found_after_update",
    };
  }

  return {
    updated: true,
    orderId: updatedOrder.id,
    orderNumber: updatedOrder.orderNumber,
  };
}

async function markCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId || null;

  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId } })
    : await prisma.order.findFirst({
        where: { stripeSessionId: session.id },
      });

  if (!order) {
    return { updated: false, reason: "order_not_found" };
  }

  if (order.payment !== "Pending") {
    return { updated: false, reason: "order_not_pending" };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      payment: "Expired",
      fulfillment: "Cancelled",
      esimStatus: "cancelled",
    },
  });

  return { updated: true, orderId: order.id, orderNumber: order.orderNumber };
}

async function markPaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.orderId || null;

  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId } })
    : await prisma.order.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

  if (!order) {
    return { updated: false, reason: "order_not_found" };
  }

  if (order.payment === "Paid" || order.payment === "Refunded") {
    return { updated: false, reason: "order_already_finalized" };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      payment: "Failed",
      fulfillment: "Cancelled",
      esimStatus: "failed",
      stripePaymentIntentId:
        order.stripePaymentIntentId || paymentIntent.id,
    },
  });

  return { updated: true, orderId: order.id, orderNumber: order.orderNumber };
}

async function markOrderRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id || null;

  if (!paymentIntentId) {
    return { updated: false, reason: "missing_payment_intent" };
  }

  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!order) {
    return { updated: false, reason: "order_not_found" };
  }

  const fullyRefunded =
    charge.refunded || charge.amount_refunded >= charge.amount;
  const payment = fullyRefunded ? "Refunded" : "Partially Refunded";

  if (order.payment === payment) {
    return {
      updated: false,
      reason: "already_recorded",
      orderId: order.id,
      orderNumber: order.orderNumber,
      payment,
    };
  }

  const wasDelivered = wasOrderEsimDelivered(order);

  await prisma.order.update({
    where: { id: order.id },
    data: {
      payment,
      ...(!wasDelivered && fullyRefunded
        ? {
            fulfillment: "Cancelled",
            esimStatus: "cancelled",
          }
        : {}),
    },
  });

  await trackCustomerEvent({
    customerId: order.customerId,
    orderId: order.id,
    productId: order.productId,
    eventType: fullyRefunded ? "payment_refunded" : "payment_partially_refunded",
    metadata: {
      stripeChargeId: charge.id,
      stripePaymentIntentId: paymentIntentId,
      amountRefunded: charge.amount_refunded / 100,
      currency: charge.currency.toUpperCase(),
    },
  });

  return {
    updated: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    payment,
  };
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");

    return NextResponse.json(
      {
        error: "Stripe webhook is not configured",
      },
      {
        status: 500,
      }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        error: "Missing stripe-signature header",
      },
      {
        status: 400,
      }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      {
        error: "Invalid signature",
      },
      {
        status: 400,
      }
    );
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await markOrderPaid(session);

      if (result.updated && result.orderId) {
        const paidOrder = await prisma.order.findUnique({
          where: { id: result.orderId },
        });

        if (paidOrder) {
          await trackCustomerEvent({
            customerId: paidOrder.customerId,
            orderId: paidOrder.id,
            productId: paidOrder.productId,
            sessionId: session.metadata?.daloSessionId || null,
            eventType: "purchase_completed",
            metadata: {
              source: "stripe_webhook",
              stripeCheckoutSessionId: session.id,
              orderNumber: paidOrder.orderNumber,
              amount: paidOrder.amount,
              currency: paidOrder.currency,
            },
          });
        }
      }

      let fulfillmentResult:
        | Awaited<ReturnType<typeof fulfillPaidOrderWithEsimGo>>
        | Awaited<ReturnType<typeof fulfillOrderMockById>>
        | { fulfilled: false; reason: string }
        | null = null;

      const esimGoReadiness = getEsimGoReadiness();

      if (
        result.orderId &&
        esimGoReadiness.automaticFulfillmentEnabled &&
        automaticPurchaseAllowed(session.livemode, result.orderId, process.env.ESIM_GO_TEST_ORDER_IDS)
      ) {
        try {
          fulfillmentResult = await fulfillPaidOrderWithEsimGo(result.orderId);
        } catch (error) {
          console.error("eSIM Go fulfillment could not start", {
            orderId: result.orderId,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          fulfillmentResult = {
            fulfilled: false,
            reason: "live_fulfillment_preflight_failed",
          };
        }
      } else if (
        result.updated &&
        result.orderId &&
        process.env.DALO_AUTO_MOCK_FULFILLMENT === "true"
      ) {
        fulfillmentResult = await fulfillOrderMockById(result.orderId);
      }

      const deliveryOrder = result.orderId
        ? await prisma.order.findUnique({ where: { id: result.orderId } })
        : null;
      const customerEmailKind = getCheckoutCustomerEmailKind(deliveryOrder);
      const emailResult = customerEmailKind === "order_confirmation" && deliveryOrder
        ? await sendOrderConfirmationEmail(deliveryOrder.id)
        : null;
      const paymentEmailResult = customerEmailKind === "payment_confirmation" && result.orderId
        ? await sendPaymentConfirmationEmail(result.orderId)
        : null;
      const internalEmailResult = customerEmailKind === "order_confirmation" && deliveryOrder
        ? await sendInternalOrderNotification(deliveryOrder.id)
        : null;

      return NextResponse.json({
        received: true,
        eventType: event.type,
        result,
        paymentEmailResult,
        fulfillmentResult,
        emailResult,
        internalEmailResult,
      });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await markCheckoutExpired(session);

      return NextResponse.json({
        received: true,
        eventType: event.type,
        result,
      });
    }

    if (
      event.type === "payment_intent.payment_failed" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      if (event.type === "checkout.session.async_payment_failed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const result = await markCheckoutExpired(session);

        return NextResponse.json({
          received: true,
          eventType: event.type,
          result,
        });
      }

      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const result = await markPaymentFailed(paymentIntent);

      return NextResponse.json({
        received: true,
        eventType: event.type,
        result,
      });
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const result = await markOrderRefunded(charge);
      const emailResult = result.updated && "orderId" in result && result.orderId
        ? await sendRefundConfirmationEmail({
            orderId: result.orderId,
            amountRefunded: charge.amount_refunded / 100,
          })
        : null;

      return NextResponse.json({
        received: true,
        eventType: event.type,
        result,
        emailResult,
      });
    }

    return NextResponse.json({
      received: true,
      eventType: event.type,
      ignored: true,
    });
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);

    return NextResponse.json(
      {
        error: "Webhook handler failed",
      },
      {
        status: 500,
      }
    );
  }
}
