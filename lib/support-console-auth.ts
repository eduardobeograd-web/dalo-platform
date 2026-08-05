import { redirect } from "next/navigation";
import {
  adminHasPermission,
  getCurrentAdmin,
} from "./admin-auth";
import {
  ADMIN_PERMISSIONS,
  type AdminPermission,
} from "./admin-permissions";

export async function requireSupportConsole(
  permission: AdminPermission = ADMIN_PERMISSIONS.SUPPORT_READ,
) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login?next=/support-console");
  }

  if (!adminHasPermission(admin, permission)) {
    redirect("/admin/access-denied");
  }

  return admin;
}
