import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const EVENT_TYPE = "internal_order_notification_sent";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendInternalOrderNotification(orderId: string) {
  const recipient =
    process.env.DALO_INTERNAL_ORDER_EMAIL?.trim() ||
    process.env.DALO_EMAIL_REPLY_TO?.trim();

  if (!recipient) {
    return {
      sent: false as const,
      skipped: true as const,
      reason: "internal_recipient_missing",
    };
  }

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`dalo-internal-order-email:${orderId}`}))`;

    const existingEvent = await tx.customerEvent.findFirst({
      where: { orderId, eventType: EVENT_TYPE },
    });

    if (existingEvent) {
      return {
        sent: false as const,
        skipped: true as const,
        reason: "already_sent",
      };
    }

    const order = await tx.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return {
        sent: false as const,
        skipped: true as const,
        reason: "order_not_found",
      };
    }

    const [product, customer] = await Promise.all([
      tx.product.findUnique({ where: { id: order.productId } }),
      order.customerId
        ? tx.customer.findUnique({ where: { id: order.customerId } })
        : tx.customer.findUnique({ where: { email: order.customer } }),
    ]);

    if (!product) {
      return {
        sent: false as const,
        skipped: true as const,
        reason: "product_not_found",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderNumber = order.orderNumber || order.id;
    const productName = order.productNameAtPurchase || product.name;
    const destination = order.countryAtPurchase || product.country;
    const data = order.dataAtPurchase || product.data;
    const validityDays = order.validityDaysAtPurchase || product.validityDays;
    const amount = order.amount ?? product.sellPrice;
    const currency = (order.currency || "USD").toUpperCase();
    const customerName = customer?.name?.trim() || "Not provided";

    const rows = [
      ["Payment", order.payment],
      ["Customer", customerName],
      ["Email", order.customer],
      ["Order number", orderNumber],
      ["Destination", destination],
      ["Plan", productName],
      ["Package", `${data} / ${validityDays} days`],
      ["Amount", `${currency} ${amount.toFixed(2)}`],
      ["ICCID", order.iccid || "Not assigned"],
      ["Ordered", order.createdAt.toISOString()],
    ];

    const html = `
      <div style="margin:0;background:#f3f7ff;padding:32px 16px;font-family:Arial,sans-serif;color:#0f172a">
        <div style="max-width:620px;margin:0 auto;overflow:hidden;border:1px solid #dbe5f3;border-radius:20px;background:#ffffff">
          <div style="background:#173fbd;padding:24px 28px;color:#ffffff">
            <div style="font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#bfdbfe">DALO order update</div>
            <h1 style="margin:8px 0 0;font-size:25px;line-height:1.25">Payment confirmed and eSIM delivered</h1>
          </div>
          <div style="padding:24px 28px">
            <table role="presentation" style="width:100%;border-collapse:collapse">
              ${rows
                .map(
                  ([label, value]) => `
                    <tr>
                      <td style="width:34%;border-bottom:1px solid #e7edf6;padding:11px 8px 11px 0;font-size:13px;font-weight:700;color:#64748b">${escapeHtml(label)}</td>
                      <td style="border-bottom:1px solid #e7edf6;padding:11px 0;font-size:14px;font-weight:600;color:#0f172a">${escapeHtml(value)}</td>
                    </tr>`,
                )
                .join("")}
            </table>
            <a href="${escapeHtml(`${siteUrl}/admin/orders/${order.id}`)}" style="display:block;margin-top:22px;border-radius:12px;background:#173fbd;padding:14px 18px;text-align:center;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none">Open order in DALO Admin</a>
          </div>
        </div>
      </div>`;

    const result = await sendEmail({
      to: recipient,
      subject: `DALO order ${orderNumber} delivered`,
      html,
    });

    if (!result.success) {
      return {
        sent: false as const,
        skipped: result.skipped,
        reason: "email_provider_failed",
      };
    }

    await tx.customerEvent.create({
      data: {
        customerId: order.customerId,
        orderId: order.id,
        productId: product.id,
        eventType: EVENT_TYPE,
        metadata: {
          recipient,
          orderNumber,
          iccid: order.iccid,
        },
      },
    });

    return { sent: true as const, skipped: false as const };
  }, { timeout: 30_000 });
}
