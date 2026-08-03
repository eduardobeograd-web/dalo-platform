import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { getDestinationImage } from "../../lib/destination-images";
import { slugifyDestination } from "../../lib/destination-pages";
import { prisma } from "../../lib/db";
import { baseUrl } from "../../lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "eSIM Destinations | Find Travel Data Plans | DALO",
  description:
    "Explore DALO eSIM destinations and compare travel data plans by country or region. Find clear pricing, flexible validity and instant digital delivery.",
  alternates: { canonical: `${baseUrl}/esim` },
  openGraph: {
    title: "eSIM Destinations | DALO",
    description:
      "Find travel eSIM plans for destinations around the world with clear pricing and instant digital delivery.",
    url: `${baseUrl}/esim`,
    type: "website",
  },
};

const popularSlugs = [
  "germany",
  "spain",
  "italy",
  "united-states-of-america",
  "japan",
  "thailand",
];

type Destination = {
  slug: string;
  name: string;
  indexable: boolean;
};

function groupDestinations(destinations: Destination[]) {
  return destinations.reduce<Record<string, Destination[]>>((groups, item) => {
    const letter = item.name.charAt(0).toUpperCase();
    (groups[letter] ||= []).push(item);
    return groups;
  }, {});
}

export default async function EsimHubPage() {
  const [products, pages] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        sellPrice: { gt: 0 },
        validityDays: { gt: 0 },
      },
      select: { country: true, region: true },
    }),
    prisma.destinationPage.findMany({
      where: { published: true },
      select: {
        slug: true,
        countryName: true,
        displayName: true,
        indexable: true,
      },
      orderBy: { displayName: "asc" },
    }),
  ]);

  const availableNames = new Set<string>();
  const availableSlugs = new Set<string>();

  for (const product of products) {
    for (const value of [product.country, product.region]) {
      const name = value?.trim();
      if (!name) continue;
      availableNames.add(name.toLowerCase());
      availableSlugs.add(slugifyDestination(name));
    }
  }

  const destinations = pages
    .filter(
      (page) =>
        availableSlugs.has(page.slug) ||
        availableNames.has(page.countryName.trim().toLowerCase()),
    )
    .map((page) => ({
      slug: page.slug,
      name: page.displayName,
      indexable: page.indexable,
    }));

  const popular = popularSlugs
    .map((slug) => destinations.find((destination) => destination.slug === slug))
    .filter((destination): destination is Destination => Boolean(destination));
  const grouped = groupDestinations(destinations);
  const letters = Object.keys(grouped).sort();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DALO eSIM destinations",
    url: `${baseUrl}/esim`,
    description:
      "Browse destinations with active DALO travel eSIM plans.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: destinations.length,
      itemListElement: destinations.map((destination, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${destination.name} eSIM`,
        url: `${baseUrl}/esim/${destination.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-950">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-blue-100 bg-[linear-gradient(135deg,#071f52_0%,#0b4cb8_58%,#0e79c9_100%)] text-white">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_18%_20%,rgba(255,255,255,.7),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(84,211,255,.7),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-100">
            DALO destinations
          </p>
          <div className="mt-4 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.03] tracking-[-0.04em] sm:text-6xl">
                Your next destination. Already connected.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">
                Browse countries and regions with active DALO plans, then compare
                data, validity and price before you travel.
              </p>
            </div>
            <Link
              href="/#quiz"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 font-black text-blue-800 shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Find my eSIM <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
              Popular destinations
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Start with a traveler favorite
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            {destinations.length} destinations with active plans
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {popular.map((destination) => (
            <Link
              key={destination.slug}
              href={`/esim/${destination.slug}`}
              className="group relative min-h-48 overflow-hidden rounded-2xl bg-slate-900 shadow-[0_12px_35px_rgba(15,38,75,.16)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
            >
              <Image
                src={getDestinationImage(destination.name)}
                alt={`Travel in ${destination.name}`}
                fill
                sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 17vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-black text-white">{destination.name}</p>
                <p className="mt-1 text-xs font-bold text-blue-100">
                  View eSIM plans <span aria-hidden="true">→</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
              All available destinations
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Explore by country or region
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Every destination below currently has at least one active,
              purchasable DALO plan. Availability updates automatically with the
              product catalogue.
            </p>
          </div>

          <nav aria-label="Destination initials" className="mt-7 flex flex-wrap gap-2">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#destinations-${letter.toLowerCase()}`}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              >
                {letter}
              </a>
            ))}
          </nav>

          <div className="mt-10 grid gap-x-10 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
            {letters.map((letter) => (
              <section key={letter} id={`destinations-${letter.toLowerCase()}`} className="scroll-mt-24">
                <h3 className="border-b border-blue-100 pb-3 text-2xl font-black text-blue-800">
                  {letter}
                </h3>
                <ul className="mt-2 divide-y divide-slate-100">
                  {grouped[letter].map((destination) => (
                    <li key={destination.slug}>
                      <Link
                        href={`/esim/${destination.slug}`}
                        className="flex min-h-12 items-center justify-between gap-3 py-3 font-bold text-slate-700 transition hover:translate-x-1 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                      >
                        <span>{destination.name}</span>
                        <span aria-hidden="true" className="text-blue-500">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eaf2ff]">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-10 sm:grid-cols-3 sm:px-8 lg:px-10">
          {[
            ["Matched to your trip", "Use the DALO quiz to compare plans by destination, duration and data usage."],
            ["Clear plan details", "See data volume, validity and price before you continue to checkout."],
            ["Delivered digitally", "Receive your installation details after payment without waiting for a physical SIM."],
          ].map(([title, copy]) => (
            <div key={title} className="border-l-2 border-blue-600 pl-5">
              <h2 className="font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteFooter />
    </main>
  );
}
