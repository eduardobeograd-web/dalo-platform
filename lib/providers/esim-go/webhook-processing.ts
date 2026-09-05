import "server-only";
import { prisma } from "@/lib/db";
import { matchBundle, quantity } from "@/lib/purchase-safety";

type UsageBundle = {
  id?: unknown;
  reference?: unknown;
  name?: unknown;
  description?: unknown;
  initialQuantity?: unknown;
  remainingQuantity?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  unlimited?: unknown;
};

type EsimGoCallback = {
  iccid?: unknown;
  alertType?: unknown;
  bundle?: UsageBundle;
  location?: unknown;
  network?: unknown;
  operator?: unknown;
};

function safeString(value: unknown, maxLength = 255) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : null;
}

function safeDate(value: unknown) {
  const text = safeString(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function percentUsed(initial: number | null, remaining: number | null) {
  if (!initial || remaining === null) return null;
  return Math.max(0, Math.min(100, Math.round((1 - remaining / initial) * 100)));
}

function bytesToGb(value: number | null) {
  return value === null ? null : value / 1_000_000_000;
}


export async function processStoredEsimGoEvent(eventId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const original = await tx.providerWebhookEvent.findUniqueOrThrow({ where: { id: eventId } });
      if (!original.signatureValid || !original.iccid) throw new Error("Unverified provider event.");
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"dalo-usage:" + original.iccid}))`;
      const event = await tx.providerWebhookEvent.findUniqueOrThrow({ where: { id: eventId } });
      if (["processed", "profile_only", "superseded"].includes(event.status)) return { received: true, duplicate: true };
      const profile = await tx.esimProfile.findUnique({ where: { iccid: original.iccid } });
      if (!profile) throw new Error("Profile is not linked to DALO yet.");
      const payload = event.payload as unknown as EsimGoCallback;
      const eventType = event.eventType;
      const assignmentId = event.assignmentId;
      const assignmentReference = event.assignmentReference;
      const bundleName = safeString(payload.bundle?.name);
      // A retry of an old callback must not replace a newer sync.
      if (profile.lastSyncedAt && profile.lastSyncedAt > event.receivedAt && event.status === "failed") {
        throw new Error("Older callback requires a fresh usage sync instead of replay.");
      }
    const eventTypeLower = eventType.toLowerCase();
    const now = new Date();
    const initialBytes = quantity(payload.bundle?.initialQuantity);
    const remainingBytes = quantity(payload.bundle?.remainingQuantity);
    const usagePercent = percentUsed(initialBytes, remainingBytes);
    const startedAt = safeDate(payload.bundle?.startTime);
    const expiresAt = safeDate(payload.bundle?.endTime);
    const lastLocation = safeString(payload.location, 255);
    const lastNetwork =
      safeString(payload.network, 255) || safeString(payload.operator, 255);

    await tx.esimProfile.update({
      where: { id: profile.id },
      data: {
        status: eventTypeLower.replaceAll(" ", "").includes("deletionscheduled")
            ? "deletion_scheduled"
          : eventTypeLower.includes("deleted")
            ? "deactivated"
            : profile.status === "provisioning"
              ? "ready"
              : profile.status,
        firstAttachedAt:
          !profile.firstAttachedAt && eventTypeLower.includes("attachment")
            ? now
            : undefined,
        firstUsedAt:
          !profile.firstUsedAt &&
          (eventTypeLower.includes("first use") ||
            eventTypeLower.includes("utilisation"))
            ? startedAt || now
            : undefined,
        deletionScheduledAt: eventTypeLower.replaceAll(" ", "").includes("deletionscheduled")
          ? now
          : undefined,
        deactivatedAt:
          eventTypeLower.includes("deleted") &&
          !eventTypeLower.includes("scheduled")
            ? now
            : undefined,
        lastLocation: lastLocation || undefined,
        lastNetwork: lastNetwork || undefined,
        lastSyncedAt: now,
      },
    });

    const bundles = await tx.esimBundle.findMany({ where: { esimProfileId: profile.id } });
    const bundle = matchBundle(bundles, bundleName, assignmentId, assignmentReference);
    if (payload.bundle && !bundle) throw new Error("Bundle is unmatched; sync the profile before retrying this event.");
    if (bundle) {
      if (initialBytes !== null && remainingBytes !== null && remainingBytes > initialBytes) throw new Error("Invalid provider usage quantities.");
      const status =
        remainingBytes === 0
          ? "depleted"
          : startedAt
            ? "active"
            : bundle.status;

      await tx.esimBundle.update({
        where: { id: bundle.id },
        data: {
          providerAssignmentId: assignmentId || undefined,
          providerAssignmentReference: assignmentReference || undefined,
          status,
          initialQuantityBytes: initialBytes ?? undefined,
          remainingQuantityBytes: remainingBytes ?? undefined,
          unlimited:
            typeof payload.bundle?.unlimited === "boolean"
              ? payload.bundle.unlimited
              : bundle.unlimited,
          startedAt: startedAt || undefined,
          expiresAt: expiresAt || undefined,
          lastUsageSyncAt: now,
          lastUsageAlertPercent: usagePercent,
        },
      });

      if (bundle.orderId) {
        const initialGb = bytesToGb(initialBytes);
        const remainingGb = bytesToGb(remainingBytes);
        await tx.order.update({
          where: { id: bundle.orderId },
          data: {
            totalDataGb: initialGb ?? undefined,
            remainingDataGb: remainingGb ?? undefined,
            usedDataGb:
              initialGb !== null && remainingGb !== null
                ? Math.max(0, initialGb - remainingGb)
                : undefined,
            activatedAt: startedAt || undefined,
            expiresAt: expiresAt || undefined,
            lastUsageSyncAt: now,
          },
        });
      }
    }

    await tx.providerWebhookEvent.update({
      where: { id: event.id },
      data: { status: bundle ? "processed" : "profile_only", processedAt: now, errorMessage: null, esimProfileId: profile.id },
    });

    return { received: true, matched: true };

    }, { timeout: 20000 });
  } catch (error) {
    await prisma.providerWebhookEvent.updateMany({
      where: { id: eventId, status: { notIn: ["processed", "profile_only", "superseded"] } },
      data: { status: "failed", errorMessage: error instanceof Error ? error.message.slice(0,1000) : "Callback processing failed" },
    });
    throw error;
  }
}
