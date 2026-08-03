import { prisma } from "../lib/db";

type ProviderNetwork = {
  name?: unknown;
  brandName?: unknown;
  mcc?: unknown;
  mnc?: unknown;
  speed?: unknown;
};

type ProviderCountry = {
  name?: unknown;
  networks?: unknown;
};

async function main() {
  const apiKey = process.env.ESIM_GO_API_KEY;
  const baseUrl = (
    process.env.ESIM_GO_BASE_URL || "https://api.esim-go.com/v2.5"
  ).replace(/\/$/, "");

  if (!apiKey) throw new Error("ESIM_GO_API_KEY is not configured.");

  const response = await fetch(`${baseUrl}/networks?returnAll=true`, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Network sync failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    countryNetworks?: ProviderCountry[];
  };
  const countries = Array.isArray(payload.countryNetworks)
    ? payload.countryNetworks
    : [];
  let updatedCountries = 0;
  let storedNetworks = 0;

  for (const country of countries) {
    const isoCode =
      typeof country.name === "string" ? country.name.trim().toUpperCase() : "";
    const rawNetworks = Array.isArray(country.networks)
      ? (country.networks as ProviderNetwork[])
      : [];
    const networks = rawNetworks
      .map((network) => {
        const name =
          typeof network.brandName === "string" && network.brandName.trim()
            ? network.brandName.trim()
            : typeof network.name === "string"
              ? network.name.trim()
              : "";
        const speeds = Array.isArray(network.speed)
          ? network.speed.filter(
              (speed): speed is string => typeof speed === "string",
            )
          : [];

        return {
          name,
          mcc: typeof network.mcc === "string" ? network.mcc : null,
          mnc: typeof network.mnc === "string" ? network.mnc : null,
          speeds: Array.from(
            new Set(speeds.map((speed) => speed.toUpperCase())),
          ),
        };
      })
      .filter((network) => network.name);

    if (!/^[A-Z]{2}$/.test(isoCode) || networks.length === 0) continue;

    const product = await prisma.product.findFirst({
      where: { isoCode, provider: "eSIM Go" },
      select: { country: true },
    });

    await prisma.countryNetworkCoverage.upsert({
      where: { isoCode },
      update: {
        countryName: product?.country || isoCode,
        networks,
        syncedAt: new Date(),
      },
      create: {
        isoCode,
        countryName: product?.country || isoCode,
        networks,
        syncedAt: new Date(),
      },
    });

    updatedCountries += 1;
    storedNetworks += networks.length;
  }

  console.log(JSON.stringify({ updatedCountries, storedNetworks }));
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
