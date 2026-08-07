import Link from "next/link";
import { notFound } from "next/navigation";
import AdminShell from "../../../../components/AdminShell";
import {
  adminHasPermission,
  requireAdminPermission,
} from "../../../../lib/admin-auth";
import { ADMIN_PERMISSIONS } from "../../../../lib/admin-permissions";
import { prisma } from "../../../../lib/db";
import { getEsimGoReadiness } from "../../../../lib/providers/esim-go/config";
import { getProviderConfigBySlug } from "../../../../lib/providers/provider-configs";
import {
  deleteTestOrder,
  fulfillOrderMock,
  fulfillSerbiaOneGbWithEsimGo,
  markOrderDelivered,
  markOrderFailed,
  markOrderPaid,
  markOrderPending,
  markOrderWaiting,
  updateOrderFulfillment,
} from "../actions";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Paid" || status === "Delivered" || status === "ready"
      ? "bg-green-100 text-green-700"
      : status === "Provisioning"
        ? "bg-blue-100 text-blue-700"
        : status === "Failed" || status === "failed"
          ? "bg-red-100 text-red-700"
          : status === "Pending" || status === "Waiting" || status === "pending"
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
  value: string | number | null | undefined;
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

function TextInput({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold text-slate-700">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue || ""}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
      />
    </div>
  );
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ liveFulfillment?: string }>;
}) {
  const admin = await requireAdminPermission(ADMIN_PERMISSIONS.ORDERS_READ);
  const canManageOrders = adminHasPermission(
    admin,
    ADMIN_PERMISSIONS.ORDERS_WRITE,
  );
  const { id } = await params;
  const { liveFulfillment } = await searchParams;

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

  const [product, recommendedProduct] = await Promise.all([
    prisma.product.findUnique({ where: { id: order.productId } }),
    order.recommendationProductId
      ? prisma.product.findUnique({ where: { id: order.recommendationProductId } })
      : null,
  ]);

  const amount = order.amount ?? product?.sellPrice ?? 0;
  const buyPrice = order.buyPriceAtPurchase ?? product?.buyPrice ?? 0;
  const profit = amount - buyPrice;
  const productName =
    order.productNameAtPurchase || product?.name || "Unknown Product";
  const destination =
    order.countryAtPurchase || product?.country || "—";
  const data = order.dataAtPurchase || product?.data || "—";
  const validityDays =
    order.validityDaysAtPurchase || product?.validityDays || 0;
  const provider =
    order.providerAtPurchase || product?.provider || "—";
  const providerProductId =
    order.providerProductIdAtPurchase ||
    product?.providerProductId ||
    "—";
  const esimGoReadiness = getEsimGoReadiness();
  const esimGoProvider = await getProviderConfigBySlug("esim-go");
  const isControlledSerbiaTestOrder =
    order.payment === "Paid" &&
    order.orderKind === "new_esim" &&
    order.providerAtPurchase?.toLowerCase() === "esim go" &&
    order.providerProductIdAtPurchase === "esim_1GB_7D_RS_V2" &&
    order.countryAtPurchase === "Serbia" &&
    order.dataAtPurchase === "1GB";
  const controlledLiveFulfillmentReady = Boolean(
    esimGoReadiness.liveTransactionsEnabled &&
      esimGoProvider?.active &&
      esimGoProvider.fulfillmentEnabled,
  );

  const markPaidWithId = markOrderPaid.bind(null, order.id);
  const markPendingWithId = markOrderPending.bind(null, order.id);
  const markDeliveredWithId = markOrderDelivered.bind(null, order.id);
  const markFailedWithId = markOrderFailed.bind(null, order.id);
  const markWaitingWithId = markOrderWaiting.bind(null, order.id);
  const deleteTestOrderWithId = deleteTestOrder.bind(null, order.id);
  const fulfillOrderMockWithId = fulfillOrderMock.bind(null, order.id);
  const fulfillSerbiaOneGbWithId = fulfillSerbiaOneGbWithEsimGo.bind(
    null,
    order.id,
  );
  const updateOrderFulfillmentWithId = updateOrderFulfillment.bind(null, order.id);

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
            View and manually fulfill this order. Later this will be filled by
            the eSIM Go API.
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
            
            <p className="text-sm font-semibold text-slate-500">DALO Order Number</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
            {order.orderNumber || "Not assigned yet"}
            </h2>

            <p className="mt-3 text-sm font-semibold text-slate-500">Internal Order ID</p>
            <p className="mt-1 break-all font-mono text-sm font-bold text-slate-500">
             {order.id}
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-500">Purchased by</p>
            <p className="mt-1 break-all text-lg font-bold text-slate-950">
              {order.customer}
            </p>
          
          </div>

          <div className="flex flex-wrap gap-3">
            <StatusBadge status={order.payment} />
            <StatusBadge status={order.fulfillment} />
            <StatusBadge status={order.esimStatus || "pending"} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DetailCard label="DALO Order Number" value={order.orderNumber || "—"} />
          <DetailCard label="Product ID" value={order.productId} />
          <DetailCard label="Created" value={order.createdAt.toLocaleString()} />
          <DetailCard label="Amount" value={formatPrice(amount)} />
          <DetailCard label="Profit" value={formatPrice(profit)} />
          <DetailCard label="Payment Status" value={order.payment} />
          <DetailCard label="eSIM Delivery" value={order.fulfillment} />
          <DetailCard label="eSIM Status" value={order.esimStatus || "pending"} />
        </div>
      </div>

      {liveFulfillment === "passed" ? (
        <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
          <p className="font-bold">Controlled eSIM Go fulfillment completed.</p>
          <p className="mt-1 text-sm">Install data and customer delivery are now available for verification.</p>
        </div>
      ) : liveFulfillment ? (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="font-bold">Controlled fulfillment did not complete.</p>
          <p className="mt-1 text-sm">Status: {liveFulfillment}. Do not retry before checking the provider operation.</p>
        </div>
      ) : null}

      {order.recommendationProductId ? (
        <div className="mb-8 rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">DALO recommendation</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Recommendation outcome</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailCard label="Recommended" value={recommendedProduct?.name || `${formatNumber(order.recommendationDataGb)} GB`} />
            <DetailCard label="Purchased" value={productName} />
            <DetailCard label="Customer choice" value={order.recommendationChoice?.replaceAll("_", " ") || "—"} />
            <DetailCard label="Quiz input" value={[order.recommendationTripLength, order.recommendationUsageType].filter(Boolean).join(" · ") || "—"} />
          </div>
        </div>
      ) : null}

      <div className="mb-8 rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Customer
          </p>
          <h2 className="text-2xl font-bold text-slate-950">
            Buyer information
          </h2>
          <p className="text-slate-600">
            The customer details connected to this purchase.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <DetailCard label="Customer Email" value={order.customer} />
          <DetailCard
            label="Customer Account ID"
            value={order.customerId || "Guest checkout"}
          />
          <DetailCard
            label="Purchase Date"
            value={order.createdAt.toLocaleString()}
          />
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">Manual Fulfillment</h2>

            <p className="mt-2 text-slate-600">
              Paste the provider data here. The customer will see these details
              immediately in the customer portal.
            </p>

            <form action={updateOrderFulfillmentWithId} className="mt-6 space-y-6">
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Payment
                  </label>
                  <select
                    name="payment"
                    defaultValue={order.payment}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-bold text-slate-700">
                    Fulfillment
                  </label>
                  <select
                    name="fulfillment"
                    defaultValue={order.fulfillment}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="Provisioning">Provisioning</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <TextInput
                  label="eSIM Status"
                  name="esimStatus"
                  defaultValue={order.esimStatus || "pending"}
                  placeholder="pending / ready / active / expired / failed"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <TextInput
                  label="Provider Order ID"
                  name="providerOrderId"
                  defaultValue={order.providerOrderId}
                  placeholder="Provider order/reference"
                />

                <TextInput
                  label="ICCID"
                  name="iccid"
                  defaultValue={order.iccid}
                  placeholder="893..."
                />

                <TextInput
                  label="iOS Install URL"
                  name="iosInstallUrl"
                  defaultValue={order.iosInstallUrl}
                  placeholder="https://..."
                />

                <TextInput
                  label="Android Install URL"
                  name="androidInstallUrl"
                  defaultValue={order.androidInstallUrl}
                  placeholder="https://..."
                />

                <TextInput
                  label="QR Code URL"
                  name="qrCodeUrl"
                  defaultValue={order.qrCodeUrl}
                  placeholder="https://..."
                />

                <TextInput
                  label="Activation Code"
                  name="activationCode"
                  defaultValue={order.activationCode}
                  placeholder="LPA:1$..."
                />
              </div>

              <div className="rounded-[2rem] bg-slate-50 p-5">
                <h3 className="text-xl font-bold text-slate-950">Usage Data</h3>

                <p className="mt-1 text-sm text-slate-600">
                  Optional. Later this will come from provider usage sync.
                </p>

                <div className="mt-5 grid gap-5 md:grid-cols-3">
                  <TextInput
                    label="Total Data GB"
                    name="totalDataGb"
                    defaultValue={formatNumber(order.totalDataGb)}
                    placeholder="10"
                  />

                  <TextInput
                    label="Used Data GB"
                    name="usedDataGb"
                    defaultValue={formatNumber(order.usedDataGb)}
                    placeholder="1.5"
                  />

                  <TextInput
                    label="Remaining Data GB"
                    name="remainingDataGb"
                    defaultValue={formatNumber(order.remainingDataGb)}
                    placeholder="8.5"
                  />
                </div>

                <label className="mt-5 flex items-center gap-3 font-bold text-slate-700">
                  <input
                    type="checkbox"
                    name="syncUsage"
                    className="h-5 w-5 rounded border-slate-300"
                  />
                  Set usage sync timestamp to now
                </label>
              </div>

              <button className="w-full rounded-2xl bg-blue-600 px-6 py-5 text-lg font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700">
                Save fulfillment details
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">Product</h2>

            {product ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <DetailCard label="Name" value={productName} />
                <DetailCard label="Destination" value={destination} />
                <DetailCard label="Region" value={product.region || "—"} />
                <DetailCard label="Data" value={data} />
                <DetailCard
                  label="Validity"
                  value={validityDays ? `${validityDays} Days` : "—"}
                />
                <DetailCard label="Plan Type" value={product.planType} />
                <DetailCard label="Usage Fit" value={product.usageFit} />
                <DetailCard label="Role" value={product.role} />
                <DetailCard label="Buy Price" value={formatPrice(buyPrice)} />
                <DetailCard label="Sell Price" value={formatPrice(amount)} />
                <DetailCard label="Provider" value={provider} />
                <DetailCard
                  label="Provider Product ID"
                  value={providerProductId}
                />
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-yellow-50 p-6 text-yellow-800">
                This order points to a product that no longer exists.
              </div>
            )}
          </div>
        </div>

          {canManageOrders ? (
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">Quick Actions</h2>

          <p className="mt-2 text-slate-600">
            Fast status updates for this order.
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
              <p className="mb-3 font-bold text-slate-700">Provider Fulfillment</p>

              {isControlledSerbiaTestOrder &&
              order.fulfillment !== "Delivered" ? (
                <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-950">
                  <p className="font-bold">Controlled live eSIM Go purchase</p>
                  <p className="mt-1 text-sm leading-6">
                    Restricted to this paid Serbia 1 GB / 7 days test order.
                    This creates one real eSIM and charges the eSIM Go balance.
                    Automatic Stripe fulfillment remains separately disabled.
                  </p>

                  <form action={fulfillSerbiaOneGbWithId} className="mt-4">
                    <label className="flex items-start gap-3 rounded-xl bg-white p-3 text-sm font-semibold">
                      <input
                        type="checkbox"
                        name="confirmLivePurchase"
                        value="yes"
                        required
                        className="mt-1"
                      />
                      I confirm this one real eSIM Go purchase.
                    </label>
                    <button
                      disabled={!controlledLiveFulfillmentReady}
                      className={`mt-3 w-full rounded-2xl px-5 py-4 font-bold text-white transition ${
                        controlledLiveFulfillmentReady
                          ? "bg-red-700 hover:bg-red-800"
                          : "cursor-not-allowed bg-slate-400"
                      }`}
                    >
                      {controlledLiveFulfillmentReady
                        ? "Buy and fulfill Serbia 1 GB once"
                        : "Live transaction remains safely locked"}
                    </button>
                  </form>
                </div>
              ) : null}

              <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                <p className="font-bold text-orange-800">
                  Mock Fulfillment
                </p>
                <p className="mt-1 text-sm text-orange-700">
                  Creates fake eSIM install data for testing. No real provider order is placed.
                </p>

                <form action={fulfillOrderMockWithId} className="mt-4">
                  <button className="w-full rounded-2xl bg-orange-600 px-5 py-4 font-bold text-white transition hover:bg-orange-700">
                    Fulfill with eSIM Go Mock
                  </button>
                </form>
              </div>

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
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Read-only access
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Order status and fulfillment actions are available only to
                administrators with order management permission.
              </p>
            </div>
          )}
        </div>
    </AdminShell>
  );
}
