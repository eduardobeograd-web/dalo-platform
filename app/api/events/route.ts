import { NextResponse } from "next/server";
import { trackCustomerEvent } from "@/lib/customer-events";

const allowedEvents = new Set([
  "product_view",
  "category_view",
  "search",
  "add_to_cart",
  "checkout_started",
  "checkout_email_entered",
  "payment_success",
  "payment_failed",
  "purchase_completed",
  "registration",
  "login",
  "password_reset",
  "esim_delivered",
  "esim_installed",
  "esim_activated",
  "esim_expiring",
  "esim_expired",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerId,
      orderId,
      productId,
      sessionId,
      eventType,
      metadata,
    } = body;

    if (!eventType || typeof eventType !== "string") {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    if (!allowedEvents.has(eventType)) {
      return NextResponse.json(
        { error: "Invalid eventType" },
        { status: 400 }
      );
    }

    const event = await trackCustomerEvent({
      customerId: customerId ?? null,
      orderId: orderId ?? null,
      productId: productId ?? null,
      sessionId: sessionId ?? null,
      eventType,
      metadata: metadata ?? null,
    });

    return NextResponse.json({
      success: true,
      eventId: event?.id ?? null,
    });
  } catch (error) {
    console.error("Event API error:", error);

    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
