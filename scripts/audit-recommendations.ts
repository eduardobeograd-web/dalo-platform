import { prisma } from "../lib/db";
import {
  buildRecommendation,
  parseDataGb,
} from "../lib/recommendation";

type AuditProduct = Awaited<ReturnType<typeof prisma.product.findMany>>[number];
type AuditSetting = Awaited<
  ReturnType<typeof prisma.recommendationSetting.findMany>
>[number];

const durations = [
  { value: "1-3", days: 3 },
  { value: "4-7", days: 7 },
  { value: "8-11", days: 11 },
  { value: "12-15", days: 15 },
  { value: "16-21", days: 21 },
  { value: "22-30", days: 30 },
];

const usageTypes = ["essential", "everyday", "power"] as const;

function effectiveDataGb(product: Pick<AuditProduct, "data">) {
  return parseDataGb(product.data) ?? 999;
}

function matchesDestination(product: AuditProduct, destination: string) {
  const target = destination.trim().toLowerCase();
  return (
    product.country.trim().toLowerCase() === target ||
    product.region?.trim().toLowerCase() === target
  );
}

function scenarioLabel(destination: string, duration: string, usage: string) {
  return `${destination} | ${duration} | ${usage}`;
}

async function main() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: [{ country: "asc" }, { validityDays: "asc" }, { sellPrice: "asc" }],
    }),
    prisma.recommendationSetting.findMany({ orderBy: { gbPerDay: "asc" } }),
  ]);

  const settingsByType = new Map(settings.map((setting) => [setting.usageType, setting]));
  const recommendationDelegate = prisma.recommendationSetting as unknown as {
    upsert: (args: { where: { usageType: string }; create: AuditSetting }) => Promise<AuditSetting>;
    findUnique: (args: { where: { usageType: string } }) => Promise<AuditSetting | null>;
  };
  const productDelegate = prisma.product as unknown as {
    findMany: () => Promise<AuditProduct[]>;
  };

  recommendationDelegate.upsert = async ({ where, create }) =>
    settingsByType.get(where.usageType) || create;
  recommendationDelegate.findUnique = async ({ where }) =>
    settingsByType.get(where.usageType) || null;
  productDelegate.findMany = async () => products;

  const destinations = [
    ...new Set(
      products.flatMap((product) =>
        product.region ? [product.country, product.region] : [product.country],
      ),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const issues = {
    noRecommendation: [] as string[],
    recommendationBelowNeed: [] as string[],
    recommendationValidityTooShort: [] as string[],
    recommendationNegativeMargin: [] as string[],
    missingUpsell: [] as string[],
    upsellNotMoreData: [] as string[],
    upsellNotNextTier: [] as string[],
    upsellExpensive: [] as string[],
  };

  let scenarios = 0;
  let recommendations = 0;
  let upsells = 0;

  for (const destination of destinations) {
    const destinationProducts = products.filter((product) =>
      matchesDestination(product, destination),
    );

    for (const duration of durations) {
      for (const usage of usageTypes) {
        scenarios += 1;
        const label = scenarioLabel(destination, duration.value, usage);
        const result = await buildRecommendation({
          country: destination,
          days: duration.value,
          type: usage,
        });
        const best = result.bestMatch;
        const upsell = result.upsellProduct;

        if (!best) {
          issues.noRecommendation.push(label);
          continue;
        }

        recommendations += 1;
        const bestData = effectiveDataGb(best);

        if (best.validityDays < duration.days) {
          issues.recommendationValidityTooShort.push(
            `${label} -> ${best.name}`,
          );
        }
        if (bestData < result.minimumDataGb) {
          issues.recommendationBelowNeed.push(
            `${label} -> ${best.data}, need ${result.minimumDataGb}GB`,
          );
        }
        if (best.sellPrice <= best.buyPrice) {
          issues.recommendationNegativeMargin.push(
            `${label} -> ${best.name} ($${best.buyPrice} / $${best.sellPrice})`,
          );
        }

        const higherCandidates = destinationProducts
          .filter(
            (product) =>
              product.id !== best.id &&
              product.validityDays >= duration.days &&
              effectiveDataGb(product) > bestData &&
              product.sellPrice > best.sellPrice,
          )
          .sort((a, b) => {
            const dataDifference = effectiveDataGb(a) - effectiveDataGb(b);
            return dataDifference || a.sellPrice - b.sellPrice;
          });

        const expectedNextTier = higherCandidates[0] || null;

        if (!upsell) {
          if (expectedNextTier) {
            issues.missingUpsell.push(
              `${label} -> ${best.data}, next ${expectedNextTier.data}`,
            );
          }
          continue;
        }

        upsells += 1;
        const upsellData = effectiveDataGb(upsell);
        if (upsellData <= bestData) {
          issues.upsellNotMoreData.push(
            `${label} -> ${best.data} to ${upsell.data}`,
          );
        }
        if (
          expectedNextTier &&
          upsellData > effectiveDataGb(expectedNextTier)
        ) {
          issues.upsellNotNextTier.push(
            `${label} -> offered ${upsell.data}, next is ${expectedNextTier.data}`,
          );
        }

        const priceDifference = upsell.sellPrice - best.sellPrice;
        const attractiveLimit = Math.min(
          12,
          Math.max(5, best.sellPrice * 0.45),
        );
        if (priceDifference > attractiveLimit) {
          issues.upsellExpensive.push(
            `${label} -> +$${priceDifference.toFixed(2)} (${best.data} to ${upsell.data})`,
          );
        }
      }
    }
  }

  const priceInversions = products
    .flatMap((product) => {
      const data = effectiveDataGb(product);
      const cheaperHigher = products.find(
        (candidate) =>
          candidate.id !== product.id &&
          matchesDestination(candidate, product.country) &&
          candidate.validityDays >= product.validityDays &&
          effectiveDataGb(candidate) > data &&
          candidate.sellPrice <= product.sellPrice,
      );
      return cheaperHigher
        ? [`${product.country}: ${product.data} $${product.sellPrice.toFixed(2)} -> ${cheaperHigher.data} $${cheaperHigher.sellPrice.toFixed(2)}`]
        : [];
    })
    .slice(0, 30);

  const issueCounts = Object.fromEntries(
    Object.entries(issues).map(([key, values]) => [key, values.length]),
  );

  console.log(
    JSON.stringify(
      {
        auditedAt: new Date().toISOString(),
        activeProducts: products.length,
        destinations: destinations.length,
        scenarios,
        recommendations,
        upsells,
        recommendationCoveragePercent: Number(
          ((recommendations / scenarios) * 100).toFixed(1),
        ),
        upsellCoveragePercent: Number(
          ((upsells / Math.max(1, recommendations)) * 100).toFixed(1),
        ),
        settings: settings.map((setting) => ({
          usageType: setting.usageType,
          gbPerDay: setting.gbPerDay,
          minimumGb: setting.minimumGb,
          maxBestMatchMultiple: setting.maxBestMatchMultiple,
          comfortMinNeedMultiple: setting.comfortMinNeedMultiple,
          heavyMinGb: setting.heavyMinGb,
          active: setting.active,
        })),
        issueCounts,
        examples: Object.fromEntries(
          Object.entries(issues).map(([key, values]) => [key, values.slice(0, 12)]),
        ),
        priceInversions,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
