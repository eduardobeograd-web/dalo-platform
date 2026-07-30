import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Team access | DALO eSIM",
  robots: {
    index: false,
    follow: false,
  },
};

type TestAccessPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function TestAccessPage({
  searchParams,
}: TestAccessPageProps) {
  const params = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#edf5ff] px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(74,151,255,0.24),transparent_34%),radial-gradient(circle_at_88%_78%,rgba(234,177,94,0.18),transparent_30%)]" />
      <div className="absolute -left-20 bottom-[-12rem] h-[30rem] w-[30rem] rounded-full bg-[#1667d9]/10 blur-3xl" />

      <section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_28px_90px_rgba(20,61,118,0.18)]">
        <div className="h-1.5 bg-[#1261c9]" />
        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <Image
            src="/dalo-logo.webp"
            alt="DALO"
            width={180}
            height={72}
            priority
            className="h-auto w-40"
          />

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1261c9]">
              Private team preview
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Welcome to DALO.
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-slate-600">
              This version is currently being prepared for launch. Enter the
              team password to continue.
            </p>
          </div>

          <form action="/api/test-access" method="post" className="mt-8">
            <input type="hidden" name="next" value={params.next || "/"} />
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-800"
            >
              Team password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              aria-invalid={params.error === "1"}
              className="mt-2 h-13 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#1261c9] focus:bg-white focus:ring-4 focus:ring-[#1261c9]/12"
              placeholder="Enter password"
            />
            {params.error === "1" ? (
              <p className="mt-2 text-sm font-medium text-red-600">
                That password is not correct. Please try again.
              </p>
            ) : null}
            <button
              type="submit"
              className="mt-4 flex h-13 w-full items-center justify-center rounded-xl bg-[#1261c9] px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(18,97,201,0.25)] transition hover:bg-[#0d52ae] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1261c9]/25 active:translate-y-px"
            >
              Open team preview
            </button>
          </form>

          <div className="mt-7 flex items-center gap-3 border-t border-slate-200 pt-6 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure private access for the DALO team
          </div>
        </div>
      </section>
    </main>
  );
}
