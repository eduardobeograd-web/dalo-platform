import { prisma } from "./db";
import {
  getFallbackSetting,
  getRecommendationSettingForUsage,
  type RecommendationUsageSetting,
} from "./recommendation-settings";

type RecommendationInput = {
  country?: string;
  days?: string;
  type?: string;
  budgetSensitive?: boolean;
};

type ProductLike = {
  id: string;
  country: string;
  isoCode: string | null;
  region: string | null;
  name: string;
  data: string;
  validityDays: number;
  planType: string;
  usageFit: string;
  role: string;
  buyPrice: number;
  sellPrice: number;
  oldPrice: number | null;
  provider: string;
  providerProductId: string;
  image: string;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type NormalizedUsage = "light" | "normal" | "heavy";

type UpsellOffer = {
  type: "comfort" | "heavy" | "regional";
  badge: string;
  title: string;
  subtitle: string;
  priceDifference: number;
  extraDataGb: number | null;
};

type ScoredProduct<TProduct extends ProductLike> = {
  product: TProduct;
  score: number;
  dataGb: number | null;
  effectiveDataGb: number;
  reasons: string[];
};

const EUROPE_COUNTRIES = new Set(
  [
    "Europe",
    "Spain",
    "Italy",
    "Germany",
    "France",
    "Portugal",
    "Greece",
    "Turkey",
    "Switzerland",
    "Austria",
    "Netherlands",
    "Croatia",
    "Serbia",
    "Montenegro",
    "Albania",
    "United Kingdom",
    "United States Kingdom",
  ].map((country) => country.toLowerCase())
);

function cleanText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

export function parseDays(days?: string) {
  if (!days) return 14;

  const value = days.trim().toLowerCase();

  if (value === "1-3") return 3;
  if (value === "4-7") return 7;
  if (value === "1-7") return 7;
  if (value === "8-14") return 14;
  if (value === "15-30") return 30;
  if (value === "30+") return 60;

  const exactNumber = Number(value);
  if (Number.isFinite(exactNumber) && exactNumber > 0) {
    return Math.ceil(exactNumber);
  }

  const rangeMatch = value.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    return Number(rangeMatch[2]);
  }

  return 14;
}

export function parseDataGb(data: string): number | null {
  const value = data.trim().toLowerCase();

  if (
    value.includes("unlimited") ||
    value.includes("unbegrenzt") ||
    value.includes("∞")
  ) {
    return null;
  }

  const match = value.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;

  const amount = Number(match[1].replace(",", "."));

  if (value.includes("mb")) {
    return amount / 1000;
  }

  return amount;
}

function getEffectiveDataGb(data: string) {
  const parsed = parseDataGb(data);

  if (parsed === null) {
    return 999;
  }

  return parsed;
}

export function normalizeUsage(type?: string): NormalizedUsage {
  const value = cleanText(type);

  if (
    value === "light" ||
    value === "essential" ||
    value === "basic" ||
    value === "low"
  ) {
    return "light";
  }

  if (
    value === "heavy" ||
    value === "power" ||
    value === "power_user" ||
    value === "power-user"
  ) {
    return "heavy";
  }

  return "normal";
}

function roundNeededGb(rawNeed: number) {
  if (rawNeed <= 1) return 1;
  if (rawNeed <= 3) return 3;
  if (rawNeed <= 5) return 5;
  if (rawNeed <= 10) return 10;
  if (rawNeed <= 20) return 20;
  if (rawNeed <= 30) return 30;
  if (rawNeed <= 50) return 50;

  return Math.ceil(rawNeed / 10) * 10;
}

function getRawEstimatedNeededGb(
  tripDays: number,
  setting: RecommendationUsageSetting
) {
  return Math.max(setting.minimumGb, tripDays * setting.gbPerDay);
}

export function getEstimatedNeededGb(
  tripDays: number,
  type?: string,
  setting?: RecommendationUsageSetting
): number {
  const usage = normalizeUsage(type);
  const effectiveSetting = setting || getFallbackSetting(usage);
  const rawNeed = getRawEstimatedNeededGb(tripDays, effectiveSetting);

  return roundNeededGb(rawNeed);
}

