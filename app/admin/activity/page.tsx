import Link from "next/link";
import type { Prisma } from "@prisma/client";
import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

const PAGE_SIZE = 50;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export default async function AdminActivityPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const query = first(params.q).trim();
  const type = first(params.type).trim();
  const page = Math.max(1, Number(first(params.page)) || 1);
  const where: Prisma.CustomerEventWhereInput = {
    ...(type ? { eventType: type } : {}),
    ...(query ? { OR: [
      { email: { contains: query, mode: "insensitive" } },
      { sessionId: { contains: query, mode: "insensitive" } },
      { order: { orderNumber: { contains: query, mode: "insensitive" } } },
    ] } : {}),
  };
  const [events, count, eventTypes] = await Promise.all([
    prisma.customerEvent.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, include: { customer: true, product: true, order: true } }),
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
          {events.map((event) => <div key={event.id} className="grid gap-3 px-5 py-4 text-sm lg:grid-cols-[190px_1fr_1.3fr_1.3fr]"><p className="text-slate-500">{event.createdAt.toLocaleString("en")}</p><p className="font-mono text-xs font-black text-blue-700">{event.eventType}</p><div><p className="font-bold text-slate-900">{event.customer?.email || event.email || "Anonymous"}</p><p className="mt-1 truncate text-xs text-slate-400">{event.sessionId || "No session"}</p></div><div><p className="font-bold text-slate-700">{event.order?.orderNumber || event.product?.name || "No linked record"}</p><p className="mt-1 text-xs text-slate-400">{event.product?.country || ""}</p></div></div>)}
          {events.length === 0 ? <p className="px-5 py-14 text-center text-slate-500">No matching activity.</p> : null}
        </div>
      </section>
    </AdminShell>
  );
}
