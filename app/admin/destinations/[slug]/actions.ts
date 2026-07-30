"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/db";
import { ADMIN_PERMISSIONS } from "../../../../lib/admin-permissions";
import { requireAdminPermission } from "../../../../lib/admin-auth";

export async function updateDestinationPage(
  slug: string,
  formData: FormData,
) {
  await requireAdminPermission(ADMIN_PERMISSIONS.SEO_WRITE);
  const faq = Array.from({ length: 4 }, (_, index) => ({
    question: String(formData.get(`faqQuestion${index}`) || "").trim(),
    answer: String(formData.get(`faqAnswer${index}`) || "").trim(),
  })).filter((item) => item.question && item.answer);

  const data = {
    countryName: String(formData.get("countryName") || "").trim(),
    displayName: String(formData.get("displayName") || "").trim(),
    seoTitle: String(formData.get("seoTitle") || "").trim(),
    seoDescription: String(formData.get("seoDescription") || "").trim(),
    headline: String(formData.get("headline") || "").trim(),
    intro: String(formData.get("intro") || "").trim(),
    heroImage: String(formData.get("heroImage") || "").trim() || null,
    heroImageAlt: String(formData.get("heroImageAlt") || "").trim() || null,
    coverageText: String(formData.get("coverageText") || "").trim() || null,
    activationText:
      String(formData.get("activationText") || "").trim() || null,
    compatibilityText:
      String(formData.get("compatibilityText") || "").trim() || null,
    hotspotText: String(formData.get("hotspotText") || "").trim() || null,
    faq,
    published: formData.get("published") === "on",
    indexable: formData.get("indexable") === "on",
  };

  await prisma.destinationPage.upsert({
    where: { slug },
    create: { slug, ...data },
    update: data,
  });

  revalidatePath(`/esim/${slug}`);
  revalidatePath("/esim");
  revalidatePath("/sitemap.xml");
  redirect(`/admin/destinations/${slug}?saved=1`);
}
