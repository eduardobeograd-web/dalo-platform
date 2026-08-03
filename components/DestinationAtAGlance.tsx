import LocalDestinationTime from "./LocalDestinationTime";
import {
  getDestinationTravelEssentials,
  getUsdExchangeRate,
} from "../lib/destination-travel-essentials";

type DestinationAtAGlanceProps = {
  slug: string;
};

function formatRate(rate: number) {
  if (rate >= 1_000) return Math.round(rate).toLocaleString("en-US");
  if (rate >= 100) return rate.toFixed(1);
  if (rate >= 10) return rate.toFixed(2);
  return rate.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export default async function DestinationAtAGlance({
  slug,
}: DestinationAtAGlanceProps) {
  const essentials = getDestinationTravelEssentials(slug);

  if (!essentials) return null;

  const exchangeRate = essentials.currencyCode
    ? await getUsdExchangeRate(essentials.currencyCode)
    : null;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-7 lg:px-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-2 border-b border-slate-100 bg-gradient-to-r from-[#f2f7ff] via-white to-[#fff8ee] px-6 py-5 sm:flex-row sm:items-end sm:justify-between lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2852cc]">
              Connected arrival essentials
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              {essentials.destination} at a glance
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Useful details to check before you land, alongside your DALO eSIM.
          </p>
        </div>

        <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
          <div className="px-6 py-5 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Local time
            </p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              <LocalDestinationTime timeZone={essentials.timeZone} />
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {essentials.referenceCity}
              {essentials.multipleTimeZones ? " reference time" : ""}
            </p>
          </div>

          <div className="px-6 py-5 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Currency
            </p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {essentials.currencyName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {essentials.currencyCode ?? "Several local currencies"}
            </p>
          </div>

          <div className="px-6 py-5 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              USD guide rate
            </p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {exchangeRate && essentials.currencyCode
                ? `1 USD ≈ ${formatRate(exchangeRate.rate)} ${essentials.currencyCode}`
                : "Check the latest local rate"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Indicative rate
              {exchangeRate?.date ? ` · Updated ${exchangeRate.date}` : ""}
            </p>
          </div>

          <div className="px-6 py-5 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-700">
              Emergency
            </p>
            <p className="mt-2 text-lg font-bold tracking-wide text-slate-950">
              {essentials.emergencyNumbers}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
              <span>{essentials.emergencyLabel}</span>
              <a
                className="font-semibold text-[#2852cc] underline decoration-blue-200 underline-offset-2 transition hover:text-blue-800"
                href={essentials.emergencySourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Official source
              </a>
            </div>
          </div>
        </div>

        <p className="border-t border-slate-100 px-6 py-3 text-xs leading-5 text-slate-500 lg:px-8">
          Times, rates and emergency details are travel guidance. Check local
          instructions when you arrive; large destinations may use several time
          zones, and card or cash rates can differ.
        </p>
      </div>
    </section>
  );
}
