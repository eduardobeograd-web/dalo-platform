"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/db";

export async function markOrderPaid(orderId: string) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      payment: "Paid",
    },
  });

  revalidatePath("/admin/orders");
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

  revalidatePath("/admin/orders");
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

  revalidatePath("/admin/orders");
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

  revalidatePath("/admin/orders");
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

  revalidatePath("/admin/orders");
}

export async function deleteTestOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    revalidatePath("/admin/orders");
    return;
  }

  if (order.payment !== "Pending") {
    revalidatePath("/admin/orders");
    return;
  }

  await prisma.order.delete({
    where: {
      id: orderId,
    },
  });

  revalidatePath("/admin/orders");
}