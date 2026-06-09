import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

const providers = [
  {
    name: "Wholesale API",
    baseUrl: "https://api.wholesale-provider.com",
    status: "Connected",
    mode: "Test Mode",
    lastSync: "Not synced yet",
  },
];

export default async function ProvidersPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const mappedProducts = products.filter(
    (product) => product.providerProductId
  );

  const activeProducts = products.filter((product) => product.active);

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
            Manage provider mappings for products stored in the DALO database.
          </p>
        </div>

        <button className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
          Add Provider
        </button>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Providers</p>
          <h2 className="mt-3 text-3xl font-bold">{providers.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Connected</p>
          <h2 className="mt-3 text-3xl font-bold text-green-700">1</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Mapped Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{mappedProducts.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Active Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{activeProducts.length}</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-950">
                Provider Connections
              </h2>

              <p className="mt-1 text-slate-600">
                Provider setup is still demo-only. Product mappings are real.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Provider</th>
                    <th className="px-6 py-4 font-semibold">Base URL</th>
                    <th className="px-6 py-4 font-semibold">Mode</th>
                    <th className="px-6 py-4 font-semibold">Products</th>
                    <th className="px-6 py-4 font-semibold">Last Sync</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {providers.map((provider) => (
                    <tr
                      key={provider.name}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold">{provider.name}</div>
                        <div className="text-sm text-slate-500">
                          Primary provider
                        </div>
                      </td>

                      <td className="px-6 py-5 font-mono text-xs text-slate-500">
                        {provider.baseUrl}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                          {provider.mode}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-bold">
                        {mappedProducts.length}
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {provider.lastSync}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                          {provider.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-2xl font-bold text-slate-950">
                Product Mappings
              </h2>

              <p className="mt-1 text-slate-600">
                These real database products are connected to provider product IDs.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">DALO Product</th>
                    <th className="px-6 py-4 font-semibold">Country</th>
                    <th className="px-6 py-4 font-semibold">Plan</th>
                    <th className="px-6 py-4 font-semibold">Usage</th>
                    <th className="px-6 py-4 font-semibold">
                      Provider Product ID
                    </th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {mappedProducts.map((product) => (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="px-6 py-5">
                        <div className="font-bold">{product.name}</div>
                        <div className="text-sm text-slate-500">
                          {product.id}
                        </div>
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {product.country}
                      </td>

                      <td className="px-6 py-5">
                        {product.data} / {product.validityDays} Days
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                          {product.usageFit}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-mono text-xs text-slate-500">
                        {product.providerProductId}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-bold ${
                            product.active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.active ? "Mapped + Active" : "Mapped + Paused"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold">Provider Setup</h2>

            <p className="mt-2 text-slate-300">
              API credentials will later be stored securely as environment
              variables.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Provider Name
                </label>
                <input
                  value="Wholesale API"
                  readOnly
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  API Base URL
                </label>
                <input
                  value="https://api.wholesale-provider.com"
                  readOnly
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  API Key
                </label>
                <input
                  value="••••••••••••••••••••"
                  readOnly
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button className="rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white">
                  Test Connection
                </button>

                <button className="rounded-2xl bg-white/10 px-5 py-4 font-bold text-white">
                  Sync Products
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Fulfillment Logic
            </h2>

            <p className="mt-3 text-slate-600">
              When a customer pays, DALO reads the selected product’s
              providerProductId and sends it to the wholesale API.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Customer buys</div>
                <div className="font-bold">Europe Smart 5GB</div>
              </div>

              <div className="text-center text-2xl text-slate-400">↓</div>

              <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
                <div className="text-sm">DALO sends Provider ID</div>
                <div className="break-all font-mono text-sm font-bold">
                  esim_5GB_15D_EU
                </div>
              </div>

              <div className="text-center text-2xl text-slate-400">↓</div>

              <div className="rounded-2xl bg-green-50 p-4 text-green-700">
                <div className="text-sm">Provider returns</div>
                <div className="font-bold">QR Code + activation data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}