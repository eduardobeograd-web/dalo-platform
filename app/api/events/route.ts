import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
  "abandoned_checkout_email_sent",
  "product_interest_email_sent",
]);

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();

  if (!email || !email.includes("@") || !email.includes(".")) {
    return null;
  }

  return email;
}

function getMetadataEmail(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>).customerEmail;

  return normalizeEmail(value);
}

async function findKnownCustomerFromSession(sessionId?: string | null) {
  if (!sessionId) {
    return null;
  }

  const recentSessionEvents = await prisma.customerEvent.findMany({
    where: {
      sessionId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      customer: true,
    },
  });

  for (const event of recentSessionEvents) {
    if (event.customer) {
      return {
        customerId: event.customer.id,
        email: event.customer.email,
      };
    }

    const metadataEmail = getMetadataEmail(event.metadata);

    if (metadataEmail) {
      const customer = await prisma.customer.upsert({
        where: {
          email: metadataEmail,
        },
        update: {
          active: true,
        },
        create: {
          email: metadataEmail,
          active: true,
        },
      });

      return {
        customerId: customer.id,
        email: customer.email,
      };
    }
  }

  return null;
}

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

    const metadataEmail = getMetadataEmail(metadata);
    let enrichedCustomerId = customerId ?? null;
    let knownCustomerEmail: string | null = null;

    if (metadataEmail) {
      const customer = await prisma.customer.upsert({
        where: {
          email: metadataEmail,
        },
        update: {
          active: true,
        },
        create: {
          email: metadataEmail,
          active: true,
        },
      });

      enrichedCustomerId = customer.id;
      knownCustomerEmail = customer.email;
    }

    if (!enrichedCustomerId && sessionId) {
      const knownCustomer = await findKnownCustomerFromSession(sessionId);

      if (knownCustomer) {
        enrichedCustomerId = knownCustomer.customerId;
        knownCustomerEmail = knownCustomer.email;
      }
    }

    const enrichedMetadata =
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? {
            ...metadata,
            ...(knownCustomerEmail
              ? {
                  knownCustomerEmail,
                  customerRecognizedBySession: true,
                }
              : {}),
          }
        : knownCustomerEmail
          ? {
              knownCustomerEmail,
              customerRecognizedBySession: true,
            }
          : metadata ?? null;

    const event = await trackCustomerEvent({
      customerId: enrichedCustomerId,
      orderId: orderId ?? null,
      productId: productId ?? null,
      sessionId: sessionId ?? null,
      eventType,
      metadata: enrichedMetadata,
    });

    return NextResponse.json({
      success: true,
      eventId: event?.id ?? null,
      customerId: enrichedCustomerId,
      knownCustomerEmail,
    });
  } catch (error) {
    console.error("Event API error:", error);

    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}
