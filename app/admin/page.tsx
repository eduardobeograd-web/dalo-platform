import AdminShell from "../../components/AdminShell";
import { adminLogout } from "./logout";

export default function AdminDashboard() {
  return (
    <AdminShell activePage="dashboard">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Manage products, recommendations, upsells and orders.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
          >
            View Website
          </a>

          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded-2xl bg-slate-950 px-6 py-4 font-bold text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Revenue</p>
          <h2 className="mt-3 text-3xl font-bold">€0</h2>
          <p className="mt-2 text-sm text-slate-500">Waiting for launch</p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Orders</p>
          <h2 className="mt-3 text-3xl font-bold">0</h2>
          <p className="mt-2 text-sm text-slate-500">No orders yet</p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Products</p>
          <h2 className="mt-3 text-3xl font-bold">0</h2>
          <p className="mt-2 text-sm text-slate-500">
            Import from rate sheet
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">Conversion</p>
          <h2 className="mt-3 text-3xl font-bold">—</h2>
          <p className="mt-2 text-sm text-slate-500">Coming soon</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-blue-50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Build Status</h2>
            <p className="mt-1 text-slate-600">
              DALO platform foundation.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
              <span className="font-semibold">Landing Page</span>
              <span className="font-bold text-green-700">Done</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
              <span className="font-semibold">Quiz Flow</span>
              <span className="font-bold text-green-700">Done</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
              <span className="font-semibold">Searching Page</span>
              <span className="font-bold text-green-700">Done</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-green-50 p-4">
              <span className="font-semibold">Result Page</span>
              <span className="font-bold text-green-700">Done</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-blue-50 p-4">
              <span className="font-semibold">Admin Platform</span>
              <span className="font-bold text-blue-700">In Progress</span>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-lg">
          <h2 className="text-2xl font-bold">Next Step</h2>

          <p className="mt-3 text-slate-300">
            Import your wholesale rate sheet and turn packages into DALO
            products.
          </p>

          <div className="mt-8 space-y-3">
            <a
              href="/admin/products"
              className="block rounded-2xl bg-blue-600 px-5 py-4 text-center font-bold text-white"
            >
              Manage Products
            </a>

            <a
              href="/admin/recommendations"
              className="block rounded-2xl bg-white/10 px-5 py-4 text-center font-bold text-white"
            >
              Set Recommendations
            </a>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}