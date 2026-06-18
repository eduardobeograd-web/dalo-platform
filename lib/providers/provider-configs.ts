import { prisma } from "@/lib/db";

export type ProviderConfigForAdmin = {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  active: boolean;
  priority: number;
  baseUrl: string | null;
  apiKeyEnvName: string | null;
  productSearchQuery: string | null;
  fulfillmentEnabled: boolean;
  catalogueEnabled: boolean;
  usageSyncEnabled: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const defaultProviders = [
  {
    name: "eSIM Go",
    slug: "esim-go",
    type: "Wholesaler API",
    status: "live_candidate",
    active: true,
    priority: 10,
    baseUrl: process.env.ESIM_GO_BASE_URL || "https://api.esim-go.com/v2.5",
    apiKeyEnvName: "ESIM_GO_API_KEY",
    productSearchQuery: "esim go,esim-go,esimgo",
    fulfillmentEnabled: false,
    catalogueEnabled: true,
    usageSyncEnabled: true,
    notes:
      "Main live provider candidate. Real fulfillment should stay disabled until payload and response mapping are verified.",
  },
  {
    name: "DALO Mock Provider",
    slug: "dalo-mock",
    type: "Internal Test Provider",
    status: "mock",
    active: true,
    priority: 20,
    baseUrl: "Local admin fulfillment action",
    apiKeyEnvName: null,
    productSearchQuery: "mock,dalo mock",
    fulfillmentEnabled: true,
    catalogueEnabled: false,
    usageSyncEnabled: false,
    notes:
      "Safe local test provider. Creates fake ICCID, activation code, install URLs and QR URL.",
  },
  {
    name: "Airalo Partner API",
    slug: "airalo",
    type: "Future Wholesaler API",
    status: "planned",
    active: false,
    priority: 30,
    baseUrl: null,
    apiKeyEnvName: "AIRALO_API_KEY",
    productSearchQuery: "airalo",
    fulfillmentEnabled: false,
    catalogueEnabled: false,
    usageSyncEnabled: false,
    notes:
      "Future provider integration. Keep fulfillment routing provider-neutral before enabling.",
  },
  {
    name: "Manual Fulfillment",
    slug: "manual",
    type: "Operational Fallback",
    status: "manual",
    active: true,
    priority: 999,
    baseUrl: "Admin workflow",
    apiKeyEnvName: null,
    productSearchQuery: null,
    fulfillmentEnabled: true,
    catalogueEnabled: false,
    usageSyncEnabled: false,
    notes:
      "Fallback path for paid orders that cannot be fulfilled automatically yet.",
  },
];

export async function ensureDefaultProviderConfigs() {
  for (const provider of defaultProviders) {
    await prisma.providerConfig.upsert({
      where: {
        slug: provider.slug,
      },
      update: {},
      create: provider,
    });
  }
}

export async function getProviderConfigs() {
  await ensureDefaultProviderConfigs();

  return prisma.providerConfig.findMany({
    orderBy: [
      {
        priority: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function getProviderConfigBySlug(slug: string) {
  await ensureDefaultProviderConfigs();

  return prisma.providerConfig.findUnique({
    where: {
      slug,
    },
  });
}

export function getProviderEnvStatus(provider: {
  apiKeyEnvName: string | null;
}) {
  if (!provider.apiKeyEnvName) {
    return {
      label: "Not required",
      configured: true,
    };
  }

  const configured = Boolean(process.env[provider.apiKeyEnvName]);

  return {
    label: configured ? "Configured" : "Missing",
    configured,
  };
}

export function getProviderStatusLabel(provider: {
  status: string;
  apiKeyEnvName: string | null;
}) {
  const env = getProviderEnvStatus(provider);

  if (provider.apiKeyEnvName && !env.configured) return "Missing API Key";

  if (provider.status === "live_candidate") return "Live Candidate";
  if (provider.status === "configured") return "Configured";
  if (provider.status === "mock") return "Mock Ready";
  if (provider.status === "planned") return "Planned";
  if (provider.status === "manual") return "Manual";

  return provider.status;
}
