import fs from "fs";
import path from "path";

type SheetPreview = {
  name: string;
  totalRows: number;
  headers: string[];
  sampleRows: Record<string, string>[];
};

type PreviewData = {
  fileName: string;
  analyzedAt: string;
  sheets: SheetPreview[];
};

function getPreviewData(): PreviewData | null {
  const filePath = path.join(process.cwd(), "data", "rate-sheet-preview.json");

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export default function ImportPreviewPage() {
  const preview = getPreviewData();

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-slate-950 p-6 text-white md:block">
          <a href="/" className="mb-10 block">
            <img src="/dalo-logo.png" alt="DALO" className="h-16 w-auto" />
          </a>

          <nav className="space-y-2">
            <a className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10" href="/admin">
              Dashboard
            </a>

            <a className="block rounded-2xl bg-blue-600 px-5 py-4 font-semibold" href="/admin/products">
              Products
            </a>

            <a className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10" href="/admin/recommendations">
              Recommendations
            </a>

            <a className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10" href="/admin/upsells">
              Upsells
            </a>

            <a className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10" href="/admin/orders">
              Orders
            </a>

            <a className="block rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/10" href="/admin/providers">
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
                Rate Sheet Preview
              </h1>

              <p className="mt-2 text-slate-600">
                Review the Excel structure before importing products.
              </p>
            </div>

            <a
              href="/admin/products/import"
              className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
            >
              ← Back to Import
            </a>
          </div>

          {!preview ? (
            <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
              <h2 className="text-2xl font-bold text-slate-950">
                No preview available
              </h2>
              <p className="mt-2 text-slate-600">
                Upload a rate sheet first.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
                  <p className="text-sm font-semibold text-slate-500">File</p>
                  <h2 className="mt-3 break-all text-xl font-bold">
                    {preview.fileName}
                  </h2>
                </div>

                <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
                  <p className="text-sm font-semibold text-slate-500">
                    Sheets
                  </p>
                  <h2 className="mt-3 text-3xl font-bold">
                    {preview.sheets.length}
                  </h2>
                </div>

                <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
                  <p className="text-sm font-semibold text-slate-500">
                    Total Rows
                  </p>
                  <h2 className="mt-3 text-3xl font-bold">
                    {preview.sheets.reduce(
                      (total, sheet) => total + sheet.totalRows,
                      0
                    )}
                  </h2>
                </div>
              </div>

              {preview.sheets.map((sheet) => (
                <div
                  key={sheet.name}
                  className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50"
                >
                  <div className="border-b border-slate-100 p-6">
                    <h2 className="text-2xl font-bold text-slate-950">
                      {sheet.name}
                    </h2>
                    <p className="mt-1 text-slate-600">
                      {sheet.totalRows} rows detected
                    </p>
                  </div>

                  <div className="p-6">
                    <h3 className="mb-4 font-bold">Detected Columns</h3>

                    <div className="mb-8 flex flex-wrap gap-3">
                      {sheet.headers.map((header) => (
                        <span
                          key={header}
                          className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700"
                        >
                          {header}
                        </span>
                      ))}
                    </div>

                    <h3 className="mb-4 font-bold">Sample Rows</h3>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left">
                        <thead className="bg-slate-50 text-sm text-slate-500">
                          <tr>
                            {sheet.headers.slice(0, 8).map((header) => (
                              <th
                                key={header}
                                className="px-4 py-3 font-semibold"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {sheet.sampleRows.map((row, index) => (
                            <tr
                              key={index}
                              className="border-t border-slate-100"
                            >
                              {sheet.headers.slice(0, 8).map((header) => (
                                <td key={header} className="px-4 py-3 text-sm">
                                  {row[header]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
                <h2 className="text-2xl font-bold">Next Step</h2>
                <p className="mt-3 text-slate-300">
                  After we confirm which sheet contains the actual packages, DALO
                  can transform rows into products.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}