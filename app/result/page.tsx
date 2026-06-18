import Image from "next/image";
import { getDaloRecommendation } from "../../lib/recommendation";
import TravelTicketCard from "../../components/result/TravelTicketCard";
import ProductViewTracker from "../../components/tracking/ProductViewTracker";
import CheckoutStartedLink from "../../components/tracking/CheckoutStartedLink";

function formatPrice(value: number) {
  return `€${value.toFixed(2)}`;
}

function getFitLabel(type: string) {
  if (type === "essential") return "Maps, messaging and email";
  if (type === "power") return "Streaming, hotspot and work";
  if (type === "long_stay") return "Long trips and multi-country travel";
  return "Social media, calls and navigation";
}

function getBadge(usageFit: string) {
  if (usageFit === "essential") return "Best for light use";
  if (usageFit === "power") return "Best for heavy use";
  if (usageFit === "long_stay") return "Best for long trips";
  return "Most popular";
}

function getDestinationFlag(destination: string) {
  const flags: Record<string, string> = {
    Europe: "🇪🇺",
    Spain: "🇪🇸",
    Italy: "🇮🇹",
    Japan: "🇯🇵",
    Thailand: "🇹🇭",
    "United States": "🇺🇸",
    "United States of America": "🇺🇸",
    "United Kingdom": "🇬🇧",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Portugal: "🇵🇹",
    Greece: "🇬🇷",
    Turkey: "🇹🇷",
    Switzerland: "🇨🇭",
    Austria: "🇦🇹",
    Netherlands: "🇳🇱",
    Croatia: "🇭🇷",
    Serbia: "🇷🇸",
    Montenegro: "🇲🇪",
    Albania: "🇦🇱",
    Dubai: "🇦🇪",
    "United Arab Emirates": "🇦🇪",
  };

  return flags[destination] || "🌍";
}

