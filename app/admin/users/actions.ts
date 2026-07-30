"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_PERMISSIONS,
  isAdminRole,
  type AdminPermission,
} from "../../../lib/admin-permissions";
import {
  requireAdminPermission,
  writeAdminAuditLog,
} from "../../../lib/admin-auth";
import { prisma } from "../../../lib/db";

function getRole(formData: FormData) {
  const value = String(formData.get("role") || "READ_ONLY");
  return isAdminRole(value) ? value : "READ_ONLY";
}

function getPermissions(formData: FormData, role: keyof typeof ADMIN_ROLE_PERMISSIONS) {
  const submitted = formData
    .getAll("permissions")
    .map(String)
    .filter((permission): permission is AdminPermission =>
      Object.values(ADMIN_PERMISSIONS).includes(permission as AdminPermission),
    );

  return role === "OWNER" ? ADMIN_ROLE_PERMISSIONS.OWNER : submitted;
}

export async function createAdminUser(formData: FormData) {
  const actor = await requireAdminPermission(ADMIN_PERMISSIONS.ADMINS_WRITE);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = getRole(formData);

  if (!name || !email || password.length < 10) {
    redirect("/admin/users?error=invalid");
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) redirect("/admin/users?error=exists");

  const user = await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      permissions: getPermissions(formData, role),
      active: true,
      mustChangePassword: true,
    },
  });

  await writeAdminAuditLog({
    adminUserId: actor.id,
    action: "ADMIN_CREATED",
    resource: "ADMIN_USER",
    resourceId: user.id,
    metadata: { email, role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

export async function updateAdminUser(userId: string, formData: FormData) {
  const actor = await requireAdminPermission(ADMIN_PERMISSIONS.ADMINS_WRITE);
  const target = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!target) redirect("/admin/users?error=missing");

  const role = getRole(formData);
  const active = formData.get("active") === "on";

  if (userId === actor.id && !active) {
    redirect("/admin/users?error=self");
  }

  if (target.role === "OWNER" && (role !== "OWNER" || !active)) {
    const ownerCount = await prisma.adminUser.count({
      where: { role: "OWNER", active: true },
    });
    if (ownerCount <= 1) redirect("/admin/users?error=owner");
  }

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: userId },
      data: {
        name: String(formData.get("name") || "").trim() || target.name,
        role,
        permissions: getPermissions(formData, role),
        active,
      },
    }),
    prisma.adminSession.deleteMany({
      where: {
        adminUserId: userId,
        ...(userId === actor.id ? { id: "__keep_current_session__" } : {}),
      },
    }),
  ]);

  await writeAdminAuditLog({
    adminUserId: actor.id,
    action: "ADMIN_ACCESS_UPDATED",
    resource: "ADMIN_USER",
    resourceId: userId,
    metadata: { email: target.email, role, active },
  });

  revalidatePath("/admin/users");
}

export async function resetAdminPassword(userId: string, formData: FormData) {
  const actor = await requireAdminPermission(ADMIN_PERMISSIONS.ADMINS_WRITE);
  const password = String(formData.get("password") || "");
  if (password.length < 10) redirect("/admin/users?error=password");

  const target = await prisma.adminUser.update({
    where: { id: userId },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      mustChangePassword: true,
    },
  });

  await prisma.adminSession.deleteMany({ where: { adminUserId: userId } });
  await writeAdminAuditLog({
    adminUserId: actor.id,
    action: "ADMIN_PASSWORD_RESET",
    resource: "ADMIN_USER",
    resourceId: userId,
    metadata: { email: target.email },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?reset=1");
}
