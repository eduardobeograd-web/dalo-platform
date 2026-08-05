import Image from "next/image";
import Link from "next/link";
import { adminLogout } from "../app/admin/logout";
import PwaInstallButton from "./PwaInstallButton";

export default function SupportConsoleHeader({
  adminName,
}: {
  adminName: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link href="/support-console" className="flex min-w-0 items-center gap-3">
          <Image
            src="/dalo-logo.webp"
            alt="DALO"
            width={180}
            height={120}
            sizes="84px"
            className="h-10 w-auto shrink-0"
          />
          <div className="min-w-0 border-l border-slate-200 pl-3">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.16em] text-blue-700">
              Support Console
            </p>
            <p className="truncate text-xs font-bold text-slate-500">{adminName}</p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <PwaInstallButton
            mobileLabel="Install"
            label="Install support app"
            appName="DALO Support"
          />
          <form action={adminLogout}>
            <button
              type="submit"
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
