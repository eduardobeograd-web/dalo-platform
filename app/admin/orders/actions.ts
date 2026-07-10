"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/db";
import { fulfillOrderMockById } from "@/lib/mock-fulfillment";

function revalidateOrderPages(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/customer/dashboard");
  revalidatePath(`/customer/orders/${orderId}`);
}

function cleanOptional(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text.length > 0 ? text : null;
}

function cleanNumber(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();

  if (!text) return null;

  const number = Number(text);

  if (Number.isNaN(number)) return null;

  return number;
}

export async function updateOrderFulfillment(orderId: string, formData: FormData) {
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      payment: String(formData.get("payment") || "Pending"),
      fulfillment: String(formData.get("fulfillment") || "Waiting"),
      esimStatus: cleanOptional(formData.get("esimStatus")),

      providerOrderId: cleanOptional(formData.get("providerOrderId")),
      iccid: cleanOptional(formData.get("iccid")),
      qrCodeUrl: cleanOptional(formData.get("qrCodeUrl")),
      activationCode: cleanOptional(formData.get("activationCode")),
      iosInstallUrl: cleanOptional(formData.get("iosInstallUrl")),
      androidInstallUrl: cleanOptional(formData.get("androidInstallUrl")),

      totalDataGb: cleanNumber(formData.get("totalDataGb")),
      usedDataGb: cleanNumber(formData.get("usedDataGb")),
      remainingDataGb: cleanNumber(formData.get("remainingDataGb")),
      lastUsageSyncAt: formData.get("syncUsage") === "on" ? new Date() : undefined,
    },
  });

  revalidateOrderPages(orderId);
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
      esimStatus: "ready",
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
      esimStatus: "failed",
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
      esimStatus: "pending",
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
export async function fulfillOrderMock(orderId: string) {
  await fulfillOrderMockById(orderId);
  revalidateOrderPages(orderId);
}
