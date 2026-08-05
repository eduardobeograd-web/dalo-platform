import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

const PAGE_SIZE = 50;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function metadataString(metadata: unknown, key: string) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function securityEventDetails(metadata: unknown) {
  const scope = metadataString(metadata, "scope");
  const country = metadataString(metadata, "country");
  const browser = metadataString(metadata, "browser");
  const outcome = metadataString(metadata, "outcome");

  return {
    title: scope ? scope.replaceAll("-", " ") : "Security limit",
    context: [country && country !== "unknown" ? country : null, browser]
      .filter(Boolean)
      .join(" · ") || "Details not recorded",
    outcome,
  };
}

export default async function AdminActivityPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const query = first(params.q).trim();
  const type = first(params.type).trim();
  const page = Math.max(1, Number(first(params.page)) || 1);
  const where = {
    ...(type
      ? { eventType: type }
      : { eventType: { not: "security_rate_limit" } }),
    ...(query ? { OR: [
      { customer: { email: { contains: query, mode: "insensitive" as const } } },
      { sessionId: { contains: query, mode: "insensitive" as const } },
      { order: { orderNumber: { contains: query, mode: "insensitive" as const } } },
    ] } : {}),
  };
  const [events, count, eventTypes] = await Promise.all([
    prisma.customerEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: { select: { email: true } },
        product: { select: { name: true, country: true } },
        order: { select: { orderNumber: true } },
      },
    }),
    prisma.customerEvent.count({ where }),
    prisma.customerEvent.findMany({ distinct: ["eventType"], select: { eventType: true }, orderBy: { eventType: "asc" } }),
  ]);

  return (
    <AdminShell activePage="activity">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">System activity</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Activity log</h1>
        <p className="mt-2 text-slate-600">Technical customer and order events for investigation. Marketing actions remain separate.</p>
        <Link href="/admin/events" className="mt-3 inline-block text-sm font-black text-blue-700">Back to Marketing →</Link>
      </div>
      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_260px_auto]">
        <input name="q" defaultValue={query} placeholder="Email, order number or session" className="rounded-xl border border-slate-200 px-4 py-3" />
        <select name="type" defaultValue={type} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold"><option value="">All event types</option>{eventTypes.map((item) => <option key={item.eventType} value={item.eventType}>{item.eventType}</option>)}</select>
        <button className="rounded-xl bg-slate-950 px-6 py-3 font-black text-white">Filter activity</button>
      </form>
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 font-black">{count} matching events</div>
        <div className="divide-y divide-slate-100">
          {events.map((event) => {
            const securityDetails = event.eventType.startsWith("security_rate_limit")
              ? securityEventDetails(event.metadata)
              : null;

            return <div key={event.id} className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[190px_1fr_1.3fr_1.3fr]">
              <p className="text-slate-500">{event.createdAt.toLocaleString("en")}</p>
              <p className="font-mono text-xs font-black text-blue-700">{event.eventType}</p>
              <div>
                <p className="font-bold text-slate-900">{event.customer?.email || "Anonymous"}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{event.sessionId || "No session"}</p>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold capitalize text-slate-700">{securityDetails?.title || event.order?.orderNumber || event.product?.name || "No linked record"}</p>
                  {securityDetails?.outcome ? <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${securityDetails.outcome === "blocked" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>{securityDetails.outcome}</span> : null}
                </div>
                <p className="mt-1 text-xs text-slate-400">{securityDetails?.context || event.product?.country || ""}</p>
              </div>
            </div>;
          })}
          {events.length === 0 ? <p className="px-5 py-14 text-center text-slate-500">No matching activity.</p> : null}
        </div>
      </section>
    </AdminShell>
  );
}
