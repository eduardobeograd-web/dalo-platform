export default function ImportProductsPage() {
  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 p-6 text-white md:block">
          <a href="/" className="mb-10 block">
            <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
          </a>

          <nav className="space-y-2">
            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin"
            >
              Dashboard
            </a>

            <a
              className="block rounded-2xl bg-blue-600 px-5 py-4 font-semibold"
              href="/admin/products"
            >
              Products
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/recommendations"
            >
              Recommendations
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/upsells"
            >
              Upsells
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/orders"
            >
              Orders
            </a>

            <a
              className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10"
              href="/admin/providers"
            >
              API Providers
            </a>
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                DALO Admin
              </p>

              <h1 className="mt-2 text-4xl font-bold text-slate-950">
                Import Rate Sheet
              </h1>

              <p className="mt-2 text-slate-600">
                Upload your wholesale Excel file and turn packages into DALO
                products.
              </p>
            </div>

            <a
              href="/admin/products"
              className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
            >
              ← Back to Products
            </a>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
              <h2 className="text-2xl font-bold text-slate-950">
                Upload Excel File
              </h2>

              <p className="mt-2 text-slate-600">
                Supported format: .xlsx rate sheet from your wholesale provider.
              </p>

              <form className="mt-8 space-y-6">
                <div className="rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50/40 p-10 text-center">
                  <div className="text-5xl">📄</div>

                  <h3 className="mt-5 text-xl font-bold">
                    Drop your rate sheet here
                  </h3>

                  <p className="mt-2 text-slate-600">
                    Or choose the Excel file from your Mac.
                  </p>

                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-4"
                  />
                </div>

                <button
                  type="button"
                  className="w-full rounded-2xl bg-blue-600 p-5 text-lg font-bold text-white shadow-lg shadow-blue-200"
                >
                  Analyze Rate Sheet
                </button>
              </form>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
                <h2 className="text-2xl font-bold">Import Logic</h2>

                <p className="mt-3 text-slate-300">
                  DALO will read the rate sheet and prepare products for review
                  before they go live.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">Step 1</div>
                    <div className="font-bold">Read countries and regions</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">Step 2</div>
                    <div className="font-bold">Detect package types</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">Step 3</div>
                    <div className="font-bold">Map provider product IDs</div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-sm text-slate-400">Step 4</div>
                    <div className="font-bold">Admin reviews before publish</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
                <h2 className="text-2xl font-bold text-slate-950">
                  DALO Rule
                </h2>

                <p className="mt-3 text-slate-600">
                  Imported products should not go live automatically. You review
                  margins, usage type and recommendation role first.
                </p>

                <div className="mt-6 rounded-2xl bg-blue-50 p-5 text-blue-700">
                  <strong>Important:</strong> import first, approve later.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Expected Product Fields
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                "Country",
                "Region",
                "Data",
                "Validity",
                "Buy Price",
                "Sell Price",
                "Plan Type",
                "Usage Fit",
                "Provider Product ID",
                "Network",
                "5G Support",
                "Status",
              ].map((field) => (
                <div
                  key={field}
                  className="rounded-2xl bg-slate-50 p-4 font-semibold"
                >
                  {field}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}