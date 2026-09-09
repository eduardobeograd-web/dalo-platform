// Read-only review. Deliberately no --apply option and no database writes.
import { prisma } from "../lib/db";
import { getDestinationSeoIssues } from "../lib/catalog-readiness";
import { parseDestinationFaq } from "../lib/destination-pages";
import review from "../content/destination-copy-review-2026-09-07.json";

async function main() {
  const pages = await prisma.destinationPage.findMany({
    where: { published: true, indexable: true },
  });
  const previews = review.pages.map((change) => {
    const current = pages.find((page) => page.slug === change.slug);
    if (!current) throw new Error(`Not a released destination: ${change.slug}`);
    const faq = parseDestinationFaq(current.faq);
    if (change.faqReplacement) {
      const replacement = change.faqReplacement;
      const matching = faq.filter((item) => item.question === replacement.question && item.answer === replacement.expectedAnswer);
      if (matching.length !== 1) throw new Error(`FAQ changed since review: ${change.slug}`);
      const item = matching[0];
      item.answer = replacement.answer;
    }
    const proposed = {
      ...current,
      seoTitle: change.seoTitle ?? current.seoTitle,
      seoDescription: change.seoDescription ?? current.seoDescription,
      faq,
    };
    const issues = getDestinationSeoIssues(proposed);
    if (issues.length) throw new Error(`${change.slug}: ${issues.join("; ")}`);
    return {
      slug: current.slug,
      before: { seoTitle: current.seoTitle, seoDescription: current.seoDescription },
      after: { seoTitle: proposed.seoTitle, seoDescription: proposed.seoDescription },
      faqChanged: Boolean(change.faqReplacement),
    };
  });
  const proposedTitles = pages.map((page) => previews.find((p) => p.slug === page.slug)?.after.seoTitle ?? page.seoTitle);
  if (new Set(proposedTitles.map((title) => title.trim().toLowerCase())).size !== pages.length) {
    throw new Error("Duplicate titles after proposed changes");
  }
  console.log(JSON.stringify({ mode: "READ_ONLY", releasedPages: pages.length, changedPages: previews.length, previews }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
