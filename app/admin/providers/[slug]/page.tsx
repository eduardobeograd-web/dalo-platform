import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/AdminShell";
import {
  getProviderConfigBySlug,
  getProviderEnvStatus,
  getProviderStatusLabel,
} from "../../../../lib/providers/provider-configs";
import { getEsimGoReadiness } from "../../../../lib/providers/esim-go/config";
import { prisma } from "../../../../lib/db";
import {
  syncEsimGoNetworks,
  testEsimGoSignedWebhook,
  updateProviderConfig,
  validateEsimGoSerbiaOneGb,
} from "../actions";

type ProviderDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    networkSync?: string;
    validation?: string;
    validationTotal?: string;
    validationCurrency?: string;
    webhookTest?: string;
  }>;
};

function statusColor(label: string) {
  if (label === "Configured" || label === "Mock Ready" || label === "Not required") {
    return "text-green-700";
  }

  if (label === "Missing" || label === "Missing API Key") {
    return "text-red-700";
  }

  if (label === "Planned" || label === "Live Candidate") {
    return "text-yellow-700";
  }

  return "text-slate-950";
}

export default async function ProviderDetailPage({
  params,
  searchParams,
}: ProviderDetailPageProps) {
  const { slug } = await params;
  const {
    networkSync,
    validation,
    validationTotal,
    validationCurrency,
    webhookTest,
  } = await searchParams;
  const provider = await getProviderConfigBySlug(slug);

  if (!provider) {
    notFound();
  }

  const envStatus = getProviderEnvStatus(provider);
  const esimGoReadiness = slug === "esim-go" ? getEsimGoReadiness() : null;
  const validationProduct =
    slug === "esim-go"
      ? await prisma.product.findFirst({
          where: {
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
          orderBy: { updatedAt: "desc" },
        })
      : null;
  const statusLabel = esimGoReadiness
    ? esimGoReadiness.liveTransactionsEnabled
      ? esimGoReadiness.automaticFulfillmentEnabled
        ? "Automatic fulfillment enabled"
        : "Live transactions · manual only"
      : esimGoReadiness.apiKeyConfigured
        ? "API key ready · live locked"
        : "Missing API Key"
    : getProviderStatusLabel(provider);
  const updateProviderWithId = updateProviderConfig.bind(null, provider.id);

  const productsHref = provider.productSearchQuery
    ? `/admin/products?q=${encodeURIComponent(
        provider.productSearchQuery.split(",")[0] || provider.slug
      )}`
    : "/admin/products";

  return (
    <AdminShell activePage="providers">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            {provider.name}
          </h1>

          <p className="mt-2 text-slate-600">
            Provider configuration, API readiness and fulfillment settings.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/providers"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
          >
            Back to Providers
          </Link>

          <Link
            href={productsHref}
            className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            View Products
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Provider</p>
          <h2 className="mt-3 text-2xl font-bold">{provider.name}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Type</p>
          <h2 className="mt-3 text-2xl font-bold">{provider.type}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Status</p>
          <h2 className={`mt-3 text-2xl font-bold ${statusColor(statusLabel)}`}>
            {statusLabel}
          </h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">API Key</p>
          <h2
            className={`mt-3 text-2xl font-bold ${statusColor(
              envStatus.label
            )}`}
          >
            {envStatus.label}
          </h2>
        </div>
      </div>

      {networkSync === "read-disabled" ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <p className="font-bold">Network sync is safely disabled.</p>
          <p className="mt-1 text-sm leading-6">
            It requires the new API key, ESIM_GO_READ_ENABLED and the provider
            catalogue switch. This does not enable real purchases.
          </p>
        </div>
      ) : networkSync ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-800">
          Network coverage updated for {networkSync} countries.
        </div>
      ) : null}

      {validation === "passed" ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-900">
          <p className="font-bold">Serbia 1 GB validation passed — no purchase.</p>
          <p className="mt-1 text-sm leading-6">
            eSIM Go confirmed the bundle at {validationTotal} {validationCurrency}.
            No order or eSIM was created.
          </p>
        </div>
      ) : validation === "failed" ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-900">
          <p className="font-bold">Serbia 1 GB validation failed safely.</p>
          <p className="mt-1 text-sm leading-6">
            No purchase was attempted. Details are recorded in the admin audit log.
          </p>
        </div>
      ) : validation === "disabled" ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <p className="font-bold">Order validation is still locked.</p>
          <p className="mt-1 text-sm leading-6">
            ESIM_GO_VALIDATE_ENABLED must be enabled separately. Live fulfillment
            remains off.
          </p>
        </div>
      ) : validation === "invalid-product" ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-900">
          The exact active Serbia 1 GB / 7 days eSIM Go product could not be verified.
          No provider request was sent.
        </div>
      ) : null}

      {webhookTest === "passed" ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-900">
          <p className="font-bold">Signed webhook self-test passed.</p>
          <p className="mt-1 text-sm leading-6">
            DALO rejected an invalid signature and accepted the correctly signed
            V3 test callback. No customer or eSIM data was changed.
          </p>
        </div>
      ) : webhookTest === "disabled" ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          Signed webhook testing remains locked until ESIM_GO_WEBHOOK_ENABLED is enabled.
        </div>
      ) : webhookTest === "failed" ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-900">
          Signed webhook self-test failed. No purchase was attempted. Review the audit log before continuing.
        </div>
      ) : null}

      <form
        action={updateProviderWithId}
        className="grid gap-6 lg:grid-cols-[1fr_380px]"
      >
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
          <h2 className="text-2xl font-bold text-slate-950">
            Edit Provider
          </h2>

          <div className="mt-8 grid gap-5">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Provider Name
              </label>
              <input
                name="name"
                required
                defaultValue={provider.name}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Provider Slug
              </label>
              <input
                name="slug"
                required
                defaultValue={provider.slug}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Type</label>
              <select
                name="type"
                defaultValue={provider.type}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option>Wholesaler API</option>
                <option>Internal Test Provider</option>
                <option>Operational Fallback</option>
                <option>Future Wholesaler API</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Status</label>
              <select
                name="status"
                defaultValue={provider.status}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="planned">Planned</option>
                <option value="live_candidate">Live Candidate</option>
                <option value="configured">Configured</option>
                <option value="mock">Mock</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Base URL
              </label>
              <input
                name="baseUrl"
                defaultValue={provider.baseUrl || ""}
                placeholder="https://api.provider.com"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                API Key Env Name
              </label>
              <input
                name="apiKeyEnvName"
                defaultValue={provider.apiKeyEnvName || ""}
                placeholder="AIRALO_API_KEY"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Product Search Query
              </label>
              <input
                name="productSearchQuery"
                defaultValue={provider.productSearchQuery || ""}
                placeholder="airalo,airalo partner"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Priority
              </label>
              <input
                name="priority"
                type="number"
                defaultValue={provider.priority}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Notes</label>
              <textarea
                name="notes"
                rows={5}
                defaultValue={provider.notes || ""}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Capabilities
            </h2>

            <div className="mt-6 space-y-4">
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                <input name="active" type="checkbox" defaultChecked={provider.active} />
                Active
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                <input
                  name="fulfillmentEnabled"
                  type="checkbox"
                  defaultChecked={provider.fulfillmentEnabled}
                />
                Fulfillment enabled
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                <input
                  name="catalogueEnabled"
                  type="checkbox"
                  defaultChecked={provider.catalogueEnabled}
                />
                Catalogue sync enabled
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                <input
                  name="usageSyncEnabled"
                  type="checkbox"
                  defaultChecked={provider.usageSyncEnabled}
                />
                Usage sync enabled
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Provider Actions
            </h2>

            <div className="mt-6 grid gap-3">
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 p-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
              >
                Save Changes
              </button>

              {provider.slug === "esim-go" ? (
                <button
                  type="submit"
                  formAction={syncEsimGoNetworks}
                  disabled={!envStatus.configured}
                  className={`rounded-2xl border p-4 font-bold transition ${
                    envStatus.configured
                      ? "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  {envStatus.configured
                    ? "Sync network coverage"
                    : "API key required for network sync"}
                </button>
              ) : null}

              {provider.slug === "esim-go" && validationProduct ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                  <p className="font-bold">Safe validation test</p>
                  <p className="mt-1 text-sm leading-6">
                    {validationProduct.name}<br />
                    Provider price ceiling: ${validationProduct.buyPrice.toFixed(2)} USD
                  </p>
                  <button
                    type="submit"
                    formAction={validateEsimGoSerbiaOneGb.bind(
                      null,
                      validationProduct.id,
                    )}
                    disabled={!esimGoReadiness?.validationEnabled}
                    className={`mt-3 w-full rounded-xl border px-4 py-3 font-bold transition ${
                      esimGoReadiness?.validationEnabled
                        ? "border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    }`}
                  >
                    {esimGoReadiness?.validationEnabled
                      ? "Validate Serbia 1 GB — no purchase"
                      : "Validation locked — no purchase possible"}
                  </button>
                  <p className="mt-3 text-xs leading-5 text-amber-800">
                    Sends only eSIM Go order type “validate”. Transaction mode,
                    fulfillment and eSIM assignment remain disabled.
                  </p>
                </div>
              ) : null}

              {provider.slug === "esim-go" ? (
                <button
                  type="submit"
                  formAction={testEsimGoSignedWebhook}
                  disabled={!esimGoReadiness?.webhookEnabled}
                  className={`rounded-2xl border p-4 font-bold transition ${
                    esimGoReadiness?.webhookEnabled
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  {esimGoReadiness?.webhookEnabled
                    ? "Test signed V3 webhook — no purchase"
                    : "Signed webhook test locked"}
                </button>
              ) : null}

              <Link
                href={productsHref}
                className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
              >
                View Provider Products
              </Link>

              <Link
                href="/admin/orders"
                className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
              >
                Open Orders
              </Link>

              <Link
                href="/admin/providers/new"
                className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
              >
                Add Another Provider
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Environment
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  API Key Env
                </p>
                <p className="mt-2 font-bold">
                  {provider.apiKeyEnvName || "Not required"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Env Status
                </p>
                <p className={`mt-2 font-bold ${statusColor(envStatus.label)}`}>
                  {envStatus.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
