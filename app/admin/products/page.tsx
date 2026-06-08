import { formatPrice, products } from "../../../lib/products";

function getMargin(buyPrice: number, sellPrice: number) {
  const profit = sellPrice - buyPrice;
  return Math.round((profit / sellPrice) * 100);
}

function getProfit(buyPrice: number, sellPrice: number) {
  return sellPrice - buyPrice;
}

export default function ProductsPage() {
  const activeProducts = products.filter((product) => product.active);
  const averageMargin =
    products.reduce(
      (total, product) => total + getMargin(product.buyPrice, product.sellPrice),
      0
    ) / products.length;

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
              className="block rounded-2xl bg-blue-600 px-5 py-4 font-semibold"
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
                Products
              </h1>

              <p className="mt-2 text-slate-600">
                Manage eSIM packages, pricing, usage classes and provider product IDs.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white">
                Import Rate Sheet
              </button>

              <button className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
                Add Product
              </button>
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
              <h2 className="mt-3 text-3xl font-bold">
                {activeProducts.length}
              </h2>
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
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Product Catalog
                  </h2>

                  <p className="mt-1 text-slate-600">
                    Products are now loaded from the central DALO product file.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">
                    All
                  </button>

                  <button className="rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-100">
                    Essential
                  </button>

                  <button className="rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-100">
                    Everyday
                  </button>

                  <button className="rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-100">
                    Power
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}