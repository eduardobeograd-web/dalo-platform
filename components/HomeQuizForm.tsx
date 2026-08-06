"use client";

import { useEffect, useRef, useState } from "react";

const durationOptions = [
  { value: "1-3", label: "1-3" },
  { value: "4-7", label: "4-7" },
  { value: "8-11", label: "8-11" },
  { value: "12-15", label: "12-15" },
  { value: "16-21", label: "16-21" },
  { value: "22-30", label: "22-30" },
];

const usageOptions = [
  {
    id: "essential",
    title: "Essential",
    text: "Maps, WhatsApp, Email",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path d="M3.5 5.5 8 3l4 2.5L16.5 3v11L12 16.5 8 14l-4.5 2.5v-11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 5.5v8.5m4-8.5v8.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "everyday",
    title: "Everyday",
    text: "Social media, calls, navigation",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <rect x="5" y="2.75" width="10" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 14.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "power",
    title: "Power User",
    text: "Streaming, hotspot, remote work",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path d="M11.5 2.5 5.75 10h3.75L8.5 17.5l5.75-7.5h-3.75l1-7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HomeQuizForm() {
  const [country, setCountry] = useState("");
  const [days, setDays] = useState("8-11");
  const [userType, setUserType] = useState("everyday");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destinationSuggestionsOpen, setDestinationSuggestionsOpen] = useState(false);
  const destinationsRequested = useRef(false);
  const durationValues = durationOptions.map((option) => option.value);

  async function loadDestinations() {
    if (destinationsRequested.current) return;
    destinationsRequested.current = true;

    try {
      const response = await fetch("/api/destinations");
      const data = await response.json();
      if (Array.isArray(data.destinations)) setDestinations(data.destinations);
    } catch {
      destinationsRequested.current = false;
    }
  }

  useEffect(() => {
    const selectedCountry = new URLSearchParams(window.location.search).get("country");
    if (selectedCountry) setCountry(selectedCountry);
  }, []);

  const normalizedCountry = country.trim().toLocaleLowerCase("en");
  const selectedDestination = destinations.find(
    (destination) => destination.toLocaleLowerCase("en") === normalizedCountry,
  );
  const selectedDestinationIsAvailable = Boolean(selectedDestination);
  const filteredDestinations = destinations
    .filter((destination) =>
      normalizedCountry
        ? destination.toLocaleLowerCase("en").includes(normalizedCountry)
        : true,
    )
    .slice(0, 8);

  return (
    <>
      <form
        id="quiz"
        action="/searching"
        method="get"
        className="relative overflow-hidden rounded-[1.5rem] border-[3px] border-[#2148c0]/55 bg-white/[0.96] p-3 shadow-[0_32px_85px_rgba(33,72,192,0.30),0_8px_24px_rgba(16,35,58,0.12)] ring-2 ring-white/90 backdrop-blur-md sm:rounded-[2rem] sm:p-4 md:p-5 lg:mt-6"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#2148c0_0%,#2148c0_82%,#e98b3a_82%,#e98b3a_100%)] shadow-[0_2px_12px_rgba(33,72,192,0.35)]" />
        <div className="pointer-events-none absolute -left-2 top-1/2 h-4 w-4 rounded-full bg-[#f7fafc]" />
        <div className="pointer-events-none absolute -right-2 top-1/2 h-4 w-4 rounded-full bg-[#f7fafc]" />

        <div className="mb-2 border-b border-dashed border-slate-300/80 pb-2 sm:mb-3 sm:pb-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-[-0.035em] text-[#10233a] sm:text-2xl md:text-[1.7rem]">Your trip. Your eSIM.</h2>
          </div>
        </div>

        <div className="pb-2 sm:pb-3">
          <label htmlFor="quiz-country" className="mb-2 flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.11em] text-slate-800 sm:mb-2.5 sm:text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2148c0] text-[11px] text-white shadow-sm">1</span>
            Where are you going?
          </label>
          <div className="relative">
            <div className="flex min-h-14 items-center gap-3 rounded-xl border-2 border-[#7892dc] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(33,72,192,0.14)] transition focus-within:border-[#2148c0] focus-within:ring-4 focus-within:ring-[#dbe6ff]/80 sm:min-h-16 sm:px-5 sm:py-3.5">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-6 w-6 shrink-0 text-[#d96f2d]">
                <path d="M16 8.5c0 4.25-6 8-6 8s-6-3.75-6-8a6 6 0 1 1 12 0Z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="10" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <input
                id="quiz-country"
                required
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                  setDestinationSuggestionsOpen(true);
                }}
                onFocus={() => {
                  setDestinationSuggestionsOpen(true);
                  void loadDestinations();
                }}
                onBlur={() => {
                  if (selectedDestination) setCountry(selectedDestination);
                  setDestinationSuggestionsOpen(false);
                }}
                placeholder="Type a country or region"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={destinationSuggestionsOpen}
                className="w-full bg-transparent text-base font-bold text-slate-900 outline-none placeholder:font-semibold placeholder:italic placeholder:text-slate-500 sm:text-lg"
              />
              <input type="hidden" name="country" value={selectedDestination || ""} />
            </div>

            {destinationSuggestionsOpen && destinations.length > 0 ? (
              <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                {filteredDestinations.length > 0 ? filteredDestinations.map((destination) => (
                  <button
                    key={destination}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setCountry(destination);
                      setDestinationSuggestionsOpen(false);
                    }}
                    className="block w-full border-b border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 last:border-b-0 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {destination}
                  </button>
                )) : (
                  <p className="px-4 py-3 text-sm text-slate-500">No matching destination. Clear the field to see all available countries.</p>
                )}
              </div>
            ) : null}
          </div>
          {country.trim().length > 0 && !selectedDestinationIsAvailable ? <p className="mt-1.5 text-xs font-semibold text-red-600">Please choose an available destination from the list.</p> : null}
          {country.trim().length > 0 && selectedDestinationIsAvailable ? <p className="mt-1.5 text-xs text-slate-500">Available destination selected.</p> : null}
        </div>

        <fieldset className="border-t border-dashed border-slate-300/80 py-2 sm:py-3">
          <legend className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 sm:mb-2 sm:text-[11px]">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2148c0] text-[10px] text-white">2</span>
            Trip length
          </legend>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-[repeat(6,minmax(0,1fr))_1.2fr]">
            {durationOptions.map((option) => (
              <label key={option.value} className="cursor-pointer rounded-lg border border-[#dbe3f7] bg-[#f8faff] px-1 py-1.5 text-center text-slate-700 transition hover:border-[#8aa3ed] hover:bg-white has-[:checked]:border-[#2148c0] has-[:checked]:bg-[#2148c0] has-[:checked]:text-white">
                <input className="sr-only" type="radio" name="days" value={option.value} checked={days === option.value} onChange={() => setDays(option.value)} />
                <span className="block text-xs font-bold">{option.label}</span>
                <span className="block text-[9px] opacity-70">days</span>
              </label>
            ))}
            <label className="col-span-2 flex min-h-[42px] cursor-pointer flex-col items-center justify-center rounded-lg border border-[#dbe3f7] bg-[#f8faff] px-2 text-slate-700 transition hover:border-[#8aa3ed] has-[:checked]:border-[#2148c0] has-[:checked]:bg-[#eef3ff] has-[:checked]:text-[#2148c0] sm:col-span-1 sm:min-h-[46px]">
              <input className="sr-only" type="radio" name="days" value={days} checked={!durationValues.includes(days)} readOnly />
              <span className="text-[9px] font-bold uppercase tracking-[0.08em]">Exact</span>
              <span className="flex items-baseline justify-center gap-1">
                <input type="number" min="1" max="30" inputMode="numeric" aria-label="Exact trip duration in days" placeholder="#" value={durationValues.includes(days) ? "" : days} onChange={(event) => {
                  if (event.target.value === "") {
                    setDays("8-11");
                    return;
                  }
                  setDays(String(Math.min(30, Math.max(1, Math.ceil(Number(event.target.value))))));
                }} className="w-5 bg-transparent text-center text-xs font-bold text-slate-900 outline-none placeholder:text-slate-400" />
                <span className="text-[9px] text-slate-400">days</span>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset className="border-t border-dashed border-slate-300/80 pt-2 sm:pt-3">
          <legend className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700 sm:mb-2 sm:text-[11px]">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2148c0] text-[10px] text-white">3</span>
            Data usage
          </legend>
          <div className="grid gap-1.5 sm:grid-cols-3 sm:gap-2">
            {usageOptions.map((item) => (
              <label key={item.id} className="relative flex cursor-pointer items-start gap-2 rounded-xl border border-[#dbe3f7] bg-[#f8faff] p-2 text-left transition duration-200 hover:border-[#8aa3ed] hover:bg-white has-[:checked]:border-[#2148c0] has-[:checked]:bg-[#eef3ff] sm:min-h-24 sm:flex-col sm:p-2.5">
                <input className="peer sr-only" type="radio" name="type" value={item.id} checked={userType === item.id} onChange={() => setUserType(item.id)} />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white/70 text-slate-500 peer-checked:border-[#b8c9ff] peer-checked:bg-white peer-checked:text-[#2148c0]" aria-hidden="true">{item.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block pr-3 text-sm font-bold text-slate-900">{item.title}</span>
                  {item.id === "everyday" ? <span className="mt-1 block w-fit rounded-md border border-[#f4c69b] bg-[#fff7ef] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#b45411]">Most popular</span> : null}
                  <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{item.text}</span>
                </span>
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-slate-300 bg-white peer-checked:border-[#2148c0] peer-checked:bg-[#2148c0] peer-checked:ring-2 peer-checked:ring-[#dbe6ff]" aria-hidden="true" />
              </label>
            ))}
          </div>
        </fieldset>

        <button disabled={!selectedDestinationIsAvailable} type="submit" className="mt-2.5 block w-full rounded-xl bg-[#2148c0] px-5 py-3 text-center text-sm font-bold text-white transition duration-200 hover:bg-[#17389b] focus:outline-none focus:ring-4 focus:ring-[#dbe6ff] active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:mt-3 sm:py-3.5">
          {selectedDestinationIsAvailable ? (
            <>Find My eSIM <span aria-hidden="true">-&gt;</span></>
          ) : (
            "Choose a destination to continue"
          )}
        </button>
        <p className="hidden text-center text-[10px] font-medium text-slate-500 sm:block">No contracts <span className="mx-1.5 text-slate-300">|</span> Instant recommendation <span className="mx-1.5 text-slate-300">|</span> Secure checkout</p>
      </form>
    </>
  );
}
