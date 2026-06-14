"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";

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

  redirect(`/checkout/success?orderId=${order.id}`);
}