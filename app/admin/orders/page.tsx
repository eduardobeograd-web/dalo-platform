import Link from "next/link";
import type { Prisma } from "../../generated/prisma/client";
import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";
import { getEsimGoReadiness } from "../../../lib/providers/esim-go/config";

const PAGE_SIZE = 25;

type OrdersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function badge(status: string) {
  if (status === "Paid" || status === "Delivered" || status === "ready") return "bg-emerald-50 text-emerald-700";
  if (status === "Failed" || status === "Refunded") return "bg-red-50 text-red-700";
  if (status === "Provisioning") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
}

function buildHref(page: number, query: string, status: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const value = params.toString();
  return value ? `/admin/orders?${value}` : "/admin/orders";
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = (await searchParams) || {};
  const query = first(params.q).trim();
  const status = first(params.status) || "all";
  const page = Math.max(1, Number(first(params.page)) || 1);
  const esimGoReadiness = getEsimGoReadiness();
  const automatedFulfillmentConfigured =
    esimGoReadiness.automaticFulfillmentEnabled;

  const filters: Prisma.OrderWhereInput[] = [];
  if (query) {
    filters.push({
      OR: [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { customer: { contains: query, mode: "insensitive" } },
        { iccid: { contains: query, mode: "insensitive" } },
        { countryAtPurchase: { contains: query, mode: "insensitive" } },
        { productNameAtPurchase: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  if (status === "paid") filters.push({ payment: "Paid" });
  if (status === "pending") filters.push({ payment: "Pending" });
  if (status === "failed") filters.push({ payment: "Failed" });
  if (status === "refunded") filters.push({ payment: "Refunded" });
  if (status === "delivered") filters.push({ fulfillment: "Delivered" });
  if (status === "needs_fulfillment") {
    filters.push({
      payment: "Paid",
      fulfillment: { not: "Delivered" },
    });
  }
  const where: Prisma.OrderWhereInput = filters.length ? { AND: filters } : {};

  const needsFulfillmentWhere: Prisma.OrderWhereInput = {
    payment: "Paid",
    fulfillment: { not: "Delivered" },
  };

  const [orders, filteredCount, totalOrders, paidTotals, needsFulfillmentCount] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.order.count({ where }),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { payment: "Paid" },
      _sum: { amount: true, buyPriceAtPurchase: true },
    }),
    prisma.order.count({ where: needsFulfillmentWhere }),
  ]);

  const productIds = [...new Set(orders.map((order) => order.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((product) => [product.id, product]));
  const revenue = paidTotals._sum.amount || 0;
  const profit = revenue - (paidTotals._sum.buyPriceAtPurchase || 0);
  const pages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));

  return (
    <AdminShell activePage="orders">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Sales operations</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Orders</h1>
          <p className="mt-2 text-slate-600">Find an order, verify payment and handle only the deliveries that need attention.</p>
        </div>
        <div className={`rounded-2xl border px-5 py-4 ${automatedFulfillmentConfigured ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Automatic fulfillment</p>
          <p className={`mt-1 font-black ${automatedFulfillmentConfigured ? "text-emerald-700" : "text-amber-700"}`}>
            {automatedFulfillmentConfigured
              ? "Live provider fulfillment enabled"
              : esimGoReadiness.apiKeyConfigured
                ? "Provider key ready · live purchases locked"
                : "Manual fallback active"}
          </p>
        </div>
      </div>

      <Link href="/admin/orders/attention" className="mt-5 inline-block font-bold text-blue-700">Delivery and usage issues →</Link>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total orders", String(totalOrders)],
          ["Paid revenue", formatPrice(revenue)],
          ["Recorded profit", formatPrice(profit)],
          ["Needs fulfillment", String(needsFulfillmentCount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <form className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input name="q" defaultValue={query} placeholder="Order, customer, ICCID or destination" className="min-w-0 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500" />
        <select name="status" defaultValue={status} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold">
          <option value="all">All statuses</option>
          <option value="needs_fulfillment">Needs fulfillment</option>
          <option value="paid">Paid</option>
          <option value="delivered">Delivered</option>
          <option value="pending">Pending payment</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="rounded-xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800">Filter orders</button>
      </form>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="font-black text-slate-950">{filteredCount} matching orders</p>
          <p className="mt-1 text-sm text-slate-500">Status changes and delivery data are managed safely inside each order.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.map((order) => {
            const product = productMap.get(order.productId);
            const country = order.countryAtPurchase || product?.country || "Unknown destination";
            const name = order.productNameAtPurchase || product?.name || "Unknown product";
            const amount = order.amount ?? product?.sellPrice ?? 0;
            const needsAttention = order.payment === "Paid" && order.fulfillment !== "Delivered";
            return (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-4 px-5 py-5 transition hover:bg-blue-50/40 lg:grid-cols-[1.1fr_1.4fr_0.7fr_0.9fr_auto] lg:items-center">
                <div>
                  <p className="font-black text-blue-700">{order.orderNumber || "No order number"}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{order.customer}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-950">{country}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">{name}</p>
                </div>
                <p className="font-black text-slate-950">{formatPrice(amount)}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${badge(order.payment)}`}>{order.payment}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${needsAttention ? "bg-orange-50 text-orange-700" : badge(order.fulfillment)}`}>{needsAttention ? "Needs fulfillment" : order.fulfillment}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">{order.createdAt.toLocaleDateString("en")}</p>
                  <span className="mt-2 inline-block rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">Open order</span>
                </div>
              </Link>
            );
          })}
          {orders.length === 0 ? <p className="px-5 py-14 text-center font-bold text-slate-500">No orders match these filters.</p> : null}
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Link href={buildHref(Math.max(1, page - 1), query, status)} aria-disabled={page <= 1} className={`rounded-xl border px-4 py-2 text-sm font-bold ${page <= 1 ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-300 text-slate-700"}`}>Previous</Link>
        <p className="text-sm font-bold text-slate-500">Page {page} of {pages}</p>
        <Link href={buildHref(Math.min(pages, page + 1), query, status)} aria-disabled={page >= pages} className={`rounded-xl border px-4 py-2 text-sm font-bold ${page >= pages ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-300 text-slate-700"}`}>Next</Link>
      </div>
    </AdminShell>
  );
}
