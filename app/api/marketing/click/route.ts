import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { trackCustomerEvent } from "../../../../lib/customer-events";

type SourceEvent = {
  customerId: string | null;
  sessionId: string | null;
  productId: string | null;
  product: { providerProductId: string } | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const campaign = url.searchParams.get("campaign") || "unknown";
  const sourceEventId = url.searchParams.get("sourceEventId") || "";
  const productId = url.searchParams.get("productId") || "";
  const suppliedProviderProductId =
    url.searchParams.get("providerProductId") || "";
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let sourceEvent: SourceEvent | null = null;

  try {
    sourceEvent = sourceEventId
      ? await prisma.customerEvent.findUnique({
          where: { id: sourceEventId },
          select: {
            customerId: true,
            sessionId: true,
            productId: true,
            product: {
              select: { providerProductId: true },
            },
          },
        })
      : null;
  } catch (error) {
    console.error("Marketing source lookup failed:", error);
  }

  const resolvedProductId = productId || sourceEvent?.productId || "";
  const providerProductId =
    suppliedProviderProductId || sourceEvent?.product?.providerProductId || "";

  const checkoutParams = new URLSearchParams({
    marketingCampaign: campaign,
    marketingSourceEventId: sourceEventId,
  });

  if (resolvedProductId) checkoutParams.set("productId", resolvedProductId);
  if (providerProductId) {
    checkoutParams.set("providerProductId", providerProductId);
  }

  const redirectUrl = resolvedProductId
    ? `${baseUrl}/checkout?${checkoutParams.toString()}`
    : `${baseUrl}/?${checkoutParams.toString()}`;

  try {
    await trackCustomerEvent({
      customerId: sourceEvent?.customerId ?? null,
      sessionId: sourceEvent?.sessionId ?? null,
      productId: resolvedProductId || null,
      eventType: "marketing_email_clicked",
      metadata: {
        source: "email_click_redirect",
        campaign,
        sourceEventId: sourceEventId || null,
        productId: resolvedProductId || null,
        providerProductId: providerProductId || null,
        redirectUrl,
      },
    });
  } catch (error) {
    console.error("Marketing click tracking failed:", error);
  }

  return NextResponse.redirect(redirectUrl);
}
