import Link from "next/link";
import { getDaloRecommendation } from "../../lib/recommendation";
import TravelTicketCard from "../../components/result/TravelTicketCard";
import ProductViewTracker from "../../components/tracking/ProductViewTracker";
import CheckoutStartedLink from "../../components/tracking/CheckoutStartedLink";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
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
      <main className="dalo-page dalo-result min-h-screen bg-[#F6F8FF] text-slate-900">
        <SiteHeader />

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

        <SiteFooter />
      </main>
    );
  }

  const hasUpsell =
    upsell &&
    upsellOffer &&
    upsell.id !== plan.id &&
    upsell.sellPrice > plan.sellPrice;

  const upsellPriceDifference = hasUpsell ? upsellOffer.priceDifference : 0;
  const recommendedDataGb = Number.parseFloat(plan.data.replace(",", "."));
  const upsellDataIncreasePercent =
    hasUpsell &&
    Number.isFinite(recommendedDataGb) &&
    recommendedDataGb > 0
      ? Math.round(((upsellOffer.extraDataGb ?? 0) / recommendedDataGb) * 100)
      : null;
  const upsellPricePerTripDay = hasUpsell
    ? upsellPriceDifference / Math.max(tripDays, 1)
    : 0;

  const hasRegionalSuggestion =
    regionalUpsell &&
    regionalUpsell.id !== plan.id &&
    regionalUpsell.active;

  const regionalPriceDifference = hasRegionalSuggestion
    ? Number((regionalUpsell.sellPrice - plan.sellPrice).toFixed(2))
    : 0;

  return (
    <main className="dalo-page dalo-result min-h-screen bg-[#F6F8FF] pb-28 text-slate-900 md:pb-0">
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

      <SiteHeader />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-6 pt-3 sm:px-6 sm:pt-5">
        <div className="grid items-stretch gap-4 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
            <div className="h-full overflow-hidden rounded-[2.25rem] border border-white/55 shadow-[0_30px_80px_rgba(7,29,68,0.25)]">
              <div className="relative min-h-[400px]">
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

          <div className="contents">
            <section className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/96 p-4 shadow-[0_20px_50px_rgba(7,29,68,0.14)] backdrop-blur-xl sm:p-5 lg:col-start-2 lg:row-start-1">
              <div className="-mx-7 -mt-7 mb-6 h-1.5 bg-gradient-to-r from-[#2148c0] via-[#1f78dc] to-[#62d4df]" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                    Best match
                  </p>

                  <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">
                    {plan.data} for {country}
                  </h1>

                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Covers your {tripDays}-day trip · Plan valid for {plan.validityDays} days
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-[#2148c0]">
                  <span className="h-2 w-2 rounded-full bg-[#2148c0]" />
                  Best fit
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <div className="text-4xl font-black text-slate-950">
                  {formatPrice(plan.sellPrice)}
                </div>

                {plan.oldPrice && (
                  <div className="pb-2 text-xl text-slate-400 line-through">
                    {formatPrice(plan.oldPrice)}
                  </div>
                )}
              </div>

              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 sm:mt-4 sm:line-clamp-none">
                DALO picked this because your trip needs at least {minimumDataGb}GB.
                This plan gives you a safe buffer for maps, WhatsApp, taxis and travel apps.
              </p>

              <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 text-center text-[10px] font-bold leading-4 text-slate-700 sm:mt-4 sm:text-left sm:text-xs">
                <div className="px-2 py-2.5 sm:px-3 sm:py-3">One-time payment</div>
                <div className="px-2 py-2.5 sm:px-3 sm:py-3">Secured by Stripe</div>
                <div className="px-2 py-2.5 sm:px-3 sm:py-3">No subscription</div>
              </div>

              <CheckoutStartedLink
                href={`/checkout?productId=${plan.id}`}
                productId={plan.id}
                className="mt-auto block rounded-2xl bg-[#2148c0] px-6 py-4 text-center text-lg font-black text-white shadow-[0_16px_35px_rgba(33,72,192,0.28)] transition hover:-translate-y-0.5 hover:bg-[#1738a0] hover:shadow-[0_20px_42px_rgba(33,72,192,0.34)]"
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
                Continue with best match · {formatPrice(plan.sellPrice)} →
              </CheckoutStartedLink>

              <p className="mt-2 text-center text-[11px] font-semibold text-slate-500">
                Secure card payment powered by Stripe
              </p>

              {hasUpsell && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-3 sm:hidden">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wide text-amber-800">
                      Smart upgrade
                    </p>
                    <p className="mt-0.5 text-sm font-black text-slate-950">
                      {upsell.data} · only +{formatPrice(upsellPriceDifference)}
                    </p>
                    {upsellDataIncreasePercent ? (
                      <p className="mt-0.5 text-[11px] font-bold text-slate-600">
                        {upsellDataIncreasePercent}% more data
                      </p>
                    ) : null}
                  </div>

                  <CheckoutStartedLink
                    href={`/checkout?productId=${upsell.id}`}
                    productId={upsell.id}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#10233a] px-3 text-xs font-black text-white shadow-sm transition hover:bg-[#2148c0]"
                    metadata={{
                      source: "result_page_mobile_upsell_cta",
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
                    Upgrade →
                  </CheckoutStartedLink>
                </div>
              )}
            </section>

            {hasUpsell && (
              <section className="dalo-upgrade-card hidden self-start overflow-hidden rounded-[1.75rem] border border-amber-300 bg-gradient-to-br from-[#173a72] via-[#174b8c] to-[#1261a5] p-5 text-white shadow-[0_24px_60px_rgba(23,74,140,0.25)] sm:block sm:p-7 lg:col-start-2 lg:row-start-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="rounded-full bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-wide text-[#174b8c]">
                    Smart upgrade
                  </div>

                  {upsellPriceDifference > 0 && (
                    <div className="rounded-full bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-950 shadow-sm">
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
                      Add {upsellOffer.extraDataGb}GB for only {formatPrice(upsellPriceDifference)} more
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black">
                      <span className="rounded-lg bg-white/10 px-3 py-2 text-blue-100">
                        {plan.data} recommended
                      </span>
                      <span aria-hidden="true" className="text-amber-300">→</span>
                      <span className="rounded-lg bg-amber-300 px-3 py-2 text-slate-950">
                        {upsell.data} upgraded
                      </span>
                      {upsellDataIncreasePercent ? (
                        <span className="rounded-lg border border-white/20 px-3 py-2 text-white">
                          {upsellDataIncreasePercent}% more data
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">
                      {upsellOffer.subtitle}
                    </p>

                    <p className="mt-2 text-xs font-bold text-amber-200">
                      Just {formatPrice(upsellPricePerTripDay)} extra per trip day.
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-xs font-bold uppercase tracking-wide text-blue-200">
                      Total plan price
                    </div>
                    <div className="text-4xl font-black">
                      {formatPrice(upsell.sellPrice)}
                    </div>

                    <CheckoutStartedLink
                      href={`/checkout?productId=${upsell.id}`}
                      productId={upsell.id}
                      className="mt-3 block rounded-2xl bg-amber-300 px-5 py-4 text-center text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(251,191,36,0.24)] transition hover:-translate-y-0.5 hover:bg-amber-200"
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
                      Upgrade to {upsell.data} →
                    </CheckoutStartedLink>
                  </div>
                </div>
              </section>
            )}

            {hasRegionalSuggestion && (
              <section className="dalo-regional-card rounded-[1.75rem] border border-purple-200 bg-white p-5 shadow-xl shadow-purple-100 sm:p-7">
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
                  View regional option →
                </CheckoutStartedLink>
              </section>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <div className="grid overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(30,64,120,0.1)] sm:grid-cols-4 sm:divide-x sm:divide-slate-200">
          <div className="bg-[#0b2750] px-5 py-4 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
              Buy with confidence
            </p>
            <p className="mt-1 text-sm font-bold">Review everything before payment.</p>
          </div>
          <div className="border-t border-slate-200 px-5 py-4 sm:border-t-0">
            <p className="text-sm font-black text-slate-950">Secure Stripe checkout</p>
            <p className="mt-1 text-xs text-slate-500">Card details handled by Stripe.</p>
          </div>
          <div className="border-t border-slate-200 px-5 py-4 sm:border-t-0">
            <p className="text-sm font-black text-slate-950">Digital delivery</p>
            <p className="mt-1 text-xs text-slate-500">Sent after successful payment.</p>
          </div>
          <Link
            href="/support"
            className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm font-black text-[#2148c0] sm:border-t-0"
          >
            Installation support
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <SiteFooter />

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
