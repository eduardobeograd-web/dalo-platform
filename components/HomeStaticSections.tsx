import Image from "next/image";
import SiteFooter from "./SiteFooter";

export function HomeWhyDalo() {
  return (
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
  );
}

export function HomeHowItWorks() {
  return (
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
  );
}

export function HomeFaq() {
  return (
      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2148c0]">Travel with confidence</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
              Questions, answered.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-600 md:text-right">
            The essentials to know before choosing and installing your travel eSIM.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {[
            {
              label: "Basics",
              question: "What is an eSIM?",
              answer:
                "An eSIM is a digital SIM card that lets you activate mobile data without replacing your physical SIM.",
            },
            {
              label: "Your number",
              question: "Can I keep my phone number?",
              answer:
                "Yes. Your physical SIM and travel eSIM can work together on most modern compatible phones.",
            },
            {
              label: "Payment",
              question: "Is checkout secure?",
              answer:
                "Recommendation questions never request payment details. Payment happens only after you review your matched plan.",
            },
            {
              label: "Installation",
              question: "How long does installation take?",
              answer:
                "Usually only a few minutes after purchase. Your eSIM is delivered digitally with setup instructions.",
            },
          ].map((item, index) => (
            <details key={item.question} className="group border-b border-slate-200 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 marker:hidden sm:px-7">
                <span className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2148c0]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block font-bold text-slate-950">
                      {item.question}
                    </span>
                  </span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef3ff] text-lg text-[#2148c0] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 pl-[4.75rem] text-sm leading-relaxed text-slate-600 sm:px-7 sm:pl-[5.5rem]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
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
  );
}

export function HomeFooter() {
  return <SiteFooter />;
}
