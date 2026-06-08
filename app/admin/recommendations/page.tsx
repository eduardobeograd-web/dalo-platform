const rules = [
  {
    country: "Europe",
    tripLength: "1–7 Days",
    userType: "Essential",
    recommendation: "Europe Essential",
    upsell: "Europe Smart",
    conversion: "—",
    status: "Active",
  },
  {
    country: "Europe",
    tripLength: "8–14 Days",
    userType: "Everyday",
    recommendation: "Europe Smart",
    upsell: "Europe Pro 10GB",
    conversion: "—",
    status: "Active",
  },
  {
    country: "Europe",
    tripLength: "15–30 Days",
    userType: "Power User",
    recommendation: "Europe Unlimited",
    upsell: "Unlimited Plus",
    conversion: "—",
    status: "Active",
  },
  {
    country: "Spain",
    tripLength: "8–14 Days",
    userType: "Everyday",
    recommendation: "Spain Smart",
    upsell: "Spain Pro 10GB",
    conversion: "—",
    status: "Draft",
  },
];

export default function RecommendationsPage() {
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
              className="block rounded-2xl bg-blue-600 px-5 py-4 font-semibold"
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
                Recommendations
              </h1>

              <p className="mt-2 text-slate-600">
                Control which eSIM plan DALO recommends for each trip profile.
              </p>
            </div>

            <button className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
              Add Rule
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-2xl font-bold text-slate-950">
                  Recommendation Rules
                </h2>
                <p className="mt-1 text-slate-600">
                  These rules turn quiz answers into product recommendations.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Country</th>
                      <th className="px-6 py-4 font-semibold">Trip Length</th>
                      <th className="px-6 py-4 font-semibold">User Type</th>
                      <th className="px-6 py-4 font-semibold">Recommendation</th>
                      <th className="px-6 py-4 font-semibold">Upsell</th>
                      <th className="px-6 py-4 font-semibold">Conversion</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rules.map((rule) => (
                      <tr
                        key={`${rule.country}-${rule.tripLength}-${rule.userType}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-6 py-5 font-semibold">
                          {rule.country}
                        </td>

                        <td className="px-6 py-5">{rule.tripLength}</td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                            {rule.userType}
                          </span>
                        </td>

                        <td className="px-6 py-5 font-bold">
                          {rule.recommendation}
                        </td>

                        <td className="px-6 py-5 text-slate-600">
                          {rule.upsell}
                        </td>

                        <td className="px-6 py-5">{rule.conversion}</td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold ${
                              rule.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {rule.status}
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
                <h2 className="text-2xl font-bold">Rule Builder</h2>
                <p className="mt-2 text-slate-300">
                  Later, you’ll create rules here without touching code.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">If</div>
                    <div className="mt-1 font-bold">
                      Europe + 8–14 Days + Everyday
                    </div>
                  </div>

                  <div className="text-center text-2xl">↓</div>

                  <div className="rounded-2xl bg-blue-600 p-4">
                    <div className="text-sm text-blue-100">Recommend</div>
                    <div className="mt-1 font-bold">Europe Smart 5GB</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">Upsell</div>
                    <div className="mt-1 font-bold">Europe Pro 10GB</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
                <h2 className="text-2xl font-bold text-slate-950">
                  Why this matters
                </h2>
                <p className="mt-3 text-slate-600">
                  The customer never sees complicated product logic. They only
                  see one clear recommendation.
                </p>

                <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-blue-700">
                  <strong>DALO Principle:</strong> Never show more than one main
                  recommendation, one upgrade and one fallback.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}