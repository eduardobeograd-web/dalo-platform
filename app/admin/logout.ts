"use server";

import { redirect } from "next/navigation";
import {
  destroyCurrentAdminSession,
  getCurrentAdmin,
  writeAdminAuditLog,
} from "../../lib/admin-auth";

export async function adminLogout() {
  const admin = await getCurrentAdmin();
  await destroyCurrentAdminSession();
  if (admin) {
    await writeAdminAuditLog({
      adminUserId: admin.id,
      action: "LOGOUT",
      resource: "ADMIN_SESSION",
    });
  }

  redirect("/admin/login");
}
