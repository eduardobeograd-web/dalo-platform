import AdminShell from "../../../../components/AdminShell";
import { createProduct } from "./actions";

export default function NewProductPage() {
  return (
    <AdminShell activePage="products">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Add Product
          </h1>

          <p className="mt-2 text-slate-600">
            Create a new eSIM product and map it to your wholesale API.
          </p>
        </div>

        <a
          href="/admin/products"
          className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-white"
        >
          ← Back to Products
        </a>
      </div>

      <form
        action={createProduct}
        className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50 lg:grid-cols-2"
      >
        <div>
          <label className="mb-2 block font-semibold">Country</label>
          <input
            name="country"
            required
            placeholder="Europe, Spain, Italy..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Region</label>
          <input
            name="region"
            placeholder="Europe, Global, Asia..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Product Name</label>
          <input
            name="name"
            required
            placeholder="Europe Smart"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Data</label>
          <input
            name="data"
            required
            placeholder="5GB, 10GB, Unlimited..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Validity Days</label>
          <input
            name="validityDays"
            type="number"
            required
            placeholder="15"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Plan Type</label>
          <select
            name="planType"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="fixed">Fixed</option>
            <option value="unlimited_lite">Unlimited Lite</option>
            <option value="unlimited_essential">Unlimited Essential</option>
            <option value="unlimited_plus">Unlimited Plus</option>
            <option value="long_duration">Long Duration</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Usage Fit</label>
          <select
            name="usageFit"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="essential">Essential</option>
            <option value="everyday">Everyday</option>
            <option value="power">Power User</option>
            <option value="long_stay">Long Stay</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Role</label>
          <select
            name="role"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="main">Main Recommendation</option>
            <option value="upsell">Upsell</option>
            <option value="premium">Premium</option>
            <option value="fallback">Fallback</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Buy Price</label>
          <input
            name="buyPrice"
            type="number"
            step="0.01"
            required
            placeholder="1.17"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Sell Price</label>
          <input
            name="sellPrice"
            type="number"
            step="0.01"
            required
            placeholder="3.55"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Old Price</label>
          <input
            name="oldPrice"
            type="number"
            step="0.01"
            placeholder="5.99"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Provider</label>
          <input
            name="provider"
            defaultValue="Wholesale API"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block font-semibold">Provider Product ID</label>
          <input
            name="providerProductId"
            required
            placeholder="esim_5GB_15D_EU"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block font-semibold">Image URL</label>
          <input
            name="image"
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="lg:col-span-2">
          <label className="mb-2 block font-semibold">Description</label>
          <textarea
            name="description"
            required
            placeholder="Perfect for social media, WhatsApp calls, maps and everyday travel."
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="lg:col-span-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-5">
          <input
            name="active"
            type="checkbox"
            defaultChecked
            className="h-5 w-5"
          />
          <label className="font-semibold">Product is active</label>
        </div>

        <div className="lg:col-span-2 flex justify-end gap-3">
          <a
            href="/admin/products"
            className="rounded-2xl border border-slate-300 px-6 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </a>

          <button
            type="submit"
            className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            Save Product
          </button>
        </div>
      </form>
    </AdminShell>
  );
}