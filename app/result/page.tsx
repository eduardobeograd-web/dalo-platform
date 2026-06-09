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

            <div className="mt-9 flex items-end gap-4">
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

            <a
             href={`/checkout?productId=${plan.id}`}
            className="mt-8 block w-full rounded-2xl bg-blue-600 p-5 text-center text-lg font-bold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700"
            >   
            Buy Now →
            </a>




            <p className="mt-4 text-center text-sm text-slate-500">
              Instant delivery after purchase. No hidden fees.
            </p>
          </div>
        </div>

        {upsell && (
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
            <div className="rounded-[2rem] bg-white p-7 shadow-lg shadow-blue-50">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 text-sm font-bold uppercase tracking-wide text-blue-600">
                    Optional upgrade
                  </div>

                  <h3 className="text-2xl font-bold text-slate-950">
                    Need more freedom?
                  </h3>

                  <p className="mt-2 text-slate-600">
                    Upgrade to {upsell.name} with {upsell.data} for{" "}
                    {formatPrice(upsell.sellPrice)}.
                  </p>
                </div>

                <button className="rounded-xl border border-blue-600 px-6 py-3 font-bold text-blue-600 transition hover:bg-blue-50">
                  Upgrade Plan
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-lg">
              <div className="text-3xl">✓</div>

              <h3 className="mt-4 text-xl font-bold">Why this plan?</h3>

              <p className="mt-2 text-slate-300">
                It matches your selected destination, travel duration and usage
                profile using DALO’s recommendation engine.
              </p>
            </div>
          </div>
        )}

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