import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/support-console",
    name: "DALO Support Console",
    short_name: "DALO Support",
    description: "Secure support operations for the DALO team.",
    start_url: "/support-console",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f8ff",
    theme_color: "#10233a",
    categories: ["business", "utilities"],
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
