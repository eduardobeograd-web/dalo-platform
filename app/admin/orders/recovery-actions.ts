"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminPermission, writeAdminAuditLog } from "@/lib/admin-auth";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { prisma } from "@/lib/db";
import { recoverEsimGoDelivery } from "@/lib/providers/esim-go/recovery";
import { syncEsimGoProfileUsage } from "@/lib/providers/esim-go/sync";
import { processStoredEsimGoEvent } from "@/lib/providers/esim-go/webhook-processing";
import { sendOrderConfirmationEmail } from "@/lib/order-confirmation-email";
import { getCheckoutCustomerEmailKind } from "@/lib/checkout-email-routing";

export async function recoverCustomerOrder(form: FormData) {
  const actor = await requireAdminPermission(ADMIN_PERMISSIONS.ORDERS_WRITE);
  const orderId = String(form.get("orderId") || "");
  const action = String(form.get("recoveryAction") || "");
  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  let message = "Recovery completed.";
  try {
    if (action === "installation") await recoverEsimGoDelivery(order.id);
    else if (action === "usage" && order.esimProfileId) await syncEsimGoProfileUsage(order.esimProfileId);
    else if (action !== "email") throw new Error("Recovery action is unavailable.");
    if (action !== "usage") {
      const current = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
      if (getCheckoutCustomerEmailKind(current) !== "order_confirmation") throw new Error("Delivery is not ready for email.");
      const result = await sendOrderConfirmationEmail(order.id);
      if (!result.sent && result.reason !== "already_sent") throw new Error("Delivery email failed; retry email after checking the mail service.");
    }
  } catch (error) {
    message = error instanceof Error ? error.message.slice(0,300) : "Recovery failed.";
  }
  await writeAdminAuditLog({ adminUserId: actor.id, action: "ORDER_RECOVERY", resource: "ORDER", resourceId: orderId, metadata: { action, result: message } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/customer/dashboard");
  revalidatePath(`/customer/orders/${orderId}`);
  redirect(`/admin/orders/${encodeURIComponent(orderId)}?recovery=${encodeURIComponent(message)}`);
}

export async function retryProviderEvent(form: FormData) {
  const actor = await requireAdminPermission(ADMIN_PERMISSIONS.ORDERS_WRITE);
  const id = String(form.get("eventId") || "");
  let message = "Provider event processed.";
  try { await processStoredEsimGoEvent(id); }
  catch (error) { message = error instanceof Error ? error.message.slice(0,300) : "Retry failed."; }
  await writeAdminAuditLog({ adminUserId: actor.id, action: "PROVIDER_EVENT_RETRY", resource: "PROVIDER_EVENT", resourceId: id, metadata: { result: message } });
  revalidatePath("/admin/orders/attention");
  revalidatePath("/customer", "layout");
  redirect(`/admin/orders/attention?result=${encodeURIComponent(message)}`);
}
