import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/customer/dashboard",
    name: "DALO eSIM",
    short_name: "DALO eSIM",
    description:
      "Keep your travel eSIM, installation details and support close at hand.",
    start_url: "/customer/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f6f8ff",
    theme_color: "#2148c0",
    categories: ["travel", "utilities"],
    icons: [
      {
        src: "/pwa-icon-192-v4.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512-v4.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-maskable-512-v4.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
