"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminPermission } from "../../../lib/admin-auth";
import { ADMIN_PERMISSIONS } from "../../../lib/admin-permissions";
import { getDestinationSeoDraft } from "../../../lib/destination-seo-draft";
import { slugifyDestination } from "../../../lib/destination-pages";
import { parseDestinationFaq } from "../../../lib/destination-pages";
import { prisma } from "../../../lib/db";

function within(value: string | null | undefined, minimum: number, maximum?: number) {
  const length = value?.trim().length || 0;
  return length >= minimum && (maximum === undefined || length <= maximum);
}

export async function prepareDestinationSeoDrafts() {
  await requireAdminPermission(ADMIN_PERMISSIONS.SEO_WRITE);

  const [products, existingPages] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        sellPrice: { gt: 0 },
        validityDays: { gt: 0 },
      },
      select: { country: true, region: true },
    }),
    prisma.destinationPage.findMany(),
  ]);

  const names = new Map<string, string>();
  for (const product of products) {
    for (const value of [product.country, product.region]) {
      const name = value?.trim();
      if (name) names.set(slugifyDestination(name), name);
    }
  }

  const pagesBySlug = new Map(existingPages.map((page) => [page.slug, page]));

  for (const [slug, name] of names) {
    const current = pagesBySlug.get(slug);
    const draft = getDestinationSeoDraft(slug, current?.displayName || name);
    const currentFaq = parseDestinationFaq(current?.faq);

    await prisma.destinationPage.upsert({
      where: { slug },
      create: {
        slug,
        ...draft,
        published: true,
        indexable: false,
      },
      update: {
        countryName: current?.countryName.trim() || name,
        displayName: current?.displayName.trim() || name,
        seoTitle: within(current?.seoTitle, 35, 65)
          ? current!.seoTitle
          : draft.seoTitle,
        seoDescription: within(current?.seoDescription, 120, 165)
          ? current!.seoDescription
          : draft.seoDescription,
        headline: within(current?.headline, 20)
          ? current!.headline
          : draft.headline,
        intro: within(current?.intro, 160) ? current!.intro : draft.intro,
        heroImage: current?.heroImage || draft.heroImage,
        heroImageAlt: current?.heroImageAlt || draft.heroImageAlt,
        coverageText: within(current?.coverageText, 80)
          ? current!.coverageText
          : draft.coverageText,
        activationText: within(current?.activationText, 80)
          ? current!.activationText
          : draft.activationText,
        compatibilityText: within(current?.compatibilityText, 80)
          ? current!.compatibilityText
          : draft.compatibilityText,
        hotspotText: within(current?.hotspotText, 60)
          ? current!.hotspotText
          : draft.hotspotText,
        faq:
          currentFaq.length >= 3 && currentFaq.every((item) => item.answer.length >= 50)
            ? currentFaq
            : draft.faq,
        published: true,
      },
    });
  }

  revalidatePath("/admin/destinations");
  revalidatePath("/admin/readiness");
  revalidatePath("/esim");
  redirect("/admin/destinations?prepared=1");
}
