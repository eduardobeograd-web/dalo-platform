"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getCurrentAdmin, writeAdminAuditLog } from "../../../lib/admin-auth";
import { prisma } from "../../../lib/db";

export async function changeAdminPassword(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const password = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirmation") || "");

  if (password.length < 10 || password !== confirmation) {
    redirect("/admin/change-password?error=1");
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      mustChangePassword: false,
    },
  });

  await writeAdminAuditLog({
    adminUserId: admin.id,
    action: "PASSWORD_CHANGED",
    resource: "ADMIN_USER",
    resourceId: admin.id,
  });

  redirect("/admin");
}
