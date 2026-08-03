import type { Metadata } from "next";
import HomeHeroQuiz from "../components/HomeHeroQuiz";
import {
  HomeFaq,
  HomeFooter,
  HomeHowItWorks,
  HomePopularDestinations,
  HomeWhyDalo,
} from "../components/HomeStaticSections";
import { siteUrl as baseUrl } from "../lib/site-url";

export const metadata: Metadata = {
  title: "eSIM for International Travel | Find Your Plan | DALO",
  description:
    "Find the right prepaid eSIM for international travel. DALO matches your destination, trip length and data usage with one clear plan recommendation.",
  alternates: { canonical: baseUrl },
  openGraph: {
    title: "Find the Right eSIM for International Travel | DALO",
    description:
      "Tell DALO where you are going, how long you are staying and how you use data. Get one clear travel eSIM recommendation.",
    url: baseUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find the Right eSIM for International Travel | DALO",
    description:
      "Get a travel eSIM recommendation matched to your destination, trip length and data usage.",
  },
};

export default function Home() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "DALO travel eSIM recommendation",
    serviceType: "Travel eSIM recommendation and digital delivery",
    provider: {
      "@type": "Organization",
      name: "DALO eSIM",
      url: baseUrl,
    },
    areaServed: "Worldwide",
    url: `${baseUrl}/#quiz`,
    description:
      "DALO matches travelers with prepaid eSIM plans based on destination, trip length and expected data usage.",
  };

  return (
    <main className="dalo-home min-h-screen bg-[#F6F8FF] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <HomeHeroQuiz />
      <HomeWhyDalo />
      <HomeHowItWorks />
      <HomePopularDestinations />
      <HomeFaq />
      <HomeFooter />
    </main>
  );
}
