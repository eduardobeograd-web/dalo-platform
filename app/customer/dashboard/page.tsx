import { redirect } from "next/navigation";
import { getCurrentCustomer } from "../../../lib/customer-auth";
import { prisma } from "../../../lib/db";

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

  return (
    <main className="min-h-screen bg-[#F6F8FF] px-6 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <a href="/" className="inline-block">
              <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
            </a>

            <p className="mt-6 text-sm font-bold uppercase tracking-wide text-blue-600">
              Customer Dashboard
            </p>

            <h1 className="mt-2 text-4xl font-bold">Your eSIMs</h1>

            <p className="mt-2 text-slate-600">
              Logged in as {customer.email}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/"
              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200"
            >
              Buy new eSIM
            </a>

            <a
              href="/customer/logout"
              className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700"
            >
              Logout
            </a>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="mt-10 rounded-[2rem] bg-white p-10 shadow-xl shadow-blue-100">
            <div className="text-5xl">🌍</div>

            <h2 className="mt-5 text-3xl font-bold">No eSIM orders yet</h2>

            <p className="mt-3 text-slate-600">
              Once you buy an eSIM with this email address, it will appear here.
            </p>

            <a
              href="/"
              className="mt-8 inline-block rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white"
            >
              Find an eSIM
            </a>
          </div>
        ) : (
          <div className="mt-10 grid gap-6">
            {orders.map((order) => {
              const product = productById.get(order.productId);
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
                order.iosInstallUrl ||
                order.androidInstallUrl ||
                order.qrCodeUrl ||
                order.activationCode ||
                order.iccid;

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-100"
                >
                  <div className="grid gap-6 p-8 lg:grid-cols-[1fr_320px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                          {order.esimStatus ||
                            order.fulfillment ||
                            "Order created"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                          {order.payment}
                        </span>

                        {hasInstallDetails ? (
                          <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                            Installation ready
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700">
                            Installation pending
                          </span>
                        )}
                      </div>

                      <h2 className="mt-5 text-3xl font-bold">
                        {product?.name || "DALO eSIM"}
                      </h2>

                      <p className="mt-2 text-slate-600">
                        Ordered on {formatDate(order.createdAt)}
                      </p>

                      <p className="mt-2 font-mono text-sm font-bold text-slate-500">
                        Order Number: {order.orderNumber || order.id}
                      </p>

                    

                      <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-500">
                            Package
                          </p>
                          <p className="mt-2 text-xl font-bold">
                            {product?.data || "Not available"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-500">
                            Validity
                          </p>
                          <p className="mt-2 text-xl font-bold">
                            {product
                              ? `${product.validityDays} days`
                              : "Not available"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-5">
                          <p className="text-sm font-semibold text-slate-500">
                            Valid until
                          </p>
                          <p className="mt-2 text-xl font-bold">
                            {formatDate(order.expiresAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-500">
                              Data usage
                            </p>

                            {hasUsageData ? (
                              <p className="mt-2 text-2xl font-bold">
                                {formatGb(order.usedDataGb)} used /{" "}
                                {formatGb(order.totalDataGb)} total
                              </p>
                            ) : (
                              <p className="mt-2 text-lg font-bold text-slate-700">
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

                    <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
                      <h3 className="text-2xl font-bold">Manage eSIM</h3>

                      <p className="mt-3 text-slate-300">
                        View activation details, install links, usage and future
                        top-ups for this eSIM.
                      </p>

                      <div className="mt-6 space-y-3">
                        <a
                          href={`/customer/orders/${order.id}`}
                          className="block rounded-2xl bg-blue-600 px-5 py-4 text-center font-bold text-white"
                        >
                          View eSIM details
                        </a>

                        <a
                          href={`/?country=${encodeURIComponent(
                            product?.country || ""
                          )}`}
                          className="block rounded-2xl bg-white/10 px-5 py-4 text-center font-bold text-white"
                        >
                          Buy more data
                        </a>

                        <a
                          href="/"
                          className="block rounded-2xl bg-white/10 px-5 py-4 text-center font-bold text-white"
                        >
                          Buy new eSIM
                        </a>
                      </div>

                      <div className="mt-6 rounded-2xl bg-white/10 p-4">
                        <p className="text-sm text-slate-400">
                          Provider Order ID
                        </p>
                        <p className="mt-1 break-all font-mono text-sm font-bold">
                          {order.providerOrderId || "Not available yet"}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl bg-white/10 p-4">
                        <p className="text-sm text-slate-400">ICCID</p>
                        <p className="mt-1 break-all font-mono text-sm font-bold">
                          {order.iccid || "Not available yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}