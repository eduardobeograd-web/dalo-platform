import Image from "next/image";
import Link from "next/link";
import PwaInstallButton from "./PwaInstallButton";

type SiteHeaderProps = {
  mode?: "public" | "checkout" | "account";
};

export default function SiteHeader({ mode = "public" }: SiteHeaderProps) {
  return (
    <header className="relative z-20 px-4 pt-2 sm:px-6 sm:pt-3">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/90 bg-white/90 px-4 py-1 shadow-[0_10px_35px_rgba(30,64,120,0.08)] backdrop-blur-xl sm:px-6 sm:py-2">
        <Link
          href="/"
          className="flex h-12 items-center overflow-visible sm:h-14"
          aria-label="DALO home"
        >
          <Image
            src="/dalo-logo.webp"
            alt="DALO"
            width={360}
            height={240}
            sizes="(max-width: 639px) 130px, 180px"
            className="h-13 w-auto origin-left scale-110 sm:h-[4.5rem] sm:scale-125"
          />
        </Link>

        {mode === "public" ? (
          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex">
            <Link className="transition hover:text-[#2148c0]" href="/#how">
              How it works
            </Link>
            <Link className="transition hover:text-[#2148c0]" href="/esim">
              Destinations
            </Link>
            <Link className="transition hover:text-[#2148c0]" href="/#faq">
              FAQ
            </Link>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {mode === "account" ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <PwaInstallButton />
            <Link
              href="/customer/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-[#2148c0] sm:rounded-xl sm:px-4 sm:text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/customer/support"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-[#2148c0] sm:block"
            >
              Support
            </Link>
            <Link
              href="/customer/logout"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#10233a] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#2148c0] sm:rounded-xl sm:px-4 sm:text-sm"
            >
              Logout
            </Link>
          </div>
        ) : mode === "checkout" ? (
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-semibold text-slate-600 transition hover:text-[#2148c0] sm:block"
            >
              Home
            </Link>
            <Link
              href="/#quiz"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2148c0] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#17389b] focus:outline-none focus:ring-4 focus:ring-blue-100 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
            >
              New search
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg px-2 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-[#2148c0] sm:text-sm"
              href="/customer/dashboard"
            >
              My account
            </Link>
            <Link
              href="/#quiz"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2148c0] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#17389b] focus:outline-none focus:ring-4 focus:ring-blue-100 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Start quiz
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
