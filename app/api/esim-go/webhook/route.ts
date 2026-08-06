import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireEsimGoCapability } from "@/lib/providers/esim-go/config";

export const runtime = "nodejs";

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

function safeNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function safeDate(value: unknown) {
  const text = safeString(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function signatureMatches(rawBody: string, signature: string, apiKey: string) {
  const supplied = signature.trim();
  const hex = createHmac("sha256", apiKey).update(rawBody).digest("hex");
  const base64 = createHmac("sha256", apiKey).update(rawBody).digest("base64");

  return [hex, base64].some((expected) => {
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(supplied);
    return (
      expectedBuffer.length === suppliedBuffer.length &&
      timingSafeEqual(expectedBuffer, suppliedBuffer)
    );
  });
}

function percentUsed(initial: number | null, remaining: number | null) {
  if (!initial || remaining === null) return null;
  return Math.max(0, Math.min(100, Math.round((1 - remaining / initial) * 100)));
}

function bytesToGb(value: number | null) {
  return value === null ? null : value / 1_000_000_000;
}

export async function POST(request: Request) {
  let apiKey: string;

  try {
    ({ apiKey } = requireEsimGoCapability("webhook"));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rawBody = await request.text();
  if (!rawBody || rawBody.length > 128_000) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const signature = request.headers.get("x-signature-sha256");
  if (!signature || !signatureMatches(rawBody, signature, apiKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: EsimGoCallback;
  try {
    payload = JSON.parse(rawBody) as EsimGoCallback;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const iccid = safeString(payload.iccid, 64);
  const eventType = safeString(payload.alertType, 100) || "Unknown";
  const assignmentId = safeString(payload.bundle?.id, 128);
  const assignmentReference = safeString(payload.bundle?.reference, 255);
  const bundleName = safeString(payload.bundle?.name, 255);
  const eventKey = createHash("sha256").update(rawBody).digest("hex");

  if (!iccid) {
    return NextResponse.json({ error: "Missing ICCID" }, { status: 400 });
  }

  const existingEvent = await prisma.providerWebhookEvent.findUnique({
    where: { eventKey },
    select: { id: true, status: true },
  });
  if (existingEvent) {
    return NextResponse.json({
      received: true,
      duplicate: true,
      status: existingEvent.status,
    });
  }

  const profile = await prisma.esimProfile.findUnique({ where: { iccid } });
  const event = await prisma.providerWebhookEvent.create({
    data: {
      esimProfileId: profile?.id || null,
      eventKey,
      eventType,
      iccid,
      assignmentId,
      assignmentReference,
      signatureValid: true,
      status: profile ? "processing" : "unmatched",
      payload: payload as unknown as Prisma.InputJsonValue,
    },
  });

  if (!profile) {
    return NextResponse.json({ received: true, matched: false });
  }

  try {
    const eventTypeLower = eventType.toLowerCase();
    const now = new Date();
    const initialBytes = safeNumber(payload.bundle?.initialQuantity);
    const remainingBytes = safeNumber(payload.bundle?.remainingQuantity);
    const usagePercent = percentUsed(initialBytes, remainingBytes);
    const startedAt = safeDate(payload.bundle?.startTime);
    const expiresAt = safeDate(payload.bundle?.endTime);
    const lastLocation = safeString(payload.location, 255);
    const lastNetwork =
      safeString(payload.network, 255) || safeString(payload.operator, 255);

    await prisma.esimProfile.update({
      where: { id: profile.id },
      data: {
        status: eventTypeLower.includes("deletion scheduled")
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
        deletionScheduledAt: eventTypeLower.includes("deletion scheduled")
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

    const bundleFilters: Prisma.EsimBundleWhereInput[] = [];
    if (assignmentId) bundleFilters.push({ providerAssignmentId: assignmentId });
    if (assignmentReference) {
      bundleFilters.push({ providerAssignmentReference: assignmentReference });
    }
    if (bundleName) bundleFilters.push({ providerBundleName: bundleName });

    const bundle = bundleFilters.length
      ? await prisma.esimBundle.findFirst({
          where: {
            esimProfileId: profile.id,
            OR: bundleFilters,
          },
          orderBy: { createdAt: "desc" },
        })
      : null;

    if (bundle) {
      const status =
        remainingBytes === 0
          ? "depleted"
          : startedAt
            ? "active"
            : bundle.status;

      await prisma.esimBundle.update({
        where: { id: bundle.id },
        data: {
          providerAssignmentId: assignmentId || undefined,
          providerAssignmentReference: assignmentReference || undefined,
          status,
          initialQuantityBytes: initialBytes,
          remainingQuantityBytes: remainingBytes,
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
        await prisma.order.update({
          where: { id: bundle.orderId },
          data: {
            totalDataGb: initialGb,
            remainingDataGb: remainingGb,
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

    await prisma.providerWebhookEvent.update({
      where: { id: event.id },
      data: { status: bundle ? "processed" : "profile_only", processedAt: now },
    });

    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    await prisma.providerWebhookEvent.update({
      where: { id: event.id },
      data: {
        status: "failed",
        errorMessage:
          error instanceof Error
            ? error.message.slice(0, 1_000)
            : "Unknown callback processing error",
      },
    });

    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
