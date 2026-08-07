import "server-only";

import { prisma } from "@/lib/db";
import { getProviderEsimStatus } from "@/lib/esim-lifecycle";
import {
  getEsimGoProfileDetails,
  listEsimGoBundles,
  type EsimGoBundleAssignment,
} from "./client";

function asDate(value: string | number | undefined) {
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

  const [response, providerProfile] = await Promise.all([
    listEsimGoBundles(profile.iccid, true),
    getEsimGoProfileDetails(profile.iccid).catch((error) => {
      console.error("eSIM Go profile status sync failed", {
        profileId: profile.id,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }),
  ]);
  const now = new Date();
  const firstInstalledAt = asDate(providerProfile?.firstInstalledDateTime);
  const profileOnlyStatus = getProviderEsimStatus({
    providerState: providerProfile?.state,
    profileStatus: providerProfile?.profileStatus,
    firstInstalledAt,
    now,
  });
  let syncedAssignments = 0;

  if (providerProfile) {
    await prisma.order.updateMany({
      where: {
        esimProfileId: profile.id,
        payment: "Paid",
        fulfillment: "Delivered",
        ...(profileOnlyStatus === "suspended"
          ? {}
          : { esimStatus: { in: ["ready", "installed"] } }),
      },
      data: { esimStatus: profileOnlyStatus },
    });
  }

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
      const startedAt = asDate(assignment.startTime);
      const expiresAt = asDate(assignment.endTime);
      const bundleStatus = assignmentStatus(assignment);
      const customerStatus = getProviderEsimStatus({
        providerState: providerProfile?.state,
        profileStatus: providerProfile?.profileStatus,
        firstInstalledAt,
        bundleStatus,
        initialQuantityBytes: initialBytes,
        remainingQuantityBytes: remainingBytes,
        startedAt,
        expiresAt,
        now,
      });
      const data = {
        providerBundleName: bundleName,
        providerAssignmentId: assignmentId,
        providerAssignmentReference: assignmentReference,
        status: bundleStatus,
        initialQuantityBytes: initialBytes,
        remainingQuantityBytes: remainingBytes,
        unlimited: assignment.unlimited === true,
        assignedAt: asDate(assignment.assignmentDateTime),
        startedAt,
        expiresAt,
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
            esimStatus: customerStatus,
            activatedAt: startedAt || undefined,
            expiresAt: expiresAt || undefined,
            lastUsageSyncAt: now,
          },
        });
      }

      syncedAssignments += 1;
    }
  }

  await prisma.esimProfile.update({
    where: { id: profile.id },
    data: {
      status:
        profileOnlyStatus === "suspended"
          ? "suspended"
          : profileOnlyStatus === "installed"
            ? "installed"
            : profile.status === "provisioning"
              ? "ready"
              : profile.status,
      profileStatus: providerProfile?.profileStatus || undefined,
      firstInstalledAt: firstInstalledAt || undefined,
      iosInstallUrl: providerProfile?.appleInstallUrl || undefined,
      androidInstallUrl:
        providerProfile?.androidInstallUrl ||
        providerProfile?.installUrl ||
        undefined,
      lastSyncedAt: now,
    },
  });

  return {
    profileId: profile.id,
    iccid: profile.iccid,
    syncedAssignments,
    syncedAt: now,
  };
}
