import Link from "next/link";
import AdminShell from "../../../../components/AdminShell";
import { getDestinationSeoIssues } from "../../../../lib/catalog-readiness";
import { parseDestinationFaq } from "../../../../lib/destination-pages";
import { prisma } from "../../../../lib/db";
import { getSeoLandingPage } from "../../../../lib/seo-pages";
import { updateDestinationPage } from "./actions";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EditDestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    country?: string | string[];
    saved?: string | string[];
  }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const page = await prisma.destinationPage.findUnique({ where: { slug } });
  const fallback = getSeoLandingPage(slug);
  const countryName =
    page?.countryName || first(query.country) || fallback?.name || slug;
  const displayName = page?.displayName || fallback?.name || countryName;
  const faqs = page ? parseDestinationFaq(page.faq) : fallback?.faq || [];
  const save = updateDestinationPage.bind(null, slug);
  const contentIssues = page
    ? getDestinationSeoIssues(page)
    : ["Save the page before running the complete editorial check"];
  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white";

  return (
    <AdminShell activePage="destinations">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
            Country page editor
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            {displayName}
          </h1>
          <p className="mt-2 font-mono text-sm text-slate-500">
            /esim/{slug}
          </p>
          <div className="mt-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-800">
            Target keyword: eSIM for {displayName}
          </div>
        </div>
        <div className="flex gap-3">
          {page?.published ? (
            <Link
              href={`/esim/${slug}`}
              target="_blank"
              className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700"
            >
              Open page
            </Link>
          ) : null}
          <Link
            href="/admin/destinations"
            className="rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Back
          </Link>
        </div>
      </div>

      {first(query.saved) ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-bold text-emerald-800">
          Country page saved.
        </div>
      ) : null}

      <section
        className={`mb-6 rounded-2xl border p-5 ${
          contentIssues.length
            ? "border-amber-200 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={`text-sm font-black uppercase tracking-wide ${contentIssues.length ? "text-amber-800" : "text-emerald-800"}`}>
              {!page?.published
                ? "Not published"
                : contentIssues.length
                  ? "Needs work"
                  : "Complete"}
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              {contentIssues.length
                ? `${contentIssues.length} items need attention`
                : "This country page passes the current checks"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Keep the title, introduction, network guidance and FAQ specific to
              this destination. Draft text is only a starting point.
            </p>
          </div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
            {!page?.published ? "Not published" : contentIssues.length ? "Needs work" : "Complete"}
          </span>
        </div>
        {contentIssues.length ? (
          <ul className="mt-4 grid gap-2 text-sm font-semibold text-amber-950 md:grid-cols-2">
            {contentIssues.map((issue) => (
              <li key={issue} className="rounded-xl bg-white/70 px-4 py-3">
                {issue}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <form action={save} className="space-y-6">
        <section className="grid gap-5 rounded-[2rem] bg-white p-7 shadow-sm lg:grid-cols-2">
          <div>
            <label className="mb-2 block font-bold">Product country name</label>
            <input
              name="countryName"
              defaultValue={countryName}
              required
              className={inputClass}
            />
            <p className="mt-2 text-xs text-slate-500">
              Must match the country stored on products.
            </p>
          </div>
          <div>
            <label className="mb-2 block font-bold">Public display name</label>
            <input
              name="displayName"
              defaultValue={displayName}
              required
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-2 block font-bold">SEO title</label>
            <input
              name="seoTitle"
              defaultValue={
                page?.seoTitle ||
                fallback?.title ||
                `${displayName} eSIM | Prepaid Travel Data Plans | DALO`
              }
              required
              maxLength={70}
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-2 block font-bold">Meta description</label>
            <textarea
              name="seoDescription"
              defaultValue={
                page?.seoDescription ||
                fallback?.description ||
                `Find eSIM plans for ${displayName} with clear data, validity and pricing.`
              }
              required
              maxLength={170}
              rows={3}
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-2 block font-bold">Page headline</label>
            <input
              name="headline"
              defaultValue={
                page?.headline ||
                fallback?.headline ||
                `Find the right eSIM for ${displayName}`
              }
              required
              className={inputClass}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-2 block font-bold">Introduction</label>
            <textarea
              name="intro"
              defaultValue={
                page?.intro ||
                fallback?.intro ||
                `Compare available eSIM plans for ${displayName} and find a clear match for your trip.`
              }
              required
              rows={5}
              className={inputClass}
            />
          </div>
        </section>

        <section className="grid gap-5 rounded-[2rem] bg-white p-7 shadow-sm lg:grid-cols-2">
          <div>
            <label className="mb-2 block font-bold">Hero image URL</label>
            <input
              name="heroImage"
              defaultValue={page?.heroImage || ""}
              placeholder="/travel/thailand.jpg"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-2 block font-bold">Image alt text</label>
            <input
              name="heroImageAlt"
              defaultValue={page?.heroImageAlt || ""}
              placeholder={`Travel destination in ${displayName}`}
              className={inputClass}
            />
          </div>
          {([
            ["coverageText", "Coverage and local networks", page?.coverageText],
            ["activationText", "Activation information", page?.activationText],
            [
              "compatibilityText",
              "Device compatibility",
              page?.compatibilityText,
            ],
            ["hotspotText", "Hotspot and tethering", page?.hotspotText],
          ] satisfies [string, string, string | null | undefined][]).map(
            ([name, label, current]) => (
            <div key={name}>
              <label className="mb-2 block font-bold">{label}</label>
              <textarea
                name={name}
                defaultValue={current || ""}
                rows={4}
                className={inputClass}
              />
            </div>
            ),
          )}
        </section>

        <section className="rounded-[2rem] bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-black">Country FAQ</h2>
          <div className="mt-5 space-y-5">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl bg-slate-50 p-5 lg:grid-cols-2"
              >
                <input
                  name={`faqQuestion${index}`}
                  defaultValue={faqs[index]?.question || ""}
                  placeholder={`Question ${index + 1}`}
                  className={inputClass}
                />
                <textarea
                  name={`faqAnswer${index}`}
                  defaultValue={faqs[index]?.answer || ""}
                  placeholder="Answer"
                  rows={3}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-7 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex items-start gap-3 rounded-2xl bg-blue-50 p-5">
              <input
                name="planFinderEnabled"
                type="checkbox"
                defaultChecked={page?.planFinderEnabled ?? true}
                className="mt-1 h-5 w-5"
              />
              <span>
                <span className="block font-black">Show compact plan finder</span>
                <span className="mt-1 block text-sm text-slate-500">
                  Lets travelers get a recommendation without choosing this destination again.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-5">
              <input
                name="published"
                type="checkbox"
                defaultChecked={page?.published || false}
                className="mt-1 h-5 w-5"
              />
              <span>
                <span className="block font-black">Publish page</span>
                <span className="mt-1 block text-sm text-slate-500">
                  Makes the page publicly available.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-5">
              <input
                name="indexable"
                type="checkbox"
                defaultChecked={page?.indexable || false}
                className="mt-1 h-5 w-5"
              />
              <span>
                <span className="block font-black">Allow Google indexing</span>
                <span className="mt-1 block text-sm text-slate-500">
                  Enable only after the content is complete and verified.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="rounded-2xl bg-blue-700 px-8 py-4 font-black text-white shadow-lg shadow-blue-200">
              Save country page
            </button>
          </div>
        </section>
      </form>
    </AdminShell>
  );
}
