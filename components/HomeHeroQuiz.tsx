import Image from "next/image";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import HomeQuizForm from "./HomeQuizForm";

const popularTrips = ["Italy", "Spain", "Japan", "Thailand"];

export default function HomeHeroQuiz() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#f7fafc] pb-8 sm:pb-12">
        <div className="pointer-events-none absolute bottom-0 left-[4%] top-0 w-[92%]">
          <Image
            src="/travel/dalo-hero-sicily.webp"
            alt=""
            fill
            preload
            fetchPriority="high"
            quality={45}
            sizes="(max-width: 767px) 86vw, 100vw"
            className="object-cover object-[48%_center] saturate-[1.08]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#f7fafc_0%,rgba(247,250,252,0.88)_22%,rgba(247,250,252,0.08)_49%,rgba(247,250,252,0.28)_74%,#f7fafc_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#f7fafc] via-[#f7fafc]/75 to-transparent" />

        <SiteHeader />

        {/* HERO */}
        <div className="relative mx-auto max-w-6xl px-5 pt-1 sm:px-6 sm:pt-3">
          <div className="grid items-start gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_580px] lg:gap-5">
            <div className="self-center py-2 pr-0 sm:py-5 sm:pr-4 lg:py-8 lg:pl-4 lg:pr-7">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 sm:mb-4 sm:text-xs">
                Your answers do the searching
              </p>

              <h1 className="max-w-[37rem] text-[2.05rem] font-bold leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.45rem]">
                <span className="block">DALO finds the</span>
                <span className="block text-[#2148c0]">right eSIM</span>
                <span className="block">for your trip.</span>
              </h1>

              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-slate-700 sm:mt-5 sm:text-lg">
                Answer three quick questions. DALO compares prepaid travel
                eSIMs for your destination and recommends one clear match.
              </p>

              <div className="mt-5 max-w-lg border-t border-slate-900/10 pt-4 sm:mt-7 sm:pt-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2.5">
                  <span className="mr-1 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#b45411] sm:text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-[#e98b3a] shadow-[0_0_0_4px_rgba(233,139,58,0.14)]" />
                    Popular trips
                  </span>
                  {popularTrips.map((destination) => (
                    <Link
                      key={destination}
                      href={`/?country=${encodeURIComponent(destination)}#quiz`}
                      className="rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-[0_5px_16px_rgba(30,64,120,0.09)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#7892dc] hover:bg-white hover:text-[#2148c0] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:text-sm"
                    >
                      {destination}
                    </Link>
                  ))}
                </div>
              </div>

            </div>

          {/* QUIZ */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-8 bottom-6 top-12 rounded-[2.5rem] bg-[#2148c0]/20 blur-3xl" />
            <HomeQuizForm />
          </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(246,248,255,0.98))]" />
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-5 sm:px-6">
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
