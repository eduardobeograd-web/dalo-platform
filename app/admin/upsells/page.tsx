import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

function formatPrice(value: number) {
  return `€${value.toFixed(2)}`;
}

export default async function UpsellsPage() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    orderBy: {
      sellPrice: "asc",
    },
  });

  const upsellRules = products
    .filter((product) => product.role === "main")
    .map((baseProduct) => {
      const upsellProduct =
        products.find(
          (product) =>
            product.id !== baseProduct.id &&
            product.sellPrice > baseProduct.sellPrice
        ) || null;

      return {
        baseProduct,
        upsellProduct,
        trigger: "Result Page",
        status: upsellProduct ? "Active" : "Missing Upsell",
      };
    });

  const activeUpsells = upsellRules.filter(
    (rule) => rule.status === "Active"
  ).length;

  return (
    <AdminShell activePage="upsells">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Upsells
          </h1>

          <p className="mt-2 text-slate-600">
            Upsells are generated from active database products.
          </p>
        </div>

        <button className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
          Add Upsell
        </button>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Upsell Rules
          </p>
          <h2 className="mt-3 text-3xl font-bold">{upsellRules.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Active Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{products.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Active Upsells
          </p>
          <h2 className="mt-3 text-3xl font-bold">{activeUpsells}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Upsell Revenue
          </p>
          <h2 className="mt-3 text-3xl font-bold">€0</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-950">
              Upsell Rules
            </h2>

            <p className="mt-1 text-slate-600">
              Each main product gets the next higher priced active product as upgrade.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Base Product</th>
                  <th className="px-6 py-4 font-semibold">Base Price</th>
                  <th className="px-6 py-4 font-semibold">Upsell Product</th>
                  <th className="px-6 py-4 font-semibold">Upsell Price</th>
                  <th className="px-6 py-4 font-semibold">Price Difference</th>
                  <th className="px-6 py-4 font-semibold">Trigger</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {upsellRules.map((rule) => {
                  const priceDifference = rule.upsellProduct
                    ? rule.upsellProduct.sellPrice - rule.baseProduct.sellPrice
                    : 0;

                  return (
                    <tr
                      key={rule.baseProduct.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold">{rule.baseProduct.name}</div>
                        <div className="text-sm text-slate-500">
                          {rule.baseProduct.data} / {rule.baseProduct.validityDays} Days
                        </div>
                      </td>

                      <td className="px-6 py-5 font-bold">
                        {formatPrice(rule.baseProduct.sellPrice)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="font-bold">
                          {rule.upsellProduct?.name || "No upsell found"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {rule.upsellProduct
                            ? `${rule.upsellProduct.data} / ${rule.upsellProduct.validityDays} Days`
                            : "Add a higher priced active product"}
                        </div>
                      </td>

                      <td className="px-6 py-5 font-bold">
                        {rule.upsellProduct
                          ? formatPrice(rule.upsellProduct.sellPrice)
                          : "—"}
                      </td>

                      <td className="px-6 py-5 font-bold text-green-700">
                        {rule.upsellProduct
                          ? `+${formatPrice(priceDifference)}`
                          : "—"}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                          {rule.trigger}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-bold ${
                            rule.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {rule.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold">Upsell Preview</h2>

            <p className="mt-2 text-slate-300">
              The customer sees one simple upgrade, not a confusing list.
            </p>

            <div className="mt-6 rounded-[2rem] bg-white p-6 text-slate-900">
              <div className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
                Need more freedom?
              </div>

              <h3 className="text-2xl font-bold">Upgrade Your Plan</h3>

              <p className="mt-3 text-slate-600">
                Get more data and more flexibility for your trip.
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
              Keep upsells simple. One upgrade is enough.
            </p>

            <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-blue-700">
              <strong>Rule:</strong> one recommendation, one upgrade, one clear
              purchase path.
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}