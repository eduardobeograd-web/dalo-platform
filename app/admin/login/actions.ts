"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import {
  createAdminSession,
  getFirstAllowedAdminPath,
  writeAdminAuditLog,
} from "../../../lib/admin-auth";

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (
    !admin ||
    !admin.active ||
    !(await bcrypt.compare(password, admin.passwordHash))
  ) {
    redirect("/admin/login?error=1");
  }

  await prisma.adminSession.deleteMany({
    where: {
      OR: [{ expiresAt: { lte: new Date() } }, { adminUserId: admin.id }],
    },
  });

  await Promise.all([
    createAdminSession(admin.id),
    prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    }),
    writeAdminAuditLog({
      adminUserId: admin.id,
      action: "LOGIN",
      resource: "ADMIN_SESSION",
    }),
  ]);

  if (admin.mustChangePassword) {
    redirect("/admin/change-password");
  }

  redirect(getFirstAllowedAdminPath(admin));
}
