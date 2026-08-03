import { writeFile } from "node:fs/promises";
import { getCatalogDestinationSeoDraft, isAutomaticDestinationSeo } from "../lib/destination-seo-draft";
import { slugifyDestination } from "../lib/destination-pages";
import { prisma } from "../lib/db";

async function main() {
  const apply = process.argv.includes("--apply");
  const [products, pages] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, sellPrice: { gt: 0 }, validityDays: { gt: 0 } },
      select: { country: true, region: true, data: true, validityDays: true, sellPrice: true },
    }),
    prisma.destinationPage.findMany(),
  ]);
  const groups = new Map<string, { name: string; products: typeof products }>();
  for (const product of products) {
    for (const value of [product.country, product.region]) {
      const name = value?.trim();
      if (!name) continue;
      const slug = slugifyDestination(name);
      const group = groups.get(slug) || { name, products: [] };
      group.products.push(product);
      groups.set(slug, group);
    }
  }

  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
  const changes: Array<{ slug: string; action: string }> = [];
  const operations = [];

  for (const [slug, group] of groups) {
    const current = pagesBySlug.get(slug);
    const name = current?.displayName || group.name;
    const validity = group.products.map((product) => product.validityDays);
    const draft = getCatalogDestinationSeoDraft(slug, name, {
      planCount: group.products.length,
      startingPrice: Math.min(...group.products.map((product) => product.sellPrice)),
      dataOptions: Array.from(new Set(group.products.map((product) => product.data))),
      minimumValidityDays: Math.min(...validity),
      maximumValidityDays: Math.max(...validity),
    });
    const shouldReplace = !current || isAutomaticDestinationSeo(current);
    if (!current) {
      operations.push(prisma.destinationPage.create({
        data: { slug, ...draft, published: true, indexable: true },
      }));
      changes.push({ slug, action: "created and indexed" });
    } else if (shouldReplace) {
      operations.push(prisma.destinationPage.update({
        where: { slug },
        data: { ...draft, countryName: current.countryName || group.name, published: true, indexable: true },
      }));
      changes.push({ slug, action: "catalog content applied and indexed" });
    } else if (!current.published || !current.indexable) {
      operations.push(prisma.destinationPage.update({
        where: { slug },
        data: { published: true, indexable: true },
      }));
      changes.push({ slug, action: "curated page published and indexed" });
    }
  }

  for (const page of pages) {
    if (groups.has(page.slug) || (!page.published && !page.indexable)) continue;
    operations.push(prisma.destinationPage.update({
      where: { slug: page.slug },
      data: { published: false, indexable: false },
    }));
    changes.push({ slug: page.slug, action: "excluded because no active plan exists" });
  }

  console.log({ apply, activeDestinations: groups.size, existingPages: pages.length, changes: changes.length });
  console.table(changes.slice(0, 30));
  if (!apply) return;

  const backupPath = `/private/tmp/dalo-destination-pages-${Date.now()}.json`;
  await writeFile(backupPath, JSON.stringify(pages, null, 2));
  await prisma.$transaction(operations, {
    maxWait: 15_000,
    timeout: 60_000,
  });
  console.log({ applied: operations.length, backupPath });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
