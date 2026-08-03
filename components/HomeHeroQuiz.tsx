"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "./SiteHeader";

export default function HomeHeroQuiz() {
  const [country, setCountry] = useState("");
  const [days, setDays] = useState("8-11");
  const [userType, setUserType] = useState("everyday");
  const [destinations, setDestinations] = useState<string[]>([]);
  const destinationsRequested = useRef(false);

  async function loadDestinations() {
    if (destinationsRequested.current) return;
    destinationsRequested.current = true;

    try {
      const response = await fetch("/api/destinations");
      const data = await response.json();

      if (Array.isArray(data.destinations)) {
        setDestinations(data.destinations);
      }
    } catch {
      destinationsRequested.current = false;
    }
  }

  const selectedDestinationIsAvailable =
    country.trim().length > 0 &&
    (destinations.length === 0 || destinations.includes(country));

  const searchingUrl = selectedDestinationIsAvailable
    ? `/searching?country=${encodeURIComponent(
        country || "Europe"
      )}&days=${encodeURIComponent(days)}&type=${encodeURIComponent(userType)}`
    : "#quiz";

  useEffect(() => {
    const selectedCountry = new URLSearchParams(window.location.search).get(
      "country"
    );

    if (selectedCountry) {
      setCountry(selectedCountry);
    }
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-[#f7fafc] pb-10 sm:pb-14">
        <div className="pointer-events-none absolute bottom-0 left-[8%] top-0 w-[86%]">
          <Image
            src="/travel/dalo-hero-sicily.webp"
            alt=""
            fill
            preload
            fetchPriority="high"
            quality={55}
            sizes="(max-width: 767px) 86vw, 100vw"
            className="object-cover object-[48%_center] saturate-[1.08]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#f7fafc_0%,rgba(247,250,252,0.94)_22%,rgba(247,250,252,0.16)_49%,rgba(247,250,252,0.46)_74%,#f7fafc_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f7fafc] via-[#f7fafc]/90 to-transparent" />

        <SiteHeader />

        {/* HERO */}
        <div className="relative mx-auto max-w-7xl px-5 pt-1 sm:px-6 sm:pt-3">
          <div className="pointer-events-none absolute left-[43%] top-6 hidden items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 shadow-sm backdrop-blur-md xl:flex">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 text-[#2148c0]"><path d="M16 8.5c0 4.25-6 8-6 8s-6-3.75-6-8a6 6 0 1 1 12 0Z" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="8.5" r="2" fill="currentColor" /></svg>
            Cefalù, Sicily
          </div>
          <div className="grid items-start gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_580px] lg:gap-5">
            <div className="self-center py-2 pr-0 sm:py-5 sm:pr-4 lg:py-8 lg:pr-7">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:mb-4 sm:text-xs">
                The travel eSIM matching engine
              </p>

              <h1 className="max-w-[37rem] text-[2.05rem] font-bold leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.45rem]">
                <span className="block">DALO finds your</span>
                <span className="block text-[#2148c0]">right eSIM.</span>
                <span className="mt-3 hidden text-[0.52em] font-semibold tracking-[-0.01em] text-slate-700 sm:block">
                  Built around your trip.
                </span>
              </h1>

              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-slate-700 sm:mt-5 sm:text-lg">
                Tell us where you&apos;re going and how you use your phone.
                DALO turns that into one clear recommendation.
              </p>

              <div className="mt-5 hidden max-w-xl rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_16px_35px_rgba(15,80,110,0.1)] backdrop-blur-sm sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                  Why DALO is different
                </p>
                <p className="mt-2 max-w-lg text-lg font-bold leading-snug text-slate-950">
                  Other eSIM shops make you compare plans. DALO recommends the one that fits your trip.
                </p>
                <div className="mt-3 grid gap-3 border-t border-slate-200 pt-3 sm:grid-cols-3">
                  <div className="border-b border-slate-200 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
                    <span className="mb-2 block h-2 w-2 rounded-full bg-blue-600" />
                    <p className="text-sm font-bold leading-snug text-slate-900">Matched to your destination</p>
                  </div>
                  <div className="border-b border-slate-200 pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
                    <span className="mb-2 block h-2 w-2 rounded-full bg-cyan-500" />
                    <p className="text-sm font-bold leading-snug text-slate-900">Matched to your usage</p>
                  </div>
                  <div>
                    <span className="mb-2 block h-2 w-2 rounded-full bg-amber-500" />
                    <p className="text-sm font-bold leading-snug text-slate-900">Ready in minutes</p>
                  </div>
                </div>
              </div>
            </div>

          {/* QUIZ */}
          <div
            id="quiz"
            className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/[0.82] p-3 shadow-[0_24px_65px_rgba(37,66,88,0.16)] backdrop-blur-md sm:rounded-[2rem] sm:p-4 md:p-5 lg:mt-10"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#2148c0_0%,#2148c0_85%,#e98b3a_85%,#e98b3a_100%)]" />
            <div className="pointer-events-none absolute -left-2 top-1/2 h-4 w-4 rounded-full bg-[#f7fafc]" />
            <div className="pointer-events-none absolute -right-2 top-1/2 h-4 w-4 rounded-full bg-[#f7fafc]" />
            <div className="mb-2 flex items-end justify-between border-b border-dashed border-slate-300/80 pb-2 sm:mb-3 sm:pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2148c0]">
                  Find your plan
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-[-0.035em] text-[#10233a] sm:text-2xl md:text-[1.7rem]">
                Your trip. Your eSIM.
                </h2>
              </div>
              <div className="hidden items-center gap-2 pb-1 sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#e98b3a]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Matching engine live</p>
              </div>
            </div>

            <div>
              <div className="pb-2 sm:pb-3">
                <label className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 sm:mb-2 sm:text-[11px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2148c0] text-[10px] text-white">1</span>
                  Destination
                </label>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/55 px-3 py-2 transition focus-within:border-[#2148c0] focus-within:bg-white/85 focus-within:ring-4 focus-within:ring-[#dbe6ff]/80 sm:px-3.5 sm:py-2.5">
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0 text-[#2148c0]"><path d="M16 8.5c0 4.25-6 8-6 8s-6-3.75-6-8a6 6 0 1 1 12 0Z" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" /></svg>
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    onFocus={() => void loadDestinations()}
                    list="available-destinations"
                    placeholder="Where are you going?"
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                  />

                  <datalist id="available-destinations">
                    {destinations.map((destination) => (
                      <option key={destination} value={destination}>
                        {destination}
                      </option>
                    ))}
                  </datalist>
                </div>

                {country.trim().length > 0 && !selectedDestinationIsAvailable && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">
                    Please choose an available destination from the list.
                  </p>
                )}

                {country.trim().length === 0 && (
                  <p className="mt-1.5 hidden text-xs text-slate-500 sm:block">
                    Start typing to see destinations with active eSIM products.
                  </p>
                )}

                {country.trim().length > 0 && selectedDestinationIsAvailable && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Only destinations with active eSIM products are shown.
                  </p>
                )}
              </div>

              <div className="border-t border-dashed border-slate-300/80 py-2 sm:py-3">
                <label className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 sm:mb-2 sm:text-[11px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2148c0] text-[10px] text-white">2</span>
                  Trip length
                </label>

                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-[repeat(6,minmax(0,1fr))_1.2fr]">
                  {[
                    { value: "1-3", label: "1–3", detail: "days" },
                    { value: "4-7", label: "4–7", detail: "days" },
                    { value: "8-11", label: "8–11", detail: "days" },
                    { value: "12-15", label: "12–15", detail: "days" },
                    { value: "16-21", label: "16–21", detail: "days" },
                    { value: "22-30", label: "22–30", detail: "days" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDays(option.value)}
                      className={`rounded-lg border px-1 py-1.5 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8c9ff] ${
                        days === option.value
                          ? "border-[#2148c0] bg-[#2148c0] text-white"
                          : "border-white/80 bg-white/50 text-slate-700 hover:border-[#8aa3ed] hover:bg-white/80"
                      }`}
                    >
                      <span className="block text-xs font-bold">{option.label}</span>
                      <span className={`block text-[9px] ${days === option.value ? "text-[#dbe6ff]" : "text-slate-400"}`}>{option.detail}</span>
                    </button>
                  ))}

                  <label
                    className={`col-span-2 flex min-h-[42px] flex-col items-center justify-center rounded-lg border px-2 transition focus-within:ring-2 focus-within:ring-[#b8c9ff] sm:col-span-1 sm:min-h-[46px] ${
                      ![
                        "1-3",
                        "4-7",
                        "8-11",
                        "12-15",
                        "16-21",
                        "22-30",
                      ].includes(days)
                        ? "border-[#2148c0] bg-[#eef3ff] text-[#2148c0]"
                        : "border-slate-200 bg-white/75 text-slate-700 hover:border-[#8aa3ed] hover:bg-white"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-[0.08em]">
                      Exact
                    </span>
                    <span className="flex items-baseline justify-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        inputMode="numeric"
                        aria-label="Exact trip duration in days"
                        placeholder="#"
                        value={
                          [
                            "1-3",
                            "4-7",
                            "8-11",
                            "12-15",
                            "16-21",
                            "22-30",
                          ].includes(days)
                            ? ""
                            : days
                        }
                        onChange={(e) => {
                          if (e.target.value === "") {
                            setDays("8-11");
                            return;
                          }

                          const exactDays = Math.min(
                            30,
                            Math.max(1, Math.ceil(Number(e.target.value)))
                          );
                          setDays(String(exactDays));
                        }}
                        className="w-5 bg-transparent text-center text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <span className="text-[9px] text-slate-400">days</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300/80 pt-2 sm:pt-3">
                <label className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 sm:mb-2 sm:text-[11px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2148c0] text-[10px] text-white">3</span>
                  Data usage
                </label>

                <div className="grid gap-1.5 sm:grid-cols-3 sm:gap-2">
                  {[
                    {
                      id: "essential",
                      title: "Essential",
                      text: "Maps, WhatsApp, Email",
                    },
                    {
                      id: "everyday",
                      title: "Everyday",
                      text: "Social media, calls, navigation",
                    },
                    {
                      id: "power",
                      title: "Power User",
                      text: "Streaming, hotspot, remote work",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUserType(item.id)}
                      className={`relative flex items-start gap-2 rounded-xl border p-2 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#dbe6ff] sm:min-h-24 sm:flex-col sm:p-2.5 ${
                        userType === item.id
                          ? "border-[#2148c0] bg-[#eef3ff]"
                          : "border-white/80 bg-white/50 hover:border-[#8aa3ed] hover:bg-white/80"
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${userType === item.id ? "border-[#b8c9ff] bg-white text-[#2148c0]" : "border-slate-200 bg-white/70 text-slate-500"}`} aria-hidden="true">
                        {item.id === "essential" && (
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M3.5 5.5 8 3l4 2.5L16.5 3v11L12 16.5 8 14l-4.5 2.5v-11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 5.5v8.5m4-8.5v8.5" stroke="currentColor" strokeWidth="1.5" /></svg>
                        )}
                        {item.id === "everyday" && (
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4"><rect x="5" y="2.75" width="10" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M8 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                        )}
                        {item.id === "power" && (
                          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M11.5 2.5 5.75 10h3.75L8.5 17.5l5.75-7.5h-3.75l1-7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="pr-3 text-sm font-bold text-slate-900">
                          {item.title}
                          {item.id === "everyday" && (
                            <span className="mt-1 block w-fit rounded-md border border-[#f4c69b] bg-[#fff7ef] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#b45411]">
                              Most popular
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
                          {item.text}
                        </div>
                      </div>
                      <span
                        className={`absolute right-3 top-3 h-2.5 w-2.5 shrink-0 rounded-full border-2 ${
                          userType === item.id
                            ? "border-[#2148c0] bg-[#2148c0] ring-2 ring-[#dbe6ff]"
                            : "border-slate-300 bg-white"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <a
                href={searchingUrl}
                aria-disabled={!selectedDestinationIsAvailable}
                className={`mt-2.5 block w-full rounded-xl px-5 py-3 text-center text-sm font-bold transition duration-200 focus:outline-none focus:ring-4 focus:ring-[#dbe6ff] active:translate-y-px sm:mt-3 sm:py-3.5 ${
                  selectedDestinationIsAvailable
                    ? "bg-[#2148c0] text-white hover:bg-[#17389b]"
                    : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
                }`}
              >
                Find My eSIM <span aria-hidden="true">→</span>
              </a>
              <p className="hidden text-center text-[10px] font-medium text-slate-500 sm:block">
                No contracts <span className="mx-1.5 text-slate-300">•</span> Instant recommendation <span className="mx-1.5 text-slate-300">•</span> Secure checkout
              </p>
            </div>
          </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(246,248,255,0.98))]" />
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 sm:px-6">
        <div className="grid overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_20px_55px_rgba(30,64,120,0.14)] sm:grid-cols-3 lg:grid-cols-[0.85fr_repeat(3,1fr)]">
          <div className="relative bg-[#2148c0] px-6 py-5 text-white sm:col-span-3 lg:col-span-1">
            <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full border border-white/15" />
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
              Travel with clarity
            </p>
            <p className="mt-1.5 max-w-xs text-lg font-bold leading-snug">
              From recommendation to connection.
            </p>
          </div>

          <div className="flex items-center gap-4 border-b border-slate-200 px-5 py-4 sm:border-b-0 sm:border-r">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-[#eef3ff] text-[#2148c0]">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="m4 10 3.5 3.5L16 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div>
              <p className="text-sm font-bold text-slate-950">Clear before checkout</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">Review your matched plan first.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-b border-slate-200 px-5 py-4 sm:border-b-0 sm:border-r">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-[#eef3ff] text-[#2148c0]">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M3 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M14.5 4H16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </span>
            <div>
              <p className="text-sm font-bold text-slate-950">Delivered digitally</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">No shop or physical SIM required.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-[#eef3ff] text-[#2148c0]">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><rect x="5" y="2.5" width="10" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M8 14.5h4M8 6.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </span>
            <div>
              <p className="text-sm font-bold text-slate-950">Guided setup</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">Installation instructions included.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
