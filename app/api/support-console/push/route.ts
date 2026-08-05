import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PERMISSIONS } from "../../../../lib/admin-permissions";
import { adminHasPermission, getCurrentAdmin } from "../../../../lib/admin-auth";
import { prisma } from "../../../../lib/db";

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === request.nextUrl.origin);
}

async function getAuthorizedAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin || !adminHasPermission(admin, ADMIN_PERMISSIONS.SUPPORT_READ)) return null;
  return admin;
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = await getAuthorizedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
  const p256dh = typeof body?.keys?.p256dh === "string" ? body.keys.p256dh.trim() : "";
  const auth = typeof body?.keys?.auth === "string" ? body.keys.auth.trim() : "";

  if (!endpoint.startsWith("https://") || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  }

  await prisma.supportPushSubscription.upsert({
    where: { endpoint },
    update: {
      adminUserId: admin.id,
      p256dh,
      auth,
      userAgent: request.headers.get("user-agent"),
      failureCount: 0,
    },
    create: {
      adminUserId: admin.id,
      endpoint,
      p256dh,
      auth,
      userAgent: request.headers.get("user-agent"),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = await getAuthorizedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) return NextResponse.json({ error: "Endpoint required" }, { status: 400 });

  await prisma.supportPushSubscription.deleteMany({
    where: { endpoint, adminUserId: admin.id },
  });
  return NextResponse.json({ success: true });
}
