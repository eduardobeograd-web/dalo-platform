import { prisma } from "./db";

type RecommendationInput = {
  country?: string;
  days?: string;
  type?: string;
};

function parseDays(days?: string) {
  if (!days) return 14;

  if (days === "1-7") return 7;
  if (days === "8-14") return 14;
  if (days === "15-30") return 30;
  if (days === "30+") return 60;

  return 14;
}

function getUsageFit(type?: string, days?: string) {
  if (days === "30+") return "long_stay";
  if (type === "essential") return "essential";
  if (type === "power") return "power";
  return "everyday";
}

export async function getDaloRecommendation(input: RecommendationInput) {
  const country = input.country || "Europe";
  const tripDays = parseDays(input.days);
  const usageFit = getUsageFit(input.type, input.days);

  const activeProducts = await prisma.product.findMany({
    where: {
      active: true,
    },
    orderBy: {
      sellPrice: "asc",
    },
  });

  const countryProducts = activeProducts.filter(
    (product) =>
      product.country.toLowerCase() === country.toLowerCase() ||
      product.region?.toLowerCase() === country.toLowerCase()
  );

  const productPool = countryProducts.length > 0 ? countryProducts : activeProducts;

  const matchingProducts = productPool.filter((product) => {
    const usageMatches = product.usageFit === usageFit;
    const validityMatches = product.validityDays >= tripDays;

    return usageMatches && validityMatches;
  });

  const recommendedProduct =
    matchingProducts[0] ||
    productPool.find((product) => product.usageFit === usageFit) ||
    productPool[0] ||
    null;

  const upsellProduct = recommendedProduct
    ? productPool.find(
        (product) =>
          product.id !== recommendedProduct.id &&
          product.sellPrice > recommendedProduct.sellPrice &&
          product.active
      ) || null
    : null;

  return {
    recommendedProduct,
    upsellProduct,
    country,
    tripDays,
    usageFit,
  };
}

export async function getRecommendationRulesPreview() {
  const rules = [
    {
      country: "Europe",
      tripLength: "1–7 Days",
      userType: "Essential",
      days: "1-7",
      type: "essential",
      status: "Active",
    },
    {
      country: "Europe",
      tripLength: "8–14 Days",
      userType: "Everyday",
      days: "8-14",
      type: "everyday",
      status: "Active",
    },
    {
      country: "Europe",
      tripLength: "15–30 Days",
      userType: "Power User",
      days: "15-30",
      type: "power",
      status: "Active",
    },
    {
      country: "Europe",
      tripLength: "30+ Days",
      userType: "Long Stay",
      days: "30+",
      type: "power",
      status: "Active",
    },
  ];

  const previews = await Promise.all(
    rules.map(async (rule) => {
      const result = await getDaloRecommendation({
        country: rule.country,
        days: rule.days,
        type: rule.type,
      });

      return {
        ...rule,
        recommendedProduct: result.recommendedProduct,
        upsellProduct: result.upsellProduct,
      };
    })
  );

  return previews;
}