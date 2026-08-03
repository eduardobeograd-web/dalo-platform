import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import {
  getDestinationSeoIssues,
  getProductReadinessIssues,
} from "../../../lib/catalog-readiness";
import { slugifyDestination } from "../../../lib/destination-pages";
import { prisma } from "../../../lib/db";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CatalogReadinessPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = (first(params.q) || "").trim().toLowerCase();
  const statusFilter = first(params.status) || "all";
  const [products, pages] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        country: true,
        isoCode: true,
        name: true,
        data: true,
        validityDays: true,
        planType: true,
        usageFit: true,
        role: true,
        buyPrice: true,
        sellPrice: true,
        provider: true,
        providerProductId: true,
        image: true,
        description: true,
      },
      orderBy: [{ country: "asc" }, { sellPrice: "asc" }],
    }),
    prisma.destinationPage.findMany({
      orderBy: { displayName: "asc" },
    }),
  ]);

  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
  const destinationNames = new Map<string, string>();
  const productsBySlug = new Map<string, typeof products>();

  for (const product of products) {
    const slug = slugifyDestination(product.country);
    destinationNames.set(slug, product.country);
    const current = productsBySlug.get(slug) || [];
    current.push(product);
    productsBySlug.set(slug, current);
  }

  for (const page of pages) {
    destinationNames.set(page.slug, page.displayName || page.countryName);
  }

  const rows = Array.from(destinationNames.entries()).map(([slug, name]) => {
    const destinationProducts = productsBySlug.get(slug) || [];
    const page = pagesBySlug.get(slug);
    const productsWithIssues = destinationProducts
      .map((product) => ({
        product,
        issues: getProductReadinessIssues(product),
      }))
      .filter((item) => item.issues.length > 0);
    const seoIssues = page
      ? getDestinationSeoIssues(page)
      : ["Country page is not configured"];
    const commerceReady =
      destinationProducts.length > 0 && productsWithIssues.length === 0;
    const seoReady = Boolean(page && seoIssues.length === 0);
    const indexingRisk = Boolean(
      page?.indexable && (!commerceReady || seoIssues.length > 0),
    );
    const status =
      commerceReady && seoReady
        ? "ready"
        : indexingRisk || destinationProducts.length === 0
          ? "blocked"
          : "needs-work";

    return {
      slug,
      name,
      page,
      products: destinationProducts,
      productsWithIssues,
      seoIssues,
      commerceReady,
      seoReady,
      indexingRisk,
      status,
    };
  });

  const filteredRows = rows
    .filter((row) => {
      if (query && !row.name.toLowerCase().includes(query) && !row.slug.includes(query)) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      const priority: Record<string, number> = {
        blocked: 0,
        "needs-work": 1,
        ready: 2,
      };
      return (priority[a.status] ?? 3) - (priority[b.status] ?? 3) || a.name.localeCompare(b.name);
    });

  const readyCount = rows.filter((row) => row.status === "ready").length;
  const blockedCount = rows.filter((row) => row.status === "blocked").length;
  const productIssueCount = rows.reduce(
    (total, row) => total + row.productsWithIssues.length,
    0,
  );
  const indexingRiskCount = rows.filter((row) => row.indexingRisk).length;
  const progress = rows.length > 0 ? Math.round((readyCount / rows.length) * 100) : 0;

  return (
    <AdminShell activePage="readiness">
      <div className="mb-8 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">DALO launch control</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Product & SEO readiness</h1>
          <p className="mt-2 max-w-3xl text-slate-600">One operational view for active products, pricing safety, country content and Google indexing.</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-end justify-between gap-8"><span className="text-sm font-bold text-slate-600">Launch readiness</span><span className="text-3xl font-black text-blue-700">{progress}%</span></div>
          <div className="mt-3 h-2 w-64 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Destinations", rows.length, "text-slate-950"],
          ["Ready", readyCount, "text-emerald-700"],
          ["Blocked", blockedCount, "text-red-700"],
          ["Products with issues", productIssueCount, "text-amber-700"],
          ["Indexing risks", indexingRiskCount, "text-red-700"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-2 text-3xl font-black ${color}`}>{value}</p></div>
        ))}
      </div>

      <form className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={first(params.q) || ""} placeholder="Search country" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500" />
        <select name="status" defaultValue={statusFilter} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:border-blue-500">
          <option value="all">All statuses</option>
          <option value="blocked">Blocked</option>
          <option value="needs-work">Needs work</option>
          <option value="ready">Ready</option>
        </select>
        <button className="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">Apply</button>
      </form>

      <div className="space-y-4">
        {filteredRows.map((row) => {
          const statusStyle = row.status === "ready" ? "bg-emerald-100 text-emerald-800" : row.status === "blocked" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800";
          const statusLabel = row.status === "ready" ? "Ready" : row.status === "blocked" ? "Blocked" : "Needs work";
          return (
            <article key={row.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-black text-slate-950">{row.name}</h2><span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle}`}>{statusLabel}</span>{row.indexingRisk ? <span className="rounded-full bg-red-700 px-3 py-1 text-xs font-black text-white">Indexing risk</span> : null}</div><p className="mt-1 font-mono text-xs text-slate-500">/esim/{row.slug}</p></div>
                <div className="flex flex-wrap gap-2"><Link href={`/admin/products?q=${encodeURIComponent(row.name)}&status=active`} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">View products</Link><Link href={`/admin/destinations/${row.slug}?country=${encodeURIComponent(row.page?.countryName || row.name)}`} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800">Edit country SEO</Link></div>
              </div>
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                <section className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between"><h3 className="font-black text-slate-950">Commerce</h3><span className={`text-xs font-black ${row.commerceReady ? "text-emerald-700" : "text-amber-700"}`}>{row.products.length} active plans</span></div>{row.products.length === 0 ? <p className="mt-3 text-sm font-semibold text-red-700">No active product is available.</p> : row.productsWithIssues.length === 0 ? <p className="mt-3 text-sm text-emerald-700">All active products pass the required data and pricing checks.</p> : <ul className="mt-3 space-y-2 text-sm text-slate-700">{row.productsWithIssues.slice(0, 4).map(({ product, issues }) => <li key={product.id}><strong>{product.name}:</strong> {issues.slice(0, 2).join(", ")}</li>)}</ul>}</section>
                <section className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between"><h3 className="font-black text-slate-950">SEO & content</h3><span className={`text-xs font-black ${row.seoReady ? "text-emerald-700" : "text-amber-700"}`}>{row.page?.published ? row.page.indexable ? "Published + index" : "Published + noindex" : row.page ? "Draft" : "Not configured"}</span></div>{row.seoIssues.length === 0 ? <p className="mt-3 text-sm text-emerald-700">Content meets the current publication and indexing standard.</p> : <ul className="mt-3 grid gap-1 text-sm text-slate-700 sm:grid-cols-2">{row.seoIssues.slice(0, 8).map((issue) => <li key={issue}>- {issue}</li>)}</ul>}</section>
              </div>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}
