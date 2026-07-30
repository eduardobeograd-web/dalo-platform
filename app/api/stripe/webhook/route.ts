import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { fulfillOrderMockById } from "@/lib/mock-fulfillment";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";
import { trackCustomerEvent } from "@/lib/customer-events";
import { sendRefundConfirmationEmail } from "@/lib/refund-confirmation-email";

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
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;

  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id,
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
      paidAt: order.paidAt || new Date(),
      fulfillment:
        order.fulfillment === "pending_manual" || order.fulfillment === "Waiting"
          ? "pending_manual"
          : order.fulfillment,
      esimStatus: order.esimStatus || "pending",
    },
  });

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

  const wasDelivered =
    order.fulfillment === "Delivered" || order.esimStatus === "ready";

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
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await markOrderPaid(session);

      let fulfillmentResult = null;

      if (
        result.updated &&
        result.orderId &&
        process.env.DALO_AUTO_MOCK_FULFILLMENT === "true"
      ) {
        fulfillmentResult = await fulfillOrderMockById(result.orderId);
      }

      const emailResult =
        result.updated && result.orderId
          ? await sendOrderConfirmationEmail(result.orderId)
          : null;

      return NextResponse.json({
        received: true,
        eventType: event.type,
        result,
        fulfillmentResult,
        emailResult,
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

    if (event.type === "payment_intent.payment_failed") {
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
      const emailResult = "orderId" in result && result.orderId
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
