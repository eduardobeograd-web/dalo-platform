import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import { requestPasswordReset } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const email = params.email || "";
  const sent = params.sent === "1";

  return (
    <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-950">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-blue-100">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Account security
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {sent ? "Check your email" : "Create or reset your password"}
          </h1>

          {sent ? (
            <>
              <p className="mt-4 leading-7 text-slate-600">
                If an active DALO account exists for that address, we sent a
                secure link. It expires in 30 minutes and works only once.
              </p>
              <a
                href="/customer/login"
                className="mt-7 inline-flex rounded-xl bg-[#2148c0] px-5 py-3 font-bold text-white transition hover:bg-[#17389b]"
              >
                Back to login
              </a>
            </>
          ) : (
            <>
              <p className="mt-4 leading-7 text-slate-600">
                Enter the email used for your DALO order. We will send a secure,
                one-time link.
              </p>

              <form action={requestPasswordReset} className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block font-semibold" htmlFor="reset-email">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    defaultValue={email}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#2148c0] p-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#17389b]"
                >
                  Send secure link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
