import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  paymentConfirmationHtml,
  paymentConfirmationSubject,
} from "@/lib/email-templates/payment-confirmation";

const EVENT_TYPE = "payment_confirmation_email_sent";

export async function sendPaymentConfirmationEmail(orderId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`dalo-payment-email:${orderId}`}))`;

    const existingEvent = await tx.customerEvent.findFirst({
      where: { orderId, eventType: EVENT_TYPE },
    });

    if (existingEvent) {
      return { sent: false as const, skipped: true as const, reason: "already_sent" };
    }

    const order = await tx.order.findUnique({ where: { id: orderId } });

    if (!order || order.payment !== "Paid") {
      return { sent: false as const, skipped: true as const, reason: "order_not_paid" };
    }

    const product = await tx.product.findUnique({ where: { id: order.productId } });

    if (!product) {
      return { sent: false as const, skipped: true as const, reason: "product_not_found" };
    }

    const customer = order.customerId
      ? await tx.customer.findUnique({ where: { id: order.customerId } })
      : await tx.customer.findUnique({ where: { email: order.customer } });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const orderNumber = order.orderNumber || order.id;
    const currency = (order.currency || "USD").toUpperCase();
    const amount = order.amount ?? product.sellPrice;
    const accountUrl = customer?.passwordHash
      ? `${siteUrl}/customer/orders/${order.id}`
      : `${siteUrl}/customer/forgot-password?email=${encodeURIComponent(order.customer)}`;
    const logoContent = await readFile(
      path.join(process.cwd(), "public", "dalo-email-header.png"),
      "base64",
    );
    const result = await sendEmail({
      to: order.customer,
      subject: paymentConfirmationSubject(orderNumber),
      attachments: [
        {
          content: logoContent,
          filename: "dalo-email-header.png",
          contentId: "dalo-header",
        },
      ],
      html: paymentConfirmationHtml({
        orderNumber,
        customerName: customer?.name || null,
        productName: order.productNameAtPurchase || product.name,
        destination: order.countryAtPurchase || product.country,
        data: order.dataAtPurchase || product.data,
        validityDays: order.validityDaysAtPurchase || product.validityDays,
        price: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
        }).format(amount),
        accountUrl,
        supportUrl: `${siteUrl}/support`,
      }),
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
        metadata: { recipient: order.customer, orderNumber },
      },
    });

    return { sent: true as const, skipped: false as const };
  }, { timeout: 30_000 });
}
