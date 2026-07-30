import { redirect } from "next/navigation";
import { getCurrentAdmin, getFirstAllowedAdminPath } from "../../../lib/admin-auth";
import { changeAdminPassword } from "./actions";

export default async function ChangeAdminPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (!admin.mustChangePassword) redirect(getFirstAllowedAdminPath(admin));
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-6">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <img src="/dalo-logo-horizontal.png" alt="DALO" className="h-14 w-auto" />
        <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Secure your account
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Choose a new password
        </h1>
        <p className="mt-3 text-slate-600">
          Use at least 10 characters. This temporary password cannot be used again.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
            The passwords must match and contain at least 10 characters.
          </div>
        ) : null}

        <form action={changeAdminPassword} className="mt-7 space-y-5">
          <input
            name="password"
            type="password"
            minLength={10}
            required
            autoComplete="new-password"
            placeholder="New password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-blue-500 focus:bg-white"
          />
          <input
            name="confirmation"
            type="password"
            minLength={10}
            required
            autoComplete="new-password"
            placeholder="Repeat password"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-blue-500 focus:bg-white"
          />
          <button className="w-full rounded-xl bg-blue-700 px-5 py-4 font-black text-white transition hover:bg-blue-800">
            Save password and continue
          </button>
        </form>
      </div>
    </main>
  );
}
