import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";
import { buildSeoAudit, type SeoAuditSeverity, type SeoAuditStatus } from "../../../lib/seo-audit";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const statusCopy: Record<SeoAuditStatus, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-rose-100 text-rose-800" },
  "needs-work": { label: "Needs work", className: "bg-amber-100 text-amber-800" },
  ready: { label: "Ready", className: "bg-emerald-100 text-emerald-800" },
  excluded: { label: "Excluded", className: "bg-slate-100 text-slate-600" },
};

const severityClass: Record<SeoAuditSeverity, string> = {
  critical: "bg-rose-500",
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-blue-400",
};

export default async function AdminSeoAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (first(params.q) || "").trim().toLowerCase();
  const requestedStatus = first(params.status) || "all";
  const selectedStatus = ["all", "critical", "needs-work", "ready", "excluded"].includes(requestedStatus)
    ? requestedStatus
    : "all";

  const [products, pages] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, select: { country: true, region: true } }),
    prisma.destinationPage.findMany({ orderBy: { displayName: "asc" } }),
  ]);
  const audit = buildSeoAudit({
    activeProductCountries: products.flatMap((product) => [product.country, product.region || ""]),
    pages,
  });
  const rows = audit.filter(
    (row) =>
      (!query ||
        row.displayName.toLowerCase().includes(query) ||
        row.countryName.toLowerCase().includes(query) ||
        row.slug.includes(query)) &&
      (selectedStatus === "all" || row.status === selectedStatus),
  );
  const criticalCount = audit.filter((row) => row.status === "critical").length;
  const needsWorkCount = audit.filter((row) => row.status === "needs-work").length;
  const readyCount = audit.filter((row) => row.status === "ready").length;
  const scoredRows = audit.filter((row) => row.status !== "excluded");
  const averageScore = scoredRows.length
    ? Math.round(scoredRows.reduce((total, row) => total + row.score, 0) / scoredRows.length)
    : 0;

  return (
    <AdminShell activePage="seo-audit">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-blue-600">DALO Search quality</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">SEO Audit</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            A live, rule-based review of every destination with a page or active plan. Nothing here changes content, indexing or publication automatically.
          </p>
        </div>
        <Link href="/admin/destinations" className="w-fit rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-800">
          Manage country pages
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Average score" value={`${averageScore}/100`} tone="blue" />
        <SummaryCard label="Critical" value={criticalCount} tone="rose" />
        <SummaryCard label="Needs work" value={needsWorkCount} tone="amber" />
        <SummaryCard label="Search ready" value={readyCount} tone="emerald" />
      </div>

      {criticalCount > 0 ? (
        <section className="mb-6 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
          <div className="border-b border-rose-100 bg-rose-50 px-5 py-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">Priority queue</p>
            <h2 className="mt-1 text-lg font-black text-slate-950">Fix critical coverage gaps first</h2>
          </div>
          <div className="grid divide-y divide-slate-100 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {audit.filter((row) => row.status === "critical").slice(0, 3).map((row) => (
              <Link key={row.slug} href={`/admin/destinations/${row.slug}?country=${encodeURIComponent(row.countryName)}`} className="p-5 transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-slate-950">{row.displayName}</p>
                  <span className="text-sm font-black text-rose-700">{row.score}/100</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{row.issues[0]?.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <form className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={first(params.q) || ""} placeholder="Search country or slug" className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-blue-500 focus:bg-white" />
        <select name="status" defaultValue={selectedStatus} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold outline-none focus:border-blue-500">
          <option value="all">All audit results</option>
          <option value="critical">Critical</option>
          <option value="needs-work">Needs work</option>
          <option value="ready">Ready</option>
          <option value="excluded">Safely excluded</option>
        </select>
        <button className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800">Apply filters</button>
      </form>

      <div className="space-y-3">
        {rows.map((row) => {
          const status = statusCopy[row.status];
          return (
            <article key={row.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-black text-slate-950">{row.displayName}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}>{status.label}</span>
                    <span className="text-xs font-bold text-slate-500">{row.productCount} active {row.productCount === 1 ? "plan" : "plans"}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-400">/esim/{row.slug}</p>

                  {row.issues.length ? (
                    <div className="mt-4 grid gap-2 lg:grid-cols-2">
                      {row.issues.slice(0, 4).map((issue) => (
                        <div key={issue.code} className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
                          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${severityClass[issue.severity]}`} />
                          <div>
                            <p className="text-sm font-black text-slate-800">{issue.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{issue.guidance}</p>
                          </div>
                        </div>
                      ))}
                      {row.issues.length > 4 ? <p className="px-1 text-xs font-bold text-slate-500">+ {row.issues.length - 4} additional checks in the country editor</p> : null}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm font-semibold text-emerald-700">No current audit findings. Keep facts and product availability under review.</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-5 border-t border-slate-100 pt-4 xl:w-56 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">SEO score</p>
                    <p className={`mt-1 text-3xl font-black ${row.score >= 90 ? "text-emerald-700" : row.score >= 65 ? "text-amber-700" : "text-rose-700"}`}>{row.score}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/destinations/${row.slug}?country=${encodeURIComponent(row.countryName)}`} className="rounded-xl bg-blue-700 px-4 py-2.5 text-center text-sm font-black text-white hover:bg-blue-800">Review page</Link>
                    {row.published ? <Link href={`/esim/${row.slug}`} target="_blank" className="rounded-xl border border-slate-200 px-4 py-2 text-center text-xs font-bold text-slate-600 hover:bg-slate-50">Open live page</Link> : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="font-black text-slate-900">No destinations match these filters.</p>
            <Link href="/admin/seo-audit" className="mt-3 inline-block text-sm font-bold text-blue-700">Clear filters</Link>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone: "blue" | "rose" | "amber" | "emerald" }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-800",
    rose: "border-rose-100 bg-rose-50 text-rose-800",
    amber: "border-amber-100 bg-amber-50 text-amber-800",
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-800",
  };
  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
