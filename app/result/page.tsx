"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";

type Plan = {
  name: string;
  data: string;
  validity: string;
  price: string;
  oldPrice: string;
  description: string;
  badge: string;
  upgrade: string;
  fit: string;
  image: string;
};

function getPlan(country: string, days: string, type: string): Plan {
  const destination = country || "Europe";

  if (days === "30+") {
    return {
      name: `${destination} Long Stay`,
      data: "20GB",
      validity: "60 Days",
      price: "€19.99",
      oldPrice: "€29.99",
      description:
        "Built for longer trips, multi-country travel and travelers who need reliable data for more than a few weeks.",
      badge: "Best for long trips",
      upgrade: "Upgrade to 50GB / 90 Days for longer travel freedom",
      fit: "Long stay travelers",
      image:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1400&auto=format&fit=crop",
    };
  }

  if (type === "essential") {
    return {
      name: `${destination} Essential`,
      data: "1GB",
      validity: "7 Days",
      price: "€3.55",
      oldPrice: "€5.99",
      description:
        "Perfect for maps, WhatsApp messages, email and light browsing during your trip.",
      badge: "Best for light use",
      upgrade: "Upgrade to 3GB for more flexibility",
      fit: "Maps, messaging and email",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
    };
  }

  if (type === "power") {
    return {
      name: `${destination} Unlimited`,
      data: "Unlimited",
      validity: days === "1-3" ? "3 Days" : "15 Days",
      price: "€14.99",
      oldPrice: "€24.99",
      description:
        "Best for streaming, hotspot, video calls and remote work while traveling.",
      badge: "Best for heavy use",
      upgrade: "Upgrade to Unlimited Plus for hotspot priority",
      fit: "Streaming, hotspot and work",
      image:
        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1400&auto=format&fit=crop",
    };
  }

  return {
    name: `${destination} Smart`,
    data: "5GB",
    validity: "15 Days",
    price: "€7.99",
    oldPrice: "€12.99",
    description:
      "Perfect for social media, WhatsApp calls, maps and everyday travel.",
    badge: "Most popular",
    upgrade: "Upgrade to 10GB for only +€3",
    fit: "Social media, calls and navigation",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1400&auto=format&fit=crop",
  };
}

export default function ResultPage() {
  const params = useSearchParams();

  const country = params.get("country") || "Europe";
  const days = params.get("days") || "8-14";
  const type = params.get("type") || "everyday";

  const plan = getPlan(country, days, type);

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      {/* NAV */}
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

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Best match found
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-slate-950 md:text-6xl">
            Your perfect eSIM
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-slate-600">
            Based on your destination, trip length and usage style, this is the
            plan DALO recommends.
          </p>
        </div>

        {/* MAIN RESULT CARD */}
        <div className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-blue-100 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative min-h-[420px]">
            <img
              src={plan.image}
              alt={plan.name}
              className="h-full min-h-[420px] w-full object-cover"
            />

            <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-blue-700 backdrop-blur">
              {plan.badge}
            </div>

            <div className="absolute bottom-6 left-6 right-6 rounded-[2rem] bg-white/90 p-5 backdrop-blur">
              <div className="text-sm font-semibold text-slate-500">
                Recommended for
              </div>
              <div className="mt-1 text-xl font-bold text-slate-950">
                {plan.fit}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
              DALO Recommendation
            </p>

            <h2 className="text-4xl font-bold text-slate-950 md:text-5xl">
              {plan.name}
            </h2>

            <p className="mt-4 text-3xl font-bold text-blue-600">
              {plan.data} / {plan.validity}
            </p>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              {plan.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Delivery</div>
                <div className="mt-1 font-bold">Instant QR Code</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Installation</div>
                <div className="mt-1 font-bold">iOS & Android</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">SIM Card</div>
                <div className="mt-1 font-bold">No physical SIM</div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Checkout</div>
                <div className="mt-1 font-bold">Secure payment</div>
              </div>
            </div>

            <div className="mt-9 flex items-end gap-4">
              <div className="text-5xl font-bold text-slate-950">
                {plan.price}
              </div>
              <div className="pb-2 text-xl text-slate-400 line-through">
                {plan.oldPrice}
              </div>
              <div className="mb-1 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                Today only
              </div>
            </div>

            <button className="mt-8 w-full rounded-2xl bg-blue-600 p-5 text-lg font-bold text-white shadow-xl shadow-blue-200 transition hover:bg-blue-700">
              Buy Now →
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              Instant delivery after purchase. No hidden fees.
            </p>
          </div>
        </div>

        {/* UPSELL */}
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
                <p className="mt-2 text-slate-600">{plan.upgrade}</p>
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
              profile.
            </p>
          </div>
        </div>

        {/* TRUST */}
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