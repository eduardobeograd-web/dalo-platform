"use client";

import { useEffect, useState } from "react";

function getDestinationFlag(destination: string) {
  const flags: Record<string, string> = {
    Europe: "🇪🇺",
    Spain: "🇪🇸",
    Italy: "🇮🇹",
    Japan: "🇯🇵",
    Thailand: "🇹🇭",
    "United States": "🇺🇸",
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

export default function Home() {
  const [country, setCountry] = useState("");
  const [days, setDays] = useState("8-14");
  const [userType, setUserType] = useState("everyday");
  const [destinations, setDestinations] = useState<string[]>([]);

  useEffect(() => {
    async function loadDestinations() {
      const response = await fetch("/api/destinations");
      const data = await response.json();

      if (Array.isArray(data.destinations)) {
        setDestinations(data.destinations);

        if (data.destinations.length > 0) {
          setCountry(data.destinations[0]);
        }
      }
    }

    loadDestinations();
  }, []);

  const selectedDestinationIsAvailable =
    destinations.length === 0 || destinations.includes(country);

  const searchingUrl = selectedDestinationIsAvailable
    ? `/searching?country=${encodeURIComponent(
        country || "Europe"
      )}&days=${encodeURIComponent(days)}&type=${encodeURIComponent(userType)}`
    : "#quiz";

  const destinationsPreview = [
    {
      name: "Spain",
      flag: "🇪🇸",
      image:
        "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Italy",
      flag: "🇮🇹",
      image:
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Japan",
      flag: "🇯🇵",
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "Thailand",
      flag: "🇹🇭",
      image:
        "https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "United States",
      flag: "🇺🇸",
      image:
        "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?q=80&w=1200&auto=format&fit=crop",
    },
    {
      name: "United Kingdom",
      flag: "🇬🇧",
      image:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      {/* NAV */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <a href="/" className="flex items-center">
          <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
        </a>

        <div className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#how">How it works</a>
          <a href="#destinations">Destinations</a>
          <a href="#faq">FAQ</a>
        </div>

        <a
          href="#quiz"
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
        >
          Find my eSIM
        </a>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_540px]">
          <div>
            <div className="mb-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
              Travel eSIM Recommendation Engine
            </div>

            <h1 className="mb-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-slate-950 md:text-7xl">
              Smarter travel starts here.
            </h1>

            <p className="mb-8 max-w-2xl text-xl leading-relaxed text-slate-600">
              Find the perfect eSIM for your trip in under 20 seconds. No
              comparing plans. No guessing. Just the right recommendation.
            </p>

            <div className="mb-10 grid max-w-xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-2xl">⚡</div>
                <p className="mt-2 text-sm font-semibold">Instant delivery</p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-2xl">🌍</div>
                <p className="mt-2 text-sm font-semibold">
                  Available destinations
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-2xl">🎯</div>
                <p className="mt-2 text-sm font-semibold">Smart match</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-blue-100">
              <img
                src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1600&auto=format&fit=crop"
                alt="Travel destination"
                className="h-72 w-full object-cover"
              />
            </div>
          </div>

          {/* QUIZ */}
          <div
            id="quiz"
            className="rounded-[2rem] border border-white bg-white/95 p-6 shadow-2xl shadow-blue-100 backdrop-blur md:p-8"
          >
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                FIND YOUR PLAN
              </p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                Your trip. Your eSIM.
              </h2>
              <p className="mt-2 text-slate-500">
                Answer 3 quick questions and we’ll recommend the best plan.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-semibold">
                  🌍 Where are you going?
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition focus-within:border-blue-500 focus-within:bg-white">
                  <div className="text-3xl">{getDestinationFlag(country)}</div>

                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
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

                {!selectedDestinationIsAvailable && (
                  <p className="mt-2 text-sm font-semibold text-red-600">
                    Please choose an available destination from the list.
                  </p>
                )}

                {selectedDestinationIsAvailable && (
                  <p className="mt-2 text-sm text-slate-500">
                    Only destinations with active eSIM products are shown.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  📅 How long are you staying?
                </label>

                <select
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
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
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-400"
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
                aria-disabled={!selectedDestinationIsAvailable}
                className={`block w-full rounded-2xl p-5 text-center text-lg font-bold shadow-xl transition ${
                  selectedDestinationIsAvailable
                    ? "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
                }`}
              >
                Find My eSIM →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-slate-950">
            How DALO works
          </h2>
          <p className="mt-4 text-xl text-slate-600">
            Three questions. One perfect eSIM recommendation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              🌍
            </div>
            <h3 className="mb-3 text-xl font-bold">Choose destination</h3>
            <p className="text-slate-600">
              Search and select one of the destinations currently available in
              the DALO product database.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              📱
            </div>
            <h3 className="mb-3 text-xl font-bold">Describe usage</h3>
            <p className="text-slate-600">
              Essential, Everyday or Power User — no technical knowledge needed.
            </p>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              🎯
            </div>
            <h3 className="mb-3 text-xl font-bold">Get your match</h3>
            <p className="text-slate-600">
              DALO recommends the plan that best fits your trip.
            </p>
          </div>
        </div>
      </section>

      {/* RESULT PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-24">
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

          <div className="rounded-[2rem] bg-white p-6 shadow-2xl shadow-blue-100">
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
              <div className="pb-1 text-slate-400 line-through">€12.99</div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-slate-950">
            Popular destinations
          </h2>
          <p className="mt-4 text-xl text-slate-600">
            Start with the places travelers search for most.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {destinationsPreview.map((destination) => (
            <div
              key={destination.name}
              className="overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-blue-50 transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="h-44 w-full object-cover"
              />
              <div className="p-6">
                <div className="text-4xl">{destination.flag}</div>
                <h3 className="mt-3 text-xl font-bold">{destination.name}</h3>
                <p className="mt-2 text-slate-600">
                  Find the right eSIM for your trip.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRAVELER TYPES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-slate-950">
            Travelers don’t think in gigabytes.
          </h2>
          <p className="mt-4 text-xl text-slate-600">
            That’s why DALO asks how you actually use your phone.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50">
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

          <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50">
            <div className="text-5xl">🎥</div>
            <h3 className="mt-5 text-2xl font-bold">Power User</h3>
            <p className="mt-3 text-slate-600">
              Streaming, hotspot, remote work and video calls.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[2.5rem] bg-slate-950 p-10 text-white md:p-14">
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
                <div className="text-3xl font-bold">Instant</div>
                <div className="mt-2 text-slate-300">Delivery</div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6">
                <div className="text-3xl font-bold">24/7</div>
                <div className="mt-2 text-slate-300">Support-ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-slate-950">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-blue-50">
            <h3 className="mb-2 font-bold">What is an eSIM?</h3>
            <p className="text-slate-600">
              An eSIM is a digital SIM card that lets you activate mobile data
              without a physical SIM.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-blue-50">
            <h3 className="mb-2 font-bold">Can I keep my phone number?</h3>
            <p className="text-slate-600">
              Yes. Your physical SIM and your travel eSIM can work together on
              most modern phones.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-blue-50">
            <h3 className="mb-2 font-bold">How long does installation take?</h3>
            <p className="text-slate-600">
              Usually less than 2 minutes after purchase. You receive your eSIM
              digitally.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
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
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
              <p className="mt-4 text-slate-600">
                The travel eSIM recommendation engine.
              </p>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Destinations</h4>
              <div className="space-y-2 text-slate-600">
                <div>Spain</div>
                <div>Europe</div>
                <div>Italy</div>
                <div>Japan</div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Support</h4>
              <div className="space-y-2 text-slate-600">
                <div>FAQ</div>
                <div>Contact</div>
                <div>Help Center</div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-bold">Company</h4>
              <div className="space-y-2 text-slate-600">
                <div>About</div>
                <div>Privacy</div>
                <div>Terms</div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t pt-6 text-sm text-slate-500">
            © 2026 DALO. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}