"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/db";
import { fulfillOrderMockById } from "@/lib/mock-fulfillment";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";
import { ADMIN_PERMISSIONS } from "../../../lib/admin-permissions";
import { requireAdminPermission } from "../../../lib/admin-auth";

async function requireOrderWrite() {
  return requireAdminPermission(ADMIN_PERMISSIONS.ORDERS_WRITE);
}

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

async function sendDeliveryEmailIfReady(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (
    order?.payment === "Paid" &&
    order.fulfillment === "Delivered" &&
    order.esimStatus === "ready" &&
    Boolean(order.activationCode || order.qrCodeUrl || order.iosInstallUrl || order.androidInstallUrl)
  ) {
    await sendOrderConfirmationEmail(order.id);
  }
}

export async function updateOrderFulfillment(orderId: string, formData: FormData) {
  await requireOrderWrite();
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

  await sendDeliveryEmailIfReady(orderId);

  revalidateOrderPages(orderId);
}

export async function markOrderPaid(orderId: string) {
  await requireOrderWrite();
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
  await requireOrderWrite();
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
  await requireOrderWrite();
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      fulfillment: "Delivered",
      esimStatus: "ready",
    },
  });

  await sendDeliveryEmailIfReady(orderId);

  revalidateOrderPages(orderId);
}

export async function markOrderFailed(orderId: string) {
  await requireOrderWrite();
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
  await requireOrderWrite();
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
  await requireOrderWrite();
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
  await requireOrderWrite();
  const result = await fulfillOrderMockById(orderId);
  if (result.fulfilled) {
    await sendDeliveryEmailIfReady(orderId);
  }
  revalidateOrderPages(orderId);
}
