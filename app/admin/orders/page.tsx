import Link from "next/link";
import AdminShell from "../../../components/AdminShell";
import { prisma } from "../../../lib/db";
import {
  deleteTestOrder,
  markOrderDelivered,
  markOrderFailed,
  markOrderPaid,
  markOrderPending,
  markOrderWaiting,
} from "./actions";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Paid" || status === "Delivered"
      ? "bg-green-100 text-green-700"
      : status === "Provisioning"
      ? "bg-blue-100 text-blue-700"
      : status === "Failed"
      ? "bg-red-100 text-red-700"
      : status === "Pending" || status === "Waiting"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-bold ${styles}`}>
      {status}
    </span>
  );
}

function OrderTypeBadge({ payment }: { payment: string }) {
  const isPendingPayment = payment === "Pending";

  return (
    <span
      className={`rounded-full px-3 py-1 text-sm font-bold ${
        isPendingPayment
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {isPendingPayment ? "Pending Payment" : "Paid Order"}
    </span>
  );
}

function FulfillmentAlertBadge({
  payment,
  fulfillment,
}: {
  payment: string;
  fulfillment: string;
}) {
  const needsFulfillment =
    payment === "Paid" &&
    (fulfillment === "pending_manual" || fulfillment === "Waiting");

  if (!needsFulfillment) return null;

  return (
    <span className="mt-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-700">
      Needs fulfillment
    </span>
  );
}

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const productIds = orders.map((order) => order.productId);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const orderRows = orders.map((order) => {
    const product = products.find((item) => item.id === order.productId);

    return {
      ...order,
      product,
      displayCountry: order.countryAtPurchase || product?.country || "—",
      displayName:
        order.productNameAtPurchase || product?.name || "Unknown Product",
      displayData: order.dataAtPurchase || product?.data || "—",
      displayValidityDays:
        order.validityDaysAtPurchase || product?.validityDays || 0,
      displayProvider:
        order.providerAtPurchase || product?.provider || "Unknown Provider",
      displayProviderProductId:
        order.providerProductIdAtPurchase ||
        product?.providerProductId ||
        "—",
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

  const needsFulfillmentOrders = orderRows.filter(
    (order) =>
      order.payment === "Paid" &&
      (order.fulfillment === "pending_manual" || order.fulfillment === "Waiting")
  ).length;

  return (
    <AdminShell activePage="orders">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">Orders</h1>

          <p className="mt-2 text-slate-600">
            Track payment status and eSIM delivery separately.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white">
            Export CSV
          </button>

          <Link
            href="/admin/orders"
            className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            Refresh Orders
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Total Orders</p>
          <h2 className="mt-3 text-3xl font-bold">{orderRows.length}</h2>
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

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Needs Fulfillment
          </p>
          <h2 className="mt-3 text-3xl font-bold text-orange-600">
            {needsFulfillmentOrders}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Paid but not delivered
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-950">Order List</h2>

            <p className="mt-1 text-slate-600">
              Paid orders with pending_manual delivery need manual fulfillment or provider API fulfillment.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1650px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">DALO Order</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Destination</th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Profit</th>
                  <th className="px-6 py-4 font-semibold">Payment Status</th>
                  <th className="px-6 py-4 font-semibold">eSIM Delivery</th>
                  <th className="px-6 py-4 font-semibold">Provider Product</th>
                  <th className="px-6 py-4 font-semibold">Order Type</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orderRows.map((order) => {
                  const markPaidWithId = markOrderPaid.bind(null, order.id);
                  const markPendingWithId = markOrderPending.bind(
                    null,
                    order.id
                  );
                  const markDeliveredWithId = markOrderDelivered.bind(
                    null,
                    order.id
                  );
                  const markFailedWithId = markOrderFailed.bind(null, order.id);
                  const markWaitingWithId = markOrderWaiting.bind(
                    null,
                    order.id
                  );
                  const deleteTestOrderWithId = deleteTestOrder.bind(
                    null,
                    order.id
                  );

                  return (
                    <tr key={order.id} className="border-t border-slate-100">
                      
                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
  >
                         {order.orderNumber || "No DALO number"}
                        </Link>

                          <div className="mt-1 max-w-[220px] truncate font-mono text-xs text-slate-400">
                          ICCID: {order.iccid || "Not assigned yet"}
                          </div>
                      </td>
                      

                      <td className="px-6 py-5">
                        <div className="font-semibold">{order.customer}</div>
                        <div className="text-sm text-slate-500">
                          {order.displayProvider}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {order.displayCountry}
                      </td>

                      <td className="px-6 py-5">
                        <div className="font-bold">
                          {order.displayName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {order.displayValidityDays
                            ? `${order.displayData} / ${order.displayValidityDays} Days`
                            : order.displayData}
                        </div>
                      </td>

                      <td className="px-6 py-5 font-bold">
                        {formatPrice(order.amount)}
                      </td>

                      <td className="px-6 py-5 font-bold text-green-700">
                        {formatPrice(order.profit)}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={order.payment} />
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge status={order.fulfillment} />
                        <FulfillmentAlertBadge
                          payment={order.payment}
                          fulfillment={order.fulfillment}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <div className="max-w-[240px] truncate font-mono text-xs text-slate-500">
                          {order.displayProviderProductId}
                        </div>
                        {order.product?.region ? (
                          <div className="mt-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                            {order.product.region}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-6 py-5">
                        <OrderTypeBadge payment={order.payment} />
                      </td>

                      <td className="px-6 py-5 text-slate-500">
                        {order.createdAt.toLocaleString()}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <form action={markPaidWithId}>
                            <button
                              type="submit"
                              className="rounded-xl bg-green-100 px-3 py-2 text-xs font-bold text-green-700"
                            >
                              Mark Paid
                            </button>
                          </form>

                          <form action={markPendingWithId}>
                            <button
                              type="submit"
                              className="rounded-xl bg-yellow-100 px-3 py-2 text-xs font-bold text-yellow-700"
                            >
                              Reset Payment
                            </button>
                          </form>

                          <form action={markDeliveredWithId}>
                            <button
                              type="submit"
                              className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700"
                            >
                              Delivered
                            </button>
                          </form>

                          <form action={markFailedWithId}>
                            <button
                              type="submit"
                              className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                            >
                              Failed
                            </button>
                          </form>

                          <form action={markWaitingWithId}>
                            <button
                              type="submit"
                              className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                            >
                              Reset Delivery
                            </button>
                          </form>

                          {order.payment === "Pending" && (
                            <form action={deleteTestOrderWithId}>
                              <button
                                type="submit"
                                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white"
                              >
                                Delete Test
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold">Manual Order Controls</h2>

            <p className="mt-2 text-slate-300">
              These controls simulate Stripe and provider API behavior during
              MVP testing.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Mark Paid</div>
                <div className="mt-1 font-bold">Payment becomes Paid</div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Reset Payment</div>
                <div className="mt-1 font-bold">
                  Payment goes back to Pending
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Delete Test</div>
                <div className="mt-1 font-bold">
                  Only available while payment is Pending
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">Safety Rule</h2>

            <p className="mt-3 text-slate-600">
              Paid orders should not be deleted casually. Only pending test
              checkout orders can be removed from this screen.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
