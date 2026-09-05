import "server-only";
import { prisma } from "@/lib/db";
import { getEsimGoInstallDetails } from "./client";

// Recovery only reads an already recorded provider purchase. Never call /orders here.
export async function recoverEsimGoDelivery(orderId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"dalo-delivery-recovery:" + orderId}))`;
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } });
    const operation = await tx.providerOperation.findUnique({ where: { idempotencyKey: `esim-go:transaction:${orderId}` } });
    if (order.payment !== "Paid" || order.orderKind !== "new_esim") throw new Error("Only paid new eSIM orders can be recovered here.");
    if (operation?.status === "completed" || order.fulfillment === "Delivered") return;
    if (!operation?.providerReference || !["provider_committed", "needs_reconciliation"].includes(operation.status)) {
      throw new Error("No confirmed provider reference. Compare the purchase in the provider portal; do not order again.");
    }
    if (operation.status === "provider_committed" && Date.now() - operation.updatedAt.getTime() < 10 * 60_000) {
      throw new Error("Delivery may still be running. Wait ten minutes before recovery.");
    }
    const summary = operation.responseSummary as { iccid?: string } | null;
    const expectedIccid = summary?.iccid;
    if (!expectedIccid) throw new Error("Missing confirmed ICCID; manual reconciliation required.");
    const response = await getEsimGoInstallDetails(operation.providerReference);
    const details = (Array.isArray(response) ? response : [response]).find((item) => item.iccid === expectedIccid);
    if (!details?.matchingId || !details.smdpAddress) throw new Error("Provider installation details are not ready yet.");
    const existingProfile = await tx.esimProfile.findUnique({ where: { iccid: expectedIccid } });
    if (existingProfile && existingProfile.customerId !== order.customerId) throw new Error("eSIM belongs to another customer.");
    const activationCode = `LPA:1$${details.smdpAddress}$${details.matchingId}`;
    const cardData = encodeURIComponent(activationCode);
    const install = {
      matchingId: details.matchingId, smdpAddress: details.smdpAddress,
      iosInstallUrl: `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${cardData}`,
      androidInstallUrl: `https://esimsetup.android.com/esim_qrcode_provisioning?carddata=${cardData}`,
    };
    const profile = await tx.esimProfile.upsert({
      where: { iccid: expectedIccid },
      update: install,
      create: { iccid: expectedIccid, customerId: order.customerId, status: "ready", ...install },
    });
    const existingBundle = await tx.esimBundle.findFirst({ where: { orderId } });
    if (existingBundle && existingBundle.esimProfileId !== profile.id) throw new Error("Order bundle belongs to another profile.");
    const bundle = existingBundle || await tx.esimBundle.create({ data: {
      orderId, esimProfileId: profile.id, productId: order.productId,
      providerBundleName: order.providerProductIdAtPurchase!, status: "processing", dataGb: order.totalDataGb,
    } });
    await tx.order.update({ where: { id: orderId }, data: {
      esimProfileId: profile.id, iccid: expectedIccid, providerOrderId: operation.providerReference,
      activationCode, iosInstallUrl: install.iosInstallUrl, androidInstallUrl: install.androidInstallUrl,
      fulfillment: "Delivered", esimStatus: "ready",
    } });
    await tx.providerOperation.update({ where: { id: operation.id }, data: {
      status: "completed", esimProfileId: profile.id, esimBundleId: bundle.id,
      lastErrorCode: null, lastErrorMessage: null, finishedAt: new Date(),
    } });
  }, { timeout: 30000 });
}
