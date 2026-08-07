"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "../../../../lib/customer-auth";
import { prisma } from "../../../../lib/db";
import { getEsimGoReadiness } from "../../../../lib/providers/esim-go/config";
import { syncEsimGoProfileUsage } from "../../../../lib/providers/esim-go/sync";
import { getProviderConfigBySlug } from "../../../../lib/providers/provider-configs";

const MINIMUM_SYNC_INTERVAL_MS = 60_000;

function orderRedirect(orderId: string, status: string): never {
  redirect(
    `/customer/orders/${encodeURIComponent(orderId)}?usageSync=${encodeURIComponent(status)}`,
  );
}

export async function refreshCustomerEsimGoUsage(formData: FormData) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const orderId = String(formData.get("orderId") || "").trim();
  if (!orderId) {
    redirect("/customer/dashboard");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      payment: "Paid",
      esimProfileId: { not: null },
      OR: [{ customerId: customer.id }, { customer: customer.email }],
    },
    select: {
      id: true,
      esimProfileId: true,
      lastUsageSyncAt: true,
      esimProfile: {
        select: {
          provider: true,
          lastSyncedAt: true,
        },
      },
    },
  });

  const profileProvider = order?.esimProfile?.provider.trim().toLowerCase();
  if (
    !order?.esimProfileId ||
    !profileProvider ||
    !["esim go", "esim-go", "esimgo"].includes(profileProvider)
  ) {
    orderRedirect(orderId, "unavailable");
  }

  const readiness = getEsimGoReadiness();
  const providerConfig = readiness.readAccessEnabled
    ? await getProviderConfigBySlug("esim-go")
    : null;

  if (
    !readiness.readAccessEnabled ||
    !providerConfig?.active ||
    !providerConfig.usageSyncEnabled
  ) {
    orderRedirect(order.id, "unavailable");
  }

  const lastSync = order.lastUsageSyncAt || order.esimProfile?.lastSyncedAt;
  if (lastSync && Date.now() - lastSync.getTime() < MINIMUM_SYNC_INTERVAL_MS) {
    orderRedirect(order.id, "recent");
  }

  try {
    await syncEsimGoProfileUsage(order.esimProfileId);
  } catch (error) {
    console.error("Customer eSIM Go usage refresh failed", {
      orderId: order.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    orderRedirect(order.id, "failed");
  }

  revalidatePath(`/customer/orders/${order.id}`);
  revalidatePath("/customer/dashboard");
  orderRedirect(order.id, "passed");
}
