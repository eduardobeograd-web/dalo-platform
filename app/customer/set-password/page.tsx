import crypto from "crypto";
import { setCustomerPassword } from "./actions";
import SiteFooter from "../../../components/SiteFooter";
import SiteHeader from "../../../components/SiteHeader";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default async function CustomerSetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token || "";
  const error = params.error || "";
  const activeTokens = token
    ? await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "PasswordResetToken"
        WHERE "tokenHash" = ${hashToken(token)}
          AND "usedAt" IS NULL
          AND "expiresAt" > ${new Date()}
        LIMIT 1
      `
    : [];
  const invalidToken =
    !token || error === "invalid" || activeTokens.length === 0;

  return (
    <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-950">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Customer Account
          </p>

          <h1 className="mt-3 text-4xl font-bold">Create your password</h1>

          <p className="mt-3 text-slate-600">
            Set a new password so you can securely manage your eSIMs and orders.
          </p>

          {invalidToken ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              This reset link is missing, expired or has already been used.
            </div>
          ) : error ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error === "short"
                ? "Password must be at least 8 characters."
                : error === "match"
                  ? "Passwords do not match."
                  : "Please check your details."}
            </div>
          ) : null}

          {invalidToken ? (
            <a
              href="/customer/forgot-password"
              className="mt-7 inline-flex rounded-xl bg-[#2148c0] px-5 py-3 font-bold text-white"
            >
              Request a new link
            </a>
          ) : (
          <form action={setCustomerPassword} className="mt-8 space-y-5">
            <input type="hidden" name="token" value={token} />
            <div>
              <label className="mb-2 block font-semibold">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="Repeat password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-600 p-5 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Create password
            </button>
          </form>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
