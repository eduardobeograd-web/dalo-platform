import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function getMargin(buyPrice: number, sellPrice: number) {
  if (sellPrice <= 0) return 0;

  const profit = sellPrice - buyPrice;
  return Math.round((profit / sellPrice) * 100);
}

function getProfit(buyPrice: number, sellPrice: number) {
  return sellPrice - buyPrice;
}

function getCountryFlag(isoCode?: string | null) {
  if (!isoCode || isoCode.length !== 2) return "🌍";

  return isoCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

function getFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function getLimit(value: string) {
  if (value === "all") return "all";

  const parsed = Number(value);

  if ([100, 200, 500, 1000].includes(parsed)) {
    return parsed;
  }

  return 200;
}

function getSearchTokens(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) || {};

  const q = getFirstParam(params.q).trim();
  const status = getFirstParam(params.status) || "active";
  const regional = getFirstParam(params.regional) || "all";
  const limit = getLimit(getFirstParam(params.limit) || "200");
  const tokens = getSearchTokens(q);

  const filters = [];

  if (status === "active") {
    filters.push({
      active: true,
    });
  }

  if (status === "inactive") {
    filters.push({
      active: false,
    });
  }

  if (regional === "regional") {
    filters.push({
      region: {
        not: null,
      },
    });
  }

  if (regional === "country") {
    filters.push({
      region: null,
    });
  }

  for (const token of tokens) {
    filters.push({
      OR: [
        { country: { contains: token } },
        { region: { contains: token } },
        { name: { contains: token } },
        { data: { contains: token } },
        { planType: { contains: token } },
        { usageFit: { contains: token } },
        { role: { contains: token } },
        { provider: { contains: token } },
        { providerProductId: { contains: token } },
        { isoCode: { contains: token } },
        { description: { contains: token } },
      ],
    });
  }

  const where = filters.length > 0 ? { AND: filters } : {};

  const [products, matchingProductsCount, totalProducts, activeProductsCount, regionalProductsCount, allProductsForStats] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [
          {
            country: "asc",
          },
          {
            region: "asc",
          },
          {
            sellPrice: "asc",
          },
          {
            validityDays: "asc",
          },
        ],
        ...(limit === "all" ? {} : { take: limit }),
      }),
      prisma.product.count({
        where,
      }),
      prisma.product.count(),
      prisma.product.count({
        where: {
          active: true,
        },
      }),
      prisma.product.count({
        where: {
          active: true,
          region: {
            not: null,
          },
        },
      }),
      prisma.product.findMany({
        select: {
          buyPrice: true,
          sellPrice: true,
        },
      }),
    ]);

  const averageMargin =
    allProductsForStats.length > 0
      ? allProductsForStats.reduce(
          (total, product) =>
            total + getMargin(product.buyPrice, product.sellPrice),
          0
        ) / allProductsForStats.length
      : 0;

  const activeFiltersCount = [
    q ? 1 : 0,
    status !== "all" ? 1 : 0,
    regional !== "all" ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);

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
            Brutal product search across country, region, data, provider IDs and pricing fields.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/products/margins"
            className="rounded-2xl border border-amber-300 bg-amber-50 px-6 py-4 font-bold text-amber-900 transition hover:bg-amber-100"
          >
            Margin Check
          </Link>

          <Link
            href="/admin/products/import"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
          >
            Import Rate Sheet
          </Link>

          <Link
            href="/admin/products/new"
            className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Total Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{totalProducts}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Active Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{activeProductsCount}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Regional Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{regionalProductsCount}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Average Margin
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            {Math.round(averageMargin)}%
          </h2>
        </div>
      </div>

      <form
        action="/admin/products"
        className="mb-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50"
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_160px_auto]">
          <div>
            <label
              htmlFor="q"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Search everything
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Europe 20GB, REUX, Balkans, eSIM Go, Power, 30 days..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold outline-none ring-blue-200 transition focus:border-blue-500 focus:bg-white focus:ring-4"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold outline-none ring-blue-200 transition focus:border-blue-500 focus:bg-white focus:ring-4"
            >
              <option value="active">Active only</option>
              <option value="all">All products</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="regional"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Product type
            </label>
            <select
              id="regional"
              name="regional"
              defaultValue={regional}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold outline-none ring-blue-200 transition focus:border-blue-500 focus:bg-white focus:ring-4"
            >
              <option value="all">All</option>
              <option value="regional">Regional only</option>
              <option value="country">Country only</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="limit"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Limit
            </label>
            <select
              id="limit"
              name="limit"
              defaultValue={String(limit)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-semibold outline-none ring-blue-200 transition focus:border-blue-500 focus:bg-white focus:ring-4"
            >
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Search
            </button>

            <Link
              href="/admin/products"
              className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
          <Link
            href="/admin/products?q=Europe&regional=regional&status=active&limit=200"
            className="rounded-full bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
          >
            Europe regional
          </Link>
          <Link
            href="/admin/products?q=Balkans&regional=regional&status=active&limit=200"
            className="rounded-full bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
          >
            Balkans
          </Link>
          <Link
            href="/admin/products?q=REUX&status=active&limit=200"
            className="rounded-full bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
          >
            REUX Provider IDs
          </Link>
          <Link
            href="/admin/products?q=50GB&status=active&limit=500"
            className="rounded-full bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
          >
            50GB plans
          </Link>
          <Link
            href="/admin/products?q=100GB&status=active&limit=500"
            className="rounded-full bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
          >
            100GB plans
          </Link>
          <Link
            href="/admin/products?regional=regional&status=active&limit=500"
            className="rounded-full bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100"
          >
            All regional
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Product Catalog
              </h2>

              <p className="mt-1 text-slate-600">
                Showing {products.length} of {matchingProductsCount} matching products.
                {activeFiltersCount > 0
                  ? ` ${activeFiltersCount} filter${activeFiltersCount === 1 ? "" : "s"} active.`
                  : " No search filters active."}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600">
              DB total: {totalProducts}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1550px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Destination</th>
                <th className="px-6 py-4 font-semibold">Region</th>
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Validity</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Role</th>
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
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={14}
                    className="px-6 py-16 text-center text-lg font-bold text-slate-500"
                  >
                    No products found. Try fewer search terms or reset filters.
                  </td>
                </tr>
              )}

              {products.map((product) => {
                const profit = getProfit(product.buyPrice, product.sellPrice);
                const margin = getMargin(product.buyPrice, product.sellPrice);
                const flag = getCountryFlag(product.isoCode);
                const isRegional = Boolean(product.region);

                return (
                  <tr key={product.id} className="border-t border-slate-100">
                    <td className="px-6 py-5 font-semibold">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{flag}</span>
                        <div>
                          <div>{product.country}</div>
                          {product.isoCode && (
                            <div className="max-w-[180px] truncate text-xs font-bold text-slate-400">
                              {product.isoCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      {product.region ? (
                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                          {product.region}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-500">
                          Country plan
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="font-bold">{product.name}</div>
                      <div className="mt-1 flex gap-2 text-sm text-slate-500">
                        <span>{product.provider}</span>
                        {isRegional && (
                          <span className="font-bold text-purple-600">
                            Regional bundle
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5 font-bold">{product.data}</td>

                    <td className="px-6 py-5">
                      {product.validityDays} Days
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                        {product.planType.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                        {product.role}
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
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          product.usageFit === "Too Low"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {product.usageFit}
                      </span>
                    </td>

                    <td className="max-w-[260px] px-6 py-5 font-mono text-xs text-slate-500">
                      <div className="truncate" title={product.providerProductId}>
                        {product.providerProductId}
                      </div>
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
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {matchingProductsCount > products.length && (
          <div className="border-t border-slate-100 bg-slate-50 p-6 text-sm font-semibold text-slate-600">
            Showing {products.length} of {matchingProductsCount} matching products.
            Increase the limit or narrow your search.
          </div>
        )}
      </div>
    </AdminShell>
  );
}
