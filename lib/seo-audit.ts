import { getDestinationSeoIssues } from "./catalog-readiness";
import { slugifyDestination } from "./destination-pages";

export type SeoAuditSeverity = "critical" | "high" | "medium" | "low";
export type SeoAuditStatus = "critical" | "needs-work" | "ready" | "excluded";

export type SeoAuditIssue = {
  code: string;
  severity: SeoAuditSeverity;
  title: string;
  guidance: string;
};

type DestinationPageInput = {
  slug: string;
  countryName: string;
  displayName: string;
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
  updatedAt: Date;
};

export type SeoAuditRow = {
  slug: string;
  countryName: string;
  displayName: string;
  productCount: number;
  score: number;
  status: SeoAuditStatus;
  issues: SeoAuditIssue[];
  published: boolean;
  indexable: boolean;
  updatedAt: Date | null;
};

const severityPenalty: Record<SeoAuditSeverity, number> = {
  critical: 35,
  high: 15,
  medium: 6,
  low: 2,
};

const issueDetails: Record<string, Omit<SeoAuditIssue, "code">> = {
  "Page is not published": {
    severity: "medium",
    title: "Page is still a draft",
    guidance: "Review the page and publish it only when the content is complete.",
  },
  "Google indexing is disabled": {
    severity: "high",
    title: "Google indexing is disabled",
    guidance: "Enable indexing only after the page has passed the editorial checks.",
  },
  "SEO title should be 35-65 characters": {
    severity: "medium",
    title: "SEO title length needs attention",
    guidance: "Write a unique title between 35 and 65 characters.",
  },
  "Meta description should be 120-165 characters": {
    severity: "medium",
    title: "Meta description length needs attention",
    guidance: "Summarize the destination and offer clearly in 120 to 165 characters.",
  },
  "SEO title and description still use the automatic template": {
    severity: "high",
    title: "Metadata still uses the automatic template",
    guidance: "Replace it with destination-specific search copy before indexing.",
  },
  "Headline and introduction need country-specific editing": {
    severity: "high",
    title: "Opening copy is still generic",
    guidance: "Add useful destination context that is specific to this country or region.",
  },
  "Travel and product guidance still contains generic copy": {
    severity: "high",
    title: "Travel guidance is still generic",
    guidance: "Verify coverage, activation, compatibility and hotspot guidance for this destination.",
  },
  "Hero image and alt text still use the automatic selection": {
    severity: "medium",
    title: "Hero image needs editorial review",
    guidance: "Confirm that the image genuinely represents the destination and improve its alt text.",
  },
  "FAQs still use the automatic template": {
    severity: "medium",
    title: "FAQs are still generic",
    guidance: "Add destination-specific questions customers actually need answered.",
  },
};

