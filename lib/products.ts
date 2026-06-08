export type UserType = "essential" | "everyday" | "power";

export type PlanType =
  | "fixed"
  | "unlimited_lite"
  | "unlimited_essential"
  | "unlimited_plus"
  | "long_duration";

export type ProductRole = "main" | "upsell" | "premium" | "fallback";

export type DaloProduct = {
  id: string;
  country: string;
  region?: string;
  name: string;
  data: string;
  validityDays: number;
  planType: PlanType;
  usageFit: UserType | "long_stay";
  role: ProductRole;
  buyPrice: number;
  sellPrice: number;
  oldPrice?: number;
  provider: string;
  providerProductId: string;
  image: string;
  description: string;
  active: boolean;
};

export const products: DaloProduct[] = [
  {
    id: "europe-essential-1gb-7d",
    country: "Europe",
    region: "Europe",
    name: "Europe Essential",
    data: "1GB",
    validityDays: 7,
    planType: "fixed",
    usageFit: "essential",
    role: "main",
    buyPrice: 1.17,
    sellPrice: 3.55,
    oldPrice: 5.99,
    provider: "Wholesale API",
    providerProductId: "esim_1GB_7D_EU",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
    description:
      "Perfect for maps, WhatsApp messages, email and light browsing during your trip.",
    active: true,
  },
  {
    id: "europe-smart-5gb-15d",
    country: "Europe",
    region: "Europe",
    name: "Europe Smart",
    data: "5GB",
    validityDays: 15,
    planType: "fixed",
    usageFit: "everyday",
    role: "main",
    buyPrice: 3.2,
    sellPrice: 7.99,
    oldPrice: 12.99,
    provider: "Wholesale API",
    providerProductId: "esim_5GB_15D_EU",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1400&auto=format&fit=crop",
    description:
      "Perfect for social media, WhatsApp calls, maps and everyday travel.",
    active: true,
  },
  {
    id: "europe-pro-10gb-30d",
    country: "Europe",
    region: "Europe",
    name: "Europe Pro",
    data: "10GB",
    validityDays: 30,
    planType: "fixed",
    usageFit: "power",
    role: "upsell",
    buyPrice: 5.8,
    sellPrice: 10.99,
    oldPrice: 16.99,
    provider: "Wholesale API",
    providerProductId: "esim_10GB_30D_EU",
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1400&auto=format&fit=crop",
    description:
      "A stronger plan for travelers who want more freedom for streaming, hotspot and calls.",
    active: true,
  },
  {
    id: "europe-unlimited-15d",
    country: "Europe",
    region: "Europe",
    name: "Europe Unlimited",
    data: "Unlimited",
    validityDays: 15,
    planType: "unlimited_essential",
    usageFit: "power",
    role: "main",
    buyPrice: 8.9,
    sellPrice: 14.99,
    oldPrice: 24.99,
    provider: "Wholesale API",
    providerProductId: "esim_UNL_15D_EU",
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1400&auto=format&fit=crop",
    description:
      "Best for streaming, hotspot, video calls and remote work while traveling.",
    active: true,
  },
  {
    id: "europe-long-stay-20gb-60d",
    country: "Europe",
    region: "Europe",
    name: "Europe Long Stay",
    data: "20GB",
    validityDays: 60,
    planType: "long_duration",
    usageFit: "long_stay",
    role: "main",
    buyPrice: 10.2,
    sellPrice: 19.99,
    oldPrice: 29.99,
    provider: "Wholesale API",
    providerProductId: "esim_20GB_60D_EU",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1400&auto=format&fit=crop",
    description:
      "Built for longer trips, multi-country travel and travelers who need reliable data for more than a few weeks.",
    active: true,
  },
];

export function formatPrice(value: number) {
  return `€${value.toFixed(2)}`;
}

export function getRecommendedProduct({
  country,
  days,
  type,
}: {
  country: string;
  days: string;
  type: string;
}) {
  const destination = country || "Europe";

  if (days === "30+") {
    return (
      products.find(
        (product) =>
          product.country === "Europe" && product.planType === "long_duration"
      ) || products[0]
    );
  }

  if (type === "essential") {
    return (
      products.find(
        (product) =>
          product.country === "Europe" && product.usageFit === "essential"
      ) || products[0]
    );
  }

  if (type === "power") {
    return (
      products.find(
        (product) =>
          product.country === "Europe" &&
          product.planType === "unlimited_essential"
      ) || products[0]
    );
  }

  return (
    products.find(
      (product) =>
        product.country === "Europe" && product.usageFit === "everyday"
    ) || products[0]
  );
}

export function getUpsellProduct(productId: string) {
  if (productId === "europe-essential-1gb-7d") {
    return products.find((product) => product.id === "europe-smart-5gb-15d");
  }

  if (productId === "europe-smart-5gb-15d") {
    return products.find((product) => product.id === "europe-pro-10gb-30d");
  }

  if (productId === "europe-unlimited-15d") {
    return products.find((product) => product.id === "europe-pro-10gb-30d");
  }

  return products.find((product) => product.id === "europe-pro-10gb-30d");
}