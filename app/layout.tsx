import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import CookieConsent from "../components/CookieConsent";
import DeferredDeviceCompatibilityCheck from "../components/DeferredDeviceCompatibilityCheck";
import { siteUrl as baseUrl } from "../lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "DALO eSIM | Find the Right Travel eSIM for Your Trip",
  description:
    "DALO eSIM matches travelers with the right data plan for their destination, trip length and usage. Get one clear recommendation and install in minutes.",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "DALO eSIM | Find the Right Travel eSIM for Your Trip",
    description:
      "Find the right travel eSIM for your destination, trip length and data usage with one clear DALO recommendation.",
    url: baseUrl,
    siteName: "DALO eSIM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DALO eSIM | Find the Right Travel eSIM for Your Trip",
    description:
      "Find the right travel eSIM plan by destination, trip length and data usage with DALO eSIM.",
  },
  applicationName: "DALO eSIM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DALO eSIM",
  },
  icons: {
    icon: [
      {
        url: "/dalo-favicon-white.png",
        type: "image/png",
        sizes: "64x64",
      },
    ],
    shortcut: "/dalo-favicon-white.png",
    apple: "/apple-touch-icon-v4.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2148c0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DALO eSIM",
    alternateName: "DALO",
    url: baseUrl,
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DALO eSIM",
    legalName: "DALO eSIM Solution LLC",
    url: baseUrl,
    logo: `${baseUrl}/apple-touch-icon-v4.png`,
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {children}
        <DeferredDeviceCompatibilityCheck />
        <CookieConsent />
      </body>
    </html>
  );
}
