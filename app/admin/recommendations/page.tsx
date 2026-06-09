import AdminShell from "../../../components/AdminShell";
import { getRecommendationRulesPreview } from "../../../lib/recommendation";
import { prisma } from "../../../lib/db";

function getPlanText(product: {
  data: string;
  validityDays: number;
} | null | undefined) {
  if (!product) return "—";
  return `${product.data} / ${product.validityDays} Days`;
}

export default async function RecommendationsPage() {
  const rules = await getRecommendationRulesPreview();

  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
  });

  return (
    <AdminShell activePage="recommendations">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Recommendations
          </h1>

          <p className="mt-2 text-slate-600">
            This page uses the same recommendation engine as the customer result page.
          </p>
        </div>

        <button className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
          Add Rule
        </button>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Engine Rules</p>
          <h2 className="mt-3 text-3xl font-bold">{rules.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Active Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{products.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Connected Rules
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            {rules.filter((rule) => rule.recommendedProduct).length}
          </h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Engine</p>
          <h2 className="mt-3 text-3xl font-bold">Live</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Recommendation Engine Preview
            </h2>

            <p className="mt-1 text-slate-600">
              These rows preview what DALO would recommend for common trip profiles.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Country</th>
                  <th className="px-6 py-4 font-semibold">Trip Length</th>
                  <th className="px-6 py-4 font-semibold">User Type</th>
                  <th className="px-6 py-4 font-semibold">Recommendation</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Upsell</th>
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

                    <td className="px-6 py-5">
                      <div className="font-bold">
                        {rule.recommendedProduct?.name || "No product found"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {rule.recommendedProduct?.id || "—"}
                      </div>
                    </td>

                    <td className="px-6 py-5 font-semibold">
                      {getPlanText(rule.recommendedProduct)}
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-bold">
                        {rule.upsellProduct?.name || "No upsell found"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {getPlanText(rule.upsellProduct)}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
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
            <h2 className="text-2xl font-bold">Shared Logic</h2>

            <p className="mt-2 text-slate-300">
              Result Page and Admin Recommendations now use the same file:
            </p>

            <div className="mt-6 rounded-2xl bg-white/10 p-4 font-mono text-sm">
              lib/recommendation.ts
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Input</div>
                <div className="mt-1 font-bold">country + days + usage</div>
              </div>

              <div className="text-center text-2xl">↓</div>

              <div className="rounded-2xl bg-blue-600 p-4">
                <div className="text-sm text-blue-100">Output</div>
                <div className="mt-1 font-bold">
                  recommended product + upsell
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              DALO Logic
            </h2>

            <p className="mt-3 text-slate-600">
              One central recommendation engine prevents different pages from showing different logic.
            </p>

            <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-blue-700">
              <strong>Principle:</strong> one engine, one recommendation, one upgrade.
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}