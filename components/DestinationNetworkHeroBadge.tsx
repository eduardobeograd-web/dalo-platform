export type DestinationSupportedNetwork = {
  name: string;
  speeds: string[];
};

export default function DestinationNetworkHeroBadge({
  networks,
}: {
  networks: DestinationSupportedNetwork[];
}) {
  if (networks.length === 0) return null;

  const visibleNetworks = networks.slice(0, 3);
  const remainingCount = networks.length - visibleNetworks.length;
  const speeds = Array.from(
    new Set(networks.flatMap((network) => network.speeds)),
  );

  return (
    <a
      href="#destination-supported-networks"
      aria-label="View all supported mobile networks"
      className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-white/70 bg-[#102a4c]/92 px-3 py-2.5 text-white shadow-lg backdrop-blur-md transition hover:bg-[#173b68]"
    >
      <span className="min-w-0">
        <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-blue-200">
          Supported networks
        </span>
        <span className="mt-0.5 block truncate text-xs font-bold">
          {visibleNetworks.map((network) => network.name).join(" · ")}
          {remainingCount > 0 ? ` · +${remainingCount}` : ""}
        </span>
      </span>
      {speeds.length > 0 ? (
        <span className="shrink-0 rounded-lg bg-white/15 px-2 py-1 text-[10px] font-black">
          {speeds.join(" / ")}
        </span>
      ) : null}
    </a>
  );
}