function productMatchesDestination(
  product: ProductLike,
  destination: string
) {
  const productCountry = cleanText(product.country);
  const productRegion = cleanText(product.region);
  const target = cleanText(destination);

  return productCountry === target || productRegion === target;
}

function isRegionalEuropeProduct(product: ProductLike) {
  const country = cleanText(product.country);
  const region = cleanText(product.region);
  const name = cleanText(product.name);

  return (
    country === "europe" ||
    region === "europe" ||
    name.includes("europe")
  );
}

function isEuropeDestination(destination: string) {
  return EUROPE_COUNTRIES.has(cleanText(destination));
}

function getDestinationProducts<TProduct extends ProductLike>(
  products: TProduct[],
  destination: string
) {
  if (cleanText(destination) === "europe") {
    return products.filter(isRegionalEuropeProduct);
  }

  const directMatches = products.filter((product) =>
    productMatchesDestination(product, destination)
  );

  if (directMatches.length > 0) {
    return directMatches;
  }

  return [];
}

function getComparablePriceStats(products: ProductLike[]) {
  const prices = products
    .map((product) => product.sellPrice)
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    return {
      cheapest: 0,
      median: 0,
    };
  }

  const median = prices[Math.floor(prices.length / 2)];

  return {
    cheapest: prices[0],
    median,
  };
}

function scoreProduct<TProduct extends ProductLike>({
  product,
  tripDays,
  neededGb,
  usage,
  comparableProducts,
}: {
  product: TProduct;
  tripDays: number;
  neededGb: number;
  usage: NormalizedUsage;
  comparableProducts: TProduct[];
}): ScoredProduct<TProduct> {
  const dataGb = parseDataGb(product.data);
  const effectiveDataGb = getEffectiveDataGb(product.data);
  const priceStats = getComparablePriceStats(comparableProducts);
  const reasons: string[] = [];

  let score = 100;

  const role = cleanText(product.role);
  const usageFit = cleanText(product.usageFit);
  const planType = cleanText(product.planType);

  if (!product.active) {
    score -= 1000;
  }

  if (role.includes("emergency")) {
    score -= 180;
  }

  if (usageFit.includes("too low")) {
    score -= 160;
  }

  if (product.validityDays >= tripDays) {
    score += 24;
    reasons.push("validity covers the full trip");
  } else {
    const missingDays = tripDays - product.validityDays;
    score -= 90 + missingDays * 8;
    reasons.push("validity is shorter than the trip");
  }

  if (effectiveDataGb >= neededGb) {
    score += 34;
    reasons.push("data allowance covers the estimated need");
  } else {
    const shortageRatio = effectiveDataGb / neededGb;

    if (shortageRatio >= 0.75) {
      score -= 35;
    } else if (shortageRatio >= 0.5) {
      score -= 75;
    } else {
      score -= 140;
    }

    reasons.push("data allowance is below the estimated need");
  }

  const dataRatio = effectiveDataGb / neededGb;

  if (dataRatio >= 1 && dataRatio <= 1.8) {
    score += 30;
    reasons.push("data amount is a close fit");
  } else if (dataRatio > 1.8 && dataRatio <= 3) {
    score += 15;
    reasons.push("extra data gives a useful safety buffer");
  } else if (dataRatio > 3 && usage === "light") {
    score -= 35;
    reasons.push("data amount is overkill for light usage");
  } else if (dataRatio > 4 && usage === "normal") {
    score -= 20;
    reasons.push("data amount is more than most normal users need");
  }

  if (usage !== "light" && effectiveDataGb <= 1) {
    score -= 150;
    reasons.push("1GB is too small for this trip profile");
  }

  if (usage === "heavy" && effectiveDataGb < 10) {
    score -= 90;
    reasons.push("heavy users need a larger data buffer");
  }

  if (usage === "light" && effectiveDataGb >= 1 && effectiveDataGb <= 5) {
    score += 12;
  }

  if (usage === "normal" && effectiveDataGb >= 3 && effectiveDataGb <= 10) {
    score += 14;
  }

  if (usage === "heavy" && (effectiveDataGb >= 20 || dataGb === null)) {
    score += 18;
  }

  if (product.validityDays > tripDays && product.validityDays <= tripDays + 14) {
    score += 8;
  }

  if (product.validityDays > tripDays + 30 && tripDays <= 7) {
    score -= 12;
  }

  if (priceStats.cheapest > 0 && product.sellPrice <= priceStats.cheapest * 1.25) {
    score += 18;
  } else if (priceStats.median > 0 && product.sellPrice <= priceStats.median) {
    score += 10;
  } else if (priceStats.median > 0 && product.sellPrice > priceStats.median * 1.8) {
    score -= 22;
  }

  const margin = product.sellPrice - product.buyPrice;
  const marginRate = product.sellPrice > 0 ? margin / product.sellPrice : 0;

  if (marginRate >= 0.12 && marginRate <= 0.45) {
    score += 4;
  }

  if (planType.includes("bundle") && usage !== "heavy") {
    score -= 4;
  }

  return {
    product,
    score,
    dataGb,
    effectiveDataGb,
    reasons,
  };
}

