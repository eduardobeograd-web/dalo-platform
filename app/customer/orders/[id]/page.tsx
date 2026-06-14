import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { getCurrentCustomer } from "../../../../lib/customer-auth";

function formatDate(date?: Date | null) {
  if (!date) return "Not available yet";

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatData(value?: number | null) {
  if (value === null || value === undefined) return "Not available yet";
  return `${value} GB`;
}

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [{ customerId: customer.id }, { customer: customer.email }],
    },
  });

  if (!order) {
    redirect("/customer/dashboard");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: order.productId,
    },
  });

  if (!product) {
    redirect("/customer/dashboard");
  }

  const usageAvailable =
    order.usedDataGb !== null ||
    order.remainingDataGb !== null ||
    order.lastUsageSyncAt !== null;

  const hasInstallationDetails =
    order.iosInstallUrl ||
    order.androidInstallUrl ||
    order.qrCodeUrl ||
    order.activationCode ||
    order.iccid;

  return (
    <main className="min-h-screen bg-[#F6F8FF] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <a href="/">
            <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/customer/dashboard"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm"
            >
              Dashboard
            </a>

            <a
              href="/customer/logout"
              className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white"
            >
              Logout
            </a>
          </div>
        </nav>

        <section className="mt-10">
          <a
            href="/customer/dashboard"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            ← Back to dashboard
          </a>

          <div className="mt-6 rounded-[2.5rem] bg-white p-8 shadow-xl shadow-blue-100">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                  eSIM Order
                </p>

                <h1 className="mt-3 text-4xl font-bold">{product.name}</h1>

                <p className="mt-3 text-slate-600">
                  {product.country} · {product.data} · {product.validityDays} days
                </p>
              </div>

              <div className="rounded-2xl bg-yellow-50 px-5 py-4 text-left">
                <div className="text-sm font-semibold text-yellow-700">
                  eSIM Status
                </div>
                <div className="mt-1 text-xl font-bold text-yellow-900">
                  {order.esimStatus || "Pending"}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                
                <div className="text-sm text-slate-500">Order Number</div>
                <div className="mt-1 font-mono text-sm font-bold">
                {order.orderNumber || order.id}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Customer Email</div>
                <div className="mt-1 font-bold">{order.customer}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Payment Status</div>
                <div className="mt-1 font-bold">{order.payment}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">eSIM Delivery</div>
                <div className="mt-1 font-bold">{order.fulfillment}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Total Data</div>
                <div className="mt-1 font-bold">
                  {formatData(order.totalDataGb)}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Expires At</div>
                <div className="mt-1 font-bold">{formatDate(order.expiresAt)}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-blue-50">
              <h2 className="text-2xl font-bold">Installation details</h2>

              {hasInstallationDetails ? (
                <div className="mt-6 space-y-4">
                  {order.iosInstallUrl ? (
                    <a
                      href={order.iosInstallUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl bg-blue-600 p-5 text-center font-bold text-white shadow-lg shadow-blue-100"
                    >
                      Install on iPhone
                    </a>
                  ) : null}

                  {order.androidInstallUrl ? (
                    <a
                      href={order.androidInstallUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl bg-slate-950 p-5 text-center font-bold text-white shadow-lg shadow-slate-100"
                    >
                      Install on Android
                    </a>
                  ) : null}

                  {order.qrCodeUrl ? (
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <div className="text-sm text-slate-500">QR Code</div>
                      <img
                        src={order.qrCodeUrl}
                        alt="eSIM QR Code"
                        className="mt-4 h-48 w-48 rounded-xl bg-white object-contain"
                      />
                    </div>
                  ) : null}

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="text-sm text-slate-500">ICCID</div>
                    <div className="mt-1 break-all font-mono text-sm font-bold">
                      {order.iccid || "Not available yet"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="text-sm text-slate-500">Manual Activation Code</div>
                    <div className="mt-1 break-all font-mono text-sm font-bold">
                      {order.activationCode || "Not available yet"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-yellow-50 p-5 text-yellow-800">
                  Your eSIM installation details are not available yet. Provider
                  fulfillment will be connected in the next step.
                </div>
              )}
            </div>

            <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-blue-50">
              <h2 className="text-2xl font-bold">Data usage</h2>

              {usageAvailable ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="text-sm text-slate-500">Used Data</div>
                    <div className="mt-1 font-bold">
                      {formatData(order.usedDataGb)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="text-sm text-slate-500">Remaining Data</div>
                    <div className="mt-1 font-bold">
                      {formatData(order.remainingDataGb)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <div className="text-sm text-slate-500">Last Sync</div>
                    <div className="mt-1 font-bold">
                      {formatDate(order.lastUsageSyncAt)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-slate-600">
                  Usage data is not available yet. This will appear after the
                  provider usage sync is connected.
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-blue-700">
                <div className="font-bold">Top-up coming soon</div>
                <p className="mt-1">
                  Later the customer will be able to buy more data for this
                  eSIM here.
                </p>
              </div>

              <button
                disabled
                className="mt-5 w-full rounded-2xl bg-slate-200 p-4 font-bold text-slate-500"
              >
                Buy top-up soon
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}