import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import { slugifyDestination } from "../../../lib/destination-pages";
import { prisma } from "../../../lib/db";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminDestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (first(params.q) || "").trim().toLowerCase();

  const [products, managedPages] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { country: true },
      distinct: ["country"],
      orderBy: { country: "asc" },
    }),
    prisma.destinationPage.findMany({
      orderBy: { displayName: "asc" },
    }),
  ]);

  const managedBySlug = new Map(
    managedPages.map((page) => [page.slug, page]),
  );
  const destinations = new Map<string, string>();

  for (const product of products) {
    const name = product.country.trim();
    if (name) destinations.set(slugifyDestination(name), name);
  }

  for (const page of managedPages) {
    destinations.set(page.slug, page.countryName);
  }

  const rows = Array.from(destinations.entries())
    .map(([slug, countryName]) => ({
      slug,
      countryName,
      page: managedBySlug.get(slug),
    }))
    .filter(
      (row) =>
        !query ||
        row.countryName.toLowerCase().includes(query) ||
        row.slug.includes(query),
    );

  return (
    <AdminShell activePage="destinations">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
          DALO Content
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950">
          Country Pages
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Manage destination content independently from provider imports and
          product pricing.
        </p>
      </div>

      <form className="mb-6 flex gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={first(params.q) || ""}
          placeholder="Search country or slug"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
        />
        <button className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white">
          Search
        </button>
      </form>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Available</p>
          <p className="mt-1 text-3xl font-black">{destinations.size}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Managed</p>
          <p className="mt-1 text-3xl font-black">{managedPages.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Indexed</p>
          <p className="mt-1 text-3xl font-black">
            {managedPages.filter((page) => page.published && page.indexable).length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rows.map(({ slug, countryName, page }) => (
          <div
            key={slug}
            className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-black text-slate-950">
                {page?.displayName || countryName}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-500">
                /esim/{slug}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  page?.published
                    ? page.indexable
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {page?.published
                  ? page.indexable
                    ? "Published + indexed"
                    : "Published + noindex"
                  : page
                    ? "Draft"
                    : "Not configured"}
              </span>
              <Link
                href={`/admin/destinations/${slug}?country=${encodeURIComponent(countryName)}`}
                className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
