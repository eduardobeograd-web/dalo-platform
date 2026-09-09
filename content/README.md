# Destination copy reviews

The production destination editor/database is the current source of truth for live copy.
These files are review artifacts, not automatic seeds. Do not replay an old review over newer edits.

## Verified work

- 2026-09-07: 17 SEO titles, four meta descriptions and the Philippines hotspot FAQ applied through the production editor and verified publicly (18 pages).
- 2026-09-07: Italy model copy, then the remaining 24 released destinations updated in the production editor. New headlines, introductions, coverage text and selected FAQs verified live. Existing indexing and publishing flags preserved.
- 2026-09-08: `balkan-copy-review-2026-09-08.json` contains five prepared reviews: Serbia, Croatia, Bosnia and Herzegovina, Montenegro and Albania. NOT applied: production admin login expired. All five publicly return `noindex, follow` at review time. Do not mark them live until saved and verified.

## Apply a review safely

1. Sign in through the normal destination admin editor.
2. Read the current form; match each FAQ replacement by its exact question. Stop on ambiguity or intervening changes.
3. Apply only the listed fields. Preserve other FAQ entries, product country mapping, images and publication/indexing/plan-finder switches.
4. Save through the editor, which revalidates the public page and sitemap.
5. Verify the new public text, metadata, quiz and indexing state.
6. Update the review status only after verification.

Indexing expansion is a separate editorial decision; none of these drafts grants it automatically. The historical priority list is not an authoritative list of current approvals.

## Historical bulk scripts

`curate-priority-destinations.ts`, `prepare-all-destinations.ts`, `finalize-indexed-destinations.ts` and the write mode of `finalize-all-destinations.ts` are historical bulk writers. They can restore outdated copy or overwrite publication/indexing decisions.

They now require BOTH `--apply` and `--allow-legacy-seo-overwrite` before running their historical writes. This is an accidental-execution guard, not permission or a backup mechanism. Do not supply those flags for routine maintenance. An intentional restoration needs an approved target set, a current backup and review of the entire script first. `finalize-all-destinations.ts` without `--apply` retains its read-only preview.

Guard tests: `node --import tsx --test scripts/legacy-seo-write-guard.test.ts` (no database access).
