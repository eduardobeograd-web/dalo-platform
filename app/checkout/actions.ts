"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";
import { trackCustomerEvent } from "../../lib/customer-events";

const ORDER_NUMBER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function extractDataGb(dataText: string) {
  const text = dataText.trim().toLowerCase();

  if (text.includes("unlimited")) {
    return null;
  }

  const gbMatch = text.match(/(\d+(?:\.\d+)?)\s*gb/);
  if (gbMatch) {
    return Number(gbMatch[1]);
  }

  const mbMatch = text.match(/(\d+(?:\.\d+)?)\s*mb/);
  if (mbMatch) {
    return Number(mbMatch[1]) / 1000;
  }

  return null;
}

function createRandomOrderNumber() {
  let code = "";

  for (let i = 0; i < 6; i++) {
    const index = crypto.randomInt(0, ORDER_NUMBER_CHARS.length);
    code += ORDER_NUMBER_CHARS[index];
  }

  return `DALO-${code}`;
}

async function createUniqueOrderNumber() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const orderNumber = createRandomOrderNumber();

    const existingOrder = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
    });

    if (!existingOrder) {
      return orderNumber;
    }
  }

  throw new Error("Could not create unique DALO order number.");
}

export async function createCheckoutOrder(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const email = normalizeEmail(String(formData.get("email") || ""));
  const sessionId = String(formData.get("sessionId") || "");
  const marketingCampaign = String(formData.get("marketingCampaign") || "");
  const marketingSourceEventId = String(formData.get("marketingSourceEventId") || "");

  if (!productId || !email || !email.includes("@")) {
    redirect(`/checkout?productId=${productId}&error=1`);
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    redirect("/checkout?error=1");
  }

  const customer = await prisma.customer.upsert({
    where: {
      email,
    },
    update: {
      active: true,
    },
    create: {
      email,
      active: true,
    },
  });

  const totalDataGb = extractDataGb(product.data);
  const orderNumber = await createUniqueOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customer: email,
      customerId: customer.id,
      productId: product.id,
      payment: "Pending",
      fulfillment: "Waiting",

      esimStatus: "pending",
      providerOrderId: null,
      iccid: null,
      qrCodeUrl: null,
      activationCode: null,
      iosInstallUrl: null,
      androidInstallUrl: null,

      totalDataGb,
      usedDataGb: null,
      remainingDataGb: null,

      expiresAt: null,
      lastUsageSyncAt: null,
    },
  });

  await trackCustomerEvent({
    customerId: customer.id,
    orderId: order.id,
    productId: product.id,
    sessionId: sessionId || null,
    eventType: "purchase_completed",
    metadata: {
      source: "checkout_mvp_test_order",
      sessionId: sessionId || null,
      paymentMode: "mvp_test_order",
      paymentStatus: order.payment,
      fulfillmentStatus: order.fulfillment,
      orderNumber: order.orderNumber,
      customerEmail: email,
      productName: product.name,
      destination: product.country,
      data: product.data,
      validityDays: product.validityDays,
      price: product.sellPrice,
      provider: product.provider,
      marketingCampaign: marketingCampaign || null,
      marketingSourceEventId: marketingSourceEventId || null,
      attributedToMarketing: Boolean(marketingCampaign || marketingSourceEventId),
    },
  });

  redirect(`/checkout/success?orderId=${order.id}`);
}