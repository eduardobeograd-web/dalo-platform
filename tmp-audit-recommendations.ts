import { buildRecommendation } from "./lib/recommendation";
import { prisma } from "./lib/db";

async function main() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    select: {
      country: true,
    },
    distinct: ["country"],
    orderBy: {
      country: "asc",
    },
  });

  const countries = products
    .map((product) => product.country)
    .filter(Boolean)
    .filter((country) => country.toLowerCase() !== "europe");

  const scenarios = [
    { days: "1-3", type: "essential", label: "3d essential" },
    { days: "1-3", type: "everyday", label: "3d everyday" },
    { days: "4-7", type: "everyday", label: "7d everyday" },
    { days: "8-14", type: "everyday", label: "14d everyday" },
    { days: "8-14", type: "power", label: "14d power" },
  ];

  for (const country of countries) {
    console.log(`\n=== ${country} ===`);

    for (const scenario of scenarios) {
      const result = await buildRecommendation({
        country,
        days: scenario.days,
        type: scenario.type,
      });

      const best = result.bestMatch
        ? `${result.bestMatch.data} €${result.bestMatch.sellPrice.toFixed(2)}`
        : "NO BEST";

      const comfort = result.comfortOption
        ? `${result.comfortOption.data} €${result.comfortOption.sellPrice.toFixed(2)}`
        : "—";

      const finalUpsell = result.upsellProduct
        ? `${result.upsellProduct.data} €${result.upsellProduct.sellPrice.toFixed(2)}`
        : "—";

      const offer = result.upsellOffer?.title || "No offer";

      console.log(
        `${scenario.label.padEnd(14)} | need ${String(
          result.minimumDataGb
        ).padEnd(3)}GB | best ${best.padEnd(14)} | comfort ${comfort.padEnd(
          14
        )} | final ${finalUpsell.padEnd(14)} | ${offer}`
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
