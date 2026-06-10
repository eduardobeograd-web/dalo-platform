"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../../lib/db";

export async function updateProduct(productId: string, formData: FormData) {
  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      country: String(formData.get("country") || ""),
      isoCode: String(formData.get("isoCode") || "") || null,
      region: String(formData.get("region") || "") || null,
      name: String(formData.get("name") || ""),
      data: String(formData.get("data") || ""),
      validityDays: Number(formData.get("validityDays") || 0),
      planType: String(formData.get("planType") || "Fixed"),
      usageFit: String(formData.get("usageFit") || "Standard"),
      role: String(formData.get("role") || "recommended"),
      buyPrice: Number(formData.get("buyPrice") || 0),
      sellPrice: Number(formData.get("sellPrice") || 0),
      oldPrice: String(formData.get("oldPrice") || "")
        ? Number(formData.get("oldPrice"))
        : null,
      provider: String(formData.get("provider") || "eSIM Go"),
      providerProductId: String(formData.get("providerProductId") || ""),
      image: String(formData.get("image") || "/dalo-logo.png"),
      description: String(formData.get("description") || ""),
      active: formData.get("active") === "on",
    },
  });

  redirect("/admin/products");
}

export async function deactivateProduct(productId: string) {
  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      active: false,
    },
  });

  redirect("/admin/products");
}