function sortByBestScore<TProduct extends ProductLike>(
  scoredProducts: ScoredProduct<TProduct>[]
) {
  return [...scoredProducts].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.product.sellPrice !== b.product.sellPrice) {
      return a.product.sellPrice - b.product.sellPrice;
    }
    return a.effectiveDataGb - b.effectiveDataGb;
  });
}

function sortByCheapest<TProduct extends ProductLike>(products: TProduct[]) {
  return [...products].sort((a, b) => {
    if (a.sellPrice !== b.sellPrice) return a.sellPrice - b.sellPrice;
    if (a.validityDays !== b.validityDays) return a.validityDays - b.validityDays;
    return getEffectiveDataGb(a.data) - getEffectiveDataGb(b.data);
  });
}

function getSafeProducts<TProduct extends ProductLike>(
  products: TProduct[],
  tripDays: number
) {
  return products.filter((product) => {
    const role = cleanText(product.role);
    const usageFit = cleanText(product.usageFit);

    if (!product.active) return false;
    if (role.includes("emergency")) return false;
    if (usageFit.includes("too low")) return false;
    if (product.validityDays < tripDays) return false;

    return true;
  });
}

function pickBudgetOption<TProduct extends ProductLike>({
  products,
  bestMatch,
  tripDays,
  neededGb,
  usage,
  budgetMinNeedMultiple,
}: {
  products: TProduct[];
  bestMatch: TProduct | null;
  tripDays: number;
  neededGb: number;
  usage: NormalizedUsage;
  budgetMinNeedMultiple: number;
}) {
  const minimumBudgetGb =
    usage === "light"
      ? Math.max(1, neededGb * budgetMinNeedMultiple)
      : usage === "heavy"
        ? Math.max(5, neededGb * budgetMinNeedMultiple)
        : Math.max(1, neededGb * budgetMinNeedMultiple);

  const candidates = products.filter((product) => {
    if (bestMatch && product.id === bestMatch.id) return false;
    if (product.validityDays < tripDays) return false;

    const dataGb = getEffectiveDataGb(product.data);

    if (dataGb < minimumBudgetGb) return false;

    if (bestMatch && product.sellPrice >= bestMatch.sellPrice) return false;

    return true;
  });

  return sortByCheapest(candidates)[0] || null;
}

function pickComfortOption<TProduct extends ProductLike>({
  products,
  bestMatch,
  tripDays,
  neededGb,
  comfortMinNeedMultiple,
}: {
  products: TProduct[];
  bestMatch: TProduct | null;
  tripDays: number;
  neededGb: number;
  comfortMinNeedMultiple: number;
}) {
  if (!bestMatch) return null;

  const bestDataGb = getEffectiveDataGb(bestMatch.data);
  const comfortTargetGb = Math.max(
    bestDataGb + 0.5,
    neededGb * comfortMinNeedMultiple
  );

  const strongCandidates = products.filter((product) => {
    if (product.id === bestMatch.id) return false;
    if (product.validityDays < tripDays) return false;

    const productDataGb = getEffectiveDataGb(product.data);

    return (
      productDataGb >= comfortTargetGb &&
      product.sellPrice > bestMatch.sellPrice
    );
  });

  const fallbackCandidates = products.filter((product) => {
    if (product.id === bestMatch.id) return false;
    if (product.validityDays < tripDays) return false;

    const productDataGb = getEffectiveDataGb(product.data);

    return (
      productDataGb > bestDataGb &&
      product.sellPrice > bestMatch.sellPrice
    );
  });

  const sortedFallbackCandidates = sortByCheapest(fallbackCandidates);

  if (sortedFallbackCandidates.length > 0) {
    return sortedFallbackCandidates[0] || null;
  }

  return sortByCheapest(strongCandidates)[0] || null;
}

