const upsells = [
  {
    baseProduct: "Europe Essential",
    upsellProduct: "Europe Smart 5GB",
    trigger: "Result Page",
    offer: "Upgrade to 5GB for more flexibility",
    extraRevenue: "+€4.44",
    status: "Active",
  },
  {
    baseProduct: "Europe Smart",
    upsellProduct: "Europe Pro 10GB",
    trigger: "Result Page",
    offer: "Upgrade to 10GB for only +€3",
    extraRevenue: "+€3.00",
    status: "Active",
  },
  {
    baseProduct: "Europe Unlimited",
    upsellProduct: "Unlimited Plus",
    trigger: "Checkout",
    offer: "Priority hotspot and streaming upgrade",
    extraRevenue: "+€5.00",
    status: "Draft",
  },
];

export default function UpsellsPage() {
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
              className="block rounded-2xl bg-blue-600 px-5 py-4 font-semibold"
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
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
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
                Upsells
              </h1>

              <p className="mt-2 text-slate-600">
                Increase average order value with smart upgrades and add-ons.
              </p>
            </div>

            <button className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
              Add Upsell
            </button>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Active Upsells
              </p>
              <h2 className="mt-3 text-3xl font-bold">2</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Upsell Revenue
              </p>
              <h2 className="mt-3 text-3xl font-bold">€0</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Conversion
              </p>
              <h2 className="mt-3 text-3xl font-bold">—</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Best Offer
              </p>
              <h2 className="mt-3 text-3xl font-bold">—</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-2xl font-bold text-slate-950">
                  Upsell Rules
                </h2>
                <p className="mt-1 text-slate-600">
                  Decide which upgrade is shown after a recommendation.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Base Product</th>
                      <th className="px-6 py-4 font-semibold">Upsell Product</th>
                      <th className="px-6 py-4 font-semibold">Trigger</th>
                      <th className="px-6 py-4 font-semibold">Offer Text</th>
                      <th className="px-6 py-4 font-semibold">Extra Revenue</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {upsells.map((upsell) => (
                      <tr
                        key={`${upsell.baseProduct}-${upsell.upsellProduct}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-6 py-5 font-semibold">
                          {upsell.baseProduct}
                        </td>

                        <td className="px-6 py-5 font-bold">
                          {upsell.upsellProduct}
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                            {upsell.trigger}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-slate-600">
                          {upsell.offer}
                        </td>

                        <td className="px-6 py-5 font-bold text-green-700">
                          {upsell.extraRevenue}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              upsell.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {upsell.status}
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
                <h2 className="text-2xl font-bold">Upsell Preview</h2>
                <p className="mt-2 text-slate-300">
                  This is what customers will see after their recommendation.
                </p>

                <div className="mt-6 rounded-[2rem] bg-white p-6 text-slate-900">
                  <div className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                    Need more freedom?
                  </div>

                  <h3 className="text-2xl font-bold">Upgrade to 10GB</h3>

                  <p className="mt-3 text-slate-600">
                    Get more data for streaming, navigation and social media.
                  </p>

                  <div className="mt-6 text-3xl font-bold text-blue-600">
                    +€3
                  </div>

                  <button className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
                <h2 className="text-2xl font-bold text-slate-950">
                  DALO Upsell Rule
                </h2>

                <p className="mt-3 text-slate-600">
                  Keep upsells simple. One upgrade is enough. Do not show users
                  too many choices.
                </p>

                <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-blue-700">
                  <strong>Rule:</strong> One recommendation, one upgrade, one
                  clear purchase path.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}