export function buildSeoAudit(input: {
  activeProductCountries: string[];
  pages: DestinationPageInput[];
}): SeoAuditRow[] {
  const productCounts = new Map<string, { countryName: string; count: number }>();
  for (const country of input.activeProductCountries) {
    const name = country.trim();
    if (!name) continue;
    const slug = slugifyDestination(name);
    const current = productCounts.get(slug);
    productCounts.set(slug, { countryName: name, count: (current?.count || 0) + 1 });
  }

  const pagesBySlug = new Map(input.pages.map((page) => [page.slug, page]));
  const slugs = new Set([...productCounts.keys(), ...pagesBySlug.keys()]);
  const duplicateTitles = duplicateValues(input.pages, (page) => page.seoTitle);
  const duplicateDescriptions = duplicateValues(input.pages, (page) => page.seoDescription);
  const duplicateImages = duplicateValues(
    input.pages.filter((page) => page.heroImage && page.heroImage !== "/world-map.webp"),
    (page) => page.heroImage || "",
  );

  return Array.from(slugs, (slug) => {
    const page = pagesBySlug.get(slug);
    const products = productCounts.get(slug);
    const countryName = page?.countryName || products?.countryName || slug;
    const issues: SeoAuditIssue[] = [];

    if (!page) {
      issues.push({
        code: "COUNTRY_PAGE_MISSING",
        severity: "critical",
        title: "Country page is not configured",
        guidance: "Create and review a dedicated landing page before making it indexable.",
      });
    } else {
      for (const message of getDestinationSeoIssues(page)) {
        issues.push(toAuditIssue(message));
      }

      if (page.indexable && !page.published) {
        issues.push({
          code: "UNPUBLISHED_INDEXABLE",
          severity: "critical",
          title: "Unpublished page is marked indexable",
          guidance: "Disable indexing until the page has been reviewed and published.",
        });
      }
      if (duplicateTitles.has(normalize(page.seoTitle))) {
        issues.push({
          code: "DUPLICATE_TITLE",
          severity: "high",
          title: "SEO title is duplicated",
          guidance: "Give this destination a unique search title and intent.",
        });
      }
      if (duplicateDescriptions.has(normalize(page.seoDescription))) {
        issues.push({
          code: "DUPLICATE_DESCRIPTION",
          severity: "high",
          title: "Meta description is duplicated",
          guidance: "Write a destination-specific description instead of repeating another page.",
        });
      }
      if (page.heroImage && duplicateImages.has(normalize(page.heroImage))) {
        issues.push({
          code: "DUPLICATE_HERO_IMAGE",
          severity: "medium",
          title: "Hero image is reused on multiple destinations",
          guidance: "Use a distinct, authentic image so the country page is visually credible.",
        });
      }
      if (page.heroImage === "/world-map.webp") {
        issues.push({
          code: "GENERIC_HERO_IMAGE",
          severity: "low",
          title: "Generic destination visual",
          guidance: "Replace the map with a licensed destination image when one becomes available.",
        });
      }
      if (
        page.heroImageAlt &&
        !normalize(page.heroImageAlt).includes(normalize(page.displayName)) &&
        !normalize(page.heroImageAlt).includes(normalize(page.countryName))
      ) {
        issues.push({
          code: "ALT_DESTINATION_MISSING",
          severity: "low",
          title: "Image alt text does not name the destination",
          guidance: "Describe the actual image and include the destination when it is naturally relevant.",
        });
      }
    }

    if (!products?.count && (page?.published || page?.indexable)) {
      issues.push({
        code: "ACTIVE_PRODUCTS_MISSING",
        severity: "critical",
        title: "No active plan is available",
        guidance: "Keep this page out of search until at least one purchasable plan is active.",
      });
    } else if (!products?.count) {
      issues.push({
        code: "NOT_IN_ACTIVE_CATALOG",
        severity: "low",
        title: "Not in the active catalog",
        guidance: "This page is safely excluded until a purchasable plan becomes available.",
      });
    }

    const uniqueIssues = Array.from(new Map(issues.map((issue) => [issue.code, issue])).values());
    const score = Math.max(
      0,
      100 - uniqueIssues.reduce((total, issue) => total + severityPenalty[issue.severity], 0),
    );
    const status: SeoAuditStatus = !products?.count && !page?.published && !page?.indexable
      ? "excluded"
      : uniqueIssues.some((issue) => issue.severity === "critical")
      ? "critical"
      : uniqueIssues.some((issue) => issue.severity === "high" || issue.severity === "medium")
        ? "needs-work"
        : "ready";

    return {
      slug,
      countryName,
      displayName: page?.displayName || countryName,
      productCount: products?.count || 0,
      score,
      status,
      issues: uniqueIssues.sort(
        (left, right) => severityRank(left.severity) - severityRank(right.severity),
      ),
      published: page?.published || false,
      indexable: page?.indexable || false,
      updatedAt: page?.updatedAt || null,
    };
  }).sort(
    (left, right) =>
      statusRank(left.status) - statusRank(right.status) ||
      left.score - right.score ||
      left.displayName.localeCompare(right.displayName),
  );
}

function toAuditIssue(message: string): SeoAuditIssue {
  const known = issueDetails[message];
  if (known) {
    return { code: message.toUpperCase().replaceAll(/[^A-Z0-9]+/g, "_"), ...known };
  }
  return {
    code: message.toUpperCase().replaceAll(/[^A-Z0-9]+/g, "_"),
    severity: /missing|incomplete|required/i.test(message) ? "high" : "medium",
    title: message,
    guidance: "Complete and verify this field in the country page editor.",
  };
}

function duplicateValues<T>(items: T[], select: (item: T) => string) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const value = normalize(select(item));
    if (value) counts.set(value, (counts.get(value) || 0) + 1);
  }
  return new Set(Array.from(counts).filter(([, count]) => count > 1).map(([value]) => value));
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("en");
}

function severityRank(value: SeoAuditSeverity) {
  return ["critical", "high", "medium", "low"].indexOf(value);
}

function statusRank(value: SeoAuditStatus) {
  return ["critical", "needs-work", "ready", "excluded"].indexOf(value);
}