function getDestinationImage(destination: string) {
  const images: Record<string, string> = {
    Europe:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1400&auto=format&fit=crop",
    Spain:
      "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1400&auto=format&fit=crop",
    Italy:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1400&auto=format&fit=crop",
    Japan:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1400&auto=format&fit=crop",
    Thailand:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1400&auto=format&fit=crop",
    "United States":
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1400&auto=format&fit=crop",
    "United States of America":
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1400&auto=format&fit=crop",
    "United Kingdom":
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1400&auto=format&fit=crop",
    Germany:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=1400&auto=format&fit=crop",
    France:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1400&auto=format&fit=crop",
    Portugal:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1400&auto=format&fit=crop",
    Greece:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1400&auto=format&fit=crop",
    Turkey:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1400&auto=format&fit=crop",
    Dubai:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1400&auto=format&fit=crop",
    "United Arab Emirates":
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1400&auto=format&fit=crop",
  };

  return (
    images[destination] ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop"
  );
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
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="/">
            <Image
              src="/dalo-logo-horizontal.png"
              alt="DALO"
              width={180}
              height={80}
              className="h-20 w-auto"
              priority
            />
          </a>

          <a
            href="/#quiz"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            New Search
          </a>
        </nav>

        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="rounded-[2rem] bg-white p-10 shadow-xl shadow-blue-50">
            <h1 className="text-4xl font-bold text-slate-950">
              No product found
            </h1>

            <p className="mt-4 text-slate-600">
              Add active products in the admin area first.
            </p>

            <a
              href="/admin/products/new"
              className="mt-8 inline-block rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white"
            >
              Add Product
            </a>
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

  const upsellPriceDifference = hasUpsell
    ? upsellOffer.priceDifference
    : 0;

  const hasRegionalSuggestion =
    regionalUpsell &&
    regionalUpsell.id !== plan.id &&
    regionalUpsell.active;

  const regionalPriceDifference = hasRegionalSuggestion
    ? Number((regionalUpsell.sellPrice - plan.sellPrice).toFixed(2))
    : 0;

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
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

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/">
          <Image
            src="/dalo-logo-horizontal.png"
            alt="DALO"
            width={260}
            height={80}
            className="h-14 w-auto"
            priority
          />
        </a>

        <div className="flex gap-3">
          <a
            href="/"
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-white"
          >
            ← Home
          </a>

          <a
            href="/#quiz"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            New Search
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-10 pt-4">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-lg shadow-blue-100 ring-1 ring-blue-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white">
              ✓
            </span>
            <span>Your recommendation is ready</span>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-blue-100 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[360px]">
            <TravelTicketCard
              country={country}
              planName={plan.name}
              data={plan.data}
              validityDays={plan.validityDays}
              usageLabel={getFitLabel(type)}
            />
          </div>

          <div className="p-6 md:p-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-600">
              Recommended eSIM
            </p>

            <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">
              Best eSIM for your trip
            </h2>

            <div className="mt-4 inline-flex rounded-2xl bg-blue-50 px-5 py-3 text-xl font-black text-blue-700">
              {plan.data} / {plan.validityDays} Days
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
              <div>
                <div className="text-sm text-slate-500">Destination</div>
                <div className="mt-1 font-bold">{country}</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Trip length</div>
                <div className="mt-1 font-bold">{tripDays} days</div>
              </div>

              <div>
                <div className="text-sm text-slate-500">Estimated need</div>
                <div className="mt-1 font-bold">At least {minimumDataGb}GB</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-sm font-black uppercase tracking-wide text-blue-700">
                Why DALO picked this plan
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Based on your destination, trip length and usage type, DALO
                estimates that you need at least {minimumDataGb}GB. This plan
                gives you a safer travel buffer for maps, WhatsApp, taxis,
                browsing and travel apps.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-4">
              <div className="text-4xl font-bold text-slate-950">
                {formatPrice(plan.sellPrice)}
              </div>

              {plan.oldPrice && (
                <div className="pb-2 text-xl text-slate-400 line-through">
                  {formatPrice(plan.oldPrice)}
                </div>
              )}

              <div className="mb-1 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                Best match
              </div>
            </div>

            <div className="mt-6">
              <CheckoutStartedLink
                href={`/checkout?productId=${plan.id}`}
                productId={plan.id}
                className="block rounded-2xl bg-blue-600 px-6 py-4 text-center text-lg font-bold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700"
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
                Continue with this plan →
              </CheckoutStartedLink>
            </div>

            {hasUpsell && (
              <div className="mt-5 rounded-[2rem] border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-2xl shadow-blue-200">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-blue-700">
                    {upsellOffer.badge}
                  </div>

                  {upsellPriceDifference > 0 && (
                    <div className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-wide text-blue-950">
                      {upsellOffer.badge === "Smart upgrade"
                        ? `Only +${formatPrice(upsellPriceDifference)}`
                        : `+${formatPrice(upsellPriceDifference)}`}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-black">
                      {upsellOffer.title}
                    </h3>

                    <div className="mt-2 text-lg font-bold text-blue-100">
                      Upgrade to {upsell.data} / {upsell.validityDays} Days
                    </div>

                    <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-100">
                      {upsellOffer.subtitle}
                    </p>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <div className="text-3xl font-black">
                      {formatPrice(upsell.sellPrice)}
                    </div>

                    <CheckoutStartedLink
                      href={`/checkout?productId=${upsell.id}`}
                      productId={upsell.id}
                      className="mt-3 inline-block rounded-2xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-lg transition hover:bg-blue-50"
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
                      Choose smart upgrade →
                    </CheckoutStartedLink>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {hasRegionalSuggestion && (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-purple-200 bg-white shadow-xl shadow-purple-100">
            <div className="border-b border-purple-100 bg-purple-50 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex rounded-full bg-purple-600 px-4 py-2 text-xs font-black uppercase tracking-wide text-white">
                    Regional travel option
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-slate-950">
                    Visiting more than {country}?
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700">
                    This is separate from your data upgrade. Choose a regional bundle
                    if your trip includes nearby countries or border crossings.
                  </p>
                </div>

                <div className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-purple-700 shadow-sm">
                  More country coverage
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_260px] lg:items-center">
              <div className="min-w-0">
                <div className="text-lg font-black text-purple-800">
                  {regionalUpsell.region || regionalUpsell.country} eSIM
                </div>

                <div className="mt-2 text-3xl font-black text-slate-950">
                  {regionalUpsell.data} / {regionalUpsell.validityDays} Days
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
                      {regionalUpsell.validityDays} Days
                    </div>
                  </div>
                </div>

                {regionalUpsell.isoCode && (
                  <div className="mt-4 rounded-2xl bg-purple-50 p-4 text-xs font-semibold leading-relaxed text-slate-600">
                    <div className="mb-2 font-black uppercase tracking-wide text-purple-700">
                      Coverage codes
                    </div>
                    <div className="break-words">
                      {regionalUpsell.isoCode}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] bg-purple-600 p-5 text-white">
                <div className="text-sm font-bold text-purple-100">
                  Regional bundle price
                </div>

                <div className="mt-2 text-4xl font-black">
                  {formatPrice(regionalUpsell.sellPrice)}
                </div>

                <div className="mt-2 text-sm font-bold text-purple-100">
                  {regionalPriceDifference > 0
                    ? `+${formatPrice(regionalPriceDifference)} vs country plan`
                    : regionalPriceDifference < 0
                      ? `${formatPrice(Math.abs(regionalPriceDifference))} cheaper than country plan`
                      : "Same price as country plan"}
                </div>

                <CheckoutStartedLink
                  href={`/checkout?productId=${regionalUpsell.id}`}
                  productId={regionalUpsell.id}
                  className="mt-5 block rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-purple-700 shadow-lg transition hover:bg-purple-50"
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
              </div>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}