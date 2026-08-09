import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  refundConfirmationHtml,
  refundConfirmationSubject,
} from "@/lib/email-templates/refund-confirmation";
import { wasOrderEsimDelivered } from "@/lib/order-delivery";
import { getOrderPurchaseDetails } from "@/lib/order-purchase-details";
import { formatCurrencyAmount } from "@/lib/money";

const EVENT_TYPE = "refund_confirmation_email_sent";

export async function sendRefundConfirmationEmail(input: {
  orderId: string;
  amountRefunded: number;
}) {
  const existingEvent = await prisma.customerEvent.findFirst({
    where: {
      orderId: input.orderId,
      eventType: EVENT_TYPE,
    },
  });

  if (existingEvent) {
    return {
      sent: false as const,
      skipped: true as const,
      reason: "already_sent",
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
  });

  if (!order) {
    return {
      sent: false as const,
      skipped: true as const,
      reason: "order_not_found",
    };
  }

  const product = await prisma.product.findUnique({
    where: { id: order.productId },
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const orderNumber = order.orderNumber || order.id;
  const partial = order.payment === "Partially Refunded";
  const wasDelivered = wasOrderEsimDelivered(order);
  const purchase = getOrderPurchaseDetails(order, product);
  const currency = (order.currency || "USD").trim().toUpperCase();
  const amount = formatCurrencyAmount(input.amountRefunded, currency);

  const result = await sendEmail({
    to: order.customer,
    subject: refundConfirmationSubject(orderNumber, partial),
    html: refundConfirmationHtml({
      orderNumber,
      productName: purchase.productName,
      amount,
      paymentStatus: order.payment,
      wasDelivered,
      accountUrl: `${siteUrl}/customer/orders/${order.id}`,
    }),
  });

  if (!result.success) {
    return {
      sent: false as const,
      skipped: result.skipped,
      reason: "email_provider_failed",
    };
  }

  await prisma.customerEvent.create({
    data: {
      customerId: order.customerId,
      orderId: order.id,
      productId: product?.id || null,
      eventType: EVENT_TYPE,
      metadata: {
        recipient: order.customer,
        orderNumber,
        amountRefunded: input.amountRefunded,
        currency,
        paymentStatus: order.payment,
        wasDelivered,
      },
    },
  });

  return {
    sent: true as const,
    skipped: false as const,
  };
}
