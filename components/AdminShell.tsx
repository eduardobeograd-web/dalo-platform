type AdminShellProps = {
  children: React.ReactNode;
  activePage:
    | "dashboard"
    | "products"
    | "recommendations"
    | "upsells"
    | "orders"
    | "events"
    | "support"
    | "providers";
};

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "products", label: "Products", href: "/admin/products" },
  {
    key: "recommendations",
    label: "Recommendations",
    href: "/admin/recommendations",
  },
  { key: "upsells", label: "Upsells", href: "/admin/upsells" },
  { key: "orders", label: "Orders", href: "/admin/orders" },
  { key: "events", label: "Events", href: "/admin/events" },
  { key: "support", label: "Support", href: "/admin/support" },
  { key: "providers", label: "API Providers", href: "/admin/providers" },
];

export default function AdminShell({ children, activePage }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      {/* Mobile Admin Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
        <div className="mb-4 flex items-center justify-between">
          <a href="/">
            <img src="/dalo-logo-horizontal.png" alt="DALO" className="h-12 w-auto" />
          </a>

          <a
            href="/"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Website
          </a>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const isActive = item.key === activePage;

            return (
              <a
                key={item.key}
                href={item.href}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-6 text-slate-900 shadow-xl shadow-blue-50 md:block">
          <a
            href="/"
            className="mb-10 flex rounded-2xl bg-blue-50 px-4 py-4 ring-1 ring-blue-100"
          >
            <img
              src="/dalo-logo-horizontal.png"
              alt="DALO"
              className="h-12 w-auto"
            />
          </a>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.key === activePage;

              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={`block rounded-2xl px-5 py-4 ${
                    isActive
                      ? "bg-blue-600 font-bold text-white"
                      : "font-bold text-black hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">{children}</section>
      </div>
    </main>
  );
}