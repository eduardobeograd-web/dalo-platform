"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import { ADMIN_PERMISSIONS } from "../../../lib/admin-permissions";
import { requireAdminPermission } from "../../../lib/admin-auth";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") return "";

  return value.trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key);

  return value.length > 0 ? value : null;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProviderConfig(formData: FormData) {
  await requireAdminPermission(ADMIN_PERMISSIONS.PROVIDERS_WRITE);
  const name = getString(formData, "name");
  const manualSlug = getString(formData, "slug");
  const slug = slugify(manualSlug || name);

  if (!name || !slug) {
    throw new Error("Provider name and slug are required.");
  }

  await prisma.providerConfig.create({
    data: {
      name,
      slug,
      type: getString(formData, "type") || "Wholesaler API",
      status: getString(formData, "status") || "planned",
      active: getBoolean(formData, "active"),
      priority: Number(getString(formData, "priority") || 100),
      baseUrl: getOptionalString(formData, "baseUrl"),
      apiKeyEnvName: getOptionalString(formData, "apiKeyEnvName"),
      productSearchQuery: getOptionalString(formData, "productSearchQuery"),
      fulfillmentEnabled: getBoolean(formData, "fulfillmentEnabled"),
      catalogueEnabled: getBoolean(formData, "catalogueEnabled"),
      usageSyncEnabled: getBoolean(formData, "usageSyncEnabled"),
      notes: getOptionalString(formData, "notes"),
    },
  });

  revalidatePath("/admin/providers");
  redirect(`/admin/providers/${slug}`);
}

export async function updateProviderConfig(id: string, formData: FormData) {
  await requireAdminPermission(ADMIN_PERMISSIONS.PROVIDERS_WRITE);
  const name = getString(formData, "name");
  const manualSlug = getString(formData, "slug");
  const slug = slugify(manualSlug || name);

  if (!name || !slug) {
    throw new Error("Provider name and slug are required.");
  }

  await prisma.providerConfig.update({
    where: {
      id,
    },
    data: {
      name,
      slug,
      type: getString(formData, "type") || "Wholesaler API",
      status: getString(formData, "status") || "planned",
      active: getBoolean(formData, "active"),
      priority: Number(getString(formData, "priority") || 100),
      baseUrl: getOptionalString(formData, "baseUrl"),
      apiKeyEnvName: getOptionalString(formData, "apiKeyEnvName"),
      productSearchQuery: getOptionalString(formData, "productSearchQuery"),
      fulfillmentEnabled: getBoolean(formData, "fulfillmentEnabled"),
      catalogueEnabled: getBoolean(formData, "catalogueEnabled"),
      usageSyncEnabled: getBoolean(formData, "usageSyncEnabled"),
      notes: getOptionalString(formData, "notes"),
    },
  });

  revalidatePath("/admin/providers");
  revalidatePath(`/admin/providers/${slug}`);
  redirect(`/admin/providers/${slug}`);
}
