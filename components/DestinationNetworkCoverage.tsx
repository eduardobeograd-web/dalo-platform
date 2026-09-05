import type { DestinationSupportedNetwork } from "./DestinationNetworkHeroBadge";

type DestinationNetworkCoverageProps = {
  destination: string;
  networks: DestinationSupportedNetwork[];
  syncedAt: Date | null;
};

export default function DestinationNetworkCoverage({
  destination,
  networks,
  syncedAt,
}: DestinationNetworkCoverageProps) {
  if (networks.length === 0) return null;

  return (
    <section
      aria-labelledby="destination-supported-networks"
      className="mt-6 sm:mt-10"
    >
      <div className="rounded-[2rem] border border-blue-200 bg-[#f5f8ff] p-5 shadow-[0_16px_40px_rgba(33,72,192,0.08)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2852cc]">
              eSIM Go network coverage
            </p>
            <h2
              id="destination-supported-networks"
              className="mt-2 text-2xl font-bold tracking-tight text-slate-950"
            >
              Supported mobile networks in {destination}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Your eSIM automatically connects to an available supported operator.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {networks.map((network) => (
            <div
              key={network.name}
              className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-900">{network.name}</span>
              {network.speeds.length > 0 ? (
                <span className="text-xs font-bold text-slate-500">
                  {network.speeds.join(" / ")}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Operator availability, routing and speed can vary by location, device
          and local conditions. Official eSIM Go network data was last synchronized on{" "}
          {syncedAt?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }) || "recently"}.
        </p>
      </div>
    </section>
  );
}
