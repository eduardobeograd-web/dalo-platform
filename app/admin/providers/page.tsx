const providers = [
  {
    name: "Wholesale API",
    baseUrl: "https://api.wholesale-provider.com",
    status: "Connected",
    mode: "Test Mode",
    products: 3,
    lastSync: "Not synced yet",
  },
];

export default function ProvidersPage() {
  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 p-6 text-white md:block">
          <a href="/" className="mb-10 block">
            <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
          </a>

          <nav className="space-y-2">
            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin"
            >
              Dashboard
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/products"
            >
              Products
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/recommendations"
            >
              Recommendations
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/upsells"
            >
              Upsells
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/orders"
            >
              Orders
            </a>

            <a
              className="block rounded-2xl bg-blue-600 px-5 py-4 font-semibold"
              href="/admin/providers"
            >
              API Providers
            </a>
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                DALO Admin
              </p>

              <h1 className="mt-2 text-4xl font-bold text-slate-950">
                API Providers
              </h1>

              <p className="mt-2 text-slate-600">
                Manage wholesale eSIM providers, API keys and product mappings.
              </p>
            </div>

            <button className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
              Add Provider
            </button>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Providers
              </p>
              <h2 className="mt-3 text-3xl font-bold">1</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Connected
              </p>
              <h2 className="mt-3 text-3xl font-bold text-green-700">1</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Mapped Products
              </p>
              <h2 className="mt-3 text-3xl font-bold">3</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                API Errors
              </p>
              <h2 className="mt-3 text-3xl font-bold">0</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-2xl font-bold text-slate-950">
                  Provider Connections
                </h2>
                <p className="mt-1 text-slate-600">
                  Each DALO product can be linked to a wholesale provider product ID.
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
                      <tr key={provider.name} className="border-t border-slate-100">
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
                          {provider.products}
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

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
                <h2 className="text-2xl font-bold">Provider Setup</h2>
                <p className="mt-2 text-slate-300">
                  Later, your API credentials will be stored securely as environment variables.
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
                  Product Mapping
                </h2>

                <p className="mt-3 text-slate-600">
                  Each product in DALO needs a provider product ID. That tells
                  the backend which eSIM to order after payment.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">DALO Product</div>
                    <div className="font-bold">Europe Smart 5GB</div>
                  </div>

                  <div className="text-center text-2xl text-slate-400">↓</div>

                  <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
                    <div className="text-sm">Provider Product ID</div>
                    <div className="font-mono text-sm font-bold">
                      esim_5GB_15D_EU
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}