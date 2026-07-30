"use client";

import Image from "next/image";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

function getUsageLabel(type: string) {
  if (type === "essential") return "Light use";
  if (type === "power") return "Heavy use";
  if (type === "long_stay") return "Long stay";
  return "Everyday use";
}

function SearchingContent() {
  const router = useRouter();
  const params = useSearchParams();

  const country = params.get("country") || "Europe";
  const days = params.get("days") || "8-14";
  const type = params.get("type") || "everyday";
  const usageLabel = getUsageLabel(type);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/result?${params.toString()}`);
    }, 1800);

    return () => clearTimeout(timer);
  }, [router, params]);

  return (
    <main className="dalo-page relative min-h-screen overflow-hidden bg-[#f7fafc] text-slate-900">
      <Image
        src="/travel/dalo-hero-sicily.webp"
        alt=""
        fill
        preload
        quality={70}
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(247,250,252,0.94),rgba(235,244,249,0.68))]" />

      <SiteHeader mode="checkout" />
      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl flex-col px-4 sm:px-6">
        <section className="flex flex-1 items-center py-5 sm:py-8">
          <div className="w-full overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/[0.88] shadow-[0_24px_65px_rgba(37,66,88,0.16)] backdrop-blur-md">
            <div className="h-1 bg-[linear-gradient(90deg,#2148c0_0%,#2148c0_85%,#e98b3a_85%,#e98b3a_100%)]" />

            <div className="p-5 sm:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2148c0]">
                    DALO matching engine
                  </p>
                  <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#10233a] sm:text-4xl">
                    Building your travel match.
                  </h1>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
                    We&apos;re checking destination, trip length and usage against
                    the available plans.
                  </p>
                </div>

                <div className="relative mt-1 hidden h-12 w-12 shrink-0 sm:block">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#2148c0]" />
                  <div className="absolute inset-[11px] rounded-full bg-[#2148c0]" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white/70 p-2 text-center">
                <div className="rounded-xl bg-[#eef3ff] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Destination
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-950">
                    {country}
                  </p>
                </div>
                <div className="rounded-xl bg-[#eef3ff] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Trip
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-950">{days} days</p>
                </div>
                <div className="rounded-xl bg-[#eef3ff] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    Usage
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-950">
                    {usageLabel}
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/75">
                {[
                  ["01", "Destination coverage", "Available products located"],
                  ["02", "Data requirement", "Usage profile calculated"],
                  ["03", "Best-value match", "Recommendation being prepared"],
                ].map(([step, title, detail], index) => (
                  <div
                    key={title}
                    className="flex items-center gap-4 border-b border-slate-200 px-4 py-3.5 last:border-b-0"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        index < 2
                          ? "bg-[#2148c0] text-white"
                          : "border border-[#8aa3ed] bg-[#eef3ff] text-[#2148c0]"
                      }`}
                    >
                      {index < 2 ? (
                        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                          <path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        step
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-950">{title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
                    </div>
                    {index === 2 && (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#e98b3a]" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[82%] animate-pulse rounded-full bg-[#2148c0]" />
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-slate-500">
                Your recommendation is almost ready.
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="relative">
        <SiteFooter />
      </div>
    </main>
  );
}

export default function SearchingPage() {
  return (
    <Suspense fallback={null}>
      <SearchingContent />
    </Suspense>
  );
}
