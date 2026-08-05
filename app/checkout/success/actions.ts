"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";

const MARKETING_CONSENT_VERSION = "2026-08-05";

export async function enablePostPurchaseMarketing(formData: FormData) {
  const stripeSessionId = String(formData.get("stripeSessionId") || "").trim();

  if (!stripeSessionId.startsWith("cs_")) {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId },
    select: { customerId: true, payment: true },
  });

  if (!order?.customerId || order.payment !== "Paid") {
    redirect(`/checkout/success?session_id=${encodeURIComponent(stripeSessionId)}`);
  }

  await prisma.customer.update({
    where: { id: order.customerId },
    data: {
      marketingEmailConsent: true,
      marketingEmailConsentAt: new Date(),
      marketingEmailConsentRevokedAt: null,
      marketingEmailConsentSource: "post_purchase",
      marketingEmailConsentVersion: MARKETING_CONSENT_VERSION,
    },
  });

  redirect(
    `/checkout/success?session_id=${encodeURIComponent(stripeSessionId)}&marketing=saved`,
  );
}
