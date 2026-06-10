import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/AdminShell";
import { prisma } from "../../../../lib/db";
import {
  deleteTestOrder,
  markOrderDelivered,
  markOrderFailed,
  markOrderPaid,
  markOrderPending,
  markOrderWaiting,
} from "../actions";

function formatPrice(value: number) {
  return `€${value.toFixed(2)}`;
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

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 break-words text-lg font-bold text-slate-950">
        {value || "—"}
      </p>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: {
      id,
    },
  });

  if (!order) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: {
      id: order.productId,
    },
  });

  const amount = product?.sellPrice || 0;
  const profit = product ? product.sellPrice - product.buyPrice : 0;

  const markPaidWithId = markOrderPaid.bind(null, order.id);
  const markPendingWithId = markOrderPending.bind(null, order.id);
  const markDeliveredWithId = markOrderDelivered.bind(null, order.id);
  const markFailedWithId = markOrderFailed.bind(null, order.id);
  const markWaitingWithId = markOrderWaiting.bind(null, order.id);
  const deleteTestOrderWithId = deleteTestOrder.bind(null, order.id);

  return (
    <AdminShell activePage="orders">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Order Detail
          </h1>

          <p className="mt-2 text-slate-600">
            View one order, payment status, eSIM delivery and product details.
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="rounded-2xl border border-slate-300 px-6 py-4 text-center font-bold text-slate-700 transition hover:bg-white"
        >
          Back to Orders
        </Link>
      </div>

      <div className="mb-8 rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-500">Order ID</p>
            <h2 className="mt-2 break-all text-2xl font-bold text-slate-950">
              {order.id}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatusBadge status={order.payment} />
            <StatusBadge status={order.fulfillment} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DetailCard label="Customer" value={order.customer} />
          <DetailCard label="Product ID" value={order.productId} />
          <DetailCard label="Created" value={order.createdAt.toLocaleString()} />
          <DetailCard label="Amount" value={formatPrice(amount)} />
          <DetailCard label="Profit" value={formatPrice(profit)} />
          <DetailCard label="Payment Status" value={order.payment} />
          <DetailCard label="eSIM Delivery" value={order.fulfillment} />
          <DetailCard
            label="Order Type"
            value={order.payment === "Pending" ? "Checkout Test" : "Demo / Paid"}
          />
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
          <h2 className="text-2xl font-bold text-slate-950">Product</h2>

          {product ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <DetailCard label="Name" value={product.name} />
              <DetailCard label="Destination" value={product.country} />
              <DetailCard label="Region" value={product.region || "—"} />
              <DetailCard label="Data" value={product.data} />
              <DetailCard label="Validity" value={`${product.validityDays} Days`} />
              <DetailCard label="Plan Type" value={product.planType} />
              <DetailCard label="Usage Fit" value={product.usageFit} />
              <DetailCard label="Role" value={product.role} />
              <DetailCard label="Buy Price" value={formatPrice(product.buyPrice)} />
              <DetailCard label="Sell Price" value={formatPrice(product.sellPrice)} />
              <DetailCard label="Provider" value={product.provider} />
              <DetailCard
                label="Provider Product ID"
                value={product.providerProductId}
              />
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-yellow-50 p-6 text-yellow-800">
              This order points to a product that no longer exists.
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
          <h2 className="text-2xl font-bold text-slate-950">Admin Actions</h2>

          <p className="mt-2 text-slate-600">
            Update payment and eSIM delivery status for this order.
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <p className="mb-3 font-bold text-slate-700">Payment</p>

              <div className="grid gap-3">
                <form action={markPaidWithId}>
                  <button className="w-full rounded-2xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700">
                    Mark Paid
                  </button>
                </form>

                <form action={markPendingWithId}>
                  <button className="w-full rounded-2xl bg-yellow-500 px-5 py-4 font-bold text-white transition hover:bg-yellow-600">
                    Mark Pending
                  </button>
                </form>
              </div>
            </div>

            <div>
              <p className="mb-3 font-bold text-slate-700">eSIM Delivery</p>

              <div className="grid gap-3">
                <form action={markDeliveredWithId}>
                  <button className="w-full rounded-2xl bg-green-600 px-5 py-4 font-bold text-white transition hover:bg-green-700">
                    Mark Delivered
                  </button>
                </form>

                <form action={markWaitingWithId}>
                  <button className="w-full rounded-2xl bg-yellow-500 px-5 py-4 font-bold text-white transition hover:bg-yellow-600">
                    Mark Waiting
                  </button>
                </form>

                <form action={markFailedWithId}>
                  <button className="w-full rounded-2xl bg-red-600 px-5 py-4 font-bold text-white transition hover:bg-red-700">
                    Mark Failed
                  </button>
                </form>
              </div>
            </div>

            {order.payment === "Pending" && (
              <div className="border-t border-slate-100 pt-6">
                <p className="mb-3 font-bold text-red-700">Danger Zone</p>

                <form action={deleteTestOrderWithId}>
                  <button className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-bold text-red-700 transition hover:bg-red-100">
                    Delete Test Order
                  </button>
                </form>

                <p className="mt-3 text-sm text-slate-500">
                  Only pending checkout test orders can be deleted.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
