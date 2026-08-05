import type { MetadataRoute } from "next";
import { prisma } from "../lib/db";
import { siteUrl as baseUrl } from "../lib/site-url";
import { getDestinationSeoIssues } from "../lib/catalog-readiness";
import { slugifyDestination } from "../lib/destination-pages";

export const revalidate = 86_400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, managedPages] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
      },
      select: {
        country: true,
        region: true,
        updatedAt: true,
      },
      orderBy: {
        country: "asc",
      },
    }),
    prisma.destinationPage.findMany({
      where: { published: true, indexable: true },
    }),
  ]);

  const productDates = new Map<string, Date>();

  for (const product of products) {
    for (const destination of [product.country, product.region]) {
      if (!destination) continue;
      const slug = slugifyDestination(destination);
      const existingDate = productDates.get(slug);
      if (!existingDate || product.updatedAt > existingDate) {
        productDates.set(slug, product.updatedAt);
      }
    }
  }

  const countryMap = new Map<string, Date>();
  for (const page of managedPages) {
    const productDate = productDates.get(page.slug);
    if (!productDate || getDestinationSeoIssues(page).length > 0) continue;
    countryMap.set(page.slug, productDate > page.updatedAt ? productDate : page.updatedAt);
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
      url: `${baseUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.8,
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
