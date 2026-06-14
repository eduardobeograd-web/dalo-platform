"use server";

import { redirect } from "next/navigation";
import { getCurrentCustomer } from "../../../lib/customer-auth";
import { prisma } from "../../../lib/db";

export async function createSupportRequest(formData: FormData) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const orderId = String(formData.get("orderId") || "");
  const reason = String(formData.get("reason") || "");
  const message = String(formData.get("message") || "").trim();

  if (!orderId || !reason || !message) {
    redirect("/customer/support?error=1");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [
        {
          customerId: customer.id,
        },
        {
          customer: customer.email,
        },
      ],
    },
  });

  if (!order) {
    redirect("/customer/support?error=1");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: order.productId,
    },
  });

  await prisma.supportRequest.create({
    data: {
      customerId: customer.id,
      orderId: order.id,
      customerEmail: customer.email,
      reason,
      message,
      status: "open",
      orderNumber: order.orderNumber,
      iccid: order.iccid,
      productName: product?.name || null,
    },
  });

  redirect(`/customer/support?orderId=${order.id}&success=1`);
}