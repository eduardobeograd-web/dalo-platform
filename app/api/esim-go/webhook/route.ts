import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db";
import { requireEsimGoCapability } from "@/lib/providers/esim-go/config";

import { processStoredEsimGoEvent } from "@/lib/providers/esim-go/webhook-processing";

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

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const iccid = safeString(payload.iccid, 64);
  const eventType = safeString(payload.alertType, 100) || "Unknown";
  const assignmentId = safeString(payload.bundle?.id, 128);
  const assignmentReference = safeString(payload.bundle?.reference, 255);
  const eventKey = createHash("sha256").update(rawBody).digest("hex");

  if (!iccid) {
    return NextResponse.json({ error: "Missing ICCID" }, { status: 400 });
  }

  const event = await prisma.providerWebhookEvent.upsert({
    where: { eventKey },
    update: {},
    create: { eventKey, eventType, iccid, assignmentId, assignmentReference,
      signatureValid: true, status: "received", payload: payload as unknown as Prisma.InputJsonValue },
  });
  try {
    return NextResponse.json(await processStoredEsimGoEvent(event.id));
  } catch {
    return NextResponse.json({ error: "Processing failed; event retained for retry" }, { status: 500 });
  }
}
