import Image from "next/image";
import { prisma } from "../../../lib/db";

function formatPrice(value: number) {
  return `€${value.toFixed(2)}`;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId?: string;
  }>;
}) {
  const params = await searchParams;

  const order = params.orderId
    ? await prisma.order.findUnique({
        where: {
          id: params.orderId,
        },
      })
    : null;

  const product = order
    ? await prisma.product.findUnique({
        where: {
          id: order.productId,
        },
      })
    : null;

  if (!order || !product) {
    return (
      <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="/">
            <Image
              src="/dalo-logo.png"
              alt="DALO"
              width={180}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </a>

          <a
            href="/"
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-white"
          >
            Back Home
          </a>
        </nav>

        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="rounded-[2rem] bg-white p-10 shadow-xl shadow-blue-50">
            <h1 className="text-4xl font-bold text-slate-950">
              Order not found
            </h1>

            <p className="mt-4 text-slate-600">
              We could not find this checkout order.
            </p>

            <a
              href="/"
              className="mt-8 inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white"
            >
              Back Home
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/">
          <Image
            src="/dalo-logo.png"
            alt="DALO"
            width={180}
            height={80}
            className="h-16 w-auto"
            priority
          />
        </a>

        <a
          href="/"
          className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-white"
        >
          Back Home
        </a>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-[2.5rem] bg-white p-10 text-center shadow-2xl shadow-blue-100">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>

          <p className="mt-8 text-sm font-bold uppercase tracking-wide text-blue-600">
            Order Received
          </p>

          <h1 className="mt-3 text-5xl font-bold text-slate-950">
            Your eSIM order is pending
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            We received your order details. Payment and automatic eSIM delivery
            will be connected in the next step of the build.
          </p>

          <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Order ID</div>
              <div className="mt-1 break-all font-mono text-sm font-bold">
                {order.id}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Email</div>
              <div className="mt-1 font-bold">{order.customer}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Product</div>
              <div className="mt-1 font-bold">{product.name}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Plan</div>
              <div className="mt-1 font-bold">
                {product.data} / {product.validityDays} Days
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Payment Status</div>
              <div className="mt-1 font-bold">{order.payment}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">eSIM Delivery</div>
              <div className="mt-1 font-bold">{order.fulfillment}</div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-blue-50 p-6 text-left text-blue-700">
            <div className="font-bold">
              Total: {formatPrice(product.sellPrice)}
            </div>
            <div className="mt-1">
              This is currently a test order only. No real payment has been
              charged yet.
            </div>
          </div>

          <div className="mt-10">
            <a
              href="/"
              className="inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white"
            >
              Back Home
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}