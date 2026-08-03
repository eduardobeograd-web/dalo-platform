import { parseDestinationFaq } from "./destination-pages";

type ProductReadinessInput = {
  country: string;
  isoCode?: string | null;
  name: string;
  data: string;
  validityDays: number;
  planType: string;
  usageFit: string;
  role: string;
  buyPrice: number;
  sellPrice: number;
  provider: string;
  providerProductId: string;
  image: string;
  description: string;
};

type DestinationReadinessInput = {
  seoTitle: string;
  seoDescription: string;
  headline: string;
  intro: string;
  heroImage?: string | null;
  heroImageAlt?: string | null;
  coverageText?: string | null;
  activationText?: string | null;
  compatibilityText?: string | null;
  hotspotText?: string | null;
  faq?: unknown;
  published: boolean;
  indexable: boolean;
};

function hasText(value: string | null | undefined, minimum = 1) {
  return Boolean(value && value.trim().length >= minimum);
}

export function getProductReadinessIssues(product: ProductReadinessInput) {
  const issues: string[] = [];

  if (!hasText(product.country)) issues.push("Missing country");
  if (!hasText(product.isoCode, 2)) issues.push("Missing ISO code");
  if (!hasText(product.name)) issues.push("Missing product name");
  if (!hasText(product.data)) issues.push("Missing data allowance");
  if (product.validityDays <= 0) issues.push("Invalid validity");
  if (!hasText(product.planType)) issues.push("Missing plan type");
  if (!hasText(product.usageFit)) issues.push("Missing usage fit");
  if (!hasText(product.role)) issues.push("Missing recommendation role");
  if (product.buyPrice <= 0) issues.push("Missing purchase price");
  if (product.sellPrice <= 0) issues.push("Missing sale price");
  if (product.sellPrice <= product.buyPrice) issues.push("No positive gross profit");
  if (!hasText(product.provider)) issues.push("Missing provider");
  if (!hasText(product.providerProductId)) issues.push("Missing provider product ID");
  if (!hasText(product.image)) issues.push("Missing product image");
  if (!hasText(product.description, 40)) issues.push("Description too short");

  return issues;
}

export function getDestinationSeoIssues(page: DestinationReadinessInput) {
  const issues: string[] = [];
  const titleLength = page.seoTitle.trim().length;
  const descriptionLength = page.seoDescription.trim().length;
  const faqs = parseDestinationFaq(page.faq);

  if (!page.published) issues.push("Page is not published");
  if (!page.indexable) issues.push("Google indexing is disabled");
  if (titleLength < 35 || titleLength > 65) issues.push("SEO title should be 35-65 characters");
  if (descriptionLength < 120 || descriptionLength > 165) issues.push("Meta description should be 120-165 characters");
  if (!hasText(page.headline, 20)) issues.push("Headline is too short");
  if (!hasText(page.intro, 160)) issues.push("Introduction needs at least 160 characters");
  if (!hasText(page.heroImage)) issues.push("Missing hero image");
  if (!hasText(page.heroImageAlt, 12)) issues.push("Missing descriptive image alt text");
  if (!hasText(page.coverageText, 80)) issues.push("Coverage information is incomplete");
  if (!hasText(page.activationText, 80)) issues.push("Activation information is incomplete");
  if (!hasText(page.compatibilityText, 80)) issues.push("Compatibility information is incomplete");
  if (!hasText(page.hotspotText, 60)) issues.push("Hotspot information is incomplete");
  if (faqs.length < 3) issues.push("At least three complete FAQs are required");
  if (faqs.some((faq) => faq.answer.length < 50)) issues.push("FAQ answers need more detail");

  return issues;
}
