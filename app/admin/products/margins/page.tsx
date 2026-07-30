import Link from "next/link";
import AdminShell from "../../../../components/AdminShell";
import { prisma } from "../../../../lib/db";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function getMarginPercent(buyPrice: number, sellPrice: number) {
  if (sellPrice <= 0) return 0;
  return ((sellPrice - buyPrice) / sellPrice) * 100;
}

const MIN_MARGIN_PERCENT = 30;
const CRITICAL_MARGIN_PERCENT = 20;
const MIN_GROSS_PROFIT = 3;
const CRITICAL_GROSS_PROFIT = 1;

function getMarginStatus(buyPrice: number, sellPrice: number) {
  const profit = sellPrice - buyPrice;
  const margin = getMarginPercent(buyPrice, sellPrice);

  if (
    margin < CRITICAL_MARGIN_PERCENT ||
    profit < CRITICAL_GROSS_PROFIT
  ) {
    return "critical";
  }

  if (margin < MIN_MARGIN_PERCENT || profit < MIN_GROSS_PROFIT) {
    return "review";
  }

  return "healthy";
}

export default async function ProductMarginsPage() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      country: true,
      name: true,
      buyPrice: true,
      sellPrice: true,
      providerProductId: true,
      active: true,
    },
    orderBy: [{ country: "asc" }, { sellPrice: "asc" }],
  });

  const activeProducts = products.filter((product) => product.active);
  const activeLossProducts = activeProducts
    .filter((product) => product.sellPrice <= product.buyPrice)
    .sort(
      (a, b) =>
        a.sellPrice - a.buyPrice - (b.sellPrice - b.buyPrice)
    );
  const protectedLossProducts = products
    .filter(
      (product) =>
        !product.active && product.sellPrice <= product.buyPrice
    )
    .sort(
      (a, b) =>
        a.sellPrice - a.buyPrice - (b.sellPrice - b.buyPrice)
    );
  const profitableProducts = activeProducts.filter(
    (product) => product.sellPrice > product.buyPrice
  );
  const criticalProducts = activeProducts.filter(
    (product) =>
      getMarginStatus(product.buyPrice, product.sellPrice) === "critical"
  );
  const reviewProducts = activeProducts.filter(
    (product) =>
      getMarginStatus(product.buyPrice, product.sellPrice) === "review"
  );
  const healthyProducts = activeProducts.filter(
    (product) =>
      getMarginStatus(product.buyPrice, product.sellPrice) === "healthy"
  );
  const averageProfit =
    profitableProducts.length > 0
      ? profitableProducts.reduce(
          (total, product) =>
            total + product.sellPrice - product.buyPrice,
          0
        ) / profitableProducts.length
      : 0;

  const displayedProducts = [
    ...criticalProducts,
    ...reviewProducts,
    ...protectedLossProducts,
  ]
    .sort(
      (a, b) =>
        getMarginPercent(a.buyPrice, a.sellPrice) -
        getMarginPercent(b.buyPrice, b.sellPrice)
    )
    .slice(0, 500);

  return (
    <AdminShell activePage="products">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Product safety
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Margin check
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Live comparison of every stored buy and sell price. Refresh this
            page after each rate-sheet import or manual price change.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          Back to products
        </Link>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-5">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">
            Active products
          </p>
          <p className="mt-3 text-3xl font-black text-slate-950">
            {activeProducts.length}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-sm font-semibold text-emerald-700">
            Healthy
          </p>
          <p className="mt-3 text-3xl font-black text-emerald-950">
            {healthyProducts.length}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-amber-800">
            Review
          </p>
          <p className="mt-3 text-3xl font-black text-amber-950">
            {reviewProducts.length}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-red-300 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">Critical</p>
          <p className="mt-3 text-3xl font-black text-red-950">
            {criticalProducts.length}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold text-amber-800">
            Protected inactive
          </p>
          <p className="mt-3 text-3xl font-black text-amber-950">
            {protectedLossProducts.length}
          </p>
        </div>
      </div>

      <div
        className={`mb-8 rounded-[1.75rem] border p-6 ${
          criticalProducts.length > 0
            ? "border-red-300 bg-red-50 text-red-950"
            : reviewProducts.length > 0
              ? "border-amber-300 bg-amber-50 text-amber-950"
              : "border-emerald-200 bg-emerald-50 text-emerald-950"
        }`}
      >
        <h2 className="text-xl font-black">
          {criticalProducts.length > 0
            ? "Critical pricing risks require attention"
            : reviewProducts.length > 0
              ? "Some products should be reviewed"
              : "All active products pass the margin guardrails"}
        </h2>
        <p className="mt-2 leading-7">
          {criticalProducts.length > 0
            ? `${criticalProducts.length} active products have less than 20% margin or less than $1.00 gross profit. Another ${reviewProducts.length} fall below the 30% margin or $3.00 gross-profit guardrail. No prices were changed automatically.`
            : reviewProducts.length > 0
              ? `${reviewProducts.length} active products fall below the 30% margin or $3.00 gross-profit guardrail. No prices were changed automatically.`
              : `Every active product has at least 30% margin and $3.00 gross profit. Average profit across profitable active products is ${formatPrice(averageProfit)}.`}
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-6">
          <h2 className="text-2xl font-black text-slate-950">
            Products requiring review
          </h2>
          <p className="mt-2 text-slate-600">
            Critical products appear first. Review means less than 30% margin
            or less than $3.00 gross profit. Prices remain unchanged.
          </p>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="p-10 text-center text-slate-600">
            No products require a margin review.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Product</th>
                  <th className="px-5 py-4 font-semibold">Provider ID</th>
                  <th className="px-5 py-4 text-right font-semibold">Buy</th>
                  <th className="px-5 py-4 text-right font-semibold">Sell</th>
                  <th className="px-5 py-4 text-right font-semibold">Profit</th>
                  <th className="px-5 py-4 text-right font-semibold">Margin</th>
                  <th className="px-5 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((product) => {
                  const profit = product.sellPrice - product.buyPrice;
                  const margin = getMarginPercent(
                    product.buyPrice,
                    product.sellPrice
                  );
                  const status = product.active
                    ? getMarginStatus(product.buyPrice, product.sellPrice)
                    : "protected";

                  return (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                            status === "critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {status === "critical"
                            ? "Critical"
                            : status === "review"
                              ? "Review"
                              : "Protected"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-950">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {product.country}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {product.providerProductId}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">
                        {formatPrice(product.buyPrice)}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">
                        {formatPrice(product.sellPrice)}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-black ${
                          status === "critical"
                            ? "text-red-700"
                            : "text-amber-700"
                        }`}
                      >
                        {formatPrice(profit)}
                      </td>
                      <td
                        className={`px-5 py-4 text-right font-black ${
                          status === "critical"
                            ? "text-red-700"
                            : "text-amber-700"
                        }`}
                      >
                        {margin.toFixed(1)}%
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-bold text-blue-700 hover:text-blue-900"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
