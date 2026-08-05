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
  | "readiness"
  | "destinations"
  | "seo-audit"
  | "recommendations"
  | "upsells"
  | "orders"
  | "events"
  | "activity"
  | "support"
  | "support-app"
  | "providers"
  | "users"
  | "audit";

const pagePermissions: Record<AdminPage, AdminPermission> = {
  dashboard: ADMIN_PERMISSIONS.DASHBOARD_READ,
  products: ADMIN_PERMISSIONS.PRODUCTS_READ,
  readiness: ADMIN_PERMISSIONS.SEO_READ,
  destinations: ADMIN_PERMISSIONS.SEO_READ,
  "seo-audit": ADMIN_PERMISSIONS.SEO_READ,
  recommendations: ADMIN_PERMISSIONS.RECOMMENDATIONS_READ,
  upsells: ADMIN_PERMISSIONS.UPSELLS_READ,
  orders: ADMIN_PERMISSIONS.ORDERS_READ,
  events: ADMIN_PERMISSIONS.EVENTS_READ,
  activity: ADMIN_PERMISSIONS.EVENTS_READ,
  support: ADMIN_PERMISSIONS.SUPPORT_READ,
  "support-app": ADMIN_PERMISSIONS.SUPPORT_READ,
  providers: ADMIN_PERMISSIONS.PROVIDERS_READ,
  users: ADMIN_PERMISSIONS.ADMINS_READ,
  audit: ADMIN_PERMISSIONS.AUDIT_READ,
};

const navGroups: Array<{
  label: string;
  items: Array<{ id: AdminPage; href: string; label: string }>;
}> = [
  {
    label: "Overview",
    items: [{ id: "dashboard", href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Sales",
    items: [
      { id: "orders", href: "/admin/orders", label: "Orders" },
      { id: "support", href: "/admin/support", label: "Support inbox" },
      { id: "support-app", href: "/support-console", label: "Support app" },
    ],
  },
  {
    label: "Catalog",
    items: [
      { id: "products", href: "/admin/products", label: "Products" },
      { id: "readiness", href: "/admin/readiness", label: "Launch readiness" },
      { id: "destinations", href: "/admin/destinations", label: "SEO & Country pages" },
      { id: "seo-audit", href: "/admin/seo-audit", label: "SEO Audit" },
    ],
  },
  {
    label: "Sales rules",
    items: [
      { id: "recommendations", href: "/admin/recommendations", label: "Recommendations" },
      { id: "upsells", href: "/admin/upsells", label: "Upsells" },
    ],
  },
  {
    label: "Growth",
    items: [
      { id: "events", href: "/admin/events", label: "Marketing" },
      { id: "activity", href: "/admin/activity", label: "Activity" },
    ],
  },
  {
    label: "System",
    items: [
      { id: "providers", href: "/admin/providers", label: "Integrations" },
      { id: "users", href: "/admin/users", label: "Team & access" },
      { id: "audit", href: "/admin/audit", label: "Audit log" },
    ],
  },
];

export default async function AdminShell({
  activePage,
  children,
}: {
  activePage: AdminPage;
  children: ReactNode;
}) {
  const admin = await requireAdminPermission(pagePermissions[activePage]);
  const roleLabel =
    ADMIN_ROLE_LABELS[admin.role as AdminRole] || admin.role.replaceAll("_", " ");
  const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  const environmentLabel = environment === "production" ? "PRODUCTION" : environment.toUpperCase();

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        adminHasPermission(admin, pagePermissions[item.id]),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="shrink-0">
            <img src="/dalo-logo-horizontal.png" alt="DALO" className="h-11 w-auto" />
          </Link>
          <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black tracking-[0.14em] ${environment === "production" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {environmentLabel}
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4">
          {visibleGroups.flatMap((group) => group.items).map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-bold ${item.id === activePage ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-[1720px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin">
              <img src="/dalo-logo-horizontal.png" alt="DALO" className="h-12 w-auto" />
            </Link>
            <span className={`rounded-lg px-2 py-1 text-[9px] font-black tracking-[0.12em] ${environment === "production" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {environmentLabel}
            </span>
          </div>

          <nav className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
            {visibleGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {group.label}
                </p>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block rounded-xl px-3 py-2.5 text-sm font-bold transition ${item.id === activePage ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-100 pt-5">
            <p className="truncate text-sm font-bold text-slate-900">{admin.name}</p>
            <p className="mt-1 text-xs text-slate-500">{roleLabel}</p>
            <form action={adminLogout} className="mt-4">
              <button type="submit" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-7 sm:px-6 sm:py-10 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
