"use client";

import { useEffect, useState } from "react";
import { trackClientEvent } from "@/lib/track-client-event";
import SiteFooter from "../components/SiteFooter";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function DaloWordmark({ className = "h-6" }: { className?: string }) {
  return (
    <img
      src="/dalo-logo-horizontal.png"
      alt="DALO"
      className={`inline-block w-auto align-[-0.15em] ${className}`}
    />
  );
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
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200&auto=format&fit=crop",
    Spain:
      "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200&auto=format&fit=crop",
    Italy:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop",
    Japan:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
    Thailand:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1200&auto=format&fit=crop",
    "United States":
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1200&auto=format&fit=crop",
    "United States of America":
      "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1200&auto=format&fit=crop",
    "United Kingdom":
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop",
  };

  return (
    images[destination] ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
  );
}

export default function Home() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DALO",
    url: baseUrl,
    logo: `${baseUrl}/dalo-logo-horizontal.png`,
    description:
      "DALO is a travel eSIM recommendation platform that helps travelers find the right eSIM plan by destination, trip length and data usage.",
  };

  const homepageFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a travel eSIM?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A travel eSIM is a digital mobile data plan that helps you stay connected abroad without changing your physical SIM card.",
        },
      },
      {
        "@type": "Question",
        name: "How does DALO choose an eSIM?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DALO uses your destination, trip length and expected data usage to guide you toward a clearer travel eSIM recommendation.",
        },
      },
      {
        "@type": "Question",
        name: "Can I keep my phone number?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. On most modern phones, your normal SIM can stay active while your travel eSIM is used for mobile data.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use WhatsApp with a travel eSIM?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. A travel eSIM provides mobile data, so apps like WhatsApp, maps, taxi apps and booking tools can work while you travel.",
        },
      },
      {
        "@type": "Question",
        name: "How much data do I need for travel?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Light users may only need a small data plan for maps and messaging, while longer trips, video use or hotspot sharing may require larger plans.",
        },
      },
      {
        "@type": "Question",
        name: "How long does eSIM installation take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Installation usually takes only a few minutes after purchase, depending on your phone, provider and internet connection.",
        },
      },
    ],
  };

  const [country, setCountry] = useState("");
  const [days, setDays] = useState("8-14");
  const [userType, setUserType] = useState("everyday");
  const [destinations, setDestinations] = useState<string[]>([]);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await fetch("/api/destinations");
        const data = await response.json();

        if (Array.isArray(data.destinations)) {
          setDestinations(data.destinations);
        }
      } catch (error) {
        console.error("Failed to load destinations", error);
      }
    }

    loadDestinations();
  }, []);

  const selectedCountryForSearch = country.trim();

  const hasSelectedDestination = selectedCountryForSearch.length > 0;

  const selectedDestinationIsAvailable =
    hasSelectedDestination &&
    (destinations.length === 0 ||
      destinations.includes(selectedCountryForSearch));

  const searchingUrl = selectedDestinationIsAvailable
    ? `/searching?country=${encodeURIComponent(
        selectedCountryForSearch
      )}&days=${encodeURIComponent(days)}&type=${encodeURIComponent(userType)}`
    : "#quiz";

  const availableDestinationCards =
    destinations.length > 0 ? destinations : ["Europe"];

  function handleSearchClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasSelectedDestination || !selectedDestinationIsAvailable) {
      event.preventDefault();
      return;
    }

    trackClientEvent({
      eventType: "search",
      metadata: {
        destination: selectedCountryForSearch,
        days,
        userType,
        source: "homepage_quiz",
      },
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6F8FF] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-40 h-96 w-96 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-[620px] h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

      {/* NAV */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center">
          <img src="/dalo-logo-horizontal.png" alt="DALO" className="h-14 w-auto" />
        </a>

        <div className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#how">How it works</a>
          <a href="#destinations">Destinations</a>
          <a href="#faq">FAQ</a>
        </div>

        <a
          href="/customer/login"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-100 ring-1 ring-blue-100 transition hover:bg-blue-50"
        >
          Customer login
        </a>
      </nav>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-4">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_520px]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-lg shadow-blue-100 ring-1 ring-blue-100">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Travel eSIM Recommendation Engine
            </div>

            <div className="mb-6 max-w-4xl">
              <h1 className="text-[clamp(2.7rem,5vw,4.9rem)] font-black leading-[0.95] tracking-[-0.055em] text-slate-950">
                Find your travel eSIM{" "}
                <span className="relative inline-block italic text-blue-600">
                  in seconds.
                  <span className="absolute -bottom-2 left-1 right-1 -z-10 h-3 -rotate-1 rounded-full bg-blue-200/70" />
                </span>
              </h1>
            </div>

            <p className="mb-7 max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">
              DALO compares available travel eSIM plans for your destination,
              trip length and phone usage — then shows you the best match
              without endless plan tables or confusing gigabyte choices.
            </p>

            <div className="overflow-hidden rounded-[2rem] border border-white bg-white/90 shadow-2xl shadow-blue-100 backdrop-blur">
              <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
                <div className="p-6">
                  <div className="mb-6">
                    <div className="text-sm font-bold uppercase tracking-wide text-blue-600">
                      How DALO works
                    </div>

                    <h4 className="mt-2 text-3xl font-black leading-tight text-slate-950">
                      Your travel eSIM, matched properly.
                    </h4>

                    <p className="mt-3 text-base leading-relaxed text-slate-600">
                      Tell us your trip once. DALO compares available plans and
                      brings the strongest match to the top.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <div className="text-sm font-black text-blue-600">
                        01
                      </div>
                      <div className="mt-1 font-black text-slate-950">
                        Share your trip
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        Destination, duration and data style.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <div className="text-sm font-black text-blue-600">
                        02
                      </div>
                      <div className="mt-1 font-black text-slate-950">
                        DALO compares plans
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        We rank available eSIMs by fit, value and coverage.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
                      <div className="text-sm font-black text-blue-600">
                        03
                      </div>
                      <div className="mt-1 font-black text-slate-950">
                        Choose the best match
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        See the strongest option first.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-slate-950 p-6 text-white">
                  <div className="text-sm font-bold uppercase tracking-wide text-blue-100">
                    Example result
                  </div>

                  <h3 className="mt-3 text-3xl font-black leading-tight tracking-tight">
                    Best match found.
                  </h3>

                  <p className="mt-4 text-base leading-relaxed text-blue-100">
                    A result card like this appears after DALO compares the
                    available plans for your trip.
                  </p>

                  <div className="mt-6 rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-2xl shadow-blue-950/20">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-black uppercase tracking-wide text-blue-600">
                          Recommended plan
                        </div>
                        <div className="mt-1 text-2xl font-black">
                          Europe Smart
                        </div>
                      </div>

                      <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        Best match
                      </div>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-4">
                      <div className="text-5xl font-black tracking-tight text-blue-600">
                        5GB
                      </div>
                      <div className="mt-1 text-sm font-bold text-slate-600">
                        15 Days · Everyday usage
                      </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-slate-500">
                          from
                        </div>
                        <div className="text-4xl font-black text-slate-950">
                          €7.99
                        </div>
                      </div>

                      <div className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-100">
                        Continue →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUIZ */}
          <div
            id="quiz"
            className="rounded-[2rem] border border-white bg-white/95 p-7 shadow-2xl shadow-blue-200 ring-1 ring-blue-100 backdrop-blur md:p-10"
          >
            <div className="mb-5">
              <div className="mb-5 rounded-[1.5rem] bg-blue-600 p-5 text-white shadow-xl shadow-blue-100">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-100">
                    Start here
                  </p>

                  <p className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700">
                    Takes 20 seconds
                  </p>
                </div>

                <h2 className="mt-2 text-2xl font-black leading-tight">
                  Get your eSIM recommendation
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-blue-50">
                  Answer the questions below. DALO compares the available plans
                  and shows your strongest match.
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 ring-1 ring-blue-100">
                ↓ Start by choosing your destination
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between space-y-6">
              <div>
                <label className="mb-2 block font-semibold">
                  🌍 Where are you going?
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition focus-within:border-blue-500 focus-within:bg-white">
                  <div className="text-3xl">
                    {getDestinationFlag(country || "Europe")}
                  </div>

                  <input
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    list="available-destinations"
                    placeholder="Search destination..."
                    className="w-full bg-transparent outline-none"
                  />

                  <datalist id="available-destinations">
                    {destinations.map((destination) => (
                      <option key={destination} value={destination}>
                        {getDestinationFlag(destination)} {destination}
                      </option>
                    ))}
                  </datalist>
                </div>

                {!hasSelectedDestination && (
                  <p className="mt-2 text-sm font-semibold text-red-600">
                    Please choose a destination before continuing.
                  </p>
                )}

                {hasSelectedDestination && !selectedDestinationIsAvailable && (
                  <p className="mt-2 text-sm font-semibold text-red-600">
                    Please choose an available destination from the list.
                  </p>
                )}

                {hasSelectedDestination && selectedDestinationIsAvailable && (
                  <p className="mt-2 text-sm text-slate-500">
                    Destination available. You can continue.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  📅 How long are you staying?
                </label>

                <select
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  <option value="1-3">1–3 Days</option>
                  <option value="4-7">4–7 Days</option>
                  <option value="8-14">8–14 Days</option>
                  <option value="15-30">15–30 Days</option>
                  <option value="30+">30+ Days</option>
                </select>
              </div>

              <div>
                <label className="mb-4 block font-semibold">
                  📱 How do you use your phone?
                </label>

                <div className="grid gap-3">
                  {[
                    {
                      id: "essential",
                      icon: "🗺",
                      title: "Essential",
                      text: "Maps, WhatsApp, Email",
                    },
                    {
                      id: "everyday",
                      icon: "📸",
                      title: "Everyday",
                      text: "Social media, calls, navigation",
                    },
                    {
                      id: "power",
                      icon: "🎥",
                      title: "Power User",
                      text: "Streaming, hotspot, remote work",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUserType(item.id)}
                      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        userType === item.id
                          ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
                          : "border-blue-100 bg-white shadow-sm hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      <div className="text-3xl">{item.icon}</div>

                      <div>
                        <div className="font-bold">
                          {item.title}
                          {item.id === "everyday" && (
                            <span className="ml-2 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                              Most popular
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-slate-500">
                          {item.text}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <a
                href={searchingUrl}
                onClick={handleSearchClick}
                aria-disabled={!selectedDestinationIsAvailable}
                className={`block w-full rounded-2xl p-5 text-center text-lg font-bold shadow-xl transition ${
                  selectedDestinationIsAvailable
                    ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
                }`}
              >
                Show my best eSIM match →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 max-w-3xl">
          <div className="mb-4 inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
            HOW DALO WORKS
          </div>

          <h2 className="text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            DALO estimates the best eSIM based on your real travel behavior.
          </h2>

          <p className="mt-5 text-xl leading-relaxed text-slate-600">
            Instead of showing you a long list of confusing eSIM plans, DALO
            uses your destination, trip length and phone usage to calculate a
            practical recommendation for your trip.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-100 ring-1 ring-blue-50">
              <div className="grid gap-5 md:grid-cols-[160px_1fr]">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=900&auto=format&fit=crop"
                  alt="Travel destination planning"
                  className="h-40 w-full rounded-[1.5rem] object-cover md:h-full"
                />

                <div>
                  <div className="text-sm font-bold uppercase tracking-wide text-blue-600">
                    Step 01
                  </div>

                  <h3 className="mt-2 text-2xl font-bold text-slate-950">
                    Destination and network need
                  </h3>

                  <p className="mt-3 leading-relaxed text-slate-600">
                    A short city trip, a beach holiday and a business trip do
                    not need the same data package. DALO starts with your
                    destination and trip length to understand the basic travel
                    situation.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-100 ring-1 ring-blue-50">
              <div className="grid gap-5 md:grid-cols-[160px_1fr]">
                <img
                  src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=900&auto=format&fit=crop"
                  alt="Phone usage while traveling"
                  className="h-40 w-full rounded-[1.5rem] object-cover md:h-full"
                />

                <div>
                  <div className="text-sm font-bold uppercase tracking-wide text-blue-600">
                    Step 02
                  </div>

                  <h3 className="mt-2 text-2xl font-bold text-slate-950">
                    Phone usage behavior
                  </h3>

                  <p className="mt-3 leading-relaxed text-slate-600">
                    DALO asks how you actually use your phone: maps and
                    messages, everyday social media, or heavier usage like
                    streaming, hotspot and remote work. This helps estimate a
                    realistic data range.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-100 ring-1 ring-blue-50">
              <div className="grid gap-5 md:grid-cols-[160px_1fr]">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=900&auto=format&fit=crop"
                  alt="Recommendation calculation"
                  className="h-40 w-full rounded-[1.5rem] object-cover md:h-full"
                />

                <div>
                  <div className="text-sm font-bold uppercase tracking-wide text-blue-600">
                    Step 03
                  </div>

                  <h3 className="mt-2 text-2xl font-bold text-slate-950">
                    Best match plus safer upgrade
                  </h3>

                  <p className="mt-3 leading-relaxed text-slate-600">
                    DALO recommends the plan that looks like the best balance
                    between price, duration and expected data usage. Because no
                    estimate can guarantee your exact future usage, DALO can
                    also show an optional upsell with more data or longer
                    validity for extra safety.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-7 text-white shadow-2xl shadow-blue-200 lg:sticky lg:top-8">
            <div className="mb-6 rounded-[2rem] bg-white/12 p-5 ring-1 ring-white/10">
              <div className="text-sm font-bold uppercase tracking-wide text-blue-200">
                Example logic
              </div>

              <h3 className="mt-2 text-3xl font-black leading-tight">
                8–14 days in Europe with everyday usage
              </h3>

              <p className="mt-4 leading-relaxed text-slate-300">
                DALO may calculate that a 5GB plan is a strong match for normal
                travel use like maps, WhatsApp calls, social media and browsing.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-white p-5 text-slate-950 shadow-xl shadow-blue-950/10">
                <div className="mb-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Best match
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-2xl font-black">Europe Smart</div>
                    <div className="mt-1 text-sm font-semibold text-slate-500">
                      5GB / 15 Days
                    </div>
                  </div>

                  <div className="text-3xl font-black text-blue-600">
                    €7.99
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-200/60 bg-cyan-400/20 p-5 shadow-lg shadow-blue-950/10">
                <div className="mb-2 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                  Optional safer choice
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-2xl font-black">Europe Plus</div>
                    <div className="mt-1 text-sm font-semibold text-cyan-100">
                      More data for heavier usage
                    </div>
                  </div>

                  <div className="text-3xl font-black">
                    +€4
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-blue-100/80">
              DALO is a recommendation engine, not a guarantee. Your real data
              usage can change depending on video calls, hotspot use, streaming,
              app updates and network behavior.
            </p>
          </div>
        </div>
      </section>

      {/* RESULT PREVIEW */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
              RECOMMENDED FOR YOU
            </div>

            <h2 className="mb-6 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              We don’t show you 50 plans.
              <br />
              We show you the right one.
            </h2>

            <p className="text-xl leading-relaxed text-slate-600">
              DALO turns your trip details into a clear recommendation — so you
              can buy with confidence instead of comparing gigabytes.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-2xl shadow-blue-100 ring-1 ring-blue-50">
            <img
              src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200&auto=format&fit=crop"
              alt="Europe travel"
              className="mb-6 h-56 w-full rounded-[1.5rem] object-cover"
            />

            <div className="mb-4 inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              Best match
            </div>

            <h3 className="text-3xl font-bold text-slate-950">
              Europe Smart
            </h3>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              5GB / 15 Days
            </p>

            <p className="mt-4 text-slate-600">
              Perfect for social media, navigation, WhatsApp calls and everyday
              travel.
            </p>

            <div className="mt-6 flex items-end gap-3">
              <div className="text-4xl font-bold">€7.99</div>
              <div className="pb-1 text-blue-100/80 line-through">€12.99</div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section
        id="destinations"
        className="relative z-10 mx-auto max-w-7xl px-6 py-14"
      >
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-slate-950">
            Available destinations
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-600">
            These destinations are currently available from active products in
            the DALO database.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {availableDestinationCards.map((destination) => (
            <button
              key={destination}
              type="button"
              onClick={() => {
                setCountry(destination);
                document.getElementById("quiz")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="overflow-hidden rounded-[2rem] bg-white text-left shadow-lg shadow-blue-50 ring-1 ring-blue-50 transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <img
                src={getDestinationImage(destination)}
                alt={destination}
                className="h-44 w-full object-cover"
              />

              <div className="p-6">
                <div className="text-4xl">
                  {getDestinationFlag(destination)}
                </div>

                <h3 className="mt-3 text-xl font-bold">{destination}</h3>

                <p className="mt-2 text-slate-600">
                  Find the right eSIM for your trip.
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* TRAVELER TYPES */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-slate-950">
            Travelers don’t think in gigabytes.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-600">
            That’s why DALO asks how you actually use your phone.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
            <div className="text-5xl">🗺</div>

            <h3 className="mt-5 text-2xl font-bold">Essential</h3>

            <p className="mt-3 text-slate-600">
              Maps, WhatsApp messages, email and light browsing.
            </p>
          </div>

          <div className="rounded-[2rem] border-2 border-blue-600 bg-white p-8 shadow-2xl shadow-blue-100">
            <div className="text-5xl">📸</div>

            <h3 className="mt-5 text-2xl font-bold">
              Everyday{" "}
              <span className="rounded-full bg-blue-600 px-3 py-1 text-sm text-white">
                Most popular
              </span>
            </h3>

            <p className="mt-3 text-slate-600">
              Social media, navigation, WhatsApp calls and daily usage.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
            <div className="text-5xl">🎥</div>

            <h3 className="mt-5 text-2xl font-bold">Power User</h3>

            <p className="mt-3 text-slate-600">
              Streaming, hotspot, remote work and video calls.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[2.5rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-200 md:p-14">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr]">
            <div>
              <h2 className="text-4xl font-bold">
                Built for travelers who want clarity.
              </h2>

              <p className="mt-4 text-lg text-slate-300">
                DALO helps travelers stop guessing and start connected.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/10 p-6">
                <div className="text-3xl font-bold">Smart</div>
                <div className="mt-2 text-slate-300">Recommendations</div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6">
                <div className="text-3xl font-bold">Fast</div>
                <div className="mt-2 text-slate-300">Travel decisions</div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6">
                <div className="text-3xl font-bold">Clear</div>
                <div className="mt-2 text-slate-300">Plan matching</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 mx-auto max-w-5xl px-6 py-14">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-slate-950">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
            <h3 className="mb-2 font-bold">What is an eSIM?</h3>

            <p className="text-slate-600">
              An eSIM is a digital SIM card that lets you activate mobile data
              without a physical SIM.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
            <h3 className="mb-2 font-bold">Can I keep my phone number?</h3>

            <p className="text-slate-600">
              Yes. Your physical SIM and your travel eSIM can work together on
              most modern phones.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-blue-50 ring-1 ring-blue-50">
            <h3 className="mb-2 font-bold">How long does installation take?</h3>

            <p className="text-slate-600">
              Usually less than 2 minutes after purchase. You receive your eSIM
              digitally.
            </p>
          </div>
        </div>
      </section>

      {/* HOMEPAGE SEO CONTENT */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 ring-1 ring-blue-50">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
              Travel eSIM basics
            </p>

            <h2 className="text-3xl font-black text-slate-950">
              What is a travel eSIM?
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              A travel eSIM is a digital SIM plan that gives you mobile data
              abroad without changing your physical SIM card. It can help you
              use maps, messaging, taxi apps, bookings and travel tools while
              avoiding expensive roaming surprises.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 ring-1 ring-blue-50">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
              Smarter choice
            </p>

            <h2 className="text-3xl font-black text-slate-950">
              How DALO helps you choose
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              DALO focuses on your destination, trip length and expected data
              usage. Instead of making you compare endless eSIM plans, DALO
              guides you toward a clearer recommendation for your travel needs.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 ring-1 ring-blue-50">
            <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
              Popular destinations
            </p>

            <h2 className="text-3xl font-black text-slate-950">
              Find eSIM plans by country
            </h2>

            <p className="mt-4 leading-8 text-slate-600">
              Explore travel eSIM options for popular destinations like Turkey,
              Thailand, Serbia, Japan, Germany, France, Spain, Italy and the
              United States.
            </p>

            <a
              href="/esim"
              className="mt-6 inline-flex rounded-full bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700"
            >
              Explore eSIM destinations →
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[2.5rem] bg-blue-600 p-10 text-center text-white shadow-2xl shadow-blue-200 md:p-16">
          <h2 className="text-4xl font-bold md:text-5xl">
            Ready to travel smarter?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Find your perfect eSIM recommendation in under 20 seconds.
          </p>

          <a
            href="#quiz"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-bold text-blue-600"
          >
            Find My eSIM →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter />
    </main>
  );
}
