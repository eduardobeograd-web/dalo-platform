import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getCurrentCustomer } from "../../../../lib/customer-auth";
import { prisma } from "../../../../lib/db";
import SiteFooter from "../../../../components/SiteFooter";
import SiteHeader from "../../../../components/SiteHeader";
import { getEsimLifecycleStatus } from "../../../../lib/esim-lifecycle";
import { getEsimGoReadiness } from "../../../../lib/providers/esim-go/config";
import { getProviderConfigBySlug } from "../../../../lib/providers/provider-configs";
import { getOrderPurchaseDetails } from "../../../../lib/order-purchase-details";
import { refreshCustomerEsimGoUsage } from "./actions";

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
  if (value < 1) {
    const megabytes = value * 1_000;
    if (megabytes > 0 && megabytes < 1) return "<1 MB";
    return `${Math.round(megabytes)} MB`;
  }
  return `${value.toFixed(1)} GB`;
}

function getUsagePercent(total?: number | null, used?: number | null) {
  if (!total || !used) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

function getCustomerStatus(order: {
  esimStatus: string | null;
  fulfillment: string;
  payment: string;
  usedDataGb: number | null;
  remainingDataGb: number | null;
  totalDataGb: number | null;
  paidAt: Date | null;
  createdAt: Date;
  activationDeadlineAt: Date | null;
  activatedAt: Date | null;
  expiresAt: Date | null;
}) {
  const lifecycleStatus = getEsimLifecycleStatus(order);

  if (lifecycleStatus === "refunded") {
    return {
      label: "This order was refunded",
      description:
        "The refund has been confirmed. Installation actions are no longer available through DALO.",
      badge: "Refunded",
      badgeStyle: "bg-amber-100 text-amber-800",
    };
  }

  if (lifecycleStatus === "delivery_issue") {
    return {
      label: "We need to check your eSIM",
      description: "Please contact support and include your DALO order number.",
      badge: "Delivery issue",
      badgeStyle: "bg-red-100 text-red-700",
    };
  }

  if (lifecycleStatus === "suspended") {
    return {
      label: "Your eSIM is suspended",
      description:
        "The provider has suspended this eSIM. Please contact DALO support before making changes on your phone.",
      badge: "Suspended",
      badgeStyle: "bg-red-100 text-red-700",
    };
  }

  if (lifecycleStatus === "expired") {
    return {
      label: "This eSIM has expired",
      description: "This plan is no longer available for installation or mobile data.",
      badge: "Expired",
      badgeStyle: "bg-slate-100 text-slate-700",
    };
  }

  if (lifecycleStatus === "no_data") {
    return {
      label: "You have no data left",
      description: "The included data allowance has been fully used.",
      badge: "No data left",
      badgeStyle: "bg-slate-100 text-slate-700",
    };
  }

  if (lifecycleStatus === "low_data") {
    return {
      label: "Your data is running low",
      description: "Less than 20% of your included data remains.",
      badge: "Low data",
      badgeStyle: "bg-amber-100 text-amber-800",
    };
  }

  if (lifecycleStatus === "active") {
    return {
      label: "Your eSIM is active",
      description: "Your eSIM has connected and started using mobile data.",
      badge: "Active",
      badgeStyle: "bg-emerald-100 text-emerald-700",
    };
  }

  if (lifecycleStatus === "installed") {
    return {
      label: "Your eSIM is installed",
      description:
        "Installation is complete. Your data plan becomes active when it first connects to a supported network.",
      badge: "Installed",
      badgeStyle: "bg-blue-100 text-blue-700",
    };
  }

  if (lifecycleStatus === "ready") {
    return {
      label: "Your eSIM is ready to install",
      description: "Install your eSIM before your trip, then activate it when you arrive.",
      badge: "Ready to install",
      badgeStyle: "bg-green-100 text-green-700",
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ usageSync?: string }>;
}) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const [{ id }, query] = await Promise.all([params, searchParams]);

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

  const purchase = getOrderPurchaseDetails(order, product);

  const esimGoReadiness = getEsimGoReadiness();
  const providerConfig =
    esimGoReadiness.readAccessEnabled || esimGoReadiness.topUpsEnabled
    ? await getProviderConfigBySlug("esim-go")
    : null;
  const usageRefreshOperational = Boolean(
    order.payment === "Paid" &&
      order.esimProfileId &&
      esimGoReadiness.readAccessEnabled &&
      providerConfig?.active &&
      providerConfig.usageSyncEnabled,
  );
  const topUpsOperational = Boolean(
    esimGoReadiness.topUpsEnabled &&
      providerConfig?.active &&
      providerConfig.fulfillmentEnabled &&
      order.esimProfileId,
  );
  const topUpProducts = topUpsOperational && purchase.country !== "Destination unavailable"
    ? await prisma.product.findMany({
        where: {
          active: true,
          country: purchase.country,
          OR: [
            { provider: { equals: "eSIM Go", mode: "insensitive" } },
            { provider: { equals: "esim-go", mode: "insensitive" } },
            { provider: { equals: "esimgo", mode: "insensitive" } },
          ],
        },
        orderBy: [{ sellPrice: "asc" }, { data: "asc" }],
        take: 4,
      })
    : [];

  const status = getCustomerStatus(order);
  const isRefunded = order.payment === "Refunded";
  const generatedQrCodeUrl =
    !isRefunded && order.activationCode
      ? await QRCode.toDataURL(order.activationCode, {
          width: 320,
          margin: 2,
          errorCorrectionLevel: "M",
        })
      : null;
  const displayedQrCodeUrl = order.qrCodeUrl || generatedQrCodeUrl;
  const canDownloadInvoice =
    Boolean(order.stripeSessionId) &&
    (order.payment === "Paid" || order.payment === "Refunded");

  const hasInstallButtons =
    !isRefunded && (order.iosInstallUrl || order.androidInstallUrl);
  const hasAlternativeSetup =
    !isRefunded && (displayedQrCodeUrl || order.activationCode);

  const hasUsageData =
    order.totalDataGb !== null &&
    order.totalDataGb !== undefined &&
    order.usedDataGb !== null &&
    order.usedDataGb !== undefined;

  const usagePercent = getUsagePercent(order.totalDataGb, order.usedDataGb);

  return (
    <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-950">
      <SiteHeader mode="account" />
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-3 sm:px-6 sm:py-8">
        <section className="mt-2 sm:mt-10">
          <a
            href="/customer/dashboard"
            className="inline-flex min-h-11 items-center font-bold text-blue-600 hover:text-blue-700"
          >
            ← Back to dashboard
          </a>

          <div className="mt-3 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_55px_rgba(30,64,120,0.14)] sm:mt-6 sm:rounded-[2.5rem] sm:shadow-2xl sm:shadow-blue-100">
            <div className="bg-gradient-to-br from-[#2148c0] via-[#173f91] to-[#10233a] p-5 text-white sm:p-8 md:p-10">
              <div className="flex flex-col justify-between gap-4 sm:gap-6 md:flex-row md:items-start">
                <div>
                  <div
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold sm:px-4 sm:py-2 sm:text-sm ${status.badgeStyle}`}
                  >
                    {status.badge}
                  </div>

                  <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:mt-5 sm:text-4xl md:text-5xl">
                    {status.label}
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:mt-4 sm:text-lg sm:leading-relaxed">
                    {status.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:rounded-[2rem] sm:p-5">
                  <p className="text-xs text-blue-100 sm:text-sm">DALO Order Number</p>
                  <p className="mt-1 break-all font-mono text-lg font-bold sm:text-2xl">
                    {order.orderNumber || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:gap-8 sm:p-8 md:p-10 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col">
                <div className="order-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600 sm:text-sm">
                    Your eSIM
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:mt-3 sm:text-3xl">
                    {purchase.productName}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 sm:mt-3 sm:text-base">
                    {purchase.country} · {purchase.data}
                    {purchase.validityDays !== null
                      ? ` · ${purchase.validityDays} days`
                      : ""}
                  </p>
                </div>

                <div className="order-3 mt-4 rounded-[1.5rem] bg-slate-50 p-4 sm:order-2 sm:mt-8 sm:rounded-[2rem] sm:p-6">
                  <h3 className="text-xl font-black sm:text-2xl">
                    {isRefunded ? "Installation unavailable" : "Install your eSIM"}
                  </h3>

                  {isRefunded ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 sm:mt-6">
                      <p className="font-black">Order refunded</p>
                      <p className="mt-2 text-sm leading-6 text-amber-900">
                        This purchase has been refunded, so installation links,
                        QR codes and activation details are no longer shown.
                        Contact DALO support if you have questions about an eSIM
                        that was installed before the refund.
                      </p>
                    </div>
                  ) : hasInstallButtons ? (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-4">
                      {order.iosInstallUrl ? (
                        <a
                          href={order.iosInstallUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-3 py-3 text-center text-xs font-bold text-white shadow-lg shadow-blue-100 sm:rounded-2xl sm:px-6 sm:py-5 sm:text-base"
                        >
                          Install on iPhone
                        </a>
                      ) : null}

                      {order.androidInstallUrl ? (
                        <a
                          href={order.androidInstallUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-3 py-3 text-center text-xs font-bold text-white shadow-lg shadow-slate-100 sm:rounded-2xl sm:px-6 sm:py-5 sm:text-base"
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

                  {!isRefunded ? (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-4">
                      <div className="min-w-0 rounded-xl bg-white p-3 sm:rounded-2xl sm:p-5">
                        <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                          ICCID
                        </p>
                        <p className="mt-1 break-all font-mono text-[11px] font-bold sm:mt-2 sm:text-sm">
                          {order.iccid || "Not available yet"}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-xl bg-white p-3 sm:rounded-2xl sm:p-5">
                        <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                          eSIM Status
                        </p>
                        <p className="mt-1 text-sm font-bold sm:mt-2 sm:text-base">
                          {status.badge}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {hasAlternativeSetup ? (
                    <details className="mt-4 rounded-xl bg-white p-4 sm:mt-6 sm:rounded-2xl sm:p-5">
                      <summary className="cursor-pointer list-none text-sm font-bold text-blue-700 marker:hidden sm:text-lg">
                        QR code &amp; manual setup
                        <span className="float-right text-slate-400" aria-hidden="true">
                          +
                        </span>
                      </summary>

                      {displayedQrCodeUrl ? (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate-500">
                            QR Code
                          </p>

                          <img
                            src={displayedQrCodeUrl}
                            alt="eSIM QR Code"
                            className="mt-3 h-40 w-40 rounded-xl bg-slate-50 object-contain p-3 sm:h-48 sm:w-48"
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
                    </details>
                  ) : null}
                </div>

                <div className="order-2 mt-4 rounded-[1.5rem] border border-blue-100 bg-white p-4 shadow-xl shadow-blue-50 sm:order-3 sm:mt-6 sm:rounded-[2rem] sm:border-0 sm:p-6">
                  <h3 className="text-xl font-bold sm:text-2xl">Data usage</h3>

                  {query.usageSync === "passed" ? (
                    <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      Your latest data usage has been loaded.
                    </div>
                  ) : null}

                  {query.usageSync === "recent" ? (
                    <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
                      Your usage is already up to date. Please wait a minute
                      before refreshing again.
                    </div>
                  ) : null}

                  {query.usageSync === "failed" ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                      Usage could not be refreshed right now. No purchase or
                      change was made. Please try again later.
                    </div>
                  ) : null}

                  {query.usageSync === "unavailable" ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                      Usage refresh is not available for this order yet.
                    </div>
                  ) : null}

                  {hasUsageData ? (
                    <div className="mt-4 sm:mt-5">
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

                  {usageRefreshOperational ? (
                    <form action={refreshCustomerEsimGoUsage} className="mt-4">
                      <input type="hidden" name="orderId" value={order.id} />
                      <button
                        type="submit"
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        Refresh data usage
                      </button>
                      <p className="mt-2 text-center text-xs leading-5 text-slate-500">
                        Checks this DALO eSIM only. This cannot buy or change a
                        plan.
                      </p>
                    </form>
                  ) : null}

                  {!isRefunded ? (
                    <div id="top-up" className="mt-5 scroll-mt-24 border-t border-slate-200 pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black text-slate-950">Need more data?</p>
                          <p className="mt-1 text-sm leading-5 text-slate-600">
                            Buy a compatible top-up for this eSIM without another installation.
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                          {topUpProducts.length ? "Available" : "Coming soon"}
                        </span>
                      </div>
                      {topUpProducts.length ? (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {topUpProducts.map((topUpProduct) => (
                            <a
                              key={topUpProduct.id}
                              href={`/checkout?productId=${encodeURIComponent(topUpProduct.id)}&topUpProfileId=${encodeURIComponent(order.esimProfileId || "")}&sourceOrderId=${encodeURIComponent(order.id)}`}
                              className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100"
                            >
                              {topUpProduct.data} · ${topUpProduct.sellPrice.toFixed(2)}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <button
                          disabled
                          className="mt-4 min-h-11 w-full cursor-not-allowed rounded-xl bg-blue-100 px-4 text-sm font-bold text-blue-400"
                        >
                          Buy more data
                        </button>
                      )}

                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <p className="text-sm font-black text-slate-950">
                          Travelling somewhere else?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          Choose another destination. Compatible plans may use
                          this installed eSIM again.
                        </p>
                        <span
                          aria-disabled="true"
                          className="mt-3 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400"
                        >
                          Add another destination · Coming soon
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <aside className="space-y-4 sm:space-y-6">
                <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white sm:rounded-[2rem] sm:p-6">
                  <h3 className="text-xl font-bold sm:text-2xl">Order details</h3>

                  {canDownloadInvoice ? (
                    <a
                      href={`/customer/orders/${order.id}/invoice`}
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:mt-5"
                    >
                      Download invoice
                    </a>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:block sm:space-y-4">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 sm:text-sm">
                        DALO Order Number
                      </p>
                      <p className="mt-1 break-all font-mono text-xs font-bold sm:text-sm">
                        {order.orderNumber || "Not assigned"}
                      </p>
                    </div>

                    <div className="col-span-2 min-w-0 sm:col-auto">
                      <p className="text-xs text-slate-400 sm:text-sm">Customer Email</p>
                      <p className="mt-1 break-all text-sm font-bold sm:text-base">
                        {order.customer}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 sm:text-sm">Payment</p>
                      <p className="mt-1 text-sm font-bold sm:text-base">{order.payment}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 sm:text-sm">Delivery</p>
                      <p className="mt-1 text-sm font-bold capitalize sm:text-base">{order.fulfillment}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 sm:text-sm">Ordered on</p>
                      <p className="mt-1 text-sm font-bold sm:text-base">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 sm:text-sm">Valid until</p>
                      <p className="mt-1 text-sm font-bold sm:text-base">
                        {formatDate(order.expiresAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white p-4 shadow-xl shadow-blue-50 sm:rounded-[2rem] sm:p-6">
                  <h3 className="text-xl font-bold sm:text-2xl">Need help?</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base">
                    If installation or mobile data does not work, contact DALO
                    support with this order attached automatically.
                  </p>

                  <a
                    href={`/customer/support?orderId=${order.id}`}
                    className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-center text-sm font-bold text-white shadow-lg shadow-blue-100 sm:mt-6 sm:rounded-2xl sm:px-5 sm:text-base"
                  >
                    Get help with this eSIM
                  </a>
                </div>

              </aside>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
