import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

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

  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      payment: "Paid",
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

      return NextResponse.json({
        received: true,
        eventType: event.type,
        result,
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
