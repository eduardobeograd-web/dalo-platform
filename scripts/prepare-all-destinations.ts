import { getDestinationSeoDraft } from "../lib/destination-seo-draft";
import { slugifyDestination } from "../lib/destination-pages";
import { prisma } from "../lib/db";

const curatedSlugs = new Set([
  "australia", "bosnia-and-herzegovina", "canada", "croatia", "egypt",
  "france", "germany", "greece", "indonesia", "italy", "japan",
  "korea-republic-of", "malaysia", "mexico", "morocco", "portugal",
  "saudi-arabia", "serbia", "singapore", "spain", "thailand", "turkey",
  "united-arab-emirates", "united-kingdom", "united-states-of-america",
]);

function looksAutomatic(page: {
  seoDescription: string;
  intro: string;
  coverageText: string | null;
}) {
  return [
    "Compare eSIM plans for ",
    "Stay connected in ",
    "DALO compares available travel eSIM plans by data allowance",
    "Your eSIM connects to supported mobile networks",
    "Available ",
  ].some((phrase) =>
    [page.seoDescription, page.intro, page.coverageText || ""].some((value) =>
      value.includes(phrase),
    ),
  );
}

async function main() {
  const [products, existingPages] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, sellPrice: { gt: 0 }, validityDays: { gt: 0 } },
      select: { country: true, region: true },
    }),
    prisma.destinationPage.findMany(),
  ]);

  const destinations = new Map<string, string>();
  for (const product of products) {
    for (const value of [product.country, product.region]) {
      const name = value?.trim();
      if (name) destinations.set(slugifyDestination(name), name);
    }
  }

  const existingBySlug = new Map(existingPages.map((page) => [page.slug, page]));
  let created = 0;
  let refreshed = 0;
  let preserved = 0;

  for (const [slug, productName] of destinations) {
    const current = existingBySlug.get(slug);
    const name = current?.displayName?.trim() || productName;
    const draft = getDestinationSeoDraft(slug, name);

    if (!current) {
      await prisma.destinationPage.create({
        data: { slug, ...draft, published: true, indexable: false },
      });
      created += 1;
      continue;
    }

    if (!curatedSlugs.has(slug) && looksAutomatic(current)) {
      await prisma.destinationPage.update({
        where: { slug },
        data: { ...draft, countryName: current.countryName || productName },
      });
      refreshed += 1;
      continue;
    }

    const missingData = Object.fromEntries(
      Object.entries(draft).filter(([key]) => {
        const value = current[key as keyof typeof current];
        return value === null || value === undefined || value === "";
      }),
    );

    if (Object.keys(missingData).length) {
      await prisma.destinationPage.update({
        where: { slug },
        data: missingData,
      });
      refreshed += 1;
    } else {
      preserved += 1;
    }
  }

  console.log({
    activeDestinations: destinations.size,
    created,
    refreshed,
    preserved,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
