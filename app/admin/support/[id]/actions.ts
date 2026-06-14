"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";

export async function updateSupportRequestStatus(
  requestId: string,
  status: "open" | "in_progress" | "resolved"
) {
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