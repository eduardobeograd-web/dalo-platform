import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "DALO | Find the Best Travel eSIM for Your Trip",
  description:
    "DALO helps travelers find the right eSIM plan by destination, trip length and data usage. Get a simple recommendation instead of comparing hundreds of plans.",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "DALO | Find the Best Travel eSIM for Your Trip",
    description:
      "DALO helps travelers find the right eSIM plan by destination, trip length and data usage. Get one clear recommendation instead of comparing hundreds of plans.",
    url: baseUrl,
    siteName: "DALO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DALO | Find the Best Travel eSIM for Your Trip",
    description:
      "Find the right travel eSIM plan by destination, trip length and data usage with DALO.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
