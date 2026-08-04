import Image from "next/image";
import { destinationMapAliases } from "../lib/destination-map-registry";
import { getDestinationTravelEssentials } from "../lib/destination-travel-essentials";

type DestinationMapProps = {
  slug: string;
  destination: string;
};

export function hasDestinationMap(slug: string) {
  return Boolean(destinationMapAliases[slug]);
}

export default function DestinationMap({
  slug,
  destination,
}: DestinationMapProps) {
  const countryCode = destinationMapAliases[slug];
  if (!countryCode) return null;

  const essentials = getDestinationTravelEssentials(slug);
  const facts: Array<{ label: string; value: string }> = [
    {
      label: essentials?.referenceCity ? "Local" : "Destination",
      value: essentials?.referenceCity || destination,
    },
  ];

  if (essentials?.currencyCode) {
    facts.push({ label: "Currency", value: essentials.currencyCode });
  }

  if (essentials?.emergencyNumbers) {
    facts.push({ label: "Emergency", value: essentials.emergencyNumbers });
  }

  if (facts.length < 3) {
    facts.push({ label: "Delivery", value: "By email" });
  }

  if (facts.length < 3) {
    facts.push({ label: "Setup", value: "Fully digital" });
  }

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#eaf3f8] shadow-[0_24px_70px_rgba(15,43,76,0.16)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.95),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.22),rgba(196,221,233,0.3))]" />

      <Image
        alt={`Map showing ${destination}`}
        className="object-cover"
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 40vw"
        src={`/destination-maps/${countryCode.toLowerCase()}.svg`}
        unoptimized
      />

      <div className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#183b72] shadow-sm backdrop-blur-sm">
        {destination} · destination ready
      </div>

      <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/80 bg-white/92 shadow-[0_14px_34px_rgba(20,54,86,0.13)] backdrop-blur-md">
        {facts.slice(0, 3).map((fact, index) => (
          <div
            className={
              index < 2 ? "border-r border-[#dce7ed] px-3 py-3" : "px-3 py-3"
            }
            key={fact.label}
          >
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#788b9f]">
              {fact.label}
            </p>
            <p className="mt-1 truncate text-xs font-bold text-[#102a4c]">
              {fact.value}
            </p>
          </div>
        ))}
      </div>

      <p className="absolute bottom-[74px] right-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#577083]/70">
        Map data · Natural Earth
      </p>
    </div>
  );
}
