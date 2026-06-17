import { redirect } from "next/navigation";
import { getCurrentCustomer } from "../../../../lib/customer-auth";
import { prisma } from "../../../../lib/db";

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
  return `${value.toFixed(1)} GB`;
}

function getUsagePercent(total?: number | null, used?: number | null) {
  if (!total || !used) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

function getCustomerStatus(order: {
  esimStatus: string | null;
  fulfillment: string;
}) {
  const status = (order.esimStatus || order.fulfillment || "").toLowerCase();

  if (status === "ready" || status === "active" || status === "delivered") {
    return {
      label: "Your eSIM is ready",
      description: "You can install your eSIM now.",
      badge: "Ready",
      badgeStyle: "bg-green-100 text-green-700",
    };
  }

  if (status === "failed") {
    return {
      label: "We need to check your eSIM",
      description: "Please contact support and include your DALO order number.",
      badge: "Needs help",
      badgeStyle: "bg-red-100 text-red-700",
    };
  }

  return {
    label: "Your eSIM is being prepared",
    description:
      "Your installation details will appear here as soon as delivery is ready.",
    badge: "Pending",
    badgeStyle: "bg-yellow-100 text-yellow-700",
  };
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

  const status = getCustomerStatus(order);

  const hasInstallButtons = order.iosInstallUrl || order.androidInstallUrl;
  const hasAlternativeSetup = order.qrCodeUrl || order.activationCode;

  const hasUsageData =
    order.totalDataGb !== null &&
    order.totalDataGb !== undefined &&
    order.usedDataGb !== null &&
    order.usedDataGb !== undefined;

  const usagePercent = getUsagePercent(order.totalDataGb, order.usedDataGb);

  return (
    <main className="min-h-screen bg-[#F6F8FF] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <a href="/" className="inline-block">
            <img src="/dalo-logo-horizontal.png" alt="DALO" className="h-14 w-auto" />
          </a>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/customer/dashboard"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm"
            >
              Dashboard
            </a>

            <a
              href={`/customer/support?orderId=${order.id}`}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm"
            >
              Support
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

          <div className="mt-6 overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-blue-100">
            <div className="bg-gradient-to-br from-blue-600 to-slate-950 p-8 text-white md:p-10">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div>
                  <div
                    className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${status.badgeStyle}`}
                  >
                    {status.badge}
                  </div>

                  <h1 className="mt-5 text-4xl font-bold md:text-5xl">
                    {status.label}
                  </h1>

                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-blue-50">
                    {status.description}
                  </p>
                </div>

                <div className="rounded-[2rem] bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-blue-100">DALO Order Number</p>
                  <p className="mt-1 font-mono text-2xl font-bold">
                    {order.orderNumber || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1fr_360px]">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                  Your eSIM
                </p>

                <h2 className="mt-3 text-3xl font-bold">{product.name}</h2>

                <p className="mt-3 text-slate-600">
                  {product.country} · {product.data} · {product.validityDays}{" "}
                  days
                </p>

                <div className="mt-8 rounded-[2rem] bg-slate-50 p-6">
                  <h3 className="text-2xl font-bold">Install your eSIM</h3>

                  {hasInstallButtons ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {order.iosInstallUrl ? (
                        <a
                          href={order.iosInstallUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl bg-blue-600 px-6 py-5 text-center font-bold text-white shadow-lg shadow-blue-100"
                        >
                          Install on iPhone
                        </a>
                      ) : null}

                      {order.androidInstallUrl ? (
                        <a
                          href={order.androidInstallUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl bg-slate-950 px-6 py-5 text-center font-bold text-white shadow-lg shadow-slate-100"
                        >
                          Install on Android
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-yellow-50 p-5 text-yellow-800">
                      Installation links are not available yet. Please check
                      again shortly or contact support.
                    </div>
                  )}

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5">
                      <p className="text-sm font-semibold text-slate-500">
                        ICCID
                      </p>
                      <p className="mt-2 break-all font-mono text-sm font-bold">
                        {order.iccid || "Not available yet"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5">
                      <p className="text-sm font-semibold text-slate-500">
                        eSIM Status
                      </p>
                      <p className="mt-2 font-bold">
                        {order.esimStatus || "Pending"}
                      </p>
                    </div>
                  </div>

                  {hasAlternativeSetup ? (
                    <div className="mt-6 rounded-2xl bg-white p-5">
                      <h4 className="text-lg font-bold">Alternative setup</h4>

                      {order.qrCodeUrl ? (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate-500">
                            QR Code
                          </p>

                          <img
                            src={order.qrCodeUrl}
                            alt="eSIM QR Code"
                            className="mt-3 h-48 w-48 rounded-xl bg-slate-50 object-contain p-3"
                          />
                        </div>
                      ) : null}

                      {order.activationCode ? (
                        <div className="mt-5">
                          <p className="text-sm font-semibold text-slate-500">
                            Manual Activation Code
                          </p>

                          <p className="mt-2 break-all rounded-xl bg-slate-50 p-4 font-mono text-sm font-bold">
                            {order.activationCode}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
                  <h3 className="text-2xl font-bold">Data usage</h3>

                  {hasUsageData ? (
                    <div className="mt-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-bold">
                          {formatData(order.usedDataGb)} used
                        </p>

                        <p className="font-bold">
                          {formatData(order.totalDataGb)} total
                        </p>
                      </div>

                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        Remaining: {formatData(order.remainingDataGb)}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Last sync: {formatDate(order.lastUsageSyncAt)}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-slate-600">
                      Usage data is not available yet. It will appear here after
                      provider usage sync is connected.
                    </div>
                  )}
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
                  <h3 className="text-2xl font-bold">Order details</h3>

                  <div className="mt-6 space-y-4">
                    <div>
                      <p className="text-sm text-slate-400">
                        DALO Order Number
                      </p>
                      <p className="mt-1 break-all font-mono text-sm font-bold">
                        {order.orderNumber || "Not assigned"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Customer Email</p>
                      <p className="mt-1 break-all font-bold">
                        {order.customer}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Payment</p>
                      <p className="mt-1 font-bold">{order.payment}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Delivery</p>
                      <p className="mt-1 font-bold">{order.fulfillment}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Ordered on</p>
                      <p className="mt-1 font-bold">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Valid until</p>
                      <p className="mt-1 font-bold">
                        {formatDate(order.expiresAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
                  <h3 className="text-2xl font-bold">Need help?</h3>

                  <p className="mt-3 text-slate-600">
                    If installation or mobile data does not work, contact DALO
                    support with this order attached automatically.
                  </p>

                  <a
                    href={`/customer/support?orderId=${order.id}`}
                    className="mt-6 block rounded-2xl bg-blue-600 px-5 py-4 text-center font-bold text-white shadow-lg shadow-blue-100"
                  >
                    Get help with this eSIM
                  </a>
                </div>

                <div className="rounded-[2rem] bg-blue-50 p-6">
                  <h3 className="text-2xl font-bold text-blue-950">
                    Top-up coming soon
                  </h3>

                  <p className="mt-3 text-blue-700">
                    Later customers will be able to buy more data for this eSIM
                    here.
                  </p>

                  <button
                    disabled
                    className="mt-6 w-full rounded-2xl bg-blue-100 px-5 py-4 font-bold text-blue-400"
                  >
                    Buy top-up soon
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}