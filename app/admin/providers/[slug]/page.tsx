import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/AdminShell";

type ProviderDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const providerDetails = {
  "esim-go": {
    name: "eSIM Go",
    type: "Wholesaler API",
    status: "Live candidate",
    description:
      "eSIM Go is the first real API provider prepared for DALO. Real fulfillment should only be enabled after payload and response mapping are verified.",
    baseUrl: process.env.ESIM_GO_BASE_URL || "https://api.esim-go.com/v2.5",
    apiKey: process.env.ESIM_GO_API_KEY ? "Configured" : "Missing",
    productsHref: "/admin/products?q=esim",
    ordersHref: "/admin/orders",
    statusHref: "/api/admin/providers/esim-go/status",
  },
  "dalo-mock": {
    name: "DALO Mock Provider",
    type: "Internal Test Provider",
    status: "Ready",
    description:
      "The mock provider is used for safe local testing. It creates fake installation data without placing real provider orders.",
    baseUrl: "Local admin action",
    apiKey: "Not required",
    productsHref: "/admin/products?q=mock",
    ordersHref: "/admin/orders",
    statusHref: "/admin/orders",
  },
  airalo: {
    name: "Airalo Partner API",
    type: "Future Wholesaler API",
    status: "Planned",
    description:
      "Airalo is planned for later. DALO should keep product mapping and fulfillment routing provider-neutral before this is added.",
    baseUrl: "Not configured yet",
    apiKey: "Missing",
    productsHref: "/admin/products?q=airalo",
    ordersHref: "/admin/orders",
    statusHref: "/admin/providers/new",
  },
  manual: {
    name: "Manual Fulfillment",
    type: "Operational Fallback",
    status: "Available",
    description:
      "Manual fulfillment is the fallback path for paid orders that cannot be fulfilled automatically yet.",
    baseUrl: "Admin workflow",
    apiKey: "Not required",
    productsHref: "/admin/products",
    ordersHref: "/admin/orders",
    statusHref: "/admin/orders",
  },
};

export default async function ProviderDetailPage({
  params,
}: ProviderDetailPageProps) {
  const { slug } = await params;
  const provider = providerDetails[slug as keyof typeof providerDetails];

  if (!provider) {
    notFound();
  }

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

          <p className="mt-2 text-slate-600">{provider.description}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/providers"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
          >
            Back to Providers
          </Link>

          <Link
            href={provider.productsHref}
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
          <h2 className="mt-3 text-2xl font-bold text-blue-700">
            {provider.status}
          </h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">API Key</p>
          <h2
            className={`mt-3 text-2xl font-bold ${
              provider.apiKey === "Configured"
                ? "text-green-700"
                : provider.apiKey === "Missing"
                ? "text-red-700"
                : "text-slate-950"
            }`}
          >
            {provider.apiKey}
          </h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
          <h2 className="text-2xl font-bold text-slate-950">
            Provider Configuration
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Base URL / Route</p>
              <p className="mt-2 break-all font-bold text-slate-950">
                {provider.baseUrl}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Description</p>
              <p className="mt-2 leading-7 text-slate-700">
                {provider.description}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="font-bold text-slate-950">Safety rule</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                No real provider order should be triggered automatically before
                the admin explicitly starts fulfillment and the provider response
                mapping is verified.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
          <h2 className="text-2xl font-bold text-slate-950">Actions</h2>

          <div className="mt-6 grid gap-3">
            <Link
              href={provider.productsHref}
              className="rounded-2xl bg-blue-600 p-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
            >
              View Provider Products
            </Link>

            <Link
              href={provider.ordersHref}
              className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
            >
              Open Orders
            </Link>

            <Link
              href={provider.statusHref}
              className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
            >
              Check Status / Setup
            </Link>

            <Link
              href="/admin/providers/new"
              className="rounded-2xl border border-slate-300 p-4 font-bold text-slate-700 transition hover:bg-white"
            >
              Add Another Provider
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
