import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  orderConfirmationHtml,
  orderConfirmationSubject,
} from "@/lib/email-templates/order-confirmation";

const EVENT_TYPE = "order_confirmation_email_sent";

export async function sendOrderConfirmationEmail(orderId: string) {
  const existingEvent = await prisma.customerEvent.findFirst({
    where: {
      orderId,
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
    where: {
      id: orderId,
    },
  });

  if (!order) {
    return {
      sent: false as const,
      skipped: true as const,
      reason: "order_not_found",
    };
  }

  const product = await prisma.product.findUnique({
    where: {
      id: order.productId,
    },
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
  const customerAccount = order.customerId
    ? await prisma.customer.findUnique({
        where: {
          id: order.customerId,
        },
      })
    : await prisma.customer.findUnique({
        where: {
          email: order.customer,
        },
      });
  const needsPasswordSetup = !customerAccount?.passwordHash;
  const accountUrl = needsPasswordSetup
    ? `${siteUrl}/customer/forgot-password?email=${encodeURIComponent(order.customer)}`
    : `${siteUrl}/customer/orders/${order.id}`;
  const logoContent = await readFile(
    path.join(process.cwd(), "public", "dalo-email-header.png"),
    "base64"
  );
  const qrCodeContent = order.activationCode
    ? (
        await QRCode.toBuffer(order.activationCode, {
          type: "png",
          width: 320,
          margin: 2,
          errorCorrectionLevel: "M",
        })
      ).toString("base64")
    : null;

  const result = await sendEmail({
    to: order.customer,
    subject: orderConfirmationSubject(orderNumber),
    attachments: [
      {
        content: logoContent,
        filename: "dalo-email-header.png",
        contentId: "dalo-header",
      },
      ...(qrCodeContent
        ? [
            {
              content: qrCodeContent,
              filename: "dalo-esim-qr.png",
              contentId: "dalo-esim-qr",
            },
          ]
        : []),
    ],
    html: orderConfirmationHtml({
      orderNumber,
      customerName: customerAccount?.name || null,
      iccid: order.iccid,
      productName: order.productNameAtPurchase || product.name,
      destination: order.countryAtPurchase || product.country,
      data: order.dataAtPurchase || product.data,
      validityDays:
        order.validityDaysAtPurchase || product.validityDays,
      price: `$${(order.amount ?? product.sellPrice).toFixed(2)}`,
      fulfillment: order.fulfillment,
      activationCode: order.activationCode,
      qrCodeUrl: qrCodeContent ? "cid:dalo-esim-qr" : order.qrCodeUrl,
      iosInstallUrl: order.iosInstallUrl,
      androidInstallUrl: order.androidInstallUrl,
      accountUrl,
      accountButtonLabel: needsPasswordSetup
        ? "Create my DALO account"
        : "View my eSIM details",
      needsPasswordSetup,
      supportUrl: `${siteUrl}/support`,
      termsUrl: `${siteUrl}/terms`,
      refundUrl: `${siteUrl}/refund-policy`,
      privacyUrl: `${siteUrl}/privacy-policy`,
      legalVersion: order.legalVersion,
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
        fulfillment: order.fulfillment,
      },
    },
  });

  return {
    sent: true as const,
    skipped: false as const,
  };
}
