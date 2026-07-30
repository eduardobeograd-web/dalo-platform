import Link from "next/link";
import { getFirstAllowedAdminPath, requireAdmin } from "../../../lib/admin-auth";

export default async function AdminAccessDeniedPage() {
  const admin = await requireAdmin();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-6">
      <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          DALO access control
        </p>
        <h1 className="mt-4 text-3xl font-black text-slate-950">
          This area is not assigned to you
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Your account is active, but it does not include permission for this
          section. Ask an owner to update your access.
        </p>
        <Link
          href={getFirstAllowedAdminPath(admin)}
          className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
        >
          Go to my workspace
        </Link>
      </div>
    </main>
  );
}
