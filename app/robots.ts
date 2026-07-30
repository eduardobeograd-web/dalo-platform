import type { MetadataRoute } from "next";
import { siteUrl as baseUrl } from "../lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/checkout",
          "/customer",
          "/result",
          "/searching",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
