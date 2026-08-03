import { prisma } from "../lib/db";

type DestinationNetworkCoverageProps = {
  slug: string;
};

type StoredNetwork = {
  name?: unknown;
  speeds?: unknown;
};

export default async function DestinationNetworkCoverage({
  slug,
}: DestinationNetworkCoverageProps) {
  const destination = await prisma.destinationPage.findFirst({
    where: { slug, published: true },
    select: { displayName: true, countryName: true },
  });

  if (!destination) return null;

  const product = await prisma.product.findFirst({
    where: {
      active: true,
      isoCode: { not: null },
      OR: [
        { country: destination.countryName },
        { country: destination.displayName },
      ],
    },
    select: { isoCode: true },
  });

  if (!product?.isoCode) return null;

  let coverage: { networks: unknown; syncedAt: Date } | null = null;

  try {
    coverage = await prisma.countryNetworkCoverage.findUnique({
      where: { isoCode: product.isoCode },
      select: { networks: true, syncedAt: true },
    });
  } catch {
    return null;
  }

  const rawNetworks = Array.isArray(coverage?.networks)
    ? (coverage.networks as StoredNetwork[])
    : [];
  const networks = rawNetworks
    .map((network) => ({
      name: typeof network.name === "string" ? network.name.trim() : "",
      speeds: Array.isArray(network.speeds)
        ? network.speeds.filter(
            (speed): speed is string => typeof speed === "string",
          )
        : [],
    }))
    .filter((network) => network.name);

  if (networks.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-7 lg:px-8">
      <div className="rounded-[28px] border border-blue-100 bg-[#f5f8ff] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2852cc]">
              Local connectivity
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Partner networks in {destination.displayName}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Your eSIM automatically connects to an available supported network.
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
          Network availability, routing and speed vary by location, device and
          local conditions. Coverage information was last synchronized on{" "}
          {coverage?.syncedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}.
        </p>
      </div>
    </section>
  );
}
