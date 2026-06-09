import { prisma } from "../../../../../lib/db";
import { deactivateProduct, updateProduct } from "./actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F6F8FF] p-10 text-slate-900">
        <div className="rounded-[2rem] bg-white p-10 shadow-xl">
          <h1 className="text-3xl font-bold">Product not found</h1>
          <a
            href="/admin/products"
            className="mt-6 inline-block rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white"
          >
            Back to Products
          </a>
        </div>
      </main>
    );
  }

  const updateProductWithId = updateProduct.bind(null, product.id);
  const deactivateProductWithId = deactivateProduct.bind(null, product.id);

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
                Edit Product
              </h1>

              <p className="mt-2 text-slate-600">
                Update product pricing, API mapping and recommendation settings.
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
            action={updateProductWithId}
            className="grid gap-6 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50 lg:grid-cols-2"
          >
            <div>
              <label className="mb-2 block font-semibold">Country</label>
              <input
                name="country"
                defaultValue={product.country}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Region</label>
              <input
                name="region"
                defaultValue={product.region || ""}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Product Name</label>
              <input
                name="name"
                defaultValue={product.name}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Data</label>
              <input
                name="data"
                defaultValue={product.data}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Validity Days</label>
              <input
                name="validityDays"
                type="number"
                defaultValue={product.validityDays}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Plan Type</label>
              <select
                name="planType"
                defaultValue={product.planType}
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
                defaultValue={product.usageFit}
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
                defaultValue={product.role}
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
                defaultValue={product.buyPrice}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Sell Price</label>
              <input
                name="sellPrice"
                type="number"
                step="0.01"
                defaultValue={product.sellPrice}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Old Price</label>
              <input
                name="oldPrice"
                type="number"
                step="0.01"
                defaultValue={product.oldPrice || ""}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Provider</label>
              <input
                name="provider"
                defaultValue={product.provider}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block font-semibold">
                Provider Product ID
              </label>
              <input
                name="providerProductId"
                defaultValue={product.providerProductId}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block font-semibold">Image URL</label>
              <input
                name="image"
                defaultValue={product.image}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block font-semibold">Description</label>
              <textarea
                name="description"
                defaultValue={product.description}
                required
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-5">
              <input
                name="active"
                type="checkbox"
                defaultChecked={product.active}
                className="h-5 w-5"
              />
              <label className="font-semibold">Product is active</label>
            </div>

            <div className="lg:col-span-2 flex flex-col justify-between gap-3 md:flex-row">
             
            <button
                formAction={deactivateProductWithId}
                className="rounded-2xl border border-red-200 px-6 py-4 font-bold text-red-600 transition hover:bg-red-50"
                >
                Deactivate Product
            </button>


              <div className="flex gap-3">
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
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}