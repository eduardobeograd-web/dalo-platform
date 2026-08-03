import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import { getDestinationSeoIssues } from "../../../lib/catalog-readiness";
import { slugifyDestination } from "../../../lib/destination-pages";
import { prisma } from "../../../lib/db";
import { prepareDestinationSeoDrafts } from "./actions";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminDestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    prepared?: string | string[];
    status?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = (first(params.q) || "").trim().toLowerCase();
  const status = first(params.status) || "all";

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

  const rows = Array.from(destinations.entries())
    .map(([slug, countryName]) => {
      const page = managedBySlug.get(slug);
      const issues = page
        ? getDestinationSeoIssues(page)
        : ["Country page is not configured"];
      const pageStatus = !page?.published
        ? "not-published"
        : issues.length
          ? "needs-work"
          : "complete";

      return { slug, countryName, page, issues, pageStatus };
    })
    .filter(
      (row) =>
        (!query ||
          row.countryName.toLowerCase().includes(query) ||
          row.slug.includes(query)) &&
        (status === "all" || status === row.pageStatus),
    );

  const destinationRows = Array.from(destinations.entries()).map(([slug]) => {
    const page = managedBySlug.get(slug);
    const issues = page ? getDestinationSeoIssues(page) : [];
    return {
      page,
      status: !page?.published
        ? "not-published"
        : issues.length
          ? "needs-work"
          : "complete",
    };
  });
  const completeCount = destinationRows.filter((row) => row.status === "complete").length;
  const needsWorkCount = destinationRows.filter((row) => row.status === "needs-work").length;
  const notPublishedCount = destinationRows.filter((row) => row.status === "not-published").length;

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
          One country, one landing page and one clear search topic. Only
          destinations with an active plan appear here.
        </p>
      </div>

      {first(params.prepared) ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-900">
          Missing SEO content was prepared for every destination with an active
          plan. Existing complete content and indexing decisions were preserved.
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-blue-950">Prepare missing page drafts</p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-900/75">
            Adds a safe starting point to empty fields. Existing copy is not
            overwritten, and every page still requires review before publication.
          </p>
        </div>
        <form action={prepareDestinationSeoDrafts}>
          <button className="whitespace-nowrap rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800">
            Prepare all pages
          </button>
        </form>
      </div>

      <form className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]">
        <input
          name="q"
          defaultValue={first(params.q) || ""}
          placeholder="Search country or slug"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:border-blue-500"
        >
          <option value="all">All countries</option>
          <option value="not-published">Not published</option>
          <option value="needs-work">Needs work</option>
          <option value="complete">Complete</option>
        </select>
        <button className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white">
          Search
        </button>
      </form>

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Active destinations</p>
          <p className="mt-1 text-3xl font-black">{destinations.size}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Not published</p>
          <p className="mt-1 text-3xl font-black text-slate-600">{notPublishedCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Needs work</p>
          <p className="mt-1 text-3xl font-black text-amber-700">{needsWorkCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-500">Complete</p>
          <p className="mt-1 text-3xl font-black text-emerald-700">{completeCount}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rows.map(({ slug, countryName, page, issues, pageStatus }) => (
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
              <p className="mt-1 text-xs font-bold text-blue-700">
                Target keyword: eSIM for {page?.displayName || countryName}
              </p>
              {issues.length ? (
                <p className="mt-2 max-w-2xl text-sm font-semibold text-amber-700">
                  {issues.slice(0, 2).join(" · ")}
                </p>
              ) : (
                <p className="mt-2 text-sm font-semibold text-emerald-700">
                  Country content has passed the current editorial checks.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  pageStatus === "complete"
                    ? "bg-emerald-100 text-emerald-800"
                    : pageStatus === "needs-work"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {pageStatus === "complete"
                  ? "Complete"
                  : pageStatus === "needs-work"
                    ? "Needs work"
                    : "Not published"}
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
