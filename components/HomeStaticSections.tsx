import Image from "next/image";
import SiteFooter from "./SiteFooter";

export function HomeWhyDalo() {
  return (
    <>
      {/* WHY DALO */}
      <section className="mx-auto max-w-7xl px-6 pb-5 pt-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#10233a] text-white shadow-[0_24px_70px_rgba(16,35,58,0.18)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/10" />

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-8 sm:p-9 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f2a45f]">
                Why DALO
              </p>
              <h2 className="mt-3 max-w-xl text-4xl font-bold tracking-[-0.035em] sm:text-[2.7rem]">
                Built for choosing, not browsing.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                Most eSIM stores start with a catalogue. DALO starts with your trip, then narrows the choice to a recommendation you can understand.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1fr_0.85fr_0.85fr] bg-white/[0.06] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:px-5">
                  <span>Decision point</span>
                  <span>Typical store</span>
                  <span className="text-white">DALO</span>
                </div>
                {[
                  ["Starting point", "Plan catalogue", "Your trip"],
                  ["What you compare", "GB and validity", "Travel needs"],
                  ["What you receive", "More options", "One clear match"],
                ].map(([label, typical, dalo]) => (
                  <div key={label} className="grid grid-cols-[1fr_0.85fr_0.85fr] border-t border-white/10 px-4 py-3 text-sm sm:px-5">
                    <span className="font-semibold text-white">{label}</span>
                    <span className="text-slate-400">{typical}</span>
                    <span className="flex items-center gap-2 font-bold text-white">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#f2a45f]" />
                      {dalo}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.05] p-8 sm:p-9 lg:border-l lg:border-t-0 lg:p-10">
              <div className="rounded-[1.5rem] bg-white p-6 text-slate-900 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2148c0]">Before checkout</p>
                    <h3 className="mt-1 text-2xl font-bold tracking-tight">Know what fits and why.</h3>
                  </div>
                  <span className="hidden h-11 w-11 items-center justify-center rounded-full bg-[#eef3ff] text-[#2148c0] sm:flex">
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5"><path d="m4 10 3.5 3.5L16 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </div>

                <div className="divide-y divide-slate-200">
                  {[
                    ["Destination fit", "Available plans for where you are going"],
                    ["Trip-length fit", "Validity aligned with your stay"],
                    ["Usage fit", "Data matched to how you use your phone"],
                    ["Plan clarity", "Review the recommendation before payment"],
                  ].map(([title, description]) => (
                    <div key={title} className="flex gap-3 py-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2148c0] text-white">
                        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3 w-3"><path d="m5 10 3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-950">{title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href="#quiz"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2148c0] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#17389b] focus:outline-none focus:ring-4 focus:ring-[#dbe6ff]"
                >
                  Find my eSIM <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function HomeHowItWorks() {
  return (
    <>
      {/* HOW IT WORKS */}
      <section id="how" className="relative rounded-t-[2.5rem] bg-[#F6F8FF] pb-14 pt-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2148c0]">
                From planning to connected
              </p>
              <h2 className="mt-2 max-w-xl text-4xl font-bold tracking-tight text-slate-950">
                Three simple moments. One smoother trip.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-600 md:text-right">
              No technical comparison and no airport SIM counter. DALO guides you from trip details to installation.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgba(30,64,120,0.1)]">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src="/travel/how-match-v2.webp"
                  alt="Traveler photographing a city with a smartphone"
                  fill
                  loading="lazy"
                  quality={68}
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#2148c0] shadow-md">1</span>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2148c0]">Tell us about the trip</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">Share where and how you travel</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Choose your destination, trip length and everyday data habits.
                </p>
              </div>
            </article>

            <article className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgba(30,64,120,0.1)]">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src="/travel/how-recommend-v2.webp"
                  alt="Traveler preparing luggage with a smartphone"
                  fill
                  loading="lazy"
                  quality={68}
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#2148c0] shadow-md">2</span>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2148c0]">Get your recommendation</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">See the plan that fits</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  DALO turns your answers into one clear match instead of another long product list.
                </p>
              </div>
            </article>

            <article className="group overflow-hidden rounded-[1.75rem] bg-white shadow-[0_16px_40px_rgba(30,64,120,0.1)]">
              <div className="relative h-56 overflow-hidden">
                <Image
                  src="/travel/how-install-v2.webp"
                  alt="Traveler using a smartphone beside an airplane window"
                  fill
                  loading="lazy"
                  quality={68}
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#2148c0] shadow-md">3</span>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2148c0]">Install before takeoff</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">Land ready to connect</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Receive your eSIM digitally, install it in minutes and activate it when you arrive.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export function HomeFaq() {
  return (
    <>
      {/* FAQ */}
      <section id="faq" className="mx-auto grid max-w-6xl gap-6 px-6 py-16 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#10233a] p-7 text-white shadow-[0_24px_65px_rgba(16,35,58,0.2)] sm:p-9 lg:sticky lg:top-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[#2148c0]/30 blur-2xl" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f2a45f]">DALO travel confidence</p>
            <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-white">
              Travel data without the usual surprises.
            </h2>
          </div>
          <p className="relative mt-5 max-w-sm text-sm leading-7 text-slate-300">
            Clear pricing, prepaid data and no contract waiting for you after the trip.
          </p>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
            {[
              ["Before payment", "Your plan and full price"],
              ["At checkout", "Secure Stripe payment"],
              ["After purchase", "Digital delivery and support"],
            ].map(([moment, promise], index) => (
              <div key={moment} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-white/10 px-4 py-4 last:border-b-0">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-[10px] font-black text-blue-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-200">{moment}</p>
                  <p className="mt-1 text-sm font-bold text-white">{promise}</p>
                </div>
              </div>
            ))}
          </div>

          <a href="/support" className="relative mt-7 inline-flex min-h-12 w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-black text-[#10233a] transition hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/40">
            DALO support is here
            <span className="text-[#2148c0]">Contact support →</span>
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {[
            {
              label: "Prepaid only",
              question: "No subscription or automatic renewal.",
              answer:
                "DALO travel eSIMs are prepaid purchases for a defined data allowance and validity period. There is no recurring DALO subscription and your plan does not renew automatically.",
            },
            {
              label: "Clear pricing",
              question: "See your complete DALO price before payment.",
              answer:
                "You see the plan, data allowance, validity and total DALO price before payment. DALO does not add an activation fee or surprise service charge after you select your plan.",
            },
            {
              label: "Roaming control",
              question: "Avoid unexpected home-carrier roaming charges.",
              answer:
                "Your DALO plan has a defined prepaid data allowance instead of open-ended DALO overage charges. Set the DALO eSIM as your mobile-data line and disable data roaming on your home SIM to avoid charges from your regular carrier.",
            },
            {
              label: "Your number",
              question: "Keep your number while DALO handles travel data.",
              answer:
                "Yes. On compatible dual-SIM phones, your regular SIM can stay active for calls and messages while the DALO eSIM provides travel data.",
            },
            {
              label: "Payment",
              question: "Stripe processes your complete card details.",
              answer:
                "No. Card details are entered and processed securely by Stripe. DALO stores the order information needed for delivery and support, but never your complete card number.",
            },
            {
              label: "Support",
              question: "Setup guidance and support stay with your order.",
              answer:
                "Your order number, eSIM details and installation options remain available in your DALO account. If you need help, support can identify the correct eSIM using your order number or ICCID.",
            },
          ].map((item, index) => (
            <details key={item.question} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(30,64,120,0.07)] transition duration-300 open:border-blue-200 open:shadow-[0_18px_45px_rgba(33,72,192,0.12)]">
              <summary className="flex min-h-28 cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 marker:hidden sm:px-6 sm:py-6">
                <span className="flex items-center gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef3ff] text-[10px] font-black tracking-[0.08em] text-[#2148c0] transition group-open:bg-[#2148c0] group-open:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-[#2148c0]">
                      {item.label}
                    </span>
                    <span className="mt-1.5 block text-base font-extrabold leading-snug text-slate-950">
                      {item.question}
                    </span>
                  </span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-[#f7f9ff] text-lg font-light text-[#2148c0] transition duration-300 group-hover:border-blue-300 group-hover:bg-blue-50 group-open:rotate-45 group-open:border-[#2148c0]">
                  +
                </span>
              </summary>
              <p className="border-t border-blue-100 bg-[#f8faff] px-5 py-5 text-sm leading-7 text-slate-600 sm:px-6">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

export function HomePopularDestinations() {
  const popularDestinationCards = [
    "Germany",
    "Spain",
    "Italy",
    "United States",
    "Japan",
    "Thailand",
  ];

  function getDestinationImage(destination: string) {
    const images: Record<string, string> = {
      Germany: "/travel/germany-home.webp",
      Spain: "/travel/spain-home.webp",
      Italy: "/travel/italy-home.webp",
      "United States": "/travel/united-states-home.webp",
      Japan: "/travel/japan-home.webp",
      Thailand: "/travel/thailand-home.webp",
    };

    return images[destination];
  }

  return (
    <>
      {/* DESTINATIONS */}
      <section id="destinations" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Explore with DALO
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
              Popular destinations
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-600 sm:text-right">
            Start with the places our travelers search for most.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {popularDestinationCards.map((destination) => (
            <a
              key={destination}
              href={
                "/?country=" +
                encodeURIComponent(
                  destination === "United States"
                    ? "United States of America"
                    : destination
                ) +
                "#quiz"
              }
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-[0_8px_24px_rgba(30,64,120,0.06)] transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_14px_34px_rgba(30,64,120,0.12)]"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={getDestinationImage(destination)}
                  alt={destination}
                  fill
                  loading="lazy"
                  quality={68}
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">Destination</p>
                    <h3 className="mt-1 text-xl font-bold">{destination}</h3>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/15 text-lg backdrop-blur-sm transition group-hover:translate-x-1 group-hover:bg-white group-hover:text-[#2148c0]">→</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e98b3a]" />
                Match a plan for this trip
              </div>
            </a>
          ))}
        </div>

        <div className="mt-7 text-center">
          <a
            href="/esim"
            className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-600 hover:text-blue-700"
          >
            View all destinations
          </a>
        </div>
      </section>
    </>
  );
}

export function HomeFooter() {
  return <SiteFooter />;
}
