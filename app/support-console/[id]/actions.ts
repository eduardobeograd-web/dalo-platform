"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_PERMISSIONS } from "../../../lib/admin-permissions";
import { requireAdminPermission, writeAdminAuditLog } from "../../../lib/admin-auth";
import { prisma } from "../../../lib/db";
import { sendEmail } from "../../../lib/email";
import { buildSupportReplyEmail } from "../../../lib/email-templates/support-reply";

export async function updateSupportRequestStatus(
  requestId: string,
  status: "open" | "in_progress" | "resolved",
) {
  const actor = await requireAdminPermission(ADMIN_PERMISSIONS.SUPPORT_WRITE);
  await prisma.supportRequest.update({ where: { id: requestId }, data: { status } });
  await writeAdminAuditLog({
    adminUserId: actor.id,
    action: "SUPPORT_STATUS_UPDATED",
    resource: "SUPPORT_REQUEST",
    resourceId: requestId,
    metadata: { status },
  });
  revalidatePath("/support-console");
  redirect(`/support-console/${requestId}`);
}

export async function sendSupportReply(requestId: string, formData: FormData) {
  const actor = await requireAdminPermission(ADMIN_PERMISSIONS.SUPPORT_WRITE);
  const message = String(formData.get("message") || "").trim();
  if (message.length < 2 || message.length > 5000) {
    redirect(`/support-console/${requestId}?error=message`);
  }

  const request = await prisma.supportRequest.findUnique({ where: { id: requestId } });
  if (!request) redirect("/support-console");

  const subject = request.orderNumber
    ? `DALO Support - Order ${request.orderNumber}`
    : `DALO Support - ${request.reason}`;
  const reply = await prisma.supportReply.create({
    data: {
      supportRequestId: request.id,
      adminUserId: actor.id,
      recipientEmail: request.customerEmail,
      subject,
      message,
    },
  });

  const result = await sendEmail({
    to: request.customerEmail,
    subject,
    html: buildSupportReplyEmail({ message, orderNumber: request.orderNumber }),
  });

  if (!result.success) {
    await prisma.supportReply.update({
      where: { id: reply.id },
      data: { deliveryStatus: result.skipped ? "skipped" : "failed" },
    });
    redirect(`/support-console/${requestId}?error=email`);
  }

  const providerMessageId = "data" in result ? result.data?.id ?? null : null;
  await prisma.$transaction([
    prisma.supportReply.update({
      where: { id: reply.id },
      data: { deliveryStatus: "sent", providerMessageId, sentAt: new Date() },
    }),
    prisma.supportRequest.update({
      where: { id: request.id },
      data: { status: "in_progress" },
    }),
  ]);
  await writeAdminAuditLog({
    adminUserId: actor.id,
    action: "SUPPORT_REPLY_SENT",
    resource: "SUPPORT_REQUEST",
    resourceId: request.id,
    metadata: { recipient: request.customerEmail, supportReplyId: reply.id },
  });
  revalidatePath(`/support-console/${requestId}`);
  revalidatePath("/support-console");
  redirect(`/support-console/${requestId}?sent=1`);
}
