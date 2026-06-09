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