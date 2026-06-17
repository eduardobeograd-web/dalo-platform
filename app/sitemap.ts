import type { MetadataRoute } from "next";
import { prisma } from "../lib/db";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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
  const products = await prisma.product.findMany({
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
  });

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

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/esim`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
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
