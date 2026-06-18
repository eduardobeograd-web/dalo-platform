"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    <main className="min-h-screen bg-[#F6F8FF] px-4 py-5 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-xl flex-col">
        <header className="flex items-center justify-between">
          <Image
            src="/dalo-logo-horizontal.png"
            alt="DALO"
            width={180}
            height={80}
            className="h-12 w-auto"
            priority
          />

          <Link
            href="/#quiz"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm"
          >
            Edit
          </Link>
        </header>

        <section className="flex flex-1 items-center py-8">
          <div className="w-full rounded-[2rem] bg-white p-6 shadow-2xl shadow-blue-100 sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>

            <div className="mt-7 text-center">
              <p className="text-sm font-black uppercase tracking-wide text-blue-600">
                DALO recommendation
              </p>

              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Finding your best eSIM
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                We are matching your trip with the best available data plan and checking if an upgrade is worth it.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
              <div className="rounded-xl bg-white p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Destination
                </p>
                <p className="mt-1 truncate text-sm font-black text-slate-950">
                  {country}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Days
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {days}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Usage
                </p>
                <p className="mt-1 truncate text-sm font-black text-slate-950">
                  {usageLabel}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-sm font-black text-white">
                  ✓
                </span>
                <span className="font-bold text-slate-800">
                  Checking destination coverage
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-blue-50 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-sm font-black text-white">
                  ✓
                </span>
                <span className="font-bold text-slate-800">
                  Estimating your data need
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-cyan-50 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-sm font-black text-white">
                  ✓
                </span>
                <span className="font-bold text-slate-800">
                  Finding the best value upgrade
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-purple-50 p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-sm font-black text-white">
                  ✓
                </span>
                <span className="font-bold text-slate-800">
                  Checking regional travel options
                </span>
              </div>
            </div>

            <p className="mt-6 text-center text-sm font-semibold text-slate-500">
              Your result is almost ready.
            </p>
          </div>
        </section>
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
