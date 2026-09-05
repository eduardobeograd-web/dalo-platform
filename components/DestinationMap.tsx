import Image from "next/image";
import DestinationNetworkHeroBadge, {
  type DestinationSupportedNetwork,
} from "./DestinationNetworkHeroBadge";
import { destinationMapAliases } from "../lib/destination-map-registry";

type DestinationMapProps = {
  slug: string;
  destination: string;
  networks?: DestinationSupportedNetwork[];
};

export function hasDestinationMap(slug: string) {
  return Boolean(destinationMapAliases[slug]);
}

export default function DestinationMap({
  slug,
  destination,
  networks = [],
}: DestinationMapProps) {
  const countryCode = destinationMapAliases[slug];
  if (!countryCode) return null;

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

      <DestinationNetworkHeroBadge networks={networks} />

      <p className="absolute bottom-[58px] right-5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#577083]/70">
        Map data · Natural Earth
      </p>
    </div>
  );
}
