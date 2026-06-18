import Link from "next/link";
import AdminShell from "../../../../components/AdminShell";
import { createProviderConfig } from "../actions";

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
            Add a new wholesaler, mock provider or manual fulfillment path.
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

      <form
        action={createProviderConfig}
        className="grid gap-6 lg:grid-cols-[1fr_380px]"
      >
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
          <h2 className="text-2xl font-bold text-slate-950">
            Provider Details
          </h2>

          <div className="mt-8 grid gap-5">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Provider Name
              </label>
              <input
                name="name"
                required
                placeholder="Example: Airalo Partner API"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Provider Slug
              </label>
              <input
                name="slug"
                placeholder="example: airalo"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <p className="mt-2 text-sm text-slate-500">
                Leave empty to auto-generate from name.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Type</label>
              <select
                name="type"
                defaultValue="Wholesaler API"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option>Wholesaler API</option>
                <option>Internal Test Provider</option>
                <option>Operational Fallback</option>
                <option>Future Wholesaler API</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Status</label>
              <select
                name="status"
                defaultValue="planned"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="planned">Planned</option>
                <option value="live_candidate">Live Candidate</option>
                <option value="configured">Configured</option>
                <option value="mock">Mock</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Base URL
              </label>
              <input
                name="baseUrl"
                placeholder="https://api.provider.com"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                API Key Env Name
              </label>
              <input
                name="apiKeyEnvName"
                placeholder="AIRALO_API_KEY"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Product Search Query
              </label>
              <input
                name="productSearchQuery"
                placeholder="airalo,airalo partner"
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <p className="mt-2 text-sm text-slate-500">
                Comma-separated keywords used to map products by provider field.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Priority
              </label>
              <input
                name="priority"
                type="number"
                defaultValue={100}
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Notes</label>
              <textarea
                name="notes"
                rows={5}
                placeholder="Internal notes about this provider..."
                className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-4 font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Capabilities
            </h2>

            <div className="mt-6 space-y-4">
              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                <input name="active" type="checkbox" defaultChecked />
                Active
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                <input name="fulfillmentEnabled" type="checkbox" />
                Fulfillment enabled
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                <input name="catalogueEnabled" type="checkbox" />
                Catalogue sync enabled
              </label>

              <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 font-bold">
                <input name="usageSyncEnabled" type="checkbox" />
                Usage sync enabled
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">Save</h2>

            <p className="mt-3 text-slate-600">
              This now saves a real ProviderConfig row in SQLite.
            </p>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Save Provider
            </button>
          </div>
        </div>
      </form>
    </AdminShell>
  );
}
