const orders = [
  {
    id: "DALO-1001",
    customer: "customer@example.com",
    destination: "Spain",
    product: "Spain Smart",
    data: "5GB",
    amount: "€7.99",
    profit: "€4.79",
    payment: "Paid",
    fulfillment: "Delivered",
    provider: "Wholesale API",
    createdAt: "Today, 14:22",
  },
  {
    id: "DALO-1002",
    customer: "traveler@example.com",
    destination: "Europe",
    product: "Europe Unlimited",
    data: "Unlimited",
    amount: "€14.99",
    profit: "€6.09",
    payment: "Paid",
    fulfillment: "Provisioning",
    provider: "Wholesale API",
    createdAt: "Today, 15:08",
  },
  {
    id: "DALO-1003",
    customer: "demo@example.com",
    destination: "Italy",
    product: "Italy Essential",
    data: "1GB",
    amount: "€3.55",
    profit: "€2.38",
    payment: "Pending",
    fulfillment: "Waiting",
    provider: "Wholesale API",
    createdAt: "Today, 15:34",
  },
  {
    id: "DALO-1004",
    customer: "support@example.com",
    destination: "Japan",
    product: "Japan Power",
    data: "10GB",
    amount: "€12.99",
    profit: "€5.44",
    payment: "Paid",
    fulfillment: "Failed",
    provider: "Wholesale API",
    createdAt: "Yesterday, 18:12",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Paid" || status === "Delivered"
      ? "bg-green-100 text-green-700"
      : status === "Provisioning"
      ? "bg-blue-100 text-blue-700"
      : status === "Failed"
      ? "bg-red-100 text-red-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-bold ${styles}`}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 p-6 text-white md:block">
          <a href="/" className="mb-10 block">
            <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
          </a>

          <nav className="space-y-2">
            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin"
            >
              Dashboard
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/products"
            >
              Products
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/recommendations"
            >
              Recommendations
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/upsells"
            >
              Upsells
            </a>

            <a
              className="block rounded-2xl bg-blue-600 px-5 py-4 font-semibold"
              href="/admin/orders"
            >
              Orders
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/providers"
            >
              API Providers
            </a>
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                DALO Admin
              </p>

              <h1 className="mt-2 text-4xl font-bold text-slate-950">
                Orders
              </h1>

              <p className="mt-2 text-slate-600">
                Track payments, API provisioning and eSIM delivery status.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white">
                Export CSV
              </button>

              <button className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">
                Refresh Orders
              </button>
            </div>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Total Orders
              </p>
              <h2 className="mt-3 text-3xl font-bold">4</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">Revenue</p>
              <h2 className="mt-3 text-3xl font-bold">€39.52</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">Profit</p>
              <h2 className="mt-3 text-3xl font-bold">€18.70</h2>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
              <p className="text-sm font-semibold text-slate-500">
                Failed Orders
              </p>
              <h2 className="mt-3 text-3xl font-bold text-red-600">1</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
              <div className="border-b border-slate-100 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">
                      Order List
                    </h2>
                    <p className="mt-1 text-slate-600">
                      Every paid order will trigger the provider API later.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button className="rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">
                      All
                    </button>
                    <button className="rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-100">
                      Paid
                    </button>
                    <button className="rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-100">
                      Failed
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Destination</th>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Profit</th>
                      <th className="px-6 py-4 font-semibold">Payment</th>
                      <th className="px-6 py-4 font-semibold">Fulfillment</th>
                      <th className="px-6 py-4 font-semibold">Created</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-slate-100">
                        <td className="px-6 py-5 font-bold">{order.id}</td>

                        <td className="px-6 py-5">
                          <div className="font-semibold">{order.customer}</div>
                          <div className="text-sm text-slate-500">
                            {order.provider}
                          </div>
                        </td>

                        <td className="px-6 py-5">{order.destination}</td>

                        <td className="px-6 py-5">
                          <div className="font-bold">{order.product}</div>
                          <div className="text-sm text-slate-500">
                            {order.data}
                          </div>
                        </td>

                        <td className="px-6 py-5 font-bold">{order.amount}</td>

                        <td className="px-6 py-5 font-bold text-green-700">
                          {order.profit}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={order.payment} />
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge status={order.fulfillment} />
                        </td>

                        <td className="px-6 py-5 text-slate-500">
                          {order.createdAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
                <h2 className="text-2xl font-bold">Fulfillment Flow</h2>
                <p className="mt-2 text-slate-300">
                  This is what happens after Stripe confirms payment.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">1. Payment</div>
                    <div className="mt-1 font-bold">Stripe confirms order</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">2. Provider API</div>
                    <div className="mt-1 font-bold">Create eSIM request</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">3. Delivery</div>
                    <div className="mt-1 font-bold">QR code sent to customer</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
                <h2 className="text-2xl font-bold text-slate-950">
                  Failed Order Actions
                </h2>

                <p className="mt-3 text-slate-600">
                  Later, failed provider requests can be retried manually or
                  refunded from this panel.
                </p>

                <div className="mt-6 space-y-3">
                  <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white">
                    Retry API Request
                  </button>

                  <button className="w-full rounded-2xl border border-red-200 px-5 py-4 font-bold text-red-600">
                    Mark for Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}