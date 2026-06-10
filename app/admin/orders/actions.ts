"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/db";

function revalidateOrderPages(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

export async function markOrderPaid(orderId: string) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      payment: "Paid",
    },
  });

  revalidateOrderPages(orderId);
}

export async function markOrderPending(orderId: string) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      payment: "Pending",
    },
  });

  revalidateOrderPages(orderId);
}

export async function markOrderDelivered(orderId: string) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      fulfillment: "Delivered",
    },
  });

  revalidateOrderPages(orderId);
}

export async function markOrderFailed(orderId: string) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      fulfillment: "Failed",
    },
  });

  revalidateOrderPages(orderId);
}

export async function markOrderWaiting(orderId: string) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      fulfillment: "Waiting",
    },
  });

  revalidateOrderPages(orderId);
}

export async function deleteTestOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    revalidateOrderPages(orderId);
    return;
  }

  if (order.payment !== "Pending") {
    revalidateOrderPages(orderId);
    return;
  }

  await prisma.order.delete({
    where: {
      id: orderId,
    },
  });

  revalidateOrderPages(orderId);
}