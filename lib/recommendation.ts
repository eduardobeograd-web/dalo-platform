import { prisma } from "./db";

type RecommendationInput = {
  country?: string;
  days?: string;
  type?: string;
};

function parseDays(days?: string) {
  if (!days) return 14;

  if (days === "1-3") return 3;
  if (days === "4-7") return 7;
  if (days === "1-7") return 7;
  if (days === "8-14") return 14;
  if (days === "15-30") return 30;
  if (days === "30+") return 60;

  return 14;
}

function parseDataGb(data: string) {
  const match = data.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;

  return Number(match[1]);
}

function getMinimumDataGb(type?: string, tripDays = 14) {
  const usageType = type || "everyday";

  if (tripDays <= 7) {
    if (usageType === "essential") return 1;
    if (usageType === "power") return 10;
    return 3;
  }

  if (tripDays <= 15) {
    if (usageType === "essential") return 2;
    if (usageType === "power") return 10;
    return 5;
  }

  if (tripDays <= 30) {
    if (usageType === "essential") return 3;
    if (usageType === "power") return 20;
    return 10;
  }

  if (usageType === "essential") return 10;
  if (usageType === "power") return 50;
  return 20;
}

function getTargetUsageFit(type?: string) {
  if (type === "essential") return "Light";
  if (type === "power") return "Heavy";
  return "Standard";
}

function getUpgradeUsageFit(type?: string) {
  if (type === "essential") return "Standard";
  if (type === "power") return "Power";
  return "Heavy";
}

function isSafeMainRecommendation(product: {
  data: string;
  validityDays: number;
  usageFit: string;
  role: string;
}, tripDays: number, minimumDataGb: number) {
  const dataGb = parseDataGb(product.data);

  if (product.usageFit === "Too Low") return false;
  if (product.role === "emergency-only") return false;
  if (product.validityDays < tripDays) return false;
  if (dataGb < minimumDataGb) return false;

  return true;
}

export async function getDaloRecommendation(input: RecommendationInput) {
  const country = input.country || "Europe";
  const tripDays = parseDays(input.days);
  const minimumDataGb = getMinimumDataGb(input.type, tripDays);
  const targetUsageFit = getTargetUsageFit(input.type);
  const upgradeUsageFit = getUpgradeUsageFit(input.type);

  const activeProducts = await prisma.product.findMany({
    where: {
      active: true,
    },
    orderBy: [
      {
        sellPrice: "asc",
      },
      {
        validityDays: "asc",
      },
    ],
  });

  const countryProducts = activeProducts.filter(
    (product) =>
      product.country.toLowerCase() === country.toLowerCase() ||
      product.region?.toLowerCase() === country.toLowerCase()
  );

  const productPool = countryProducts.length > 0 ? countryProducts : activeProducts;

  const safeProducts = productPool.filter((product) =>
    isSafeMainRecommendation(product, tripDays, minimumDataGb)
  );

  const matchingProducts = safeProducts.filter(
    (product) => product.usageFit === targetUsageFit
  );

  const recommendedProduct =
    matchingProducts[0] ||
    safeProducts.find((product) => product.usageFit === upgradeUsageFit) ||
    safeProducts[0] ||
    null;

  const upsellProduct = recommendedProduct
    ? safeProducts.find((product) => {
        const recommendedDataGb = parseDataGb(recommendedProduct.data);
        const productDataGb = parseDataGb(product.data);

        return (
          product.id !== recommendedProduct.id &&
          productDataGb > recommendedDataGb &&
          product.sellPrice > recommendedProduct.sellPrice
        );
      }) || null
    : null;

  return {
    recommendedProduct,
    upsellProduct,
    country,
    tripDays,
    usageFit: targetUsageFit,
    minimumDataGb,
  };
}

export async function getRecommendationRulesPreview() {
  const rules = [
    {
      country: "Germany",
      tripLength: "1–7 Days",
      userType: "Essential",
      days: "1-7",
      type: "essential",
      status: "Active",
    },
    {
      country: "Germany",
      tripLength: "8–14 Days",
      userType: "Everyday",
      days: "8-14",
      type: "everyday",
      status: "Active",
    },
    {
      country: "Germany",
      tripLength: "15–30 Days",
      userType: "Everyday",
      days: "15-30",
      type: "everyday",
      status: "Active",
    },
    {
      country: "Germany",
      tripLength: "15–30 Days",
      userType: "Power User",
      days: "15-30",
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
        minimumDataGb: result.minimumDataGb,
      };
    })
  );

  return previews;
}