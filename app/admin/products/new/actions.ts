"use server";

import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { ADMIN_PERMISSIONS } from "../../../../lib/admin-permissions";
import { requireAdminPermission } from "../../../../lib/admin-auth";

export async function createProduct(formData: FormData) {
  await requireAdminPermission(ADMIN_PERMISSIONS.PRODUCTS_WRITE);
  const country = String(formData.get("country") || "");
  const region = String(formData.get("region") || "");
  const name = String(formData.get("name") || "");
  const data = String(formData.get("data") || "");
  const validityDays = Number(formData.get("validityDays") || 0);
  const planType = String(formData.get("planType") || "fixed");
  const usageFit = String(formData.get("usageFit") || "everyday");
  const role = String(formData.get("role") || "main");
  const buyPrice = Number(formData.get("buyPrice") || 0);
  const sellPrice = Number(formData.get("sellPrice") || 0);
  const oldPriceRaw = String(formData.get("oldPrice") || "");
  const provider = String(formData.get("provider") || "Wholesale API");
  const providerProductId = String(formData.get("providerProductId") || "");
  const image = String(formData.get("image") || "");
  const description = String(formData.get("description") || "");
  const active = formData.get("active") === "on";

  await prisma.product.create({
    data: {
      country,
      region: region || null,
      name,
      data,
      validityDays,
      planType,
      usageFit,
      role,
      buyPrice,
      sellPrice,
      oldPrice: oldPriceRaw ? Number(oldPriceRaw) : null,
      provider,
      providerProductId,
      image:
        image ||
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1400&auto=format&fit=crop",
      description,
      active,
    },
  });

  redirect("/admin/products");
}
