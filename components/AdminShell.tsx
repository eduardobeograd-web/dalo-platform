import Link from "next/link";
import type { ReactNode } from "react";
import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_LABELS,
  type AdminPermission,
  type AdminRole,
} from "../lib/admin-permissions";
import {
  adminHasPermission,
  requireAdminPermission,
} from "../lib/admin-auth";
import { adminLogout } from "../app/admin/logout";

type AdminPage =
  | "dashboard"
  | "products"
  | "destinations"
  | "recommendations"
  | "upsells"
  | "orders"
  | "events"
  | "support"
  | "providers"
  | "users"
  | "audit";

const pagePermissions: Record<AdminPage, AdminPermission> = {
  dashboard: ADMIN_PERMISSIONS.DASHBOARD_READ,
  products: ADMIN_PERMISSIONS.PRODUCTS_READ,
  destinations: ADMIN_PERMISSIONS.SEO_READ,
  recommendations: ADMIN_PERMISSIONS.RECOMMENDATIONS_READ,
  upsells: ADMIN_PERMISSIONS.UPSELLS_READ,
  orders: ADMIN_PERMISSIONS.ORDERS_READ,
  events: ADMIN_PERMISSIONS.EVENTS_READ,
  support: ADMIN_PERMISSIONS.SUPPORT_READ,
  providers: ADMIN_PERMISSIONS.PROVIDERS_READ,
  users: ADMIN_PERMISSIONS.ADMINS_READ,
  audit: ADMIN_PERMISSIONS.AUDIT_READ,
};

const navItems: Array<{
  id: AdminPage;
  href: string;
  label: string;
  shortLabel: string;
}> = [
  { id: "dashboard", href: "/admin", label: "Dashboard", shortLabel: "Home" },
  { id: "orders", href: "/admin/orders", label: "Orders", shortLabel: "Orders" },
  { id: "support", href: "/admin/support", label: "Support", shortLabel: "Support" },
  { id: "products", href: "/admin/products", label: "Products", shortLabel: "Products" },
  {
    id: "destinations",
    href: "/admin/destinations",
    label: "Country pages",
    shortLabel: "SEO",
  },
  {
    id: "recommendations",
    href: "/admin/recommendations",
    label: "Recommendations",
    shortLabel: "Rules",
  },
  { id: "upsells", href: "/admin/upsells", label: "Upsells", shortLabel: "Upsells" },
  { id: "events", href: "/admin/events", label: "Events", shortLabel: "Events" },
  {
    id: "providers",
    href: "/admin/providers",
    label: "API providers",
    shortLabel: "Providers",
  },
  {
    id: "users",
    href: "/admin/users",
    label: "Team & access",
    shortLabel: "Team",
  },
  { id: "audit", href: "/admin/audit", label: "Audit log", shortLabel: "Audit" },
];

export default async function AdminShell({
  activePage,
  children,
}: {
  activePage: AdminPage;
  children: ReactNode;
}) {
  const admin = await requireAdminPermission(pagePermissions[activePage]);
  const visibleItems = navItems.filter((item) =>
    adminHasPermission(admin, pagePermissions[item.id]),
  );
  const roleLabel =
    ADMIN_ROLE_LABELS[admin.role as AdminRole] || admin.role.replaceAll("_", " ");

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-5">
            <Link href="/admin" className="shrink-0">
              <img
                src="/dalo-logo-horizontal.png"
                alt="DALO"
                className="h-12 w-auto"
              />
            </Link>
            <span className="hidden border-l border-slate-200 pl-5 text-xs font-black uppercase tracking-[0.2em] text-slate-400 sm:block">
              Operations
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-slate-900">{admin.name}</p>
              <p className="text-xs text-slate-500">{roleLabel}</p>
            </div>
            <form action={adminLogout}>
              <button
                type="submit"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1500px] gap-1 overflow-x-auto px-4 sm:px-6">
          {visibleItems.map((item) => {
            const active = item.id === activePage;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold transition ${
                  active
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
