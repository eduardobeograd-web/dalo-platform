import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { sendEmail } from "../../../../lib/email";
import { trackCustomerEvent } from "../../../../lib/customer-events";
import {
  productInterestHtml,
  productInterestSubject,
} from "../../../../lib/email-templates/product-interest";
import { ADMIN_PERMISSIONS } from "../../../../lib/admin-permissions";
import { requireAdminPermission } from "../../../../lib/admin-auth";

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
    await requireAdminPermission(ADMIN_PERMISSIONS.EVENTS_WRITE);
    const body = await request.json();
    const eventId = String(body.eventId || "");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    const productViewEvent = await prisma.customerEvent.findUnique({
      where: {
        id: eventId,
      },
      include: {
        customer: true,
        product: true,
      },
    });

    if (!productViewEvent) {
      return NextResponse.json(
        { success: false, error: "Product view event not found" },
        { status: 404 }
      );
    }

    if (productViewEvent.eventType !== "product_view") {
      return NextResponse.json(
        { success: false, error: "Event is not product_view" },
        { status: 400 }
      );
    }

    const customerEmail =
      productViewEvent.customer?.email ||
      getMetadataValue(productViewEvent.metadata, "knownCustomerEmail") ||
      getMetadataValue(productViewEvent.metadata, "customerEmail");

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: "No known customer email for this product view" },
        { status: 400 }
      );
    }

    const consentCustomer = productViewEvent.customer ||
      await prisma.customer.findUnique({ where: { email: customerEmail } });

    if (!consentCustomer?.marketingEmailConsent) {
      return NextResponse.json(
        {
          success: false,
          error: "This customer has not consented to marketing emails.",
        },
        { status: 403 },
      );
    }

    const existingPurchase = await prisma.customerEvent.findFirst({
      where: {
        eventType: "purchase_completed",
        productId: productViewEvent.productId,
        sessionId: productViewEvent.sessionId,
        createdAt: {
          gte: productViewEvent.createdAt,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        {
          success: false,
          error: "This product view already converted to a purchase.",
        },
        { status: 400 }
      );
    }

    const alreadySent = await prisma.customerEvent.findFirst({
      where: {
        eventType: "product_interest_email_sent",
        productId: productViewEvent.productId,
        sessionId: productViewEvent.sessionId,
        createdAt: {
          gte: productViewEvent.createdAt,
        },
      },
    });

    if (alreadySent) {
      return NextResponse.json(
        {
          success: false,
          error: "Product interest email was already sent for this view.",
        },
        { status: 400 }
      );
    }

    const destination =
      getMetadataValue(productViewEvent.metadata, "destination") ||
      productViewEvent.product?.country ||
      "your trip";

    const productName =
      getMetadataValue(productViewEvent.metadata, "productName") ||
      productViewEvent.product?.name ||
      "Your DALO eSIM";

    const rawPrice =
      getMetadataValue(productViewEvent.metadata, "price") ||
      String(productViewEvent.product?.sellPrice || "");

    const price = rawPrice.startsWith("$") ? rawPrice : `$${rawPrice}`;

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const directCheckoutUrl = productViewEvent.productId
      ? `${baseUrl}/checkout?productId=${productViewEvent.productId}`
      : `${baseUrl}/`;

    const checkoutUrl = productViewEvent.productId
      ? `${baseUrl}/api/marketing/click?campaign=product_interest&sourceEventId=${productViewEvent.id}&productId=${productViewEvent.productId}`
      : directCheckoutUrl;

    const result = await sendEmail({
      to: customerEmail,
      subject: productInterestSubject(destination),
      html: productInterestHtml({
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
      customerId: productViewEvent.customerId,
      sessionId: productViewEvent.sessionId,
      productId: productViewEvent.productId,
      eventType: "product_interest_email_sent",
      metadata: {
        source: "admin_manual_send",
        originalEventId: productViewEvent.id,
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
      message: "Product interest email sent.",
    });
  } catch (error) {
    console.error("Manual product interest email failed:", error);

    return NextResponse.json(
      { success: false, error: "Failed to send product interest email" },
      { status: 500 }
    );
  }
}
