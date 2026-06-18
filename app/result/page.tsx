import Image from "next/image";
import Link from "next/link";
import { getDaloRecommendation } from "../../lib/recommendation";
import TravelTicketCard from "../../components/result/TravelTicketCard";
import ProductViewTracker from "../../components/tracking/ProductViewTracker";
import CheckoutStartedLink from "../../components/tracking/CheckoutStartedLink";

function formatPrice(value: number) {
  return `€${value.toFixed(2)}`;
}

function getFitLabel(type: string) {
  if (type === "essential") return "Maps and messages";
  if (type === "power") return "Streaming and hotspot";
  if (type === "long_stay") return "Long stay";
  return "Everyday use";
}

function getUsageLabel(type: string) {
  if (type === "essential") return "Light use";
  if (type === "power") return "Heavy use";
  if (type === "long_stay") return "Long stay";
  return "Everyday use";
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    country?: string;
    days?: string;
    type?: string;
  }>;
}) {
  const params = await searchParams;

  const country = params.country || "Europe";
  const days = params.days || "8-14";
  const type = params.type || "everyday";

  const {
    recommendedProduct: plan,
    upsellProduct: upsell,
    upsellOffer,
    regionalUpsell,
    minimumDataGb,
    tripDays,
  } = await getDaloRecommendation({
    country,
    days,
    type,
  });

  if (!plan) {
    return (
      <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/">
            <Image
              src="/dalo-logo-horizontal.png"
              alt="DALO"
              width={180}
              height={80}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <Link
            href="/#quiz"
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            New Search
          </Link>
        </nav>

        <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
            <h1 className="text-3xl font-bold text-slate-950">
              No product found
            </h1>

            <p className="mt-4 text-slate-600">
              Add active products in the admin area first.
            </p>

            <Link
              href="/admin/products/new"
              className="mt-8 inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white"
            >
              Add Product
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const hasUpsell =
    upsell &&
    upsellOffer &&
    upsell.id !== plan.id &&
    upsell.sellPrice > plan.sellPrice;

  const upsellPriceDifference = hasUpsell ? upsellOffer.priceDifference : 0;

  const hasRegionalSuggestion =
    regionalUpsell &&
    regionalUpsell.id !== plan.id &&
    regionalUpsell.active;

  const regionalPriceDifference = hasRegionalSuggestion
    ? Number((regionalUpsell.sellPrice - plan.sellPrice).toFixed(2))
    : 0;

  return (
    <main className="min-h-screen bg-[#F6F8FF] pb-28 text-slate-900 md:pb-0">
      <ProductViewTracker
        productId={plan.id}
        metadata={{
          source: "result_page",
          destination: country,
          days,
          userType: type,
          productName: plan.name,
          data: plan.data,
          validityDays: plan.validityDays,
          price: plan.sellPrice,
          provider: plan.provider,
          hasUpsell: Boolean(hasUpsell),
          upsellProductId: hasUpsell ? upsell.id : null,
          upsellOfferType: hasUpsell ? upsellOffer.type : null,
          upsellPriceDifference: hasUpsell ? upsellOffer.priceDifference : null,
          upsellExtraDataGb: hasUpsell ? upsellOffer.extraDataGb : null,
        }}
      />

      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Image
            src="/dalo-logo-horizontal.png"
            alt="DALO"
            width={240}
            height={80}
            className="h-11 w-auto sm:h-14"
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/#quiz"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Edit trip
          </Link>

          <Link
            href="/"
            className="hidden rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 sm:inline-flex"
          >
            New Search
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-6">
        <div className="mb-4 rounded-[1.5rem] bg-white p-4 shadow-lg shadow-blue-50 sm:mb-6 sm:p-5">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            Your result
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-700">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {country}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {tripDays} days
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {getUsageLabel(type)}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              Need: {minimumDataGb}GB+
            </span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-blue-100">
              <div className="relative min-h-[520px]">
                <TravelTicketCard
                  country={country}
                  planName={plan.name}
                  data={plan.data}
                  validityDays={plan.validityDays}
                  usageLabel={getFitLabel(type)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <section className="rounded-[2rem] bg-white p-5 shadow-2xl shadow-blue-100 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                    Best match
                  </p>

                  <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                    {plan.data} for {country}
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Valid for {plan.validityDays} days · {getFitLabel(type)}
                  </p>
                </div>

                <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  Recommended
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <div className="text-5xl font-black text-slate-950">
                  {formatPrice(plan.sellPrice)}
                </div>

                {plan.oldPrice && (
                  <div className="pb-2 text-xl text-slate-400 line-through">
                    {formatPrice(plan.oldPrice)}
                  </div>
                )}
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                  Instant delivery
                </div>

                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                  eSIM ready
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                  No physical SIM
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                DALO picked this because your trip needs at least {minimumDataGb}GB.
                This plan gives you a safe buffer for maps, WhatsApp, taxis and travel apps.
              </p>

              <CheckoutStartedLink
                href={`/checkout?productId=${plan.id}`}
                productId={plan.id}
                className="mt-5 block rounded-2xl bg-blue-600 px-6 py-4 text-center text-lg font-black text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700"
                metadata={{
                  source: "result_page_main_cta",
                  destination: country,
                  days,
                  userType: type,
                  productName: plan.name,
                  data: plan.data,
                  validityDays: plan.validityDays,
                  price: plan.sellPrice,
                  provider: plan.provider,
                }}
              >
                Continue with best match →
              </CheckoutStartedLink>
            </section>

            {hasUpsell && (
              <section className="rounded-[2rem] border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-blue-900 p-5 text-white shadow-2xl shadow-blue-200 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-blue-700">
                    Better value upgrade
                  </div>

                  {upsellPriceDifference > 0 && (
                    <div className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-wide text-blue-950">
                      Only +{formatPrice(upsellPriceDifference)}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <h2 className="text-3xl font-black leading-tight">
                      Get {upsell.data} instead
                    </h2>

                    <p className="mt-2 text-base font-bold text-blue-100">
                      {upsell.validityDays} days · more room for hotspot, video and travel apps
                    </p>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                      {upsellOffer.subtitle}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-4xl font-black">
                      {formatPrice(upsell.sellPrice)}
                    </div>

                    <CheckoutStartedLink
                      href={`/checkout?productId=${upsell.id}`}
                      productId={upsell.id}
                      className="mt-3 block rounded-2xl bg-white px-5 py-4 text-center text-sm font-black text-blue-700 shadow-lg transition hover:bg-blue-50"
                      metadata={{
                        source: "result_page_upsell_cta",
                        destination: country,
                        days,
                        userType: type,
                        productName: upsell.name,
                        data: upsell.data,
                        validityDays: upsell.validityDays,
                        price: upsell.sellPrice,
                        provider: upsell.provider,
                        originalProductId: plan.id,
                        originalProductName: plan.name,
                        priceDifference: upsellPriceDifference,
                        upsellOfferType: upsellOffer.type,
                        upsellExtraDataGb: upsellOffer.extraDataGb,
                        upsellTitle: upsellOffer.title,
                      }}
                    >
                      Choose upgrade →
                    </CheckoutStartedLink>
                  </div>
                </div>
              </section>
            )}

            {hasRegionalSuggestion && (
              <section className="rounded-[2rem] border border-purple-200 bg-white p-5 shadow-xl shadow-purple-100 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex rounded-full bg-purple-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                      Regional option
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-slate-950">
                      Visiting more than {country}?
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Choose this if your trip includes nearby countries or border crossings.
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-slate-950">
                      {formatPrice(regionalUpsell.sellPrice)}
                    </div>

                    <div className="mt-1 text-xs font-bold text-purple-700">
                      {regionalPriceDifference > 0
                        ? `+${formatPrice(regionalPriceDifference)} vs best match`
                        : regionalPriceDifference < 0
                          ? `${formatPrice(Math.abs(regionalPriceDifference))} cheaper`
                          : "Same price"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Region
                    </div>
                    <div className="mt-1 font-black text-slate-900">
                      {regionalUpsell.region || regionalUpsell.country}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Data
                    </div>
                    <div className="mt-1 font-black text-slate-900">
                      {regionalUpsell.data}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Validity
                    </div>
                    <div className="mt-1 font-black text-slate-900">
                      {regionalUpsell.validityDays} days
                    </div>
                  </div>
                </div>

                <CheckoutStartedLink
                  href={`/checkout?productId=${regionalUpsell.id}`}
                  productId={regionalUpsell.id}
                  className="mt-5 block rounded-2xl bg-purple-600 px-5 py-4 text-center text-sm font-black text-white shadow-lg shadow-purple-200 transition hover:bg-purple-700"
                  metadata={{
                    source: "result_page_regional_option_cta",
                    destination: country,
                    days,
                    userType: type,
                    productName: regionalUpsell.name,
                    data: regionalUpsell.data,
                    validityDays: regionalUpsell.validityDays,
                    price: regionalUpsell.sellPrice,
                    provider: regionalUpsell.provider,
                    originalProductId: plan.id,
                    originalProductName: plan.name,
                    regionalCoverage: regionalUpsell.region,
                    priceDifference: regionalPriceDifference,
                  }}
                >
                  Choose regional bundle →
                </CheckoutStartedLink>
              </section>
            )}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-500">
              Best match · {plan.data}
            </p>
            <p className="text-xl font-black text-slate-950">
              {formatPrice(plan.sellPrice)}
            </p>
          </div>

          <CheckoutStartedLink
            href={`/checkout?productId=${plan.id}`}
            productId={plan.id}
            className="shrink-0 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-200"
            metadata={{
              source: "result_page_mobile_sticky_cta",
              destination: country,
              days,
              userType: type,
              productName: plan.name,
              data: plan.data,
              validityDays: plan.validityDays,
              price: plan.sellPrice,
              provider: plan.provider,
            }}
          >
            Continue →
          </CheckoutStartedLink>
        </div>
      </div>
    </main>
  );
}
