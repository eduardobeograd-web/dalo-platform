import crypto from "node:crypto";
import { prisma } from "@/lib/db";

const WINDOW_MINUTES = 10;
const MAX_ATTEMPTS = 8;
const EVENT_TYPE = "checkout_rate_limit_attempt";

function requestAddress(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function allowCheckoutAttempt(
  request: Request,
  identity?: string | null
) {
  const secret =
    process.env.DALO_RATE_LIMIT_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "dalo-local-rate-limit");

  if (!secret) {
    console.error("DALO_RATE_LIMIT_SECRET is required in production");
    return false;
  }

  const fingerprint = crypto
    .createHash("sha256")
    .update(`${secret}:${requestAddress(request)}:${identity || "anonymous"}`)
    .digest("hex");
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000);
  const attempts = await prisma.customerEvent.count({
    where: {
      eventType: EVENT_TYPE,
      sessionId: fingerprint,
      createdAt: { gte: windowStart },
    },
  });

  if (attempts >= MAX_ATTEMPTS) return false;

  await prisma.customerEvent.create({
    data: {
      eventType: EVENT_TYPE,
      sessionId: fingerprint,
      metadata: {
        windowMinutes: WINDOW_MINUTES,
      },
    },
  });

  return true;
}
