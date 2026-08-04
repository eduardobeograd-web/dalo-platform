import {
  destinationMapAliases,
  destinationMapCountries,
} from "../lib/destination-map-data";
import { getDestinationTravelEssentials } from "../lib/destination-travel-essentials";

type DestinationMapProps = {
  slug: string;
  destination: string;
};

function getViewBox(bounds: [number, number, number, number]) {
  const [minX, minY, maxX, maxY] = bounds;
  const countryWidth = Math.max(maxX - minX, 1);
  const countryHeight = Math.max(maxY - minY, 1);
  const width = Math.min(Math.max(countryWidth * 2.4, 210), 560);
  const height = Math.min(Math.max(countryHeight * 2.2, 170), 350);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    value: `${centerX - width / 2} ${centerY - height / 2} ${width} ${height}`,
    width,
  };
}

export function hasDestinationMap(slug: string) {
  return Boolean(destinationMapAliases[slug]);
}

export default function DestinationMap({
  slug,
  destination,
}: DestinationMapProps) {
  const countryCode = destinationMapAliases[slug];
  const country = destinationMapCountries.find(
    (candidate) => candidate.code === countryCode,
  );

  if (!country) return null;

  const essentials = getDestinationTravelEssentials(slug);
  const viewBox = getViewBox(country.bounds);
  const markerRadius = Math.max(viewBox.width / 90, 2.4);
  const city = essentials?.referenceCity || destination;
  const currency = essentials?.currencyCode || "Local currency";
  const emergency = essentials?.emergencyNumbers || "Check locally";

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#eaf3f8] shadow-[0_24px_70px_rgba(15,43,76,0.16)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.95),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.22),rgba(196,221,233,0.3))]" />

      <svg
        aria-label={`Map showing ${destination}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        viewBox={viewBox.value}
      >
        <g
          fill="#d5e4eb"
          stroke="#f8fbfc"
          strokeLinejoin="round"
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
        >
          {destinationMapCountries.map((candidate) => (
            <path d={candidate.path} key={candidate.code} />
          ))}
        </g>
        <path
          d={country.path}
          fill="#234fc7"
          stroke="#ffffff"
          strokeLinejoin="round"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={country.marker[0]}
          cy={country.marker[1]}
          fill="rgba(238,140,63,0.24)"
          r={markerRadius * 2.5}
        />
        <circle
          cx={country.marker[0]}
          cy={country.marker[1]}
          fill="#ee8c3f"
          r={markerRadius}
          stroke="#ffffff"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="absolute left-5 top-5 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#183b72] shadow-sm backdrop-blur-sm">
        {destination} · destination ready
      </div>

      <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/80 bg-white/92 shadow-[0_14px_34px_rgba(20,54,86,0.13)] backdrop-blur-md">
        <div className="border-r border-[#dce7ed] px-3 py-3">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#788b9f]">
            Local
          </p>
          <p className="mt-1 truncate text-xs font-bold text-[#102a4c]">{city}</p>
        </div>
        <div className="border-r border-[#dce7ed] px-3 py-3">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#788b9f]">
            Currency
          </p>
          <p className="mt-1 truncate text-xs font-bold text-[#102a4c]">
            {currency}
          </p>
        </div>
        <div className="px-3 py-3">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#788b9f]">
            Emergency
          </p>
          <p className="mt-1 truncate text-xs font-bold text-[#102a4c]">
            {emergency}
          </p>
        </div>
      </div>

      <p className="absolute bottom-[74px] right-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#577083]/70">
        Map data · Natural Earth
      </p>
    </div>
  );
}
