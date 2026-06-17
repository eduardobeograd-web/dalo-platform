import Image from "next/image";
import { prisma } from "../../lib/db";
import { createCheckoutOrder } from "./actions";
import CheckoutSessionInput from "../../components/tracking/CheckoutSessionInput";

function formatPrice(value: number) {
  return `€${value.toFixed(2)}`;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    productId?: string;
    error?: string;
    stripe?: string;
  }>;
}) {
  const params = await searchParams;
  const productId = params.productId;
  const hasError = params.error === "1";
  const stripeMissing = params.stripe === "missing";

  const product = productId
    ? await prisma.product.findUnique({
        where: {
          id: productId,
        },
      })
    : null;

  if (!product) {
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
        </nav>

        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="rounded-[2rem] bg-white p-10 shadow-xl shadow-blue-50">
            <h1 className="text-4xl font-bold text-slate-950">
              Product not found
            </h1>

            <p className="mt-4 text-slate-600">
              Go back and choose a valid eSIM product.
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
          href="/#quiz"
          className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-white"
        >
          ← New Search
        </a>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Complete your order
          </h1>

          <p className="mt-3 text-slate-600">
            Enter your email so DALO can prepare your eSIM order.
          </p>

          {hasError && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              Please enter a valid email address and try again.
            </div>
          )}

          {stripeMissing && (
            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
              Stripe is prepared, but no real Stripe test key is connected yet.
            </div>
          )}

          <form action={createCheckoutOrder} className="mt-8 space-y-5">
            <input type="hidden" name="productId" value={product.id} />
            <CheckoutSessionInput />

            <div>
              <label className="mb-2 block font-semibold">Email address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Full name</label>
              <input
                name="name"
                type="text"
                placeholder="Eduardo"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-700">
              <strong>MVP mode:</strong> This creates a pending order in the DALO
              database. Real Stripe payment will be activated after test keys are
              added.
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 p-5 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Create Test Order →
            </button>
          </form>

          <form
            action="/api/stripe/checkout"
            method="POST"
            className="mt-4 space-y-4"
          >
            <input type="hidden" name="productId" value={product.id} />
            <CheckoutSessionInput />

            <input
              name="email"
              type="email"
              required
              placeholder="Stripe test email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
            />

            <button
              type="submit"
              className="w-full rounded-2xl border border-slate-300 p-5 text-lg font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Test Stripe Route →
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
            <img
              src={product.image}
              alt={product.name}
              className="h-52 w-full object-cover"
            />

            <div className="p-7">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                Your eSIM
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                {product.name}
              </h2>

              <p className="mt-3 text-xl font-bold text-blue-600">
                {product.data} / {product.validityDays} Days
              </p>

              <p className="mt-4 text-slate-600">{product.description}</p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Plan</span>
                  <span className="font-bold">
                    {formatPrice(product.sellPrice)}
                  </span>
                </div>

                <div className="mt-3 flex justify-between">
                  <span className="text-slate-600">Delivery</span>
                  <span className="font-bold">Instant</span>
                </div>

                <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-xl">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-blue-600">
                    {formatPrice(product.sellPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl">
            <h3 className="text-xl font-bold">Checkout Status</h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Local Orders</div>
                <div className="font-bold">Working</div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Stripe Route</div>
                <div className="font-bold">Prepared</div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Real Payments</div>
                <div className="font-bold">Needs Stripe test key</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}