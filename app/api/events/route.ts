import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { trackCustomerEvent } from "@/lib/customer-events";
import { allowSecurityAttempt } from "@/lib/security-rate-limit";
import {
  CONSENT_COOKIE_NAME,
  getEventConsentCategory,
  parseConsentValue,
} from "@/lib/consent";

const allowedPublicEvents = new Set([
  "product_view",
  "category_view",
  "search",
  "add_to_cart",
  "checkout_started",
  "checkout_email_entered",
  "marketing_email_clicked",
]);

function cleanIdentifier(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 128) : null;
}

function cleanMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const serialized = JSON.stringify(value);
  if (serialized.length > 8_000) return null;

  const metadata = { ...(value as Record<string, unknown>) };
  delete metadata.customerEmail;
  delete metadata.email;
  delete metadata.customerId;
  delete metadata.orderId;
  delete metadata.stripeSessionId;
  delete metadata.stripePaymentIntentId;

  return metadata;
}

export async function POST(request: Request) {
  try {
    if (
      !(await allowSecurityAttempt({
        scope: "public-events",
        headers: request.headers,
        ipLimit: 120,
        windowMinutes: 10,
      }))
    ) {
      return NextResponse.json(
        { error: "Too many events" },
        { status: 429 },
      );
    }

    const body = await request.json();

    const {
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

    if (!allowedPublicEvents.has(eventType)) {
      return NextResponse.json(
        { error: "Invalid eventType" },
        { status: 400 }
      );
    }

    const consentCategory = getEventConsentCategory(eventType);

    if (consentCategory !== "necessary") {
      const cookieStore = await cookies();
      const consent = parseConsentValue(
        cookieStore.get(CONSENT_COOKIE_NAME)?.value
      );

      if (!consent?.[consentCategory]) {
        return NextResponse.json(
          {
            success: false,
            skipped: true,
            reason: "consent_required",
          },
          { status: 202 }
        );
      }
    }

    const event = await trackCustomerEvent({
      customerId: null,
      orderId: null,
      productId: cleanIdentifier(productId),
      sessionId: cleanIdentifier(sessionId),
      eventType,
      metadata: cleanMetadata(metadata),
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
