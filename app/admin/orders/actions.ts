"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import { fulfillOrderMockById } from "@/lib/mock-fulfillment";
import { fulfillPaidOrderWithEsimGo } from "@/lib/providers/esim-go/fulfillment";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";
import { sendInternalOrderNotification } from "@/lib/internal-order-notification";
import { ADMIN_PERMISSIONS } from "../../../lib/admin-permissions";
import {
  requireAdminPermission,
  writeAdminAuditLog,
} from "../../../lib/admin-auth";
import { addMonths, getFirstUsageLifecycleUpdate } from "../../../lib/esim-lifecycle";

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
    await sendInternalOrderNotification(order.id);
  }
}

export async function updateOrderFulfillment(orderId: string, formData: FormData) {
  await requireOrderWrite();
  const existingOrder = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const usedDataGb = cleanNumber(formData.get("usedDataGb"));
  const usageLifecycle = getFirstUsageLifecycleUpdate({
    previousUsedDataGb: existingOrder.usedDataGb,
    nextUsedDataGb: usedDataGb,
    activatedAt: existingOrder.activatedAt,
    expiresAt: existingOrder.expiresAt,
    validityDays: existingOrder.validityDaysAtPurchase,
  });
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
      usedDataGb,
      remainingDataGb: cleanNumber(formData.get("remainingDataGb")),
      lastUsageSyncAt: formData.get("syncUsage") === "on" ? new Date() : undefined,
      ...usageLifecycle,
    },
  });

  await sendDeliveryEmailIfReady(orderId);

  revalidateOrderPages(orderId);
}

export async function markOrderPaid(orderId: string) {
  await requireOrderWrite();
  const paidAt = new Date();
  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      payment: "Paid",
      paidAt,
      activationDeadlineAt: addMonths(paidAt, 6),
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

export async function fulfillSerbiaOneGbWithEsimGo(
  orderId: string,
  formData: FormData,
) {
  const actor = await requireOrderWrite();
  const confirmed = formData.get("confirmLivePurchase") === "yes";

  if (!confirmed) {
    redirect(`/admin/orders/${orderId}?liveFulfillment=confirmation-required`);
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    redirect(`/admin/orders/${orderId}?liveFulfillment=missing`);
  }

  if (order.fulfillment === "Delivered" && order.esimStatus === "ready") {
    redirect(`/admin/orders/${orderId}?liveFulfillment=already-delivered`);
  }

  const isControlledTestOrder =
    order.payment === "Paid" &&
    order.orderKind === "new_esim" &&
    order.providerAtPurchase?.toLowerCase() === "esim go" &&
    order.providerProductIdAtPurchase === "esim_1GB_7D_RS_V2" &&
    order.countryAtPurchase === "Serbia" &&
    order.dataAtPurchase === "1GB";

  if (!isControlledTestOrder) {
    redirect(`/admin/orders/${orderId}?liveFulfillment=ineligible`);
  }

  let status = "failed";
  let reason = "Unknown live fulfillment error.";

  try {
    const result = await fulfillPaidOrderWithEsimGo(order.id);
    reason =
      "reason" in result && typeof result.reason === "string"
        ? result.reason
        : "completed";

    if (result.fulfilled) {
      await sendDeliveryEmailIfReady(order.id);
      status = "passed";
    }
  } catch (error) {
    reason =
      error instanceof Error
        ? error.message.slice(0, 300)
        : "Unknown live fulfillment error.";
  }

  await writeAdminAuditLog({
    adminUserId: actor.id,
    action:
      status === "passed"
        ? "ESIM_GO_CONTROLLED_FULFILLMENT_PASSED"
        : "ESIM_GO_CONTROLLED_FULFILLMENT_FAILED",
    resource: "ORDER",
    resourceId: order.id,
    metadata: {
      orderNumber: order.orderNumber,
      providerProductId: order.providerProductIdAtPurchase,
      status,
      reason,
      controlledTest: true,
    },
  });

  revalidateOrderPages(order.id);
  redirect(`/admin/orders/${order.id}?liveFulfillment=${status}`);
}
