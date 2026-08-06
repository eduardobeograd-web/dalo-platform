import "server-only";

import { createHash } from "node:crypto";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { getProviderConfigBySlug } from "@/lib/providers/provider-configs";
import {
  checkEsimGoCompatibility,
  createEsimGoTransaction,
  EsimGoApiError,
  getEsimGoInstallDetails,
  validateEsimGoOrder,
  type EsimGoInstallDetails,
  type EsimGoOrderResponse,
} from "./client";
import { getEsimGoReadiness } from "./config";
import { syncEsimGoProfileUsage } from "./sync";

function fingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function providerError(error: unknown) {
  if (error instanceof EsimGoApiError) {
    return {
      code: String(error.status),
      message: error.message.slice(0, 1_000),
    };
  }

  return {
    code: error instanceof Error ? error.name : "unknown_error",
    message:
      error instanceof Error
        ? error.message.slice(0, 1_000)
        : "Unknown provider error",
  };
}

function firstInstallDetails(
  value: EsimGoInstallDetails | EsimGoInstallDetails[],
) {
  return Array.isArray(value) ? value[0] || null : value;
}

function responseEsim(response: EsimGoOrderResponse) {
  for (const item of response.order || []) {
    const esim = item.esims?.[0];
    if (esim?.iccid) return esim;
  }

  return null;
}

function activationCode(details: EsimGoInstallDetails | null) {
  if (!details?.smdpAddress || !details.matchingId) return null;
  return `LPA:1$${details.smdpAddress}$${details.matchingId}`;
}

function asDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function responseSummary(response: EsimGoOrderResponse, iccid: string | null) {
  return {
    status: response.status || null,
    statusMessage: response.statusMessage || null,
    orderReference: response.orderReference || null,
    total: response.total ?? null,
    currency: response.currency || null,
    assigned: response.assigned ?? null,
    iccid,
  } satisfies Prisma.InputJsonObject;
}

async function loadFulfillableOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { esimProfile: true },
  });

  if (!order) throw new Error("Order not found.");
  if (order.payment !== "Paid") throw new Error("Order is not paid.");
  if (!order.providerProductIdAtPurchase) {
    throw new Error("Order has no provider bundle mapping.");
  }
  if (
    typeof order.buyPriceAtPurchase !== "number" ||
    !Number.isFinite(order.buyPriceAtPurchase) ||
    order.buyPriceAtPurchase < 0
  ) {
    throw new Error("Order has no verified purchase-time provider cost.");
  }
  if (order.fulfillment === "Delivered" && order.esimStatus === "ready") {
    throw new Error("Order is already delivered.");
  }
  if (order.orderKind !== "new_esim" && !order.esimProfile) {
    throw new Error("Top-up order has no reusable eSIM profile.");
  }

  return order;
}

