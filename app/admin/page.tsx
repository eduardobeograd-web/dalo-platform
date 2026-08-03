import AdminShell from "../../components/AdminShell";
import { prisma } from "../../lib/db";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function getMargin(buyPrice: number, sellPrice: number) {
  if (sellPrice === 0) return 0;

  const profit = sellPrice - buyPrice;
  return Math.round((profit / sellPrice) * 100);
}

export default async function AdminDashboard() {
  const [products, orders, supportRequests] = await Promise.all([
    prisma.product.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.supportRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const activeProducts = products.filter((product) => product.active);

  const orderRows = orders.map((order) => {
    const product = products.find((item) => item.id === order.productId);

    return {
      ...order,
      product,
      amount: order.amount ?? product?.sellPrice ?? 0,
      profit:
        (order.amount ?? product?.sellPrice ?? 0) -
        (order.buyPriceAtPurchase ?? product?.buyPrice ?? 0),
    };
  });

  const paidOrderRows = orderRows.filter((order) => order.payment === "Paid");

  const revenue = paidOrderRows.reduce(
    (total, order) => total + order.amount,
    0
  );

  const profit = paidOrderRows.reduce(
    (total, order) => total + order.profit,
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.payment === "Pending"
  ).length;

  const paidOrders = orders.filter((order) => order.payment === "Paid").length;

  const openFulfillments = orders.filter(
    (order) =>
      order.payment === "Paid" &&
      (order.fulfillment !== "Delivered" || order.esimStatus !== "ready")
  );

  const failedPayments = orders.filter(
    (order) => order.payment === "Failed"
  );

  const expiredCheckouts = orders.filter(
    (order) => order.payment === "Expired"
  );

  const refundedOrders = orders.filter(
    (order) => order.payment === "Refunded"
  );

  const operationalOrders = orders
    .filter(
      (order) =>
        openFulfillments.some((item) => item.id === order.id) ||
        order.payment === "Failed" ||
        order.payment === "Expired" ||
        order.payment === "Refunded"
    )
    .slice(0, 6);

  const openSupportRequests = supportRequests.filter(
    (request) => request.status === "open"
  ).length;

  const inProgressSupportRequests = supportRequests.filter(
    (request) => request.status === "in_progress"
  ).length;

  const resolvedSupportRequests = supportRequests.filter(
    (request) => request.status === "resolved"
  ).length;

  const averageMargin =
    products.length > 0
      ? products.reduce(
          (total, product) =>
            total + getMargin(product.buyPrice, product.sellPrice),
          0
        ) / products.length
      : 0;

  const estimatedCatalogValue = products.reduce(
    (total, product) => total + product.sellPrice,
    0
  );

  return (
    <AdminShell activePage="dashboard">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Live overview from your local DALO database.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
          >
            View Website
          </a>

        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Products</p>
          <h2 className="mt-3 text-3xl font-bold">{products.length}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Total products in database
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Active Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{activeProducts.length}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Visible for recommendations
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Revenue</p>
          <h2 className="mt-3 text-3xl font-bold">{formatPrice(revenue)}</h2>
          <p className="mt-2 text-sm text-slate-500">Paid orders only</p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Profit</p>
          <h2 className="mt-3 text-3xl font-bold text-green-700">
            {formatPrice(profit)}
          </h2>
          <p className="mt-2 text-sm text-slate-500">Paid orders only</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Orders</p>
          <h2 className="mt-3 text-3xl font-bold">{orders.length}</h2>
          <p className="mt-2 text-sm text-slate-500">
            Total database orders
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Paid Orders</p>
          <h2 className="mt-3 text-3xl font-bold">{paidOrders}</h2>
          <p className="mt-2 text-sm text-slate-500">Orders marked as paid</p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Pending Orders
          </p>
          <h2 className="mt-3 text-3xl font-bold text-yellow-600">
            {pendingOrders}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Checkout tests or unpaid orders
          </p>
        </div>

        <a
          href="/admin/support"
          className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50 transition hover:-translate-y-1 hover:shadow-xl"
        >
          <p className="text-sm font-semibold text-slate-500">Open Support</p>
          <h2 className="mt-3 text-3xl font-bold text-blue-700">
            {openSupportRequests}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {inProgressSupportRequests} in progress
          </p>
        </a>
      </div>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-blue-50">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
              Operations
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Orders that need attention
            </h2>
          </div>

          <a
            href="/admin/orders"
            className="w-fit rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Review all orders
          </a>
        </div>

        <div className="grid border-b border-slate-100 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Open delivery",
              value: openFulfillments.length,
              color: "text-blue-700",
            },
            {
              label: "Failed payments",
              value: failedPayments.length,
              color: "text-red-700",
            },
            {
              label: "Expired checkouts",
              value: expiredCheckouts.length,
              color: "text-amber-700",
            },
            {
              label: "Refunded",
              value: refundedOrders.length,
              color: "text-slate-700",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-b border-slate-100 px-6 py-5 last:border-b-0 sm:odd:border-r lg:border-b-0 lg:not-last:border-r"
            >
              <p className="text-sm font-semibold text-slate-500">
                {item.label}
              </p>
              <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="px-6 py-6 md:px-8">
          {operationalOrders.length === 0 ? (
            <div className="rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
              No payment or delivery issues need attention.
            </div>
          ) : (
            <div className="space-y-3">
              {operationalOrders.map((order) => {
                const needsDelivery =
                  order.payment === "Paid" &&
                  order.fulfillment !== "Delivered" &&
                  order.esimStatus !== "ready";
                const status = needsDelivery
                  ? "Open delivery"
                  : order.payment;

                return (
                  <a
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 px-5 py-4 transition hover:border-blue-300 hover:bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-950">
                        {order.orderNumber || "Order without number"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {order.customer}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {status}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Database Status</h2>
            <p className="mt-1 text-slate-600">
              Current DALO product, order and support foundation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
              <span className="font-semibold">Prisma Database</span>
              <span className="font-bold text-green-700">Connected</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
              <span className="font-semibold">Product Table</span>
              <span className="font-bold text-green-700">
                {products.length} Products
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
              <span className="font-semibold">Order Table</span>
              <span className="font-bold text-green-700">
                {orders.length} Orders
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
              <span className="font-semibold">Support Table</span>
              <span className="font-bold text-green-700">
                {supportRequests.length} Requests
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
              <span className="font-semibold">Open Support Requests</span>
              <span className="font-bold text-blue-700">
                {openSupportRequests} Open
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4">
              <span className="font-semibold">Support In Progress</span>
              <span className="font-bold text-amber-700">
                {inProgressSupportRequests} In Progress
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
              <span className="font-semibold">Resolved Support</span>
              <span className="font-bold text-emerald-700">
                {resolvedSupportRequests} Resolved
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
              <span className="font-semibold">Paid Order Revenue</span>
              <span className="font-bold text-blue-700">
                {formatPrice(revenue)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
              <span className="font-semibold">Paid Order Profit</span>
              <span className="font-bold text-blue-700">
                {formatPrice(profit)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span className="font-semibold">Avg. Margin</span>
              <span className="font-bold text-slate-700">
                {Math.round(averageMargin)}%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span className="font-semibold">Catalog Sell Value</span>
              <span className="font-bold text-slate-700">
                {formatPrice(estimatedCatalogValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Next Step</h2>

          <p className="mt-3 text-slate-300">
            Continue improving product management, order handling and customer
            support before touching Stripe or API fulfillment.
          </p>

          <div className="mt-8 space-y-3">
            <a
              href="/admin/products"
              className="block rounded-2xl bg-blue-600 px-5 py-4 text-center font-bold text-white"
            >
              Manage Products
            </a>

            <a
              href="/admin/products/import"
              className="block rounded-2xl bg-white/10 px-5 py-4 text-center font-bold text-white"
            >
              Import Rate Sheet
            </a>

            <a
              href="/admin/orders"
              className="block rounded-2xl bg-white/10 px-5 py-4 text-center font-bold text-white"
            >
              View Orders
            </a>

            <a
              href="/admin/support"
              className="block rounded-2xl bg-white/10 px-5 py-4 text-center font-bold text-white"
            >
              View Support Requests
            </a>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
