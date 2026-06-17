import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { sendEmail } from "../../../../lib/email";
import { trackCustomerEvent } from "../../../../lib/customer-events";
import {
  abandonedCheckoutHtml,
  abandonedCheckoutSubject,
} from "../../../../lib/email-templates/abandoned-checkout";

function getMetadataValue(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];

  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = String(body.eventId || "");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    const emailEvent = await prisma.customerEvent.findUnique({
      where: {
        id: eventId,
      },
      include: {
        product: true,
      },
    });

    if (!emailEvent) {
      return NextResponse.json(
        { success: false, error: "Checkout email event not found" },
        { status: 404 }
      );
    }

    if (emailEvent.eventType !== "checkout_email_entered") {
      return NextResponse.json(
        { success: false, error: "Event is not checkout_email_entered" },
        { status: 400 }
      );
    }

    const customerEmail = getMetadataValue(
      emailEvent.metadata,
      "customerEmail"
    );

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: "customerEmail is missing in metadata" },
        { status: 400 }
      );
    }

    const existingPurchase = emailEvent.sessionId
      ? await prisma.customerEvent.findFirst({
          where: {
            eventType: "purchase_completed",
            sessionId: emailEvent.sessionId,
            createdAt: {
              gte: emailEvent.createdAt,
            },
          },
        })
      : null;

    if (existingPurchase) {
      return NextResponse.json(
        {
          success: false,
          error: "This checkout is no longer abandoned. Purchase already exists.",
        },
        { status: 400 }
      );
    }

    const alreadySent = await prisma.customerEvent.findFirst({
      where: {
        eventType: "abandoned_checkout_email_sent",
        sessionId: emailEvent.sessionId,
        productId: emailEvent.productId,
        createdAt: {
          gte: emailEvent.createdAt,
        },
      },
    });

    if (alreadySent) {
      return NextResponse.json(
        {
          success: false,
          error: "Reminder email was already sent for this checkout.",
        },
        { status: 400 }
      );
    }

    const destination =
      getMetadataValue(emailEvent.metadata, "destination") ||
      emailEvent.product?.country ||
      "your trip";

    const productName =
      getMetadataValue(emailEvent.metadata, "productName") ||
      emailEvent.product?.name ||
      "Your DALO eSIM";

    const rawPrice =
      getMetadataValue(emailEvent.metadata, "price") ||
      String(emailEvent.product?.sellPrice || "");

    const price = rawPrice.startsWith("€") ? rawPrice : `€${rawPrice}`;

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const directCheckoutUrl = emailEvent.productId
      ? `${baseUrl}/checkout?productId=${emailEvent.productId}`
      : `${baseUrl}/`;

    const checkoutUrl = emailEvent.productId
      ? `${baseUrl}/api/marketing/click?campaign=abandoned_checkout&sourceEventId=${emailEvent.id}&productId=${emailEvent.productId}`
      : directCheckoutUrl;

    const result = await sendEmail({
      to: customerEmail,
      subject: abandonedCheckoutSubject(destination),
      html: abandonedCheckoutHtml({
        customerEmail,
        productName,
        destination,
        price,
        checkoutUrl,
      }),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    await trackCustomerEvent({
      sessionId: emailEvent.sessionId,
      productId: emailEvent.productId,
      eventType: "abandoned_checkout_email_sent",
      metadata: {
        source: "admin_manual_send",
        originalEventId: emailEvent.id,
        customerEmail,
        destination,
        productName,
        price,
        checkoutUrl,
        resendResult: result.data || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Abandoned checkout reminder sent.",
    });
  } catch (error) {
    console.error("Manual abandoned checkout email failed:", error);

    return NextResponse.json(
      { success: false, error: "Failed to send reminder email" },
      { status: 500 }
    );
  }
}
