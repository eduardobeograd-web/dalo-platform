import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";
import { getEsimGoReadiness } from "../../../lib/providers/esim-go/config";

export const dynamic = "force-dynamic";

type ProviderStatus = "configured" | "locked" | "missing" | "mock" | "planned" | "manual";

type ProductForProviderStats = {
  provider: string | null;
  providerProductId: string | null;
  active: boolean;
};

type ProviderOverview = {
  name: string;
  slug: string;
  type: string;
  status: ProviderStatus;
  statusLabel: string;
  baseUrl: string;
  description: string;
  products: number;
  activeProducts: number;
  mappedProducts: number;
  fulfillment: boolean;
  catalogue: boolean;
  usageSync: boolean;
  detailsHref: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  secondaryActionLabel: string;
  secondaryActionHref: string;
};

function StatusBadge({ status, label }: { status: ProviderStatus; label: string }) {
  const styles =
    status === "configured"
      ? "bg-green-100 text-green-700"
      : status === "locked"
      ? "bg-amber-100 text-amber-800"
      : status === "mock"
      ? "bg-blue-100 text-blue-700"
      : status === "missing"
      ? "bg-red-100 text-red-700"
      : status === "planned"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-bold ${styles}`}>
      {label}
    </span>
  );
}

function CapabilityBadge({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-bold ${
        enabled
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {enabled ? "Yes" : "No"} · {label}
    </span>
  );
}

function providerMatches(product: ProductForProviderStats, terms: string[]) {
  const provider = (product.provider || "").toLowerCase();

  return terms.some((term) => provider.includes(term.toLowerCase()));
}

function getProviderStats(
  products: ProductForProviderStats[],
  terms: string[]
) {
  const providerProducts = products.filter((product) =>
    providerMatches(product, terms)
  );

  return {
    products: providerProducts.length,
    activeProducts: providerProducts.filter((product) => product.active).length,
    mappedProducts: providerProducts.filter(
      (product) => product.providerProductId?.trim()
    ).length,
  };
}

export default async function AdminProvidersPage() {
  const products = await prisma.product.findMany({
    select: {
      provider: true,
      providerProductId: true,
      active: true,
    },
  });

  const esimGoReadiness = getEsimGoReadiness();

  const esimGoStats = getProviderStats(products, [
    "esim go",
    "esim-go",
    "esimgo",
  ]);

  const mockStats = getProviderStats(products, ["mock", "dalo mock"]);

  const providers: ProviderOverview[] = [
    {
      name: "eSIM Go",
      slug: "esim-go",
      type: "Wholesaler API",
      status: esimGoReadiness.liveTransactionsEnabled
        ? "configured"
        : esimGoReadiness.apiKeyConfigured
          ? "locked"
          : "missing",
      statusLabel: esimGoReadiness.liveTransactionsEnabled
        ? "Live fulfillment enabled"
        : esimGoReadiness.apiKeyConfigured
          ? "API key ready · live locked"
          : "Missing API Key",
      baseUrl: esimGoReadiness.baseUrl,
      description:
        "Main live provider candidate for catalogue sync, bundle application, QR retrieval and later usage checks.",
      products: esimGoStats.products,
      activeProducts: esimGoStats.activeProducts,
      mappedProducts: esimGoStats.mappedProducts,
      fulfillment: esimGoReadiness.liveTransactionsEnabled,
      catalogue: esimGoReadiness.readAccessEnabled,
      usageSync: esimGoReadiness.webhookEnabled,
      detailsHref: "/admin/providers/esim-go",
      primaryActionLabel: "Provider Details",
      primaryActionHref: "/admin/providers/esim-go",
      secondaryActionLabel: "View Products",
      secondaryActionHref: "/admin/products?q=esim",
    },
    {
      name: "DALO Mock Provider",
      slug: "dalo-mock",
      type: "Internal Test Provider",
      status: "mock",
      statusLabel: "Mock Ready",
      baseUrl: "Local admin fulfillment action",
      description:
        "Safe provider for local testing. Creates fake ICCID, activation code, install links and QR URL without placing a real eSIM order.",
      products: mockStats.products,
      activeProducts: mockStats.activeProducts,
      mappedProducts: mockStats.mappedProducts,
      fulfillment: true,
      catalogue: false,
      usageSync: false,
      detailsHref: "/admin/providers/dalo-mock",
      primaryActionLabel: "Provider Details",
      primaryActionHref: "/admin/providers/dalo-mock",
      secondaryActionLabel: "Needs Fulfillment",
      secondaryActionHref: "/admin/orders",
    },
    {
      name: "Airalo Partner API",
      slug: "airalo",
      type: "Future Wholesaler API",
      status: "planned",
      statusLabel: "Planned",
      baseUrl: "Not configured yet",
      description:
        "Future provider integration. Product mapping and fulfillment routing should stay provider-neutral so Airalo can be added later.",
      products: 0,
      activeProducts: 0,
      mappedProducts: 0,
      fulfillment: false,
      catalogue: false,
      usageSync: false,
      detailsHref: "/admin/providers/airalo",
      primaryActionLabel: "Provider Details",
      primaryActionHref: "/admin/providers/airalo",
      secondaryActionLabel: "Add Later",
      secondaryActionHref: "/admin/providers/new",
    },
    {
      name: "Manual Fulfillment",
      slug: "manual",
      type: "Operational Fallback",
      status: "manual",
      statusLabel: "Manual",
      baseUrl: "Admin workflow",
      description:
        "Fallback for paid orders that cannot be fulfilled automatically yet. Admin can find paid but undelivered orders and handle them manually.",
      products: 0,
      activeProducts: 0,
      mappedProducts: 0,
      fulfillment: true,
      catalogue: false,
      usageSync: false,
      detailsHref: "/admin/providers/manual",
      primaryActionLabel: "Provider Details",
      primaryActionHref: "/admin/providers/manual",
      secondaryActionLabel: "Open Orders",
      secondaryActionHref: "/admin/orders",
    },
  ];

  const visibleProviders = providers.filter(
    (provider) => provider.slug === "esim-go" || provider.slug === "manual"
  );

  const readyProviders = visibleProviders.filter(
    (provider) => provider.status === "configured" || provider.status === "mock"
  ).length;

  const mappedProducts = visibleProviders.reduce(
    (total, provider) => total + provider.mappedProducts,
    0
  );

  return (
    <AdminShell activePage="providers">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            API Providers
          </h1>

          <p className="mt-2 text-slate-600">
            Manage wholesalers, fulfillment readiness and provider product mapping.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
          >
            Back to Dashboard
          </Link>

          <Link
            href="/admin/providers/new"
            className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            Add API Provider
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <Link
          href="/admin/providers"
          className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <p className="text-sm font-semibold text-slate-500">Providers</p>
          <h2 className="mt-3 text-3xl font-bold">{visibleProviders.length}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Live integration and fallback
          </p>
        </Link>

        <Link
          href="/admin/providers"
          className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <p className="text-sm font-semibold text-slate-500">Ready Paths</p>
          <h2 className="mt-3 text-3xl font-bold text-green-700">
            {readyProviders}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Configured or safe for testing
          </p>
        </Link>

        <Link
          href="/admin/products"
          className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <p className="text-sm font-semibold text-slate-500">Mapped Products</p>
          <h2 className="mt-3 text-3xl font-bold">{mappedProducts}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Products with provider IDs
          </p>
        </Link>

        <Link
          href="/admin/providers/esim-go"
          className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <p className="text-sm font-semibold text-slate-500">eSIM Go Key</p>
          <h2
            className={`mt-3 text-3xl font-bold ${
              esimGoReadiness.apiKeyConfigured
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            {esimGoReadiness.apiKeyConfigured ? "Ready" : "Missing"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            ESIM_GO_API_KEY environment
          </p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Provider List
            </h2>

            <p className="mt-1 text-slate-600">
              Click a provider to open details. Keep real fulfillment disabled until credentials and delivery mapping are verified.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Provider</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Base URL / Route</th>
                  <th className="px-6 py-4 font-semibold">Products</th>
                  <th className="px-6 py-4 font-semibold">Capabilities</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleProviders.map((provider) => (
                  <tr
                    key={provider.name}
                    className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <Link
                        href={provider.detailsHref}
                        className="font-bold text-slate-950 underline-offset-4 hover:text-blue-700 hover:underline"
                      >
                        {provider.name}
                      </Link>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {provider.type}
                      </p>

                      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                        {provider.description}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge
                        status={provider.status}
                        label={provider.statusLabel}
                      />
                    </td>

                    <td className="px-6 py-5">
                      <p className="max-w-xs break-all text-sm font-semibold text-slate-700">
                        {provider.baseUrl}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-bold">{provider.products}</span>{" "}
                          total
                        </p>
                        <p>
                          <span className="font-bold text-green-700">
                            {provider.activeProducts}
                          </span>{" "}
                          active
                        </p>
                        <p>
                          <span className="font-bold text-blue-700">
                            {provider.mappedProducts}
                          </span>{" "}
                          mapped
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex max-w-xs flex-wrap gap-2">
                        <CapabilityBadge
                          enabled={provider.fulfillment}
                          label="Fulfillment"
                        />
                        <CapabilityBadge
                          enabled={provider.catalogue}
                          label="Catalogue"
                        />
                        <CapabilityBadge
                          enabled={provider.usageSync}
                          label="Usage Sync"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={provider.primaryActionHref}
                          className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
                        >
                          {provider.primaryActionLabel}
                        </Link>

                        <Link
                          href={provider.secondaryActionHref}
                          className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-white"
                        >
                          {provider.secondaryActionLabel}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Quick Actions
            </h2>

            <div className="mt-6 grid gap-3">
              <Link
                href="/admin/providers/new"
                className="rounded-2xl bg-blue-600 p-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
              >
                + Add API Provider
              </Link>

              <Link
                href="/admin/products"
                className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
              >
                Product Mapping
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
              >
                Orders / Fulfillment
              </Link>

              <Link
                href="/api/admin/providers/esim-go/status"
                className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
              >
                eSIM Go Status JSON
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Environment Status
            </h2>

            <div className="mt-6 space-y-4">
              <Link
                href="/admin/providers/esim-go"
                className={`block rounded-2xl p-4 transition hover:-translate-y-1 ${
                  esimGoReadiness.apiKeyConfigured
                    ? "bg-green-50"
                    : "bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">ESIM_GO_API_KEY</span>
                  <span
                    className={`font-bold ${
                      esimGoReadiness.apiKeyConfigured
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {esimGoReadiness.apiKeyConfigured
                      ? "Configured"
                      : "Missing"}
                  </span>
                </div>
              </Link>

              <Link
                href="/admin/providers/esim-go"
                className="block rounded-2xl bg-blue-50 p-4 transition hover:-translate-y-1"
              >
                <p className="font-semibold">ESIM_GO_BASE_URL</p>
                <p className="mt-2 break-all text-sm font-bold text-blue-700">
                  {esimGoReadiness.baseUrl}
                </p>
              </Link>

              <Link
                href="/admin/providers/esim-go"
                className={`block rounded-2xl p-4 transition hover:-translate-y-1 ${
                  esimGoReadiness.liveTransactionsEnabled
                    ? "bg-green-50"
                    : "bg-amber-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">Real purchases</span>
                  <span
                    className={`text-right font-bold ${
                      esimGoReadiness.liveTransactionsEnabled
                        ? "text-green-700"
                        : "text-amber-800"
                    }`}
                  >
                    {esimGoReadiness.liveTransactionsEnabled
                      ? "Enabled"
                      : "Safely locked"}
                  </span>
                </div>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
