import "server-only";

import { prisma } from "@/lib/db";
import {
  listEsimGoBundles,
  type EsimGoBundleAssignment,
} from "./client";

function asDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function asQuantity(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function bytesToGb(value: number | null) {
  return value === null ? null : value / 1_000_000_000;
}

function assignmentStatus(assignment: EsimGoBundleAssignment) {
  if (assignment.bundleState?.trim()) {
    return assignment.bundleState.trim().toLowerCase();
  }
  if (assignment.remainingQuantity === 0) return "depleted";
  if (assignment.startTime) return "active";
  return "assigned";
}

export async function syncEsimGoProfileUsage(esimProfileId: string) {
  const profile = await prisma.esimProfile.findUnique({
    where: { id: esimProfileId },
    include: {
      bundles: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!profile) throw new Error("eSIM profile not found.");

  const response = await listEsimGoBundles(profile.iccid, true);
  const now = new Date();
  let syncedAssignments = 0;

  for (const providerBundle of response.bundles || []) {
    const bundleName = providerBundle.name?.trim();
    if (!bundleName) continue;

    for (const assignment of providerBundle.assignments || []) {
      const assignmentId = assignment.id?.trim() || null;
      const assignmentReference =
        assignment.assignmentReference?.trim() || null;

      const existing =
        (assignmentId
          ? profile.bundles.find(
              (bundle) => bundle.providerAssignmentId === assignmentId,
            )
          : null) ||
        (assignmentReference
          ? profile.bundles.find(
              (bundle) =>
                bundle.providerAssignmentReference === assignmentReference,
            )
          : null) ||
        profile.bundles.find(
          (bundle) =>
            bundle.providerBundleName === bundleName &&
            !bundle.providerAssignmentId &&
            !bundle.providerAssignmentReference,
        );

      const initialBytes = asQuantity(assignment.initialQuantity);
      const remainingBytes = asQuantity(assignment.remainingQuantity);
      const data = {
        providerBundleName: bundleName,
        providerAssignmentId: assignmentId,
        providerAssignmentReference: assignmentReference,
        status: assignmentStatus(assignment),
        initialQuantityBytes: initialBytes,
        remainingQuantityBytes: remainingBytes,
        unlimited: assignment.unlimited === true,
        assignedAt: asDate(assignment.assignmentDateTime),
        startedAt: asDate(assignment.startTime),
        expiresAt: asDate(assignment.endTime),
        lastUsageSyncAt: now,
      };

      const saved = existing
        ? await prisma.esimBundle.update({
            where: { id: existing.id },
            data,
          })
        : await prisma.esimBundle.create({
            data: {
              esimProfileId: profile.id,
              ...data,
            },
          });

      if (saved.orderId) {
        const initialGb = bytesToGb(initialBytes);
        const remainingGb = bytesToGb(remainingBytes);
        await prisma.order.update({
          where: { id: saved.orderId },
          data: {
            totalDataGb: initialGb,
            remainingDataGb: remainingGb,
            usedDataGb:
              initialGb !== null && remainingGb !== null
                ? Math.max(0, initialGb - remainingGb)
                : undefined,
            activatedAt: asDate(assignment.startTime) || undefined,
            expiresAt: asDate(assignment.endTime) || undefined,
            lastUsageSyncAt: now,
          },
        });
      }

      syncedAssignments += 1;
    }
  }

  await prisma.esimProfile.update({
    where: { id: profile.id },
    data: { lastSyncedAt: now },
  });

  return {
    profileId: profile.id,
    iccid: profile.iccid,
    syncedAssignments,
    syncedAt: now,
  };
}
