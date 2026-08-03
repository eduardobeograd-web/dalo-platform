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

type EsimGoNetwork = {
  name?: unknown;
  brandName?: unknown;
  mcc?: unknown;
  mnc?: unknown;
  speed?: unknown;
};

type EsimGoCountryNetworks = {
  name?: unknown;
  networks?: unknown;
};

function cleanNetwork(value: EsimGoNetwork) {
  const name =
    typeof value.brandName === "string" && value.brandName.trim()
      ? value.brandName.trim()
      : typeof value.name === "string"
        ? value.name.trim()
        : "";
  const speeds = Array.isArray(value.speed)
    ? value.speed.filter((speed): speed is string => typeof speed === "string")
    : [];

  if (!name) return null;

  return {
    name,
    mcc: typeof value.mcc === "string" ? value.mcc : null,
    mnc: typeof value.mnc === "string" ? value.mnc : null,
    speeds: Array.from(new Set(speeds.map((speed) => speed.toUpperCase()))),
  };
}

export async function syncEsimGoNetworks() {
  await requireAdminPermission(ADMIN_PERMISSIONS.PROVIDERS_WRITE);
  const apiKey = process.env.ESIM_GO_API_KEY;
  const baseUrl = (
    process.env.ESIM_GO_BASE_URL || "https://api.esim-go.com/v2.5"
  ).replace(/\/$/, "");

  if (!apiKey) {
    throw new Error("ESIM_GO_API_KEY is not configured.");
  }

  const response = await fetch(`${baseUrl}/networks?returnAll=true`, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Network sync failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    countryNetworks?: EsimGoCountryNetworks[];
  };
  const countries = Array.isArray(payload.countryNetworks)
    ? payload.countryNetworks
    : [];
  let updated = 0;

  for (const country of countries) {
    const isoCode =
      typeof country.name === "string" ? country.name.trim().toUpperCase() : "";
    const rawNetworks = Array.isArray(country.networks)
      ? (country.networks as EsimGoNetwork[])
      : [];
    const networks = rawNetworks
      .map(cleanNetwork)
      .filter((network): network is NonNullable<typeof network> => Boolean(network));

    if (!/^[A-Z]{2}$/.test(isoCode) || networks.length === 0) continue;

    const product = await prisma.product.findFirst({
      where: { isoCode, provider: "eSIM Go" },
      select: { country: true },
    });

    await prisma.countryNetworkCoverage.upsert({
      where: { isoCode },
      update: {
        countryName: product?.country || isoCode,
        networks,
        syncedAt: new Date(),
      },
      create: {
        isoCode,
        countryName: product?.country || isoCode,
        networks,
        syncedAt: new Date(),
      },
    });
    updated += 1;
  }

  redirect(`/admin/providers/esim-go?networkSync=${updated}`);
}
