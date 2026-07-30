import "server-only";

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import {
  ADMIN_PERMISSIONS,
  type AdminPermission,
  parseAdminPermissions,
} from "./admin-permissions";

export const ADMIN_SESSION_COOKIE = "dalo_admin_session";
const SESSION_LENGTH_MS = 1000 * 60 * 60 * 12;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function adminHasPermission(
  admin: { role: string; permissions: unknown },
  permission: AdminPermission,
) {
  return (
    admin.role === "OWNER" ||
    parseAdminPermissions(admin.permissions).includes(permission)
  );
}

export async function createAdminSession(adminUserId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_LENGTH_MS);

  await prisma.adminSession.create({
    data: {
      adminUserId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { adminUser: true },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.adminUser.active
  ) {
    return null;
  }

  return session.adminUser;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  if (admin.mustChangePassword) {
    redirect("/admin/change-password");
  }

  return admin;
}

export async function requireAdminPermission(permission: AdminPermission) {
  const admin = await requireAdmin();

  if (!adminHasPermission(admin, permission)) {
    redirect("/admin/access-denied");
  }

  return admin;
}

export async function destroyCurrentAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function writeAdminAuditLog(input: {
  adminUserId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  await prisma.adminAuditLog.create({
    data: {
      adminUserId: input.adminUserId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      metadata: input.metadata,
    },
  });
}

export function getFirstAllowedAdminPath(admin: {
  role: string;
  permissions: unknown;
}) {
  const routes: Array<[AdminPermission, string]> = [
    [ADMIN_PERMISSIONS.DASHBOARD_READ, "/admin"],
    [ADMIN_PERMISSIONS.ORDERS_READ, "/admin/orders"],
    [ADMIN_PERMISSIONS.SUPPORT_READ, "/admin/support"],
    [ADMIN_PERMISSIONS.PRODUCTS_READ, "/admin/products"],
    [ADMIN_PERMISSIONS.SEO_READ, "/admin/destinations"],
    [ADMIN_PERMISSIONS.ADMINS_READ, "/admin/users"],
  ];

  return (
    routes.find(([permission]) =>
      adminHasPermission(admin, permission),
    )?.[1] || "/admin/access-denied"
  );
}