export async function validatePaidOrderWithEsimGo(orderId: string) {
  const order = await loadFulfillableOrder(orderId);
  const bundleName = order.providerProductIdAtPurchase!;
  const targetIccid = order.esimProfile?.iccid || null;
  const input = { bundleName, iccid: targetIccid };
  const idempotencyKey = `esim-go:validate:${order.id}:${bundleName}:${targetIccid || "new"}`;

  const existing = await prisma.providerOperation.findUnique({
    where: { idempotencyKey },
  });

  if (existing?.status === "completed") return existing;

  if (targetIccid) {
    const compatibility = await checkEsimGoCompatibility(
      targetIccid,
      bundleName,
    );
    if (!compatibility.compatible) {
      throw new Error("The bundle is not compatible with the existing ICCID.");
    }
  }

  const operation = existing
    ? await prisma.providerOperation.update({
        where: { id: existing.id },
        data: {
          status: "processing",
          attemptCount: { increment: 1 },
          startedAt: new Date(),
          lastErrorCode: null,
          lastErrorMessage: null,
        },
      })
    : await prisma.providerOperation.create({
        data: {
          orderId: order.id,
          esimProfileId: order.esimProfileId,
          operationKind: "order_validation",
          mode: "validate",
          idempotencyKey,
          requestFingerprint: fingerprint(input),
          requestSummary: input,
          status: "processing",
          attemptCount: 1,
          startedAt: new Date(),
        },
      });

  try {
    const result = await validateEsimGoOrder(input);

    if (result.valid === false) {
      throw new Error("eSIM Go rejected the order validation.");
    }
    if (result.currency && result.currency.toUpperCase() !== "USD") {
      throw new Error("eSIM Go validation returned an unexpected currency.");
    }
    if (
      typeof result.total === "number" &&
      typeof order.buyPriceAtPurchase === "number" &&
      result.total > order.buyPriceAtPurchase + 0.01
    ) {
      throw new Error(
        "Provider cost is higher than the recorded purchase-time cost.",
      );
    }

    return prisma.providerOperation.update({
      where: { id: operation.id },
      data: {
        status: "completed",
        responseSummary: {
          valid: result.valid ?? null,
          total: result.total ?? null,
          currency: result.currency || null,
          assigned: result.assigned ?? null,
        },
        finishedAt: new Date(),
      },
    });
  } catch (error) {
    const detail = providerError(error);
    await prisma.providerOperation.update({
      where: { id: operation.id },
      data: {
        status: "failed",
        lastErrorCode: detail.code,
        lastErrorMessage: detail.message,
        finishedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function fulfillPaidOrderWithEsimGo(orderId: string) {
  const readiness = getEsimGoReadiness();
  if (!readiness.liveTransactionsEnabled) {
    return { fulfilled: false as const, reason: "live_fulfillment_disabled" };
  }

  const provider = await getProviderConfigBySlug("esim-go");
  if (!provider?.active || !provider.fulfillmentEnabled) {
    return { fulfilled: false as const, reason: "provider_fulfillment_disabled" };
  }

  const order = await loadFulfillableOrder(orderId);
  const bundleName = order.providerProductIdAtPurchase!;
  const targetIccid = order.esimProfile?.iccid || null;
  const input = { bundleName, iccid: targetIccid };
  const idempotencyKey = `esim-go:transaction:${order.id}`;
  const existing = await prisma.providerOperation.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    return {
      fulfilled: existing.status === "completed",
      reason: `existing_operation_${existing.status}`,
      operationId: existing.id,
    } as const;
  }

  await validatePaidOrderWithEsimGo(order.id);

  const operation = await prisma.providerOperation.create({
    data: {
      orderId: order.id,
      esimProfileId: order.esimProfileId,
      operationKind: targetIccid ? "bundle_topup" : "new_esim_order",
      mode: "transaction",
      idempotencyKey,
      requestFingerprint: fingerprint(input),
      requestSummary: input,
      status: "processing",
      attemptCount: 1,
      startedAt: new Date(),
    },
  });

  let providerCommitted = false;

  try {
    const result = await createEsimGoTransaction(input);
    const orderReference = result.orderReference?.trim() || null;
    const responseProfile = responseEsim(result);
    const iccid = targetIccid || responseProfile?.iccid?.trim() || null;

    if (!orderReference || !iccid) {
      throw new Error("Provider transaction response is missing its reference or ICCID.");
    }

    providerCommitted = true;
    await prisma.providerOperation.update({
      where: { id: operation.id },
      data: {
        status: "provider_committed",
        providerReference: orderReference,
        responseSummary: responseSummary(result, iccid),
      },
    });

    let details: EsimGoInstallDetails | null = targetIccid
      ? {
          iccid: targetIccid,
          matchingId: order.esimProfile?.matchingId || undefined,
          smdpAddress: order.esimProfile?.smdpAddress || undefined,
          profileStatus: order.esimProfile?.profileStatus || undefined,
          pin: order.esimProfile?.pin || undefined,
          puk: order.esimProfile?.puk || undefined,
          firstInstalledDateTime:
            order.esimProfile?.firstInstalledAt?.toISOString(),
          installUrl: order.esimProfile?.androidInstallUrl || undefined,
          appleInstallUrl: order.esimProfile?.iosInstallUrl || undefined,
        }
      : responseProfile;
    if (!targetIccid && (!details?.matchingId || !details.smdpAddress)) {
      details = firstInstallDetails(
        await getEsimGoInstallDetails(orderReference),
      );
    }

    const profile = await prisma.esimProfile.upsert({
      where: { iccid },
      update: {
        customerId: order.customerId,
        status: "ready",
        matchingId: details?.matchingId || undefined,
        smdpAddress: details?.smdpAddress || undefined,
        pin: details?.pin || undefined,
        puk: details?.puk || undefined,
        profileStatus: details?.profileStatus || undefined,
        iosInstallUrl: details?.appleInstallUrl || undefined,
        androidInstallUrl: details?.installUrl || undefined,
        firstInstalledAt: asDate(details?.firstInstalledDateTime) || undefined,
        lastSyncedAt: new Date(),
      },
      create: {
        customerId: order.customerId,
        iccid,
        status: "ready",
        matchingId: details?.matchingId || null,
        smdpAddress: details?.smdpAddress || null,
        pin: details?.pin || null,
        puk: details?.puk || null,
        profileStatus: details?.profileStatus || null,
        iosInstallUrl: details?.appleInstallUrl || null,
        androidInstallUrl: details?.installUrl || null,
        firstInstalledAt: asDate(details?.firstInstalledDateTime),
        lastSyncedAt: new Date(),
      },
    });

    const bundle = await prisma.esimBundle.create({
      data: {
        esimProfileId: profile.id,
        orderId: order.id,
        productId: order.productId,
        providerBundleName: bundleName,
        status: "processing",
        countryCode: null,
        dataGb: order.totalDataGb,
        assignedAt: new Date(),
      },
    });

    const lpa = activationCode(details);
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          esimProfileId: profile.id,
          fulfillment: "Delivered",
          esimStatus: "ready",
          providerOrderId: orderReference,
          iccid,
          activationCode: lpa,
          iosInstallUrl: details?.appleInstallUrl || null,
          androidInstallUrl: details?.installUrl || null,
          remainingDataGb: order.totalDataGb,
          usedDataGb: 0,
          lastUsageSyncAt: new Date(),
        },
      }),
      prisma.providerOperation.update({
        where: { id: operation.id },
        data: {
          esimProfileId: profile.id,
          esimBundleId: bundle.id,
          status: "completed",
          finishedAt: new Date(),
        },
      }),
    ]);

    try {
      await syncEsimGoProfileUsage(profile.id);
    } catch (error) {
      console.error("Initial eSIM Go usage sync failed", {
        orderId: order.id,
        profileId: profile.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return {
      fulfilled: true as const,
      orderId: order.id,
      operationId: operation.id,
      profileId: profile.id,
      bundleId: bundle.id,
    };
  } catch (error) {
    const detail = providerError(error);
    await prisma.providerOperation.update({
      where: { id: operation.id },
      data: {
        status: providerCommitted ? "needs_reconciliation" : "unknown",
        lastErrorCode: detail.code,
        lastErrorMessage: detail.message,
        finishedAt: new Date(),
      },
    });

    return {
      fulfilled: false as const,
      reason: providerCommitted
        ? "provider_committed_needs_reconciliation"
        : "transaction_result_unknown_do_not_retry",
      operationId: operation.id,
    };
  }
}
