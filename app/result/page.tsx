import Image from "next/image";
import { getDaloRecommendation } from "../../lib/recommendation";

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

  const { recommendedProduct: plan, upsellProduct: upsell } =
    await getDaloRecommendation({
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
    upsell.id !== plan.id &&
    upsell.sellPrice >= plan.sellPrice;

  const upsellPriceDifference = hasUpsell
    ? upsell.sellPrice - plan.sellPrice
    : 0;

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

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Best match found
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Your perfect eSIM
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-slate-600">
            Based on your destination, trip length and usage style, DALO found
            the best matching product from your database.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-blue-100 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative min-h-[420px]">
            <img
              src={plan.image}
              alt={plan.name}
              className="h-full min-h-[420px] w-full object-cover"
            />

            <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-blue-700 backdrop-blur">
              {getBadge(plan.usageFit)}
            </div>

            <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] bg-white/90 p-5 backdrop-blur">
              <div className="text-sm font-semibold text-slate-500">
                Recommended for
              </div>
              <div className="mt-1 text-xl font-bold text-slate-950">
                {getFitLabel(type)}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
              DALO Recommendation Engine
            </p>

            <h2 className="text-4xl font-bold text-slate-950 md:text-5xl">
              {plan.name}
            </h2>

            <p className="mt-4 text-3xl font-bold text-blue-600">
              {plan.data} / {plan.validityDays} Days
            </p>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {plan.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Destination</div>
                <div className="mt-1 font-bold">{country}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Usage</div>
                <div className="mt-1 font-bold">{plan.usageFit}</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Provider ID</div>
                <div className="mt-1 break-all font-mono text-xs font-bold">
                  {plan.providerProductId}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Delivery</div>
                <div className="mt-1 font-bold">Instant QR Code</div>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap items-end gap-4">
              <div className="text-5xl font-bold text-slate-950">
                {formatPrice(plan.sellPrice)}
              </div>

              {plan.oldPrice && (
                <div className="pb-2 text-xl text-slate-400 line-through">
                  {formatPrice(plan.oldPrice)}
                </div>
              )}

              <div className="mb-1 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                Today only
              </div>
            </div>

            {hasUpsell ? (
              <div className="mt-8 rounded-[2rem] border-2 border-blue-200 bg-blue-50 p-5 shadow-xl shadow-blue-100">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wide text-blue-700">
                      Recommended upgrade
                    </div>

                    <h3 className="mt-1 text-2xl font-bold text-slate-950">
                      Choose your data package
                    </h3>
                  </div>

                  <div className="hidden rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white sm:block">
                    Best value
                  </div>
                </div>

                <div className="grid gap-4">
                  <a
                    href={`/checkout?productId=${plan.id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-slate-500">
                          Recommended plan
                        </div>

                        <div className="mt-1 text-xl font-bold text-slate-950">
                          {plan.name}
                        </div>

                        <div className="mt-1 font-semibold text-blue-600">
                          {plan.data} / {plan.validityDays} Days
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-950">
                          {formatPrice(plan.sellPrice)}
                        </div>

                        <div className="mt-1 text-sm font-semibold text-slate-500">
                          Continue
                        </div>
                      </div>
                    </div>
                  </a>

                  <a
                    href={`/checkout?productId=${upsell.id}`}
                    className="block rounded-2xl border-2 border-blue-600 bg-blue-600 p-5 text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700">
                          Upgrade recommended
                        </div>

                        <div className="mt-3 text-2xl font-bold">
                          {upsell.name}
                        </div>

                        <div className="mt-1 font-semibold text-blue-100">
                          {upsell.data} / {upsell.validityDays} Days
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-blue-100">
                          More data for maps, social media, video calls,
                          hotspot and fewer worries while traveling.
                        </p>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <div className="text-3xl font-bold">
                          {formatPrice(upsell.sellPrice)}
                        </div>

                        {upsellPriceDifference > 0 && (
                          <div className="mt-1 text-sm font-bold text-blue-100">
                            only +{formatPrice(upsellPriceDifference)}
                          </div>
                        )}

                        <div className="mt-4 rounded-xl bg-white px-4 py-3 text-center font-bold text-blue-700">
                          Upgrade →
                        </div>
                      </div>
                    </div>
                  </a>
                </div>

                <p className="mt-4 text-center text-sm text-slate-600">
                  Instant delivery after purchase. No hidden fees.
                </p>
              </div>
            ) : (
              <>
                <a
                  href={`/checkout?productId=${plan.id}`}
                  className="mt-8 block w-full rounded-2xl bg-blue-600 p-5 text-center text-lg font-bold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700"
                >
                  Buy recommended plan →
                </a>

                <p className="mt-4 text-center text-sm text-slate-500">
                  Instant delivery after purchase. No hidden fees.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-7 shadow-lg shadow-blue-50">
            <div className="text-3xl">⚡</div>

            <h3 className="mt-4 font-bold">Instant delivery</h3>

            <p className="mt-2 text-slate-600">
              Receive your eSIM digitally after purchase.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-lg shadow-blue-50">
            <div className="text-3xl">🌍</div>

            <h3 className="mt-4 font-bold">Travel-ready coverage</h3>

            <p className="mt-2 text-slate-600">
              Built for international travel and quick activation.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-7 shadow-lg shadow-blue-50">
            <div className="text-3xl">🔒</div>

            <h3 className="mt-4 font-bold">Secure checkout</h3>

            <p className="mt-2 text-slate-600">
              Fast and secure payment flow prepared for Stripe.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}