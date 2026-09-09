/** Historical bulk writers must never run accidentally against edited pages. */
export function requireLegacySeoWriteConsent(args: readonly string[]) {
  if (!args.includes("--apply") || !args.includes("--allow-legacy-seo-overwrite")) {
    throw new Error(
      "Legacy SEO write blocked. This historical script can overwrite reviewed copy " +
      "and publication/indexing decisions. Use the destination admin editor for " +
      "routine changes. For an explicitly approved restoration, first back up the " +
      "destination data and review the full target set, then supply both --apply " +
      "and --allow-legacy-seo-overwrite. Neither flag is approval by itself.",
    );
  }
}
