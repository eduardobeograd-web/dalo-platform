import { prisma } from "../../lib/db";
import { createCheckoutOrder } from "./actions";
import CheckoutSessionInput from "../../components/tracking/CheckoutSessionInput";
import CheckoutEmailInput from "../../components/tracking/CheckoutEmailInput";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function CheckoutLegalConsent({ idPrefix }: { idPrefix: string }) {
  const legalId = `${idPrefix}-legal`;
  const deliveryId = `${idPrefix}-delivery`;

  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
      <legend className="px-1 text-sm font-bold text-slate-900">
        Order confirmation
      </legend>

      <label
        htmlFor={legalId}
        className="flex cursor-pointer items-start gap-3 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6"
      >
        <input
          id={legalId}
          name="legalAccepted"
          type="checkbox"
          value="yes"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        />
        <span>
          I agree to the{" "}
          <a href="/terms" className="font-semibold text-blue-700 underline-offset-2 hover:underline">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a
            href="/refund-policy"
            className="font-semibold text-blue-700 underline-offset-2 hover:underline"
          >
            Refund Policy
          </a>
          , and acknowledge the{" "}
          <a
            href="/privacy-policy"
            className="font-semibold text-blue-700 underline-offset-2 hover:underline"
          >
            Privacy Policy
          </a>
          .
        </span>
      </label>

      <label
        htmlFor={deliveryId}
        className="flex cursor-pointer items-start gap-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6"
      >
        <input
          id={deliveryId}
          name="immediateDeliveryAccepted"
          type="checkbox"
          value="yes"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        />
        <span>
          I expressly request immediate digital delivery of my eSIM. I
          understand that once delivery begins, I may lose an applicable right
          to cancel. This does not affect my rights if the service is defective
          or supplied incorrectly.
        </span>
      </label>
    </fieldset>
  );
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    productId?: string;
    error?: string;
    stripe?: string;
    consent?: string;
    marketingCampaign?: string;
    marketingSourceEventId?: string;
    recommendedProductId?: string;
    recommendationTripLength?: string;
    recommendationUsageType?: string;
    recommendationChoice?: string;
  }>;
}) {
  const params = await searchParams;
  const productId = params.productId;
  const hasError = params.error === "1";
  const stripeMissing = params.stripe === "missing";
  const consentRequired = params.consent === "required";
  const marketingCampaign = params.marketingCampaign || "";
  const marketingSourceEventId = params.marketingSourceEventId || "";
  const recommendedProductId = params.recommendedProductId || "";
  const recommendationTripLength = params.recommendationTripLength || "";
  const recommendationUsageType = params.recommendationUsageType || "";
  const recommendationChoice = params.recommendationChoice || "";
  const testCheckoutEnabled =
    process.env.NODE_ENV !== "production" &&
    process.env.DALO_ENABLE_TEST_CHECKOUT === "true";

  const product = productId
    ? await prisma.product.findFirst({
        where: {
          id: productId,
          active: true,
        },
      })
    : null;

  if (!product) {
    return (
      <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-900">
        <SiteHeader mode="checkout" />

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
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-900">
      <SiteHeader mode="checkout" />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 sm:py-10 lg:grid-cols-[1fr_420px] lg:gap-8">
        <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-blue-50 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Secure Checkout
          </p>

          <h1 className="mt-2 text-[2rem] font-bold leading-tight text-slate-950 sm:text-4xl">
            Complete your order
          </h1>

          <p className="mt-3 text-slate-600">
            Enter your email so DALO can prepare your eSIM order.
          </p>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 lg:hidden">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950">
                {product.name}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                {product.data} · {product.validityDays} days · Instant delivery
              </p>
            </div>
            <p className="shrink-0 text-xl font-black text-[#2148c0]">
              {formatPrice(product.sellPrice)}
            </p>
          </div>

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

          {consentRequired && (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Please confirm both required statements before placing your order.
            </div>
          )}

          <form
            action="/api/stripe/checkout"
            method="POST"
            className="mt-6 space-y-4 sm:mt-8 sm:space-y-5"
          >
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="marketingCampaign" value={marketingCampaign} />
            <input type="hidden" name="marketingSourceEventId" value={marketingSourceEventId} />
            <input type="hidden" name="recommendedProductId" value={recommendedProductId} />
            <input type="hidden" name="recommendationTripLength" value={recommendationTripLength} />
            <input type="hidden" name="recommendationUsageType" value={recommendationUsageType} />
            <input type="hidden" name="recommendationChoice" value={recommendationChoice} />
            <CheckoutSessionInput />

            <div>
              <label className="mb-2 block font-semibold">Email address</label>
              <CheckoutEmailInput
                productId={product.id}
                productName={product.name}
                destination={product.country}
                price={product.sellPrice}
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

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-[11px] font-semibold leading-4 text-slate-600 sm:text-xs">
              <span>Secure payment</span>
              <span>Instant delivery</span>
              <span>Order support</span>
            </div>

            <CheckoutLegalConsent idPrefix="stripe-order" />

            <button
              type="submit"
              className="min-h-14 w-full rounded-2xl bg-[#2148c0] px-3 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#17389b] focus:outline-none focus:ring-4 focus:ring-blue-100 sm:p-5 sm:text-lg"
            >
              Continue to secure payment →
            </button>
          </form>

          {testCheckoutEnabled && (
            <details className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-bold text-slate-600">
                Development test order
              </summary>
              <form action={createCheckoutOrder} className="mt-4 space-y-4">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="marketingCampaign" value={marketingCampaign} />
                <input type="hidden" name="marketingSourceEventId" value={marketingSourceEventId} />
                <input type="hidden" name="recommendedProductId" value={recommendedProductId} />
                <input type="hidden" name="recommendationTripLength" value={recommendationTripLength} />
                <input type="hidden" name="recommendationUsageType" value={recommendationUsageType} />
                <input type="hidden" name="recommendationChoice" value={recommendationChoice} />
                <CheckoutSessionInput />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Development email"
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none focus:border-blue-500"
                />
                <CheckoutLegalConsent idPrefix="local-order" />
                <button
                  type="submit"
                  className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700"
                >
                  Create local test order
                </button>
              </form>
            </details>
          )}
        </div>

        <div className="space-y-6">
          <div className="hidden overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50 lg:block">
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

          <div className="rounded-[2rem] bg-[#10233a] p-7 text-white shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">
              Protected checkout
            </p>
            <h3 className="mt-2 text-xl font-bold">Pay with confidence</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Payment details are handled securely by Stripe. DALO never stores
              your complete card number.
            </p>
            <div className="mt-5 border-t border-white/10 pt-4 text-sm font-semibold text-slate-200">
              USD pricing · Digital delivery · Order support
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
