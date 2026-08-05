import { redirect } from "next/navigation";
import { getCurrentCustomer } from "../../../lib/customer-auth";
import { prisma } from "../../../lib/db";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import { getEsimLifecycleStatus } from "../../../lib/esim-lifecycle";

function formatDate(value?: Date | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatGb(value?: number | null) {
  if (value === null || value === undefined) return null;
  return `${value.toFixed(1)}GB`;
}

function getUsagePercent(total?: number | null, used?: number | null) {
  if (!total || !used) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export default async function CustomerDashboardPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        {
          customerId: customer.id,
        },
        {
          customer: customer.email,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const productIds = [...new Set(orders.map((order) => order.productId))];

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const productById = new Map(products.map((product) => [product.id, product]));
  const installationReadyCount = orders.filter(
    (order) =>
      order.payment !== "Refunded" &&
      (order.usedDataGb || 0) <= 0 &&
      (order.iosInstallUrl ||
        order.androidInstallUrl ||
        order.qrCodeUrl ||
        order.activationCode ||
        order.iccid)
  ).length;

  return (
    <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-950">
      <SiteHeader mode="account" />
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:px-6 sm:py-8">
        <section className="mt-3 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2148c0] via-[#173f91] to-[#10233a] p-5 text-white shadow-[0_22px_55px_rgba(33,72,192,0.2)] sm:mt-8 sm:rounded-[2.5rem] sm:p-8 md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-100 sm:text-sm sm:tracking-wide">
            Customer Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight sm:mt-3 sm:text-5xl">
            Your eSIMs
          </h1>

          <div className="mt-2 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="break-all text-sm text-blue-50 sm:max-w-2xl sm:text-lg">
              Logged in as {customer.email}
            </p>
            <a
              href="/customer/settings"
              className="inline-flex min-h-10 w-fit items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Account settings
            </a>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/15 pt-4 sm:max-w-md sm:gap-4">
            <div>
              <p className="text-2xl font-black">{orders.length}</p>
              <p className="text-xs font-semibold text-blue-100">
                {orders.length === 1 ? "eSIM order" : "eSIM orders"}
              </p>
            </div>
            <div className="border-l border-white/15 pl-4">
              <p className="text-2xl font-black">{installationReadyCount}</p>
              <p className="text-xs font-semibold text-blue-100">
                Installation ready
              </p>
            </div>
          </div>
        </section>

        {orders.length === 0 ? (
          <div className="mt-5 rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-100 sm:mt-10 sm:p-10">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" />
              </svg>
            </div>

            <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
              No eSIM orders yet
            </h2>

            <p className="mt-3 text-slate-600">
              Once you buy an eSIM with this email address, it will appear here.
            </p>

            <a
              href="/"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 font-bold text-white sm:mt-8"
            >
              Find an eSIM
            </a>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:mt-10 sm:gap-6">
            {orders.map((order) => {
              const product = productById.get(order.productId);
              const lifecycleStatus = getEsimLifecycleStatus(order);
              const isRefunded = lifecycleStatus === "refunded";

              const usagePercent = getUsagePercent(
                order.totalDataGb,
                order.usedDataGb
              );

              const hasUsageData =
                order.totalDataGb !== null &&
                order.totalDataGb !== undefined &&
                order.usedDataGb !== null &&
                order.usedDataGb !== undefined;

              const hasInstallDetails =
                !isRefunded &&
                (order.iosInstallUrl ||
                  order.androidInstallUrl ||
                  order.qrCodeUrl ||
                  order.activationCode ||
                  order.iccid);

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-[1.75rem] border border-white bg-white shadow-[0_16px_42px_rgba(30,64,120,0.1)] sm:rounded-[2rem] sm:shadow-xl sm:shadow-blue-100"
                >
                  <div className="h-1 bg-gradient-to-r from-[#2148c0] via-[#4d8bea] to-[#e9a15b]" />
                  <div className="grid gap-4 p-4 sm:gap-6 sm:p-8 lg:grid-cols-[1fr_320px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold sm:px-4 sm:py-2 sm:text-sm ${
                          lifecycleStatus === "refunded"
                            ? "bg-amber-100 text-amber-800"
                            : lifecycleStatus === "delivery_issue"
                              ? "bg-red-100 text-red-700"
                              : lifecycleStatus === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : lifecycleStatus === "ready"
                                  ? "bg-green-100 text-green-700"
                                  : lifecycleStatus === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-slate-100 text-slate-700"
                        }`}>
                          {lifecycleStatus === "refunded"
                            ? "Refunded"
                            : lifecycleStatus === "delivery_issue"
                              ? "Delivery issue"
                              : lifecycleStatus === "active"
                                ? "Active"
                                : lifecycleStatus === "expired"
                                  ? "Expired"
                                  : lifecycleStatus === "data_used"
                                    ? "Data used"
                                    : lifecycleStatus === "ready"
                                  ? "Ready to install"
                                  : "Installation pending"}
                        </span>
                      </div>

                      <h2 className="mt-4 text-2xl font-black tracking-tight sm:mt-5 sm:text-3xl">
                        {product?.name || "DALO eSIM"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600 sm:mt-2 sm:text-base">
                        Ordered on {formatDate(order.createdAt)}
                      </p>

                      <p className="mt-1 break-all font-mono text-xs font-bold text-slate-500 sm:mt-2 sm:text-sm">
                        Order: {order.orderNumber || order.id}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-4">
                        <div className="min-w-0 rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-5">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
                            Package
                          </p>
                          <p className="mt-1 break-words text-base font-black sm:mt-2 sm:text-xl">
                            {product?.data || "Not available"}
                          </p>
                        </div>

                        <div className="min-w-0 rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-5">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
                            Validity
                          </p>
                          <p className="mt-1 break-words text-base font-black sm:mt-2 sm:text-xl">
                            {product
                              ? `${product.validityDays} days`
                              : "Not available"}
                          </p>
                        </div>

                        <div className="min-w-0 rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-5">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
                            Valid until
                          </p>
                          <p className="mt-1 break-words text-sm font-black sm:mt-2 sm:text-xl">
                            {formatDate(order.expiresAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-4 sm:mt-6 sm:p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-500">
                              Data usage
                            </p>

                            {hasUsageData ? (
                              <p className="mt-1 text-lg font-bold sm:mt-2 sm:text-2xl">
                                {formatGb(order.usedDataGb)} used /{" "}
                                {formatGb(order.totalDataGb)} total
                              </p>
                            ) : (
                              <p className="mt-1 text-sm font-bold leading-5 text-slate-700 sm:mt-2 sm:text-lg">
                                Usage tracking will appear after provider sync.
                              </p>
                            )}
                          </div>

                          {order.lastUsageSyncAt ? (
                            <p className="text-sm text-slate-500">
                              Updated {formatDate(order.lastUsageSyncAt)}
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                              width: `${hasUsageData ? usagePercent : 0}%`,
                            }}
                          />
                        </div>

                        {hasUsageData ? (
                          <p className="mt-3 text-sm font-semibold text-slate-600">
                            Remaining: {formatGb(order.remainingDataGb)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white sm:rounded-[2rem] sm:p-6">
                      <h3 className="text-xl font-bold sm:text-2xl">Manage eSIM</h3>

                      <p className="mt-3 hidden text-slate-300 sm:block">
                        View installation details, usage and everything connected
                        to this eSIM.
                      </p>

                      {!isRefunded ? (
                        <details className="mt-4 rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 text-sm sm:mt-5">
                          <summary className="cursor-pointer font-bold text-blue-100">
                            Did you know? Keep this eSIM after your trip
                          </summary>
                          <p className="mt-2 text-xs leading-5 text-slate-300">
                            Your eSIM and data plan are separate. Compatible data
                            or country plans may be added without another
                            installation. DALO checks compatibility first.
                          </p>
                        </details>
                      ) : null}

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:block sm:space-y-3">
                        <a
                          href={`/customer/orders/${order.id}`}
                          className="col-span-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-4 text-center text-sm font-bold text-white sm:block sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base"
                        >
                          View eSIM details
                        </a>

                        <a
                          href={`/customer/support?orderId=${order.id}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-3 text-center text-xs font-bold text-white sm:block sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base"
                        >
                          Get help
                        </a>

                        <a
                          href={`/customer/orders/${order.id}#top-up`}
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white/10 px-3 text-center text-xs font-bold text-white sm:block sm:rounded-2xl sm:px-5 sm:py-4 sm:text-base"
                        >
                          Buy more data
                        </a>

                        <a
                          href="/"
                          className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-3 text-center text-xs font-bold text-slate-200 sm:block sm:rounded-2xl sm:bg-white/10 sm:px-5 sm:py-4 sm:text-base sm:text-white"
                        >
                          Add another destination
                        </a>
                      </div>

                      <div className="hidden">
                      <div className="min-w-0 rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
                        <p className="text-sm text-slate-400">
                          Order number
                        </p>
                        <p className="mt-1 break-all font-mono text-xs font-bold sm:text-sm">
                          {order.orderNumber || "Not assigned yet"}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-xl bg-white/10 p-3 sm:rounded-2xl sm:p-4">
                        <p className="text-sm text-slate-400">ICCID</p>
                        <p className="mt-1 break-all font-mono text-xs font-bold sm:text-sm">
                          {order.iccid || "Not assigned yet"}
                        </p>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
