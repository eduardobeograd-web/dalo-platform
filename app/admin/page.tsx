import AdminShell from "../../components/AdminShell";
import { prisma } from "../../lib/db";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todaysOrders,
    todaysPaidTotals,
    openFulfillmentsCount,
    failedPaymentsCount,
    refundedTodayCount,
    openSupportRequests,
    inProgressSupportRequests,
    operationalOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { payment: "Paid", paidAt: { gte: today } },
      _sum: { amount: true, buyPriceAtPurchase: true },
    }),
    prisma.order.count({
      where: {
        payment: "Paid",
        OR: [
          { fulfillment: { not: "Delivered" } },
          { esimStatus: { not: "ready" } },
        ],
      },
    }),
    prisma.order.count({ where: { payment: "Failed" } }),
    prisma.order.count({
      where: { payment: "Refunded", paidAt: { gte: today } },
    }),
    prisma.supportRequest.count({ where: { status: "open" } }),
    prisma.supportRequest.count({ where: { status: "in_progress" } }),
    prisma.order.findMany({
      where: {
        OR: [
          {
            payment: "Paid",
            OR: [
              { fulfillment: { not: "Delivered" } },
              { esimStatus: { not: "ready" } },
            ],
          },
          { payment: "Failed" },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        customer: true,
        payment: true,
        fulfillment: true,
        esimStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const todaysRevenue = todaysPaidTotals._sum.amount || 0;
  const todaysProfit =
    todaysRevenue - (todaysPaidTotals._sum.buyPriceAtPurchase || 0);
  const ordersNeedingAttention =
    openFulfillmentsCount + failedPaymentsCount;

  const metrics = [
    {
      label: "Needs attention",
      value: ordersNeedingAttention,
      detail: `${openFulfillmentsCount} delivery · ${failedPaymentsCount} payment`,
      href: "/admin/orders",
      valueClass: ordersNeedingAttention > 0 ? "text-red-700" : "text-emerald-700",
    },
    {
      label: "Open support",
      value: openSupportRequests,
      detail: `${inProgressSupportRequests} currently in progress`,
      href: "/admin/support",
      valueClass: openSupportRequests > 0 ? "text-blue-700" : "text-emerald-700",
    },
    {
      label: "Orders today",
      value: todaysOrders,
      detail: `${refundedTodayCount} refunded today`,
      href: "/admin/orders",
      valueClass: "text-slate-950",
    },
    {
      label: "Revenue today",
      value: formatPrice(todaysRevenue),
      detail: `${formatPrice(todaysProfit)} estimated profit`,
      href: "/admin/orders",
      valueClass: "text-emerald-700",
    },
  ];

  return (
    <AdminShell activePage="dashboard">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-600">
            DALO Operations
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            What needs your attention
          </h1>
          <p className="mt-2 text-slate-600">
            Orders, delivery and customer support in one focused view.
          </p>
        </div>

        <a
          href="/"
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
        >
          View website
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <a
            key={metric.label}
            href={metric.href}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60"
          >
            <p className="text-sm font-bold text-slate-500">{metric.label}</p>
            <p className={`mt-3 text-3xl font-black ${metric.valueClass}`}>
              {metric.value}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {metric.detail}
            </p>
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_290px]">
        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red-600">
                Action queue
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Orders requiring a decision
              </h2>
            </div>
            <a
              href="/admin/orders"
              className="inline-flex min-h-10 w-fit items-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              All orders
            </a>
          </div>

          <div className="p-4 sm:p-6">
            {operationalOrders.length === 0 ? (
              <div className="rounded-2xl bg-emerald-50 px-5 py-5 text-sm font-bold text-emerald-800">
                Everything is clear. No payment or delivery issue needs attention.
              </div>
            ) : (
              <div className="space-y-2">
                {operationalOrders.map((order) => {
                  const needsDelivery =
                    order.payment === "Paid" &&
                    (order.fulfillment !== "Delivered" ||
                      order.esimStatus !== "ready");
                  const status = needsDelivery ? "Open delivery" : "Payment failed";

                  return (
                    <a
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition hover:border-blue-300 hover:bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-black text-slate-950">
                          {order.orderNumber || "Order without number"}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {order.customer}
                        </p>
                      </div>
                      <span
                        className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                          needsDelivery
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {status}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-[1.75rem] bg-slate-950 p-5 text-white sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-300">
            Quick access
          </p>
          <h2 className="mt-2 text-xl font-black">Go directly to</h2>

          <div className="mt-5 space-y-2">
            {[
              ["Customer support", "/admin/support"],
              ["Orders", "/admin/orders"],
              ["Products", "/admin/products"],
              ["SEO & country pages", "/admin/destinations"],
            ].map(([label, href], index) => (
              <a
                key={href}
                href={href}
                className={`flex min-h-11 items-center justify-between rounded-xl px-4 text-sm font-bold transition ${
                  index === 0
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "bg-white/10 text-slate-100 hover:bg-white/15"
                }`}
              >
                {label}
                <span aria-hidden="true">→</span>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
