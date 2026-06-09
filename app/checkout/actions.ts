"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";

export async function createCheckoutOrder(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  const email = String(formData.get("email") || "");

  if (!productId || !email) {
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

  const order = await prisma.order.create({
    data: {
      customer: email,
      productId,
      payment: "Pending",
      fulfillment: "Waiting",
    },
  });

  redirect(`/checkout/success?orderId=${order.id}`);
}