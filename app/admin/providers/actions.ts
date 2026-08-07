"use server";

import { createHmac } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/db";
import { ADMIN_PERMISSIONS } from "../../../lib/admin-permissions";
import {
  requireAdminPermission,
  writeAdminAuditLog,
} from "../../../lib/admin-auth";
import {
  getEsimGoReadiness,
  requireEsimGoCapability,
} from "../../../lib/providers/esim-go/config";
import {
  getEsimGoNetworks,
  validateEsimGoOrder,
} from "../../../lib/providers/esim-go/client";

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
  const readiness = getEsimGoReadiness();
  const provider = await prisma.providerConfig.findUnique({
    where: { slug: "esim-go" },
    select: { active: true, catalogueEnabled: true },
  });

  if (
    !readiness.readAccessEnabled ||
    !provider?.active ||
    !provider.catalogueEnabled
  ) {
    redirect("/admin/providers/esim-go?networkSync=read-disabled");
  }

  const payload = await getEsimGoNetworks();
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

export async function validateEsimGoSerbiaOneGb(productId: string) {
  const actor = await requireAdminPermission(
    ADMIN_PERMISSIONS.PROVIDERS_WRITE,
  );
  const readiness = getEsimGoReadiness();

  if (!readiness.validationEnabled) {
    redirect("/admin/providers/esim-go?validation=disabled");
  }

  const [provider, product] = await Promise.all([
    prisma.providerConfig.findUnique({
      where: { slug: "esim-go" },
      select: { active: true, catalogueEnabled: true },
    }),
    prisma.product.findFirst({
      where: {
        id: productId,
        active: true,
        provider: "eSIM Go",
        isoCode: "RS",
        data: "1GB",
        validityDays: 7,
      },
      select: {
        id: true,
        name: true,
        buyPrice: true,
        providerProductId: true,
      },
    }),
  ]);

  if (
    !provider?.active ||
    !provider.catalogueEnabled ||
    !product ||
    !product.providerProductId.trim() ||
    !Number.isFinite(product.buyPrice) ||
    product.buyPrice <= 0
  ) {
    redirect("/admin/providers/esim-go?validation=invalid-product");
  }

  let validation = "failed";
  let total: number | null = null;
  let currency: string | null = null;
  let failureMessage = "Unknown validation error.";

  try {
    const result = await validateEsimGoOrder({
      bundleName: product.providerProductId,
    });
    total = Number(result.total);
    currency = result.currency?.trim().toUpperCase() || null;

    if (result.valid !== true) {
      throw new Error(result.statusMessage || "Provider rejected the bundle.");
    }

    if (!Number.isFinite(total)) {
      throw new Error("Provider validation returned no usable total.");
    }

    if (currency !== "USD") {
      throw new Error(`Unexpected provider currency: ${currency || "missing"}.`);
    }

    if (total > product.buyPrice + 0.01) {
      throw new Error(
        `Provider total ${total.toFixed(2)} exceeds the stored buy price ${product.buyPrice.toFixed(2)}.`,
      );
    }

    await writeAdminAuditLog({
      adminUserId: actor.id,
      action: "ESIM_GO_PRODUCT_VALIDATION_PASSED",
      resource: "PRODUCT",
      resourceId: product.id,
      metadata: {
        productName: product.name,
        providerProductId: product.providerProductId,
        providerTotal: total,
        storedBuyPrice: product.buyPrice,
        currency,
        purchaseCreated: false,
      },
    });
    validation = "passed";
  } catch (error) {
    failureMessage =
      error instanceof Error ? error.message.slice(0, 300) : failureMessage;

    await writeAdminAuditLog({
      adminUserId: actor.id,
      action: "ESIM_GO_PRODUCT_VALIDATION_FAILED",
      resource: "PRODUCT",
      resourceId: product.id,
      metadata: {
        productName: product.name,
        providerProductId: product.providerProductId,
        providerTotal: Number.isFinite(total) ? total : null,
        storedBuyPrice: product.buyPrice,
        currency,
        error: failureMessage,
        purchaseCreated: false,
      },
    });
  }

  const query = new URLSearchParams({ validation });
  if (validation === "passed" && total !== null && currency) {
    query.set("validationTotal", total.toFixed(2));
    query.set("validationCurrency", currency);
  }

  redirect(`/admin/providers/esim-go?${query.toString()}`);
}

export async function testEsimGoSignedWebhook() {
  const actor = await requireAdminPermission(
    ADMIN_PERMISSIONS.PROVIDERS_WRITE,
  );
  const readiness = getEsimGoReadiness();

  if (!readiness.webhookEnabled) {
    redirect("/admin/providers/esim-go?webhookTest=disabled");
  }

  let status = "failed";
  let invalidSignatureStatus: number | null = null;
  let validSignatureStatus: number | null = null;
  let errorMessage: string | null = null;

  try {
    const { apiKey } = requireEsimGoCapability("webhook");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL is missing.");

    const endpoint = new URL("/api/esim-go/webhook", siteUrl).toString();
    const body = JSON.stringify({
      iccid: `DALO-WEBHOOK-TEST-${Date.now()}`,
      alertType: "DALOConfigurationTest",
      bundle: {
        id: `test-${Date.now()}`,
        reference: "dalo-signed-webhook-self-test",
        name: "DALO_WEBHOOK_SELF_TEST",
        initialQuantity: 1_000_000_000,
        remainingQuantity: 1_000_000_000,
        unlimited: false,
      },
    });

    const invalidResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature-SHA256": "invalid-signature",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    invalidSignatureStatus = invalidResponse.status;

    const signature = createHmac("sha256", apiKey)
      .update(body)
      .digest("hex");
    const validResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature-SHA256": signature,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    validSignatureStatus = validResponse.status;
    const validPayload = (await validResponse.json()) as {
      received?: unknown;
      matched?: unknown;
    };

    if (
      invalidSignatureStatus !== 401 ||
      !validResponse.ok ||
      validPayload.received !== true ||
      validPayload.matched !== false
    ) {
      throw new Error("Webhook signature self-test returned an unexpected result.");
    }

    status = "passed";
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message.slice(0, 300) : "Unknown error.";
  }

  await writeAdminAuditLog({
    adminUserId: actor.id,
    action:
      status === "passed"
        ? "ESIM_GO_WEBHOOK_SELF_TEST_PASSED"
        : "ESIM_GO_WEBHOOK_SELF_TEST_FAILED",
    resource: "PROVIDER",
    resourceId: "esim-go",
    metadata: {
      invalidSignatureStatus,
      validSignatureStatus,
      unmatchedTestProfile: true,
      error: errorMessage,
    },
  });

  redirect(`/admin/providers/esim-go?webhookTest=${status}`);
}
