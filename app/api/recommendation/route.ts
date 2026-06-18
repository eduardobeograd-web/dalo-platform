import { NextRequest, NextResponse } from "next/server";
import { buildRecommendation, normalizeUsage, parseDays } from "@/lib/recommendation";

type UsageType = "essential" | "everyday" | "power";

type RecommendationApiInput = {
  country?: unknown;
  days?: unknown;
  type?: unknown;
  debug?: unknown;
};

type PublicProduct = {
  id?: unknown;
  country?: unknown;
  region?: unknown;
  name?: unknown;
  data?: unknown;
  validityDays?: unknown;
  planType?: unknown;
  usageFit?: unknown;
  role?: unknown;
  sellPrice?: unknown;
  oldPrice?: unknown;
  provider?: unknown;
  image?: unknown;
  description?: unknown;
};

type PublicUpsellOffer = {
  type?: unknown;
  badge?: unknown;
  title?: unknown;
  subtitle?: unknown;
  priceDifference?: unknown;
  extraDataGb?: unknown;
};

type RecommendationLike = {
  bestMatch?: PublicProduct | null;
  upsellProduct?: PublicProduct | null;
  upsellOffer?: PublicUpsellOffer | null;

  minimumDataGb?: unknown;
  rawEstimatedDataGb?: unknown;
  maxReasonableBestDataGb?: unknown;
  explanation?: unknown;

  budgetProduct?: PublicProduct | null;
  comfortProduct?: PublicProduct | null;
  heavyProduct?: PublicProduct | null;
  regionalProduct?: PublicProduct | null;
  scoredProducts?: unknown;
};

const DEFAULT_COUNTRY = "Europe";
const DEFAULT_DAYS = "8-14";
const DEFAULT_TYPE: UsageType = "everyday";

const allowedDays = new Set(["1-3", "4-7", "8-14", "15-30", "30+"]);
const allowedTypes = new Set(["essential", "everyday", "power"]);

function normalizeCountry(value: unknown) {
  if (typeof value !== "string") {
    return DEFAULT_COUNTRY;
  }

  const country = value.trim();

  return country || DEFAULT_COUNTRY;
}

function normalizeDaysInput(value: unknown) {
  if (typeof value !== "string") {
    return DEFAULT_DAYS;
  }

  const days = value.trim();

  if (!days) {
    return DEFAULT_DAYS;
  }

  if (allowedDays.has(days)) {
    return days;
  }

  return DEFAULT_DAYS;
}

function normalizeTypeInput(value: unknown): UsageType {
  if (typeof value !== "string") {
    return DEFAULT_TYPE;
  }

  const type = value.trim().toLowerCase();

  if (allowedTypes.has(type)) {
    return type as UsageType;
  }

  return DEFAULT_TYPE;
}

function getPublicUsage(type: UsageType) {
  const usage = normalizeUsage(type);

  if (usage === "light") return "light";
  if (usage === "heavy") return "heavy";

  return "normal";
}

function safeProduct(product?: PublicProduct | null) {
  if (!product) {
    return null;
  }

  return {
    id: product.id,
    country: product.country,
    region: product.region,
    name: product.name,
    data: product.data,
    validityDays: product.validityDays,
    planType: product.planType,
    usageFit: product.usageFit,
    role: product.role,
    sellPrice: product.sellPrice,
    oldPrice: product.oldPrice,
    provider: product.provider,
    image: product.image,
    description: product.description,
  };
}

function safeUpsellOffer(offer?: PublicUpsellOffer | null) {
  if (!offer) {
    return null;
  }

  return {
    type: offer.type,
    badge: offer.badge,
    title: offer.title,
    subtitle: offer.subtitle,
    priceDifference:
      typeof offer.priceDifference === "number"
        ? Number(offer.priceDifference.toFixed(2))
        : offer.priceDifference,
    extraDataGb: offer.extraDataGb,
  };
}

function toPublicRecommendation(
  recommendation: RecommendationLike | null,
  debug: boolean
) {
  if (!recommendation) {
    return null;
  }

  const publicRecommendation: Record<string, unknown> = {
    bestMatch: safeProduct(recommendation.bestMatch),
    upsellProduct: safeProduct(recommendation.upsellProduct),
    upsellOffer: safeUpsellOffer(recommendation.upsellOffer),
    minimumDataGb: recommendation.minimumDataGb,
    rawEstimatedDataGb: recommendation.rawEstimatedDataGb,
    maxReasonableBestDataGb: recommendation.maxReasonableBestDataGb,
    explanation: recommendation.explanation ?? null,
  };

  if (debug) {
    publicRecommendation.debug = {
      budgetProduct: safeProduct(recommendation.budgetProduct),
      comfortProduct: safeProduct(recommendation.comfortProduct),
      heavyProduct: safeProduct(recommendation.heavyProduct),
      regionalProduct: safeProduct(recommendation.regionalProduct),
      scoredProducts: recommendation.scoredProducts,
    };
  }

  return publicRecommendation;
}

function buildPublicInput(input: RecommendationApiInput) {
  const country = normalizeCountry(input.country);
  const days = normalizeDaysInput(input.days);
  const type = normalizeTypeInput(input.type);
  const tripDays = parseDays(days);
  const usage = getPublicUsage(type);

  return {
    country,
    days,
    type,
    tripDays,
    usage,
  };
}

async function getRecommendationResponse(input: RecommendationApiInput) {
  const publicInput = buildPublicInput(input);
  const debug = input.debug === true || input.debug === "true";

  const recommendation = await buildRecommendation({
    country: publicInput.country,
    days: publicInput.days,
    type: publicInput.type,
  });

  return {
    input: publicInput,
    recommendation: toPublicRecommendation(
      recommendation as RecommendationLike | null,
      debug
    ),
  };
}

export async function POST(request: NextRequest) {
  try {
    let body: RecommendationApiInput = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const response = await getRecommendationResponse(body);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Recommendation API POST error:", error);

    return NextResponse.json(
      {
        error: "Failed to build recommendation",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const response = await getRecommendationResponse({
      country: searchParams.get("country"),
      days: searchParams.get("days"),
      type: searchParams.get("type"),
      debug: searchParams.get("debug"),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Recommendation API GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to build recommendation",
      },
      {
        status: 500,
      }
    );
  }
}
