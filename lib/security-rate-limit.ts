import crypto from "node:crypto";
import { prisma } from "@/lib/db";

const EVENT_TYPE = "security_rate_limit";

type SecurityRateLimitInput = {
  scope: string;
  headers: Headers;
  identity?: string | null;
  ipLimit: number;
  identityLimit?: number;
  windowMinutes: number;
};

function requestAddress(headers: Headers) {
  const value =
    headers.get("x-vercel-forwarded-for") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for") ||
    headers.get("x-real-ip") ||
    "unknown";

  return value.split(",")[0].trim().slice(0, 128) || "unknown";
}

function fingerprint(secret: string, scope: string, kind: string, value: string) {
  return crypto
    .createHash("sha256")
    .update(`${secret}:${scope}:${kind}:${value}`)
    .digest("hex");
}

export async function allowSecurityAttempt({
  scope,
  headers,
  identity,
  ipLimit,
  identityLimit = ipLimit,
  windowMinutes,
}: SecurityRateLimitInput) {
  const secret =
    process.env.DALO_RATE_LIMIT_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "dalo-local-rate-limit");

  if (!secret) {
    console.error("DALO_RATE_LIMIT_SECRET is required in production");
    return false;
  }

  const normalizedScope = scope.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const normalizedIdentity = identity?.trim().toLowerCase().slice(0, 254);
  const limits = [
    {
      key: fingerprint(
        secret,
        normalizedScope,
        "ip",
        requestAddress(headers),
      ),
      limit: ipLimit,
      kind: "ip",
    },
    ...(normalizedIdentity
      ? [
          {
            key: fingerprint(
              secret,
              normalizedScope,
              "identity",
              normalizedIdentity,
            ),
            limit: identityLimit,
            kind: "identity",
          },
        ]
      : []),
  ];
  const windowStart = new Date(Date.now() - windowMinutes * 60_000);
  const counts = await Promise.all(
    limits.map(({ key }) =>
      prisma.customerEvent.count({
        where: {
          eventType: EVENT_TYPE,
          sessionId: key,
          createdAt: { gte: windowStart },
        },
      }),
    ),
  );

  if (counts.some((count, index) => count >= limits[index].limit)) {
    return false;
  }

  await prisma.customerEvent.createMany({
    data: limits.map(({ key, kind }) => ({
      eventType: EVENT_TYPE,
      sessionId: key,
      metadata: {
        scope: normalizedScope,
        kind,
        windowMinutes,
      },
    })),
  });

  return true;
}
