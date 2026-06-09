import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

function formatPrice(value: number) {
  return `€${value.toFixed(2)}`;
}

function getMargin(buyPrice: number, sellPrice: number) {
  const profit = sellPrice - buyPrice;
  return Math.round((profit / sellPrice) * 100);
}

function getProfit(buyPrice: number, sellPrice: number) {
  return sellPrice - buyPrice;
}

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const activeProducts = products.filter((product) => product.active);

  const averageMargin =
    products.length > 0
      ? products.reduce(
          (total, product) =>
            total + getMargin(product.buyPrice, product.sellPrice),
          0
        ) / products.length
      : 0;

  return (
    <AdminShell activePage="products">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Products
          </h1>

          <p className="mt-2 text-slate-600">
            Products are loaded from the local DALO database.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/admin/products/import"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
          >
            Import Rate Sheet
          </a>

          <a
            href="/admin/products/new"
            className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            Add Product
          </a>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Total Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{products.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Active Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{activeProducts.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Average Margin
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            {Math.round(averageMargin)}%
          </h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            API Providers
          </p>
          <h2 className="mt-3 text-3xl font-bold">1</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-bold text-slate-950">
            Product Catalog
          </h2>

          <p className="mt-1 text-slate-600">
            These products are stored in SQLite via Prisma.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Country</th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Validity</th>
                <th className="px-6 py-4 font-semibold">Plan Type</th>
                <th className="px-6 py-4 font-semibold">Buy</th>
                <th className="px-6 py-4 font-semibold">Sell</th>
                <th className="px-6 py-4 font-semibold">Profit</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Provider ID</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => {
                const profit = getProfit(product.buyPrice, product.sellPrice);
                const margin = getMargin(product.buyPrice, product.sellPrice);

                return (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="px-6 py-5 font-semibold">
                      {product.country}
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-bold">{product.name}</div>
                      <div className="text-sm text-slate-500">
                        {product.provider}
                      </div>
                    </td>

                    <td className="px-6 py-5">{product.data}</td>

                    <td className="px-6 py-5">
                      {product.validityDays} Days
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                        {product.planType.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      {formatPrice(product.buyPrice)}
                    </td>

                    <td className="px-6 py-5 font-bold">
                      {formatPrice(product.sellPrice)}
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-bold text-green-700">
                        {formatPrice(profit)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {margin}% margin
                      </div>
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
                        {product.active ? "Active" : "Paused"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <a
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                      >
                        Edit
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}