"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "../../../lib/customer-auth";
import { canCustomerArchiveOrder } from "../../../lib/customer-order-archive";
import { prisma } from "../../../lib/db";

export async function setCustomerOrderArchived(formData: FormData) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const orderId = String(formData.get("orderId") || "").trim();
  const requestedAction = String(formData.get("archiveAction") || "").trim();

  if (!orderId || !["archive", "restore"].includes(requestedAction)) {
    return;
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ customerId: customer.id }, { customer: customer.email }],
    },
  });

  if (!order) {
    return;
  }

  if (requestedAction === "archive" && !canCustomerArchiveOrder(order)) {
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      customerArchivedAt:
        requestedAction === "archive" ? new Date() : null,
    },
  });

  revalidatePath("/customer/dashboard");
}
