import { revalidatePath } from "next/cache";
import AdminShell from "../../../components/AdminShell";
import { getRecommendationRulesPreview } from "../../../lib/recommendation";
import { prisma } from "../../../lib/db";
import {
  getRecommendationSettings,
  parseSettingNumber,
  updateRecommendationSettingById,
} from "../../../lib/recommendation-settings";
import { ADMIN_PERMISSIONS } from "../../../lib/admin-permissions";
import { requireAdminPermission } from "../../../lib/admin-auth";

function formatPrice(value: number | null | undefined) {
  if (typeof value !== "number") return "—";
  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number") return "—";
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function getPlanText(product: {
  data: string;
  validityDays: number;
} | null | undefined) {
  if (!product) return "—";
  return `${product.data} / ${product.validityDays} Days`;
}

function SmallPlanBox({
  label,
  product,
}: {
  label: string;
  product:
    | {
        name: string;
        data: string;
        validityDays: number;
        sellPrice: number;
      }
    | null
    | undefined;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-sm font-bold text-slate-950">
        {product ? product.name : "—"}
      </div>

      <div className="mt-1 text-sm text-slate-600">
        {product ? getPlanText(product) : "No product"}
      </div>

      <div className="mt-2 text-sm font-black text-blue-700">
        {product ? formatPrice(product.sellPrice) : "—"}
      </div>
    </div>
  );
}

async function updateRecommendationSetting(formData: FormData) {
  "use server";
  await requireAdminPermission(ADMIN_PERMISSIONS.RECOMMENDATIONS_WRITE);

  const id = String(formData.get("id") || "");
  const gbPerDay = parseSettingNumber(formData.get("gbPerDay"));
  const minimumGb = parseSettingNumber(formData.get("minimumGb"));
  const maxBestMatchMultiple = parseSettingNumber(
    formData.get("maxBestMatchMultiple")
  );
  const budgetMinNeedMultiple = parseSettingNumber(
    formData.get("budgetMinNeedMultiple")
  );
  const comfortMinNeedMultiple = parseSettingNumber(
    formData.get("comfortMinNeedMultiple")
  );
  const heavyMinGb = parseSettingNumber(formData.get("heavyMinGb"));

  if (
    !id ||
    gbPerDay === null ||
    minimumGb === null ||
    maxBestMatchMultiple === null ||
    budgetMinNeedMultiple === null ||
    comfortMinNeedMultiple === null ||
    heavyMinGb === null
  ) {
    throw new Error("Invalid recommendation setting form data");
  }

  await updateRecommendationSettingById({
    id,
    gbPerDay,
    minimumGb,
    maxBestMatchMultiple,
    budgetMinNeedMultiple,
    comfortMinNeedMultiple,
    heavyMinGb,
  });

  revalidatePath("/admin/recommendations");
  revalidatePath("/result");
}

export default async function RecommendationsPage() {
  const [rules, settings, products] = await Promise.all([
    getRecommendationRulesPreview(),
    getRecommendationSettings(),
    prisma.product.findMany({
      where: {
        active: true,
      },
    }),
  ]);

  const connectedRules = rules.filter((rule) => rule.recommendedProduct).length;
  const upsellRules = rules.filter((rule) => rule.upsellProduct).length;

  return (
    <AdminShell activePage="recommendations">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Recommendations
          </h1>

          <p className="mt-2 max-w-3xl text-slate-600">
            Control how DALO calculates Best Match and Smart Upgrade offers.
            These values are stored in the database, not hard-coded in the UI.
          </p>
        </div>

        <a
          href="/admin/products"
          className="rounded-2xl bg-blue-600 px-6 py-4 text-center font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
        >
          Manage Products
        </a>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Usage Settings
          </p>
          <h2 className="mt-3 text-3xl font-bold">{settings.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            Active Products
          </p>
          <h2 className="mt-3 text-3xl font-bold">{products.length}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">
            With Best Match
          </p>
          <h2 className="mt-3 text-3xl font-bold">{connectedRules}</h2>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg shadow-blue-50">
          <p className="text-sm font-semibold text-slate-500">With Upsell</p>
          <h2 className="mt-3 text-3xl font-bold">{upsellRules}</h2>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-2xl font-bold text-slate-950">
            Editable Recommendation Criteria
          </h2>

          <p className="mt-1 text-slate-600">
            Change these values to tune Best Match and Smart Upgrade logic
            without editing code.
          </p>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-3">
          {settings.map((setting) => (
            <form
              key={setting.id}
              action={updateRecommendationSetting}
              className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5"
            >
              <input type="hidden" name="id" value={setting.id} />

              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-wide text-blue-600">
                    {setting.usageType}
                  </div>

                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    {setting.label}
                  </h3>
                </div>

                <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                  Active
                </div>
              </div>

              <div className="grid gap-4">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    GB per day
                  </span>
                  <input
                    name="gbPerDay"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={setting.gbPerDay}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none ring-blue-200 focus:ring-4"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Minimum GB
                  </span>
                  <input
                    name="minimumGb"
                    type="number"
                    step="0.5"
                    min="0"
                    defaultValue={setting.minimumGb}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none ring-blue-200 focus:ring-4"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Max Best Match Overkill
                  </span>
                  <input
                    name="maxBestMatchMultiple"
                    type="number"
                    step="0.1"
                    min="1"
                    defaultValue={setting.maxBestMatchMultiple}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none ring-blue-200 focus:ring-4"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Example: 2.5 means Best Match should not be more than 2.5×
                    the raw estimated need.
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Budget Minimum Need Multiple
                  </span>
                  <input
                    name="budgetMinNeedMultiple"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={setting.budgetMinNeedMultiple}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none ring-blue-200 focus:ring-4"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Internal only. Budget is not shown to customers.
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Comfort Upsell Multiple
                  </span>
                  <input
                    name="comfortMinNeedMultiple"
                    type="number"
                    step="0.1"
                    min="1"
                    defaultValue={setting.comfortMinNeedMultiple}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none ring-blue-200 focus:ring-4"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Used for offers like “Get 10GB more for only $4 extra”.
                  </span>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Heavy Upsell Min GB
                  </span>
                  <input
                    name="heavyMinGb"
                    type="number"
                    step="1"
                    min="0"
                    defaultValue={setting.heavyMinGb}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none ring-blue-200 focus:ring-4"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                Save {setting.label}
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {rules.map((rule) => (
            <div
              key={`${rule.country}-${rule.tripLength}-${rule.userType}`}
              className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-50"
            >
              <div className="border-b border-slate-100 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                        {rule.country}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                        {rule.tripLength}
                      </span>

                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                        {rule.userType}
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-slate-950">
                      {rule.recommendedProduct?.name || "No product found"}
                    </h2>

                    <p className="mt-1 text-slate-600">
                      Raw estimate:{" "}
                      <strong>{formatNumber(rule.rawEstimatedDataGb)}GB</strong>{" "}
                      · Rounded need:{" "}
                      <strong>{rule.minimumDataGb}GB</strong> · Max Best Match:{" "}
                      <strong>
                        {formatNumber(rule.maxReasonableBestDataGb)}GB
                      </strong>
                    </p>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                    {rule.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                <SmallPlanBox
                  label="Best Match"
                  product={rule.recommendedProduct}
                />

                <SmallPlanBox
                  label="Budget Internal"
                  product={rule.budgetOption}
                />

                <SmallPlanBox
                  label="Comfort Upsell"
                  product={rule.comfortOption}
                />

                <SmallPlanBox
                  label="Heavy Data"
                  product={rule.heavyDataOption}
                />

                <SmallPlanBox
                  label="Regional Upsell"
                  product={rule.regionalUpsell}
                />

                <div className="rounded-2xl border-2 border-blue-500 bg-blue-50 p-4">
                  <div className="text-xs font-black uppercase tracking-wide text-blue-700">
                    Final Customer Upsell
                  </div>

                  <div className="mt-2 text-sm font-black text-slate-950">
                    {rule.upsellOffer
                      ? rule.upsellOffer.title
                      : "No upsell offer"}
                  </div>

                  <div className="mt-2 text-sm text-slate-600">
                    {rule.upsellProduct
                      ? `${rule.upsellProduct.name} · ${getPlanText(
                          rule.upsellProduct
                        )} · ${formatPrice(rule.upsellProduct.sellPrice)}`
                      : "No upsell selected"}
                  </div>

                  {rule.upsellOffer && (
                    <div className="mt-3 rounded-xl bg-white p-3 text-xs font-semibold text-slate-600">
                      {rule.upsellOffer.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold">Current Logic</h2>

            <p className="mt-2 text-slate-300">
              DALO now calculates recommendations from backend settings.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Best Match</div>
                <div className="mt-1 font-bold">
                  Fit first, price second, no absurd overkill
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Customer Upsell</div>
                <div className="mt-1 font-bold">
                  Concrete upgrade offer, not a random expensive plan
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-sm text-slate-400">Budget</div>
                <div className="mt-1 font-bold">
                  Internal only. Not shown on result page.
                </div>
              </div>

              <div className="rounded-2xl bg-blue-600 p-4">
                <div className="text-sm text-blue-100">Example</div>
                <div className="mt-1 font-bold">
                  “Get 10GB more for only $4 extra”
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-50">
            <h2 className="text-2xl font-bold text-slate-950">
              Recommended Start Values
            </h2>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">
                <strong>Essential:</strong> 0.5GB/day, minimum 1GB
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <strong>Everyday:</strong> 1.0GB/day, minimum 3GB
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <strong>Power:</strong> 2.0GB/day, minimum 5GB
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
