import type { Prisma } from "../generated/prisma/client";
import Link from "next/link";
import SupportConsoleHeader from "../../components/SupportConsoleHeader";
import { prisma } from "../../lib/db";
import { requireSupportConsole } from "../../lib/support-console-auth";
import { getFirstAllowedAdminPath } from "../../lib/admin-auth";

const PAGE_SIZE = 30;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function statusStyle(status: string) {
  if (status === "resolved") return "bg-emerald-100 text-emerald-800";
  if (status === "in_progress") return "bg-amber-100 text-amber-800";
  return "bg-blue-100 text-blue-800";
}

function statusLabel(status: string) {
  if (status === "resolved") return "Resolved";
  if (status === "in_progress") return "Being handled";
  return "New request";
}

export default async function SupportConsolePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireSupportConsole();
  const params = (await searchParams) || {};
  const query = first(params.q).trim();
  const status = first(params.status) || "open";
  const page = Math.max(1, Number(first(params.page)) || 1);
  const supportWhere: Prisma.SupportRequestWhereInput = {
    ...(status !== "all" ? { status } : {}),
    ...(query
      ? {
          OR: [
            { customerEmail: { contains: query, mode: "insensitive" } },
            { orderNumber: { contains: query, mode: "insensitive" } },
            { iccid: { contains: query, mode: "insensitive" } },
            { reason: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const orderWhere: Prisma.OrderWhereInput | undefined =
    query.length >= 3
      ? {
          OR: [
            { customer: { contains: query, mode: "insensitive" } },
            { orderNumber: { contains: query, mode: "insensitive" } },
            { iccid: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined;

  const [requests, count, open, inProgress, orders] = await Promise.all([
    prisma.supportRequest.findMany({
      where: supportWhere,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { customer: { select: { name: true } } },
    }),
    prisma.supportRequest.count({ where: supportWhere }),
    prisma.supportRequest.count({ where: { status: "open" } }),
    prisma.supportRequest.count({ where: { status: "in_progress" } }),
    orderWhere
      ? prisma.order.findMany({
          where: orderWhere,
          orderBy: { createdAt: "desc" },
          take: 8,
          select: {
            id: true,
            orderNumber: true,
            customer: true,
            payment: true,
            fulfillment: true,
            esimStatus: true,
            iccid: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
  ]);
  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-[#f3f6fc] text-slate-900">
      <SupportConsoleHeader
        adminName={admin.name}
        adminHomePath={getFirstAllowedAdminPath(admin)}
      />

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[1.75rem] bg-[#10233a] p-6 text-white shadow-[0_22px_55px_rgba(16,35,58,0.2)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f2a45f]">
                Customer support
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Support workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Find a customer, understand the order and move every request to a clear next step.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-2xl font-black">{open}</p>
                <p className="text-xs font-bold text-blue-100">New requests</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="text-2xl font-black">{inProgress}</p>
                <p className="text-xs font-bold text-amber-200">Being handled</p>
              </div>
            </div>
          </div>
        </section>

        <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_190px_auto]">
          <label className="sr-only" htmlFor="support-search">Search support</label>
          <input
            id="support-search"
            name="q"
            defaultValue={query}
            placeholder="Order, email, ICCID or topic"
            className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
          <label className="sr-only" htmlFor="support-status">Request status</label>
          <select
            id="support-status"
            name="status"
            defaultValue={status}
            className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold outline-none focus:border-blue-500"
          >
            <option value="open">New requests</option>
            <option value="in_progress">Being handled</option>
            <option value="resolved">Resolved</option>
            <option value="all">All requests</option>
          </select>
          <button className="min-h-12 rounded-xl bg-[#2148c0] px-6 font-black text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">
            Search
          </button>
        </form>

        {query.length >= 3 ? (
          <section className="mt-5 rounded-2xl border border-blue-100 bg-[#eef3ff] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">Order lookup</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">{orders.length} matching orders</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">Payment and delivery context</span>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {orders.map((order) => (
                <article key={order.id} className="rounded-xl border border-blue-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-black text-slate-950">{order.orderNumber || order.id}</p>
                      <p className="mt-1 truncate text-sm text-slate-600">{order.customer}</p>
                    </div>
                    <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black uppercase text-blue-700">{order.payment}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <p><strong className="text-slate-700">Delivery:</strong> {order.fulfillment}</p>
                    <p><strong className="text-slate-700">eSIM:</strong> {order.esimStatus || "Pending"}</p>
                    <p className="col-span-2 truncate"><strong className="text-slate-700">ICCID:</strong> {order.iccid || "Not assigned"}</p>
                  </div>
                </article>
              ))}
              {orders.length === 0 ? (
                <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-slate-500 lg:col-span-2">No orders match this search.</p>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <h2 className="font-black text-slate-950">{count} matching requests</h2>
            <span className="text-xs font-bold text-slate-400">Newest first</span>
          </div>
          <div className="divide-y divide-slate-100">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/support-console/${request.id}`}
                className="block px-5 py-5 transition hover:bg-slate-50 focus:outline-none focus-visible:bg-blue-50 sm:px-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${statusStyle(request.status)}`}>
                        {statusLabel(request.status)}
                      </span>
                      <span className="text-xs text-slate-400">{request.createdAt.toLocaleString("en")}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-black text-slate-950">{request.reason}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{request.message}</p>
                  </div>
                  <span className="shrink-0 text-lg font-black text-blue-700">→</span>
                </div>
                <div className="mt-4 grid gap-1 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:grid-cols-3">
                  <p className="truncate"><strong className="text-slate-700">Customer:</strong> {request.customer?.name || "Name not provided"} · {request.customerEmail}</p>
                  <p className="truncate"><strong className="text-slate-700">Order:</strong> {request.orderNumber || "Not linked"}</p>
                  <p className="truncate"><strong className="text-slate-700">ICCID:</strong> {request.iccid || "Not assigned"}</p>
                </div>
              </Link>
            ))}
            {requests.length === 0 ? (
              <p className="px-5 py-16 text-center text-sm text-slate-500">No support requests match these filters.</p>
            ) : null}
          </div>
        </section>

        {pageCount > 1 ? (
          <nav aria-label="Support pages" className="mt-5 flex items-center justify-between gap-3">
            {page > 1 ? (
              <Link href={`/support-console?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}&page=${page - 1}`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700">← Previous</Link>
            ) : <span />}
            <span className="text-sm font-bold text-slate-500">Page {page} of {pageCount}</span>
            {page < pageCount ? (
              <Link href={`/support-console?q=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}&page=${page + 1}`} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700">Next →</Link>
            ) : <span />}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
