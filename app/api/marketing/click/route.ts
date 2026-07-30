import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { trackCustomerEvent } from "../../../../lib/customer-events";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const campaign = url.searchParams.get("campaign") || "unknown";
  const sourceEventId = url.searchParams.get("sourceEventId") || "";
  const productId = url.searchParams.get("productId") || "";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const redirectUrl = productId
    ? `${baseUrl}/checkout?productId=${encodeURIComponent(
        productId
      )}&marketingCampaign=${encodeURIComponent(
        campaign
      )}&marketingSourceEventId=${encodeURIComponent(sourceEventId)}`
    : `${baseUrl}/?marketingCampaign=${encodeURIComponent(
        campaign
      )}&marketingSourceEventId=${encodeURIComponent(sourceEventId)}`;

  try {
    const sourceEvent = sourceEventId
      ? await prisma.customerEvent.findUnique({
          where: {
            id: sourceEventId,
          },
        })
      : null;

    await trackCustomerEvent({
      customerId: sourceEvent?.customerId ?? null,
      sessionId: sourceEvent?.sessionId ?? null,
      productId: productId || sourceEvent?.productId || null,
      eventType: "marketing_email_clicked",
      metadata: {
        source: "email_click_redirect",
        campaign,
        sourceEventId: sourceEventId || null,
        productId: productId || sourceEvent?.productId || null,
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("Marketing click tracking failed:", error);
  }

  return NextResponse.redirect(redirectUrl);
}
