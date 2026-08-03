import { prisma } from "../../../lib/db";
import { stripe } from "../../../lib/stripe";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

async function loadStripeCheckoutOrder(sessionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = stripeSession.metadata?.orderId;

  if (!orderId) {
    return null;
  }

  return prisma.order.findFirst({
    where: {
      id: orderId,
      stripeSessionId: stripeSession.id,
    },
  });
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId?: string;
    session_id?: string;
  }>;
}) {
  const params = await searchParams;

  let order = params.session_id
    ? await loadStripeCheckoutOrder(params.session_id)
    : null;

  if (
    !order &&
    params.orderId &&
    process.env.NODE_ENV !== "production" &&
    process.env.DALO_ENABLE_TEST_CHECKOUT === "true"
  ) {
    order = await prisma.order.findUnique({
      where: {
        id: params.orderId,
      },
    });
  }

  const product = order
    ? await prisma.product.findUnique({
        where: {
          id: order.productId,
        },
      })
    : null;

  const customer = order?.customerId
    ? await prisma.customer.findUnique({
        where: {
          id: order.customerId,
        },
      })
    : order?.customer
      ? await prisma.customer.findUnique({
          where: {
            email: order.customer,
          },
        })
      : null;

  if (!order || !product) {
    return (
      <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-900">
        <SiteHeader mode="checkout" />

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
        <SiteFooter />
      </main>
    );
  }

  const hasPassword = Boolean(customer?.passwordHash);
  const encodedEmail = encodeURIComponent(order.customer);

  return (
    <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-900">
      <SiteHeader mode="checkout" />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-[2.5rem] bg-white p-10 text-center shadow-2xl shadow-blue-100">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>

          <p className="mt-8 text-sm font-bold uppercase tracking-wide text-blue-600">
            Order Confirmed
          </p>

          <h1 className="mt-3 text-5xl font-bold text-slate-950">
            Your eSIM order is confirmed
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            {order.esimStatus === "ready"
              ? "Your test payment was received and your test eSIM is ready."
              : "Your payment was received in test mode. Your eSIM is now being prepared."}
          </p>

          <div className="mt-8 rounded-[2rem] bg-blue-600 p-7 text-left text-white shadow-xl shadow-blue-100">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-100">
              Next step
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Manage your eSIM in your customer account
            </h2>

            <p className="mt-3 text-blue-50">
              Create a password to access your order, eSIM details, future
              top-ups and support information.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {hasPassword ? (
                <a
                  href="/customer/login"
                  className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-blue-700"
                >
                  Log in to customer account
                </a>
              ) : (
                <a
                  href={`/customer/forgot-password?email=${encodedEmail}`}
                  className="rounded-2xl bg-white px-6 py-4 text-center font-bold text-blue-700"
                >
                  Create password
                </a>
              )}

              <a
                href="/customer/login"
                className="rounded-2xl border border-blue-200 px-6 py-4 text-center font-bold text-white"
              >
                Already have an account?
              </a>
            </div>
          </div>

          <div className="mt-10 grid gap-4 text-left md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">Order Number</div>
              <div className="mt-1 font-mono text-sm font-bold">
                {order.orderNumber || order.id}
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
              Total: {formatPrice(order.amount ?? product.sellPrice)}
            </div>
            <div className="mt-1">
              {order.esimStatus === "ready"
                ? "Stripe test payment and test eSIM delivery completed successfully."
                : "Stripe test payment completed. Your eSIM delivery is being prepared."}
            </div>
          </div>

          <div className="mt-10">
            <a
              href="/"
              className="inline-block rounded-2xl bg-slate-100 px-8 py-4 font-bold text-slate-700"
            >
              Back Home
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
