import { redirect } from "next/navigation";
import { getCurrentCustomer } from "../../../lib/customer-auth";
import { prisma } from "../../../lib/db";

export default async function CustomerSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/customer/login");
  }

  const params = await searchParams;
  const orderId = params.orderId;

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

  const selectedOrder = orderId
    ? orders.find((order) => order.id === orderId)
    : orders[0];

  const product = selectedOrder
    ? await prisma.product.findUnique({
        where: {
          id: selectedOrder.productId,
        },
      })
    : null;

  return (
    <main className="min-h-screen bg-[#F6F8FF] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <a href="/">
            <img src="/dalo-logo.png" alt="DALO" className="h-14 w-auto" />
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

        <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-blue-100 md:p-10">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
              DALO Support
            </p>

            <h1 className="mt-3 text-5xl font-bold">How can we help?</h1>

            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Send us your issue with the correct eSIM order attached. This
              helps support find your eSIM faster.
            </p>

            <form className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Select order
                </label>

                <select
                  name="orderId"
                  defaultValue={selectedOrder?.id || ""}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
                >
                  {orders.length === 0 ? (
                    <option value="">No orders found</option>
                  ) : (
                    orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {`${order.orderNumber || order.id} · ${
                          order.iccid || "ICCID not assigned"
                        }`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Reason
                </label>

                <select
                  name="reason"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="installing">eSIM is not installing</option>
                  <option value="qr">QR code needed again</option>
                  <option value="data">Mobile data is not working</option>
                  <option value="topup">I need a top-up</option>
                  <option value="wrong-country">I bought the wrong country</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Message
                </label>

                <textarea
                  name="message"
                  rows={6}
                  placeholder="Describe what happened..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <button
                type="button"
                className="w-full rounded-2xl bg-blue-600 p-5 text-lg font-bold text-white shadow-lg shadow-blue-100"
              >
                Submit support request soon
              </button>

              <p className="text-sm text-slate-500">
                This form is prepared for the MVP. Sending support requests will
                be connected later.
              </p>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl">
              <h2 className="text-2xl font-bold">Attached order</h2>

              {selectedOrder ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">DALO Order Number</p>
                    <p className="mt-1 font-mono text-lg font-bold">
                      {selectedOrder.orderNumber || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">ICCID</p>
                    <p className="mt-1 break-all font-mono text-sm font-bold">
                      {selectedOrder.iccid || "Not assigned yet"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Product</p>
                    <p className="mt-1 font-bold">
                      {product?.name || "Product not found"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Customer</p>
                    <p className="mt-1 break-all font-bold">{customer.email}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-slate-300">
                  No order is attached yet.
                </p>
              )}
            </div>

            <div className="rounded-[2rem] bg-white p-7 shadow-xl shadow-blue-50">
              <h2 className="text-2xl font-bold">Common fixes</h2>

              <div className="mt-5 space-y-4 text-slate-600">
                <p>Restart your phone after installing the eSIM.</p>
                <p>Make sure data roaming is enabled for the eSIM.</p>
                <p>Check that the selected eSIM is active for mobile data.</p>
                <p>Use Wi-Fi during installation.</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}