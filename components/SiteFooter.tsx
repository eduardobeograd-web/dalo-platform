import Image from "next/image";
import CookieSettingsButton from "./CookieSettingsButton";

export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-slate-200/80 bg-white/90 px-6 py-10 text-slate-900 backdrop-blur">
      <div className="mx-auto max-w-7xl">
        <section className="relative mb-12 overflow-hidden rounded-[2rem] bg-[#10233a] p-7 text-white shadow-[0_24px_65px_rgba(16,35,58,0.18)] sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#f2a45f]">
                Travel with clarity
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Your trip deserves a plan that fits.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Tell DALO where you&apos;re going, how long you&apos;ll stay and
                how you use your phone. Get one clear recommendation.
              </p>
            </div>

            <div className="lg:text-right">
              <a
                href="/#quiz"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#10233a] transition hover:bg-[#eef3ff]"
              >
                Find my eSIM <span className="ml-2" aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="relative mt-7 grid gap-3 border-t border-white/10 pt-5 text-sm sm:grid-cols-3">
            {["Clear recommendation", "Review before payment", "Digital delivery"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 font-semibold text-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f2a45f]" />
                  {item}
                </div>
              )
            )}
          </div>
        </section>

        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(4,1fr)]">
          <div>
            <a href="/" aria-label="DALO home" className="inline-flex">
              <Image
                src="/dalo-logo.webp"
                alt="DALO"
                width={360}
                height={240}
                sizes="140px"
                className="h-14 w-auto origin-left scale-110"
              />
            </a>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
              The travel eSIM recommendation engine.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Destinations</h4>

            <div className="space-y-2 text-sm text-slate-600">
              <a className="block hover:text-[#2148c0]" href="/esim/turkey">
                Turkey eSIM
              </a>
              <a className="block hover:text-[#2148c0]" href="/esim/thailand">
                Thailand eSIM
              </a>
              <a className="block hover:text-[#2148c0]" href="/esim/germany">
                Germany eSIM
              </a>
              <a
                className="block hover:text-[#2148c0]"
                href="/esim/united-states-of-america"
              >
                USA eSIM
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Support</h4>

            <div className="space-y-2 text-sm text-slate-600">
              <a className="block hover:text-[#2148c0]" href="/support">
                Support
              </a>
              <a className="block hover:text-[#2148c0]" href="/contact">
                Contact
              </a>
              <a className="block hover:text-[#2148c0]" href="/customer/login">
                Login
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Company</h4>

            <div className="space-y-2 text-sm text-slate-600">
              <a className="block hover:text-[#2148c0]" href="/about">
                About
              </a>
              <a className="block hover:text-[#2148c0]" href="/esim">
                All destinations
              </a>
              <a className="block hover:text-[#2148c0]" href="/#how">
                How it works
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold">Legal</h4>

            <div className="space-y-2 text-sm text-slate-600">
              <a className="block hover:text-[#2148c0]" href="/privacy-policy">
                Privacy
              </a>
              <a className="block hover:text-[#2148c0]" href="/terms">
                Terms
              </a>
              <a className="block hover:text-[#2148c0]" href="/refund-policy">
                Refund policy
              </a>
              <a className="block hover:text-[#2148c0]" href="/cookie-policy">
                Cookie policy
              </a>
              <CookieSettingsButton />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">
          © 2026 DALO. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
