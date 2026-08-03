import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/AdminShell";
import {
  getProviderConfigBySlug,
  getProviderEnvStatus,
  getProviderStatusLabel,
} from "../../../../lib/providers/provider-configs";
import { syncEsimGoNetworks, updateProviderConfig } from "../actions";

type ProviderDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    networkSync?: string;
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
  const { networkSync } = await searchParams;
  const provider = await getProviderConfigBySlug(slug);

  if (!provider) {
    notFound();
  }

  const envStatus = getProviderEnvStatus(provider);
  const statusLabel = getProviderStatusLabel(provider);
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

      {networkSync === "missing-key" ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <p className="font-bold">Network sync is not configured yet.</p>
          <p className="mt-1 text-sm leading-6">
            Add ESIM_GO_API_KEY to the Vercel environment and redeploy before
            starting the network coverage sync.
          </p>
        </div>
      ) : networkSync ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 font-semibold text-green-800">
          Network coverage updated for {networkSync} countries.
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
