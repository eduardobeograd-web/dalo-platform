import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "DALO Support Console",
  description: "Secure DALO team support workspace.",
  applicationName: "DALO Support Console",
  manifest: "/support-console/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DALO Support",
  },
};

export const viewport: Viewport = {
  themeColor: "#10233a",
};

export default function SupportConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
