import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  refundConfirmationHtml,
  refundConfirmationSubject,
} from "@/lib/email-templates/refund-confirmation";

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

  if (!product) {
    return {
      sent: false as const,
      skipped: true as const,
      reason: "product_not_found",
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const orderNumber = order.orderNumber || order.id;
  const partial = order.payment === "Partially Refunded";
  const wasDelivered =
    order.fulfillment === "Delivered" || order.esimStatus === "ready";

  const result = await sendEmail({
    to: order.customer,
    subject: refundConfirmationSubject(orderNumber, partial),
    html: refundConfirmationHtml({
      orderNumber,
      productName: order.productNameAtPurchase || product.name,
      amount: `$${input.amountRefunded.toFixed(2)}`,
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
      productId: product.id,
      eventType: EVENT_TYPE,
      metadata: {
        recipient: order.customer,
        orderNumber,
        amountRefunded: input.amountRefunded,
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
