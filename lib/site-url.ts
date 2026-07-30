const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

if (!configuredSiteUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be configured in production for canonical URLs, robots.txt and sitemap.xml.",
  );
}

export const siteUrl = (configuredSiteUrl || "http://localhost:3000").replace(
  /\/+$/,
  "",
);
