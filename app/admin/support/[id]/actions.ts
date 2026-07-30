"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { ADMIN_PERMISSIONS } from "../../../../lib/admin-permissions";
import { requireAdminPermission } from "../../../../lib/admin-auth";

export async function updateSupportRequestStatus(
  requestId: string,
  status: "open" | "in_progress" | "resolved"
) {
  await requireAdminPermission(ADMIN_PERMISSIONS.SUPPORT_WRITE);
  await prisma.supportRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status,
    },
  });

  redirect(`/admin/support/${requestId}`);
}
