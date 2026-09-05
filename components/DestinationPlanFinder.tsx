"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const durationOptions = ["1-3", "4-7", "8-11", "12-15", "16-21", "22-30"];

const usageOptions = [
  {
    id: "essential",
    title: "Essential",
    detail: "Maps, messages and email",
  },
  {
    id: "everyday",
    title: "Everyday",
    detail: "Social media, calls and navigation",
  },
  {
    id: "power",
    title: "Power user",
    detail: "Streaming, hotspot and remote work",
  },
] as const;

type RecommendedProduct = {
  id: string;
  providerProductId: string;
  name: string;
  data: string;
  validityDays: number;
  sellPrice: number;
};

type RecommendationResponse = {
  recommendation?: {
    bestMatch?: RecommendedProduct | null;
    minimumDataGb?: number;
  } | null;
};

function checkoutHref({
  product,
  days,
  usage,
}: {
  product: RecommendedProduct;
  days: string;
  usage: string;
}) {
  const params = new URLSearchParams({
    productId: product.id,
    providerProductId: product.providerProductId,
    recommendedProductId: product.id,
    recommendationTripLength: days,
    recommendationUsageType: usage,
    recommendationChoice: "best_match",
  });

  return `/checkout?${params.toString()}`;
}

export default function DestinationPlanFinder({
  destination,
}: {
  destination: string;
}) {
  const [days, setDays] = useState("8-11");
  const [usage, setUsage] = useState<(typeof usageOptions)[number]["id"]>(
    "everyday",
  );
  const [recommendation, setRecommendation] =
    useState<RecommendedProduct | null>(null);
  const [minimumDataGb, setMinimumDataGb] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateDays(value: string) {
    setDays(value);
    setRecommendation(null);
    setError("");
  }

  function updateUsage(value: (typeof usageOptions)[number]["id"]) {
    setUsage(value);
    setRecommendation(null);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: destination, days, type: usage }),
      });

      if (!response.ok) throw new Error("Recommendation request failed");

      const data = (await response.json()) as RecommendationResponse;
      const bestMatch = data.recommendation?.bestMatch;

      if (!bestMatch?.id || !bestMatch.providerProductId) {
        setRecommendation(null);
        setError("No matching plan is available for these answers yet.");
        return;
      }

      setRecommendation(bestMatch);
      setMinimumDataGb(data.recommendation?.minimumDataGb ?? null);
    } catch {
      setRecommendation(null);
      setError("We could not build your recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const resultParams = new URLSearchParams({
    country: destination,
    days,
    type: usage,
  });

  return (
    <section
      id="plan-finder"
      aria-labelledby="destination-plan-finder-title"
      className="mt-6 overflow-hidden rounded-[2rem] border border-blue-200 bg-white shadow-[0_20px_55px_rgba(33,72,192,0.13)] sm:mt-10"
    >
      <div className="h-1.5 bg-[linear-gradient(90deg,#2148c0_0%,#2148c0_82%,#e98b3a_82%,#e98b3a_100%)]" />
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
            Quick plan finder
          </p>
          <h2
            id="destination-plan-finder-title"
            className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl"
          >
            Find your {destination} match
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            Your destination is set. Tell us how long you are travelling and how
            you use mobile data.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-800">
            <span aria-hidden="true">📍</span>
            {destination}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <fieldset>
            <legend className="text-sm font-black text-slate-950">
              1. How long is your trip?
            </legend>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {durationOptions.map((option) => (
                <label
                  key={option}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-center transition hover:border-blue-300 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-700 has-[:checked]:text-white"
                >
                  <input
                    type="radio"
                    name="destinationFinderDays"
                    value={option}
                    checked={days === option}
                    onChange={() => updateDays(option)}
                    className="sr-only"
                  />
                  <span className="block text-sm font-black">{option}</span>
                  <span className="block text-[10px] font-semibold opacity-70">days</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-black text-slate-950">
              2. How will you use your data?
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {usageOptions.map((option) => (
                <label
                  key={option.id}
                  className="relative cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-300 has-[:checked]:border-blue-700 has-[:checked]:bg-blue-50"
                >
                  <input
                    type="radio"
                    name="destinationFinderUsage"
                    value={option.id}
                    checked={usage === option.id}
                    onChange={() => updateUsage(option.id)}
                    className="peer sr-only"
                  />
                  <span className="block pr-5 text-sm font-black text-slate-950">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {option.detail}
                  </span>
                  <span className="absolute right-3 top-3 h-3 w-3 rounded-full border-2 border-slate-300 bg-white peer-checked:border-blue-700 peer-checked:bg-blue-700" />
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2148c0] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-[#17389b] disabled:cursor-wait disabled:bg-slate-400"
          >
            {loading ? "Finding your match…" : "Show my best match →"}
          </button>

          <div aria-live="polite">
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            {recommendation ? (
              <div className="rounded-2xl border-2 border-blue-700 bg-[linear-gradient(135deg,#eef3ff,#ffffff)] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">
                      Your best match
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                      {recommendation.data} · {recommendation.validityDays} days
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {minimumDataGb !== null
                        ? `Matched to an estimated need of at least ${minimumDataGb} GB.`
                        : recommendation.name}
                    </p>
                  </div>
                  <p className="text-3xl font-black text-slate-950">
                    ${recommendation.sellPrice.toFixed(2)}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={checkoutHref({ product: recommendation, days, usage })}
                    className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-black text-white transition hover:bg-blue-800"
                  >
                    Choose this plan →
                  </Link>
                  <Link
                    href={`/result?${resultParams.toString()}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
                  >
                    See full comparison
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
