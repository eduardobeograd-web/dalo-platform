import Link from "next/link";
import AdminShell from "../../../../components/AdminShell";

export default function NewProviderPage() {
  return (
    <AdminShell activePage="providers">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Add API Provider
          </h1>

          <p className="mt-2 text-slate-600">
            Prepare a new wholesaler connection for DALO.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/providers"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
          >
            Back to Providers
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
          <h2 className="text-2xl font-bold text-slate-950">
            Provider setup is not connected to the database yet
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            This page is clickable now, but saving is intentionally disabled.
            The next clean step is to add a ProviderConfig model to Prisma.
            After that, this form can create real API providers without changing code.
          </p>

          <div className="mt-8 grid gap-5">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Provider Name
              </label>
              <input
                disabled
                placeholder="Example: Airalo Partner API"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 font-semibold text-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Provider Slug
              </label>
              <input
                disabled
                placeholder="example: airalo"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 font-semibold text-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Base URL
              </label>
              <input
                disabled
                placeholder="https://api.provider.com"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 font-semibold text-slate-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                API Key Env Name
              </label>
              <input
                disabled
                placeholder="AIRALO_API_KEY"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 font-semibold text-slate-500"
              />
            </div>

            <button
              disabled
              className="rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white opacity-60 shadow-lg shadow-blue-200"
            >
              Save Provider after ProviderConfig model exists
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Required next step
            </h2>

            <p className="mt-3 text-slate-600">
              Add a Prisma model first. Without that, providers are still hardcoded in the Admin Providers page.
            </p>

            <div className="mt-6 rounded-2xl bg-blue-50 p-4">
              <p className="font-bold text-slate-950">ProviderConfig</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                name, slug, type, baseUrl, apiKeyEnvName, fulfillmentEnabled,
                catalogueEnabled, usageSyncEnabled, active, priority.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Planned providers
            </h2>

            <div className="mt-6 space-y-3">
              <Link
                href="/admin/providers/airalo"
                className="block rounded-2xl bg-yellow-50 p-4 font-bold text-yellow-700 transition hover:-translate-y-1"
              >
                Airalo Partner API
              </Link>

              <Link
                href="/admin/providers/esim-go"
                className="block rounded-2xl bg-blue-50 p-4 font-bold text-blue-700 transition hover:-translate-y-1"
              >
                eSIM Go
              </Link>

              <Link
                href="/admin/providers/manual"
                className="block rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 transition hover:-translate-y-1"
              >
                Manual Fulfillment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
