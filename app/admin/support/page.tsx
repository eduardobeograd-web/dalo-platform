import Link from "next/link";
import type { Prisma } from "../../generated/prisma/client";
import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";

const PAGE_SIZE = 30;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function statusClass(status: string) {
  if (status === "resolved") return "bg-emerald-50 text-emerald-700";
  if (status === "in_progress") return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

function statusLabel(status: string) {
  if (status === "resolved") return "Resolved";
  if (status === "in_progress") return "Being handled";
  return "New request";
}

export default async function AdminSupportPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const query = first(params.q).trim();
  const status = first(params.status) || "open";
  const page = Math.max(1, Number(first(params.page)) || 1);
  const where: Prisma.SupportRequestWhereInput = {
    ...(status !== "all" ? { status } : {}),
    ...(query ? { OR: [
      { customerEmail: { contains: query, mode: "insensitive" } },
      { orderNumber: { contains: query, mode: "insensitive" } },
      { iccid: { contains: query, mode: "insensitive" } },
      { reason: { contains: query, mode: "insensitive" } },
    ] } : {}),
  };

  const [requests, count, open, inProgress] = await Promise.all([
    prisma.supportRequest.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.supportRequest.count({ where }),
    prisma.supportRequest.count({ where: { status: "open" } }),
    prisma.supportRequest.count({ where: { status: "in_progress" } }),
  ]);

  return (
    <AdminShell activePage="support">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Customer support</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Support inbox</h1>
          <p className="mt-2 text-slate-600">Prioritize new customer issues and find requests by order, email or ICCID.</p>
        </div>
        <Link href="/support-console" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-800">
          Open Support App →
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <span className="rounded-xl bg-blue-50 px-4 py-3 font-black text-blue-700">{open} new requests</span>
        <span className="rounded-xl bg-amber-50 px-4 py-3 font-black text-amber-700">{inProgress} being handled</span>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_200px_auto]">
        <input name="q" defaultValue={query} placeholder="Email, DALO order, ICCID or topic" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" />
        <select name="status" defaultValue={status} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold">
          <option value="open">New requests</option>
          <option value="in_progress">Being handled</option>
          <option value="resolved">Resolved</option>
          <option value="all">All requests</option>
        </select>
        <button className="rounded-xl bg-blue-700 px-6 py-3 font-black text-white">Filter</button>
      </form>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4 font-black text-slate-950">{count} matching requests</div>
        <div className="divide-y divide-slate-100">
          {requests.map((request) => (
            <Link key={request.id} href={`/admin/support/${request.id}`} className="grid gap-4 px-5 py-5 hover:bg-slate-50 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(request.status)}`}>{statusLabel(request.status)}</span>
                  <span className="text-xs text-slate-400">{request.createdAt.toLocaleString("en")}</span>
                </div>
                <p className="mt-2 font-black text-slate-950">{request.reason}</p>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">{request.message}</p>
              </div>
              <p className="truncate text-sm font-bold text-slate-700">{request.customerEmail}</p>
              <div className="text-sm">
                <p className="font-black text-slate-800">{request.orderNumber || "No order"}</p>
                <p className="mt-1 text-slate-400">{request.iccid || "No ICCID"}</p>
              </div>
              <span className="font-black text-blue-700">Open</span>
            </Link>
          ))}
          {requests.length === 0 ? <p className="px-5 py-14 text-center text-slate-500">No support requests match these filters.</p> : null}
        </div>
      </section>
    </AdminShell>
  );
}