function pickHeavyDataOption<TProduct extends ProductLike>({
  products,
  bestMatch,
  tripDays,
  heavyMinGb,
}: {
  products: TProduct[];
  bestMatch: TProduct | null;
  tripDays: number;
  heavyMinGb: number;
}) {
  const minimumHeavyGb = heavyMinGb;

  const candidates = products.filter((product) => {
    if (bestMatch && product.id === bestMatch.id) return false;
    if (product.validityDays < tripDays) return false;

    const dataGb = getEffectiveDataGb(product.data);

    return dataGb >= minimumHeavyGb || parseDataGb(product.data) === null;
  });

  return sortByCheapest(candidates)[0] || null;
}

function pickRegionalUpsell<TProduct extends ProductLike>({
  products,
  destination,
  bestMatch,
  tripDays,
  neededGb,
}: {
  products: TProduct[];
  destination: string;
  bestMatch: TProduct | null;
  tripDays: number;
  neededGb: number;
}) {
  if (!isEuropeDestination(destination)) return null;
  if (cleanText(destination) === "europe") return null;

  const candidates = products.filter((product) => {
    if (bestMatch && product.id === bestMatch.id) return false;
    if (!isRegionalEuropeProduct(product)) return false;
    if (product.validityDays < tripDays) return false;

    const dataGb = getEffectiveDataGb(product.data);

    return dataGb >= Math.max(1, neededGb * 0.75);
  });

  return sortByCheapest(candidates)[0] || null;
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatGb(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function buildUpsellOffer({
  bestMatch,
  upsellProduct,
  upsellType,
}: {
  bestMatch: ProductLike | null;
  upsellProduct: ProductLike | null;
  upsellType: "comfort" | "heavy" | "regional" | null;
}): UpsellOffer | null {
  if (!bestMatch || !upsellProduct || !upsellType) return null;

  const priceDifference = upsellProduct.sellPrice - bestMatch.sellPrice;

  if (priceDifference <= 0) return null;

  const attractiveDifference =
    priceDifference <=
    Math.min(12, Math.max(5, bestMatch.sellPrice * 0.45));

  const bestGb = parseDataGb(bestMatch.data);
  const upsellGb = parseDataGb(upsellProduct.data);

  if (upsellType === "regional") {
    return {
      type: "regional",
      badge: attractiveDifference
        ? "Multi-country upgrade"
        : "Regional alternative",
      title: attractiveDifference
        ? `Travel across Europe for only +${formatPrice(priceDifference)}`
        : `Europe-wide plan available for +${formatPrice(priceDifference)}`,
      subtitle:
        "Choose this if you visit more than one country on your trip.",
      priceDifference,
      extraDataGb: null,
    };
  }

  if (bestGb === null || upsellGb === null) {
    return {
      type: "heavy",
      badge: attractiveDifference
        ? "Unlimited upgrade"
        : "Unlimited option",
      title: attractiveDifference
        ? `Upgrade to unlimited data for only +${formatPrice(priceDifference)}`
        : `Unlimited data available for +${formatPrice(priceDifference)}`,
      subtitle:
        "Best if you use hotspot, video calls, streaming or work while travelling.",
      priceDifference,
      extraDataGb: null,
    };
  }

  const extraDataGb = upsellGb - bestGb;

  if (extraDataGb <= 0) return null;

  if (upsellType === "heavy") {
    return {
      type: "heavy",
      badge: attractiveDifference
        ? "Heavy data upgrade"
        : "More data option",
      title: attractiveDifference
        ? `Upgrade to ${upsellProduct.data} for only +${formatPrice(priceDifference)}`
        : `Upgrade to ${upsellProduct.data} for +${formatPrice(priceDifference)}`,
      subtitle:
        "Best if you use hotspot, video calls, streaming or heavier travel days.",
      priceDifference,
      extraDataGb,
    };
  }

  return {
    type: "comfort",
    badge: attractiveDifference ? "Smart upgrade" : "More data option",
    title: attractiveDifference
      ? `Upgrade to ${upsellProduct.data} for only +${formatPrice(priceDifference)}`
      : `Upgrade to ${upsellProduct.data} for +${formatPrice(priceDifference)}`,
    subtitle:
      "A safer data buffer for maps, social media, browsing and longer days outside.",
    priceDifference,
    extraDataGb,
  };
}

function pickFinalUpsell<TProduct extends ProductLike>({
  bestMatch,
  regionalUpsell,
  comfortOption,
  heavyDataOption,
}: {
  bestMatch: TProduct | null;
  regionalUpsell: TProduct | null;
  comfortOption: TProduct | null;
  heavyDataOption: TProduct | null;
}) {
  const candidates = [
    { product: regionalUpsell, type: "regional" as const },
    { product: comfortOption, type: "comfort" as const },
    { product: heavyDataOption, type: "heavy" as const },
  ];

  for (const candidate of candidates) {
    if (!bestMatch || !candidate.product) continue;

    const offer = buildUpsellOffer({
      bestMatch,
      upsellProduct: candidate.product,
      upsellType: candidate.type,
    });

    if (offer) {
      return {
        product: candidate.product,
        type: candidate.type,
        offer,
      };
    }
  }

  return {
    product: null,
    type: null,
    offer: null,
  };
}

function createExplanation({
  destination,
  tripDays,
  usage,
  neededGb,
  bestMatch,
}: {
  destination: string;
  tripDays: number;
  usage: NormalizedUsage;
  neededGb: number;
  bestMatch: ProductLike | null;
}) {
  if (!bestMatch) {
    return {
      title: "No reliable match found",
      bullets: [
        "DALO could not find an active plan that fits this destination and trip length.",
        "Add more active products or check the destination name in the product database.",
      ],
    };
  }

  const usageLabel =
    usage === "light"
      ? "light use"
      : usage === "heavy"
        ? "heavy use"
        : "normal travel use";

  return {
    title: "Why DALO picked this plan",
    bullets: [
      `Your trip is estimated at ${tripDays} days with ${usageLabel}.`,
      `DALO estimates you need at least ${neededGb}GB for maps, messaging, browsing and travel apps.`,
      `${bestMatch.data} with ${bestMatch.validityDays} days gives a safer fit than the smallest available plans.`,
    ],
  };
}

const ACTIVE_PRODUCTS_CACHE_MS = 15_000;
let activeProductsCache:
  | {
      expiresAt: number;
      products: ProductLike[];
    }
  | undefined;
let activeProductsRequest: Promise<ProductLike[]> | undefined;

async function getActiveRecommendationProducts() {
  const now = Date.now();

  if (activeProductsCache && activeProductsCache.expiresAt > now) {
    return activeProductsCache.products;
  }

  if (activeProductsRequest) {
    return activeProductsRequest;
  }

  activeProductsRequest = prisma.product
    .findMany({
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
    })
    .then((products) => {
      activeProductsCache = {
        expiresAt: Date.now() + ACTIVE_PRODUCTS_CACHE_MS,
        products,
      };

      return products;
    })
    .finally(() => {
      activeProductsRequest = undefined;
    });

  return activeProductsRequest;
}

export async function buildRecommendation(input: RecommendationInput) {
  const country = input.country || "Europe";
  const tripDays = parseDays(input.days);
  const usage = normalizeUsage(input.type);
  const [setting, activeProducts] = await Promise.all([
    getRecommendationSettingForUsage(usage),
    getActiveRecommendationProducts(),
  ]);
  const rawEstimatedDataGb = getRawEstimatedNeededGb(tripDays, setting);
  const minimumDataGb = getEstimatedNeededGb(tripDays, input.type, setting);

  const destinationProducts = getDestinationProducts(activeProducts, country);
  const productPool = destinationProducts;

  const safeProducts = getSafeProducts(productPool, tripDays);

  const scoredProducts = safeProducts.map((product) =>
    scoreProduct({
      product,
      tripDays,
      neededGb: minimumDataGb,
      usage,
      comparableProducts: safeProducts,
    })
  );

  const maxReasonableBestDataGb = Math.max(
    minimumDataGb,
    rawEstimatedDataGb * setting.maxBestMatchMultiple
  );

  const reasonableBestCandidates = scoredProducts.filter((scoredProduct) => {
    if (scoredProduct.effectiveDataGb < minimumDataGb) return false;
    if (scoredProduct.product.validityDays < tripDays) return false;

    if (parseDataGb(scoredProduct.product.data) === null) {
      return usage === "heavy";
    }

    return scoredProduct.effectiveDataGb <= maxReasonableBestDataGb;
  });

  const bestMatch =
    sortByBestScore(
      reasonableBestCandidates.length > 0
        ? reasonableBestCandidates
        : scoredProducts
    )[0]?.product || null;

  const budgetOption = pickBudgetOption({
    products: safeProducts,
    bestMatch,
    tripDays,
    neededGb: minimumDataGb,
    usage,
    budgetMinNeedMultiple: setting.budgetMinNeedMultiple,
  });

  const comfortOption = pickComfortOption({
    products: safeProducts,
    bestMatch,
    tripDays,
    neededGb: minimumDataGb,
    comfortMinNeedMultiple: setting.comfortMinNeedMultiple,
  });

  const heavyDataOption = pickHeavyDataOption({
    products: safeProducts,
    bestMatch,
    tripDays,
    heavyMinGb: setting.heavyMinGb,
  });

  const regionalUpsell = pickRegionalUpsell({
    products: activeProducts,
    destination: country,
    bestMatch,
    tripDays,
    neededGb: minimumDataGb,
  });

  const finalUpsell = pickFinalUpsell({
    bestMatch,
    regionalUpsell: null,
    comfortOption,
    heavyDataOption,
  });

  const explanation = createExplanation({
    destination: country,
    tripDays,
    usage,
    neededGb: minimumDataGb,
    bestMatch,
  });

  return {
    bestMatch,
    budgetOption,
    comfortOption,
    heavyDataOption,
    regionalUpsell,
    upsellProduct: finalUpsell.product,
    upsellOffer: finalUpsell.offer,
    explanation,

    country,
    tripDays,
    usage,
    setting,
    rawEstimatedDataGb,
    minimumDataGb,
    maxReasonableBestDataGb,
    scoredProducts: sortByBestScore(scoredProducts),
  };
}

export async function getDaloRecommendation(input: RecommendationInput) {
  const result = await buildRecommendation(input);

  const upsellProduct = result.upsellProduct || null;

  return {
    recommendedProduct: result.bestMatch,
    upsellProduct,
    country: result.country,
    tripDays: result.tripDays,
    usageFit:
      result.usage === "light"
        ? "Light"
        : result.usage === "heavy"
          ? "Heavy"
          : "Standard",
    minimumDataGb: result.minimumDataGb,
    rawEstimatedDataGb: result.rawEstimatedDataGb,
    maxReasonableBestDataGb: result.maxReasonableBestDataGb,
    setting: result.setting,

    bestMatch: result.bestMatch,
    budgetOption: result.budgetOption,
    comfortOption: result.comfortOption,
    heavyDataOption: result.heavyDataOption,
    regionalUpsell: result.regionalUpsell,
    upsellOffer: result.upsellOffer,
    explanation: result.explanation,
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
        rawEstimatedDataGb: result.rawEstimatedDataGb,
        maxReasonableBestDataGb: result.maxReasonableBestDataGb,
        setting: result.setting,
        budgetOption: result.budgetOption,
        comfortOption: result.comfortOption,
        heavyDataOption: result.heavyDataOption,
        regionalUpsell: result.regionalUpsell,
        upsellOffer: result.upsellOffer,
      };
    })
  );

  return previews;
}
