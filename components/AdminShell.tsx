type AdminShellProps = {
  children: React.ReactNode;
  activePage:
    | "dashboard"
    | "products"
    | "recommendations"
    | "upsells"
    | "orders"
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
  { key: "providers", label: "API Providers", href: "/admin/providers" },
];

export default function AdminShell({ children, activePage }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 p-6 text-white md:block">
          <a href="/" className="mb-10 block">
            <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
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
                      ? "bg-blue-600 font-semibold text-white"
                      : "text-slate-300 hover:bg-white/10"
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