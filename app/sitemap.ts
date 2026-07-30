import type { MetadataRoute } from "next";
import { prisma } from "../lib/db";
import { siteUrl as baseUrl } from "../lib/site-url";

const indexedCountrySlugs = new Set([
  "turkey",
  "thailand",
  "serbia",
  "croatia",
  "bosnia-and-herzegovina",
  "germany",
  "france",
  "italy",
  "spain",
  "japan",
  "egypt",
  "united-arab-emirates",
  "united-kingdom",
  "united-states-of-america",
  "greece",
  "portugal",
  "morocco",
  "canada",
  "australia",
  "mexico",
  "indonesia",
  "malaysia",
  "singapore",
  "korea-republic-of",
  "saudi-arabia",
]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, managedPages] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
      },
      select: {
        country: true,
        updatedAt: true,
      },
      orderBy: {
        country: "asc",
      },
    }),
    prisma.destinationPage.findMany({
      where: { published: true },
      select: {
        slug: true,
        indexable: true,
        updatedAt: true,
      },
    }),
  ]);

  const countryMap = new Map<string, Date>();

  for (const product of products) {
    if (!product.country) continue;

    const slug = slugify(product.country);

    if (!indexedCountrySlugs.has(slug)) continue;

    const existingDate = countryMap.get(slug);

    if (!existingDate || product.updatedAt > existingDate) {
      countryMap.set(slug, product.updatedAt);
    }
  }

  for (const page of managedPages) {
    if (page.indexable) {
      countryMap.set(page.slug, page.updatedAt);
    } else {
      countryMap.delete(page.slug);
    }
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/esim`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/refund-policy`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const countryRoutes: MetadataRoute.Sitemap = Array.from(countryMap.entries()).map(
    ([slug, lastModified]) => ({
      url: `${baseUrl}/esim/${slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...countryRoutes];
}
