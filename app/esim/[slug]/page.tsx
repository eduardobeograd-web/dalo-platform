import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDestinationSeoIssues } from "../../../lib/catalog-readiness";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import DestinationAtAGlance from "../../../components/DestinationAtAGlance";
import DestinationNetworkCoverage from "../../../components/DestinationNetworkCoverage";
import DestinationMap, {
  hasDestinationMap,
} from "../../../components/DestinationMap";
import { parseDestinationFaq } from "../../../lib/destination-pages";
import { getDestinationEditorialGuide } from "../../../lib/destination-editorial-guides";
import { getDestinationImage } from "../../../lib/destination-images";
import { prisma } from "../../../lib/db";
import {
  getSeoLandingPage,
  seoLandingPages,
} from "../../../lib/seo-pages";
import { siteUrl as baseUrl } from "../../../lib/site-url";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = true;
export const revalidate = 3600;

const popularDestinations = [
  { name: "Turkey", href: "/esim/turkey" },
  { name: "Thailand", href: "/esim/thailand" },
  { name: "Serbia", href: "/esim/serbia" },
  { name: "Croatia", href: "/esim/croatia" },
  { name: "Bosnia and Herzegovina", href: "/esim/bosnia-and-herzegovina" },
  { name: "Germany", href: "/esim/germany" },
  { name: "France", href: "/esim/france" },
  { name: "Italy", href: "/esim/italy" },
  { name: "Spain", href: "/esim/spain" },
  { name: "Japan", href: "/esim/japan" },
  { name: "Egypt", href: "/esim/egypt" },
  { name: "United Arab Emirates", href: "/esim/united-arab-emirates" },
  { name: "United Kingdom", href: "/esim/united-kingdom" },
  { name: "United States", href: "/esim/united-states-of-america" },
  { name: "Greece", href: "/esim/greece" },
  { name: "Portugal", href: "/esim/portugal" },
  { name: "Morocco", href: "/esim/morocco" },
  { name: "Canada", href: "/esim/canada" },
  { name: "Australia", href: "/esim/australia" },
  { name: "Mexico", href: "/esim/mexico" },
  { name: "Indonesia", href: "/esim/indonesia" },
  { name: "Malaysia", href: "/esim/malaysia" },
  { name: "Singapore", href: "/esim/singapore" },
  { name: "South Korea", href: "/esim/korea-republic-of" },
  { name: "Saudi Arabia", href: "/esim/saudi-arabia" },
];

const landingPages: Record<
  string,
  {
    name: string;
    countryMatches: string[];
    title: string;
    description: string;
  }
> = {
  turkey: {
    name: "Turkey",
    countryMatches: ["Turkey", "Türkiye", "Turkiye", "turkey"],
    title: "Turkey eSIM | Compare Travel eSIM Plans | DALO",
    description:
      "Compare eSIM plans for Turkey. Find travel data plans with transparent pricing, validity and instant activation options.",
  },
  thailand: {
    name: "Thailand",
    countryMatches: ["Thailand", "thailand"],
    title: "Thailand eSIM | Compare Travel eSIM Plans | DALO",
    description:
      "Compare eSIM plans for Thailand. Find travel data plans for your trip with clear prices and validity.",
  },
  usa: {
    name: "USA",
    countryMatches: ["USA", "United States", "United States of America", "usa"],
    title: "USA eSIM | Compare Travel eSIM Plans | DALO",
    description:
      "Compare eSIM plans for the USA. Find travel data plans for the United States with transparent prices.",
  },
  europe: {
    name: "Europe",
    countryMatches: ["Europe", "europe"],
    title: "Europe eSIM | Compare Travel eSIM Plans | DALO",
    description:
      "Compare eSIM plans for Europe. Find regional travel eSIM options with clear data volume, validity and price.",
  },
};

function getPage(slug: string) {
  const landingPage = landingPages[slug];

  if (landingPage) return landingPage;

  const seoPage = getSeoLandingPage(slug);

  if (!seoPage) return null;

  return {
    name: seoPage.name,
    countryMatches: [seoPage.name],
    title: seoPage.title,
    description: seoPage.description,
  };
}

export async function generateStaticParams() {
  const managedPages = await prisma.destinationPage.findMany({
    where: { published: true },
    select: { slug: true },
  });
  const slugs = new Set([
    ...Object.keys(landingPages),
    ...Object.keys(seoLandingPages),
    ...managedPages.map((page) => page.slug),
  ]);

  return Array.from(slugs).map((slug) => ({ slug }));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPlanHint(dataAmount: string) {
  const normalized = dataAmount.toLowerCase();

  if (normalized.includes("100gb") || normalized.includes("50gb")) {
    return "Best for heavy data use";
  }

  if (normalized.includes("20gb") || normalized.includes("10gb")) {
    return "Best for longer trips";
  }

  if (normalized.includes("5gb") || normalized.includes("3gb")) {
    return "Best for maps, taxis and messaging";
  }

  return "Best for light travel use";
}

type TravelerPlanCandidate = {
  id: string;
  name: string;
  data: string;
  validityDays: number;
  sellPrice: number;
};

function getPlanDataGb(dataAmount: string) {
  const normalized = dataAmount.toLowerCase().replace(/\s+/g, "");
  const value = Number.parseFloat(normalized.match(/[\d.]+/)?.[0] || "0");
  if (!Number.isFinite(value)) return 0;
  return normalized.includes("mb") ? value / 1_000 : value;
}

function getTravelerPlanPicks<T extends TravelerPlanCandidate>(products: T[]) {
  if (!products.length) return [];

  const shortTrip = [...products].sort(
    (left, right) =>
      Math.abs(left.validityDays - 3) - Math.abs(right.validityDays - 3) ||
      getPlanDataGb(left.data) - getPlanDataGb(right.data) ||
      left.sellPrice - right.sellPrice,
  )[0];
  const everyday = [...products].sort(
    (left, right) =>
      Math.abs(getPlanDataGb(left.data) - 5) -
        Math.abs(getPlanDataGb(right.data) - 5) ||
      Math.abs(left.validityDays - 7) - Math.abs(right.validityDays - 7) ||
      left.sellPrice - right.sellPrice,
  )[0];
  const heavy = [...products].sort(
    (left, right) =>
      getPlanDataGb(right.data) - getPlanDataGb(left.data) ||
      right.validityDays - left.validityDays ||
      left.sellPrice - right.sellPrice,
  )[0];

  return [
    {
      label: "Short city break",
      detail: "A practical starting point for maps, messages and bookings.",
      product: shortTrip,
    },
    {
      label: "One-week trip",
      detail: "Balanced for everyday navigation, calls and social use.",
      product: everyday,
    },
    {
      label: "Heavy data use",
      detail: "More headroom for video, hotspot and longer travel days.",
      product: heavy,
    },
  ].filter(
    (pick, index, allPicks) =>
      allPicks.findIndex((candidate) => candidate.product.id === pick.product.id) ===
      index,
  );
}

async function getProducts(
  slug: string,
  managedPage?: { countryName: string; displayName: string } | null,
) {
  const page = getPage(slug);

  if (!page && !managedPage) return [];

  const products = await prisma.product.findMany({
    where: {
      active: true,
    },
    orderBy: {
      sellPrice: "asc",
    },
  });

  return products.filter((product) => {
    const countrySlug = slugify(product.country || "");
    const regionSlug = slugify(product.region || "");

    return (
      product.slug === slug ||
      countrySlug === slug ||
      regionSlug === slug ||
      page?.countryMatches.includes(product.country) ||
      page?.countryMatches.includes(product.region || "") ||
      managedPage?.countryName === product.country ||
      managedPage?.countryName === product.region ||
      managedPage?.displayName === product.country
    );
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  const seoPage = getSeoLandingPage(slug);
  const managedPage = await prisma.destinationPage.findFirst({
    where: { slug, published: true },
  });
  const activeProduct = managedPage
    ? await prisma.product.findFirst({
        where: {
          active: true,
          OR: [
            { country: managedPage.countryName },
            { region: managedPage.countryName },
          ],
        },
        select: { id: true },
      })
    : null;

  if (!page && !seoPage && !managedPage) {
    return {
      title: "Destination not found | DALO",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = managedPage?.seoTitle || seoPage?.title || page!.title;
  const description =
    managedPage?.seoDescription || seoPage?.description || page!.description;

  const pageUrl = `${baseUrl}/esim/${slug}`;
  const displayName =
    managedPage?.displayName || seoPage?.name || page!.name;
  const socialImage =
    managedPage?.heroImage || getDestinationImage(displayName);

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: Boolean(
        managedPage &&
          activeProduct &&
          getDestinationSeoIssues(managedPage).length === 0,
      ),
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: socialImage,
          alt:
            managedPage?.heroImageAlt || `${displayName} travel destination`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function EsimLandingPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "usa") {
    redirect("/esim/united-states-of-america");
  }

  const page = getPage(slug);
  const seoPage = getSeoLandingPage(slug);
  const managedPage = await prisma.destinationPage.findFirst({
    where: { slug, published: true },
  });

  if (!page && !seoPage && !managedPage) notFound();

  const displayName =
    managedPage?.displayName || seoPage?.name || page!.name;
  const editorialGuide = getDestinationEditorialGuide(slug);
  const destinationImage =
    managedPage?.heroImage || getDestinationImage(displayName);
  const pageUrl = `${baseUrl}/esim/${slug}`;
  const headline =
    managedPage?.headline ||
    seoPage?.headline ||
    `${displayName} eSIM plans for your trip`;
  const introText =
    managedPage?.intro ||
    seoPage?.intro ||
    `Find available eSIM plans for ${displayName}. DALO helps travelers find simple mobile data options with transparent prices, validity, and data volume.`;
  const managedFaqs = parseDestinationFaq(managedPage?.faq);
  const faqs =
    (managedFaqs.length ? managedFaqs : null) ||
    seoPage?.faq || [
      {
        question: `Does the ${displayName} eSIM work with iPhone?`,
        answer: "Yes, if your iPhone supports eSIM and is unlocked.",
      },
      {
        question: "When is the eSIM activated?",
        answer:
          "Most eSIMs activate after installation or when they connect to the destination network.",
      },
      {
        question: "Can I keep my normal SIM?",
        answer:
          "Yes. You can usually keep your normal SIM for calls and use the eSIM for mobile data.",
      },
    ];

  const products = await getProducts(slug, managedPage);
  const bestProduct = products[0];
  const travelerPlanPicks = getTravelerPlanPicks(products);
  const contentReviewedAt = managedPage?.updatedAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (!bestProduct) notFound();

  const productSchema = bestProduct
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: bestProduct.name,
        description: bestProduct.seoDescription || bestProduct.description,
        url: pageUrl,
        sku: String(bestProduct.id),
        category: "Travel eSIM",
        brand: {
          "@type": "Brand",
          name: "DALO",
        },
        offers: {
          "@type": "Offer",
          price: bestProduct.sellPrice,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      }
    : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "DALO",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "eSIM",
        item: `${baseUrl}/esim`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: pageUrl,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${displayName} eSIM plans`,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description:
          product.seoDescription ||
          product.description ||
          `${product.data} mobile data for ${displayName}. Valid for ${product.validityDays} days.`,
        brand: {
          "@type": "Brand",
          name: "DALO",
        },
        offers: {
          "@type": "Offer",
          price: product.sellPrice,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <main className="dalo-page dalo-content-page min-h-screen bg-[#F6F8FF] text-slate-900">
      <SiteHeader />
      {productSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-5 sm:px-6 sm:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500 sm:mb-8"
        >
          <Link href="/" className="text-blue-700 hover:text-blue-900">
            DALO
          </Link>

          <span aria-hidden="true">/</span>

          <Link href="/esim" className="text-blue-700 hover:text-blue-900">
            eSIM
          </Link>

          <span aria-hidden="true">/</span>

          <span className="text-slate-900">{displayName}</span>
        </nav>

        <div className="dalo-content-hero dalo-country-hero overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-100">
          <div
            className="grid lg:grid-cols-[1.15fr_0.85fr]"
          >
            <div className="p-5 sm:p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600 sm:mb-3 sm:text-sm">
                {displayName} travel eSIM
              </p>

              <h1 className="max-w-3xl text-[2rem] font-black leading-[1.05] tracking-tight text-slate-950 sm:text-4xl md:text-6xl">
                {headline}
              </h1>

              <p className="mt-3 line-clamp-4 max-w-3xl text-base leading-7 text-slate-600 sm:mt-5 sm:line-clamp-none sm:text-lg sm:leading-8">
                {introText}
              </p>

              {bestProduct ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-3 sm:hidden">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
                      Recommended plan
                    </p>
                    <p className="mt-1 text-xl font-black text-slate-950">
                      ${bestProduct.sellPrice.toFixed(2)}
                    </p>
                  </div>
                  <Link
                    href={`/checkout?productId=${bestProduct.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-bold text-white"
                  >
                    View best plan →
                  </Link>
                </div>
              ) : null}

              {bestProduct?.seoText ? (
                <p className="mt-4 line-clamp-3 max-w-3xl text-sm leading-6 text-slate-600 sm:mt-5 sm:line-clamp-none sm:text-base sm:leading-7">
                  {bestProduct.seoText}
                </p>
              ) : null}
            </div>
            {hasDestinationMap(slug) ? (
              <DestinationMap destination={displayName} slug={slug} />
            ) : (
              <Image
                width={640}
                height={320}
                preload
                quality={60}
                sizes="(max-width: 639px) 100vw, 320px"
                src={destinationImage}
                alt={
                  managedPage?.heroImageAlt ||
                  `${displayName} travel destination`
                }
                className="h-40 min-h-0 w-full object-cover sm:h-60 lg:h-full lg:min-h-72"
              />
            )}
          </div>
        </div>

        {products.length ? (
          <section id="plans" className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
            {products.map((product) => {
              return (
              <article
                key={product.id}
                className={
                  product.data.toLowerCase().includes("5gb")
                    ? "rounded-[1.5rem] border-2 border-blue-600 bg-white p-5 shadow-xl shadow-blue-200 sm:p-6"
                    : "rounded-[1.5rem] border border-white/90 bg-white/90 p-5 shadow-[0_16px_38px_rgba(30,64,120,0.1)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(30,64,120,0.14)] sm:p-6"
                }
              >
                {product.data.toLowerCase().includes("5gb") ? (
                  <p className="mb-4 inline-flex rounded-full bg-blue-700 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                    DALO pick
                  </p>
                ) : null}
                <p className="text-sm font-semibold text-blue-700">
                  DALO travel plan
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  {product.name}
                </h2>

                <p className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {getPlanHint(product.data)}
                </p>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    <strong>Data:</strong> {product.data}
                  </p>
                  <p>
                    <strong>Validity:</strong> {product.validityDays} days
                  </p>
                  <p>
                    <strong>Plan type:</strong> {product.planType}
                  </p>
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    {product.oldPrice ? (
                      <p className="text-sm text-slate-400 line-through">
                        ${product.oldPrice.toFixed(2)}
                      </p>
                    ) : null}
                    <p className="text-3xl font-black text-slate-950">
                      ${product.sellPrice.toFixed(2)}
                    </p>
                  </div>

                  <Link
                    href={`/checkout?productId=${product.id}`}
                    className="rounded-full bg-blue-700 px-5 py-3 text-sm font-bold text-white"
                  >
                    Get this eSIM →
                  </Link>
                </div>
              </article>
              );
            })}
          </section>
        ) : (
          <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              eSIM plans for {displayName}
            </h2>
            <p className="mt-3 text-slate-600">
              We are preparing live eSIM offers for {displayName}. You can still
              use the DALO comparison quiz to find the best available match for
              your trip.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white"
            >
              Start comparison
            </Link>
          </section>
        )}

        {travelerPlanPicks.length > 1 ? (
          <section className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  Choose by travel style
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  A useful starting point for your {displayName} trip
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-slate-600">
                These options are selected from currently available DALO plans.
                Your quiz result can refine the match further.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {travelerPlanPicks.map(({ label, detail, product }, index) => (
                <article
                  key={label}
                  className={`rounded-[1.5rem] border p-5 sm:p-6 ${
                    index === 1
                      ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
                      : "border-blue-100 bg-white shadow-sm"
                  }`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">
                    {label}
                  </p>
                  <h3 className="mt-3 text-xl font-black text-slate-950">
                    {product.data} · {product.validityDays} days
                  </h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                    {detail}
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">From</p>
                      <p className="text-2xl font-black text-slate-950">
                        ${product.sellPrice.toFixed(2)}
                      </p>
                    </div>
                    <Link
                      href={`/checkout?productId=${product.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 text-sm font-black text-white transition hover:bg-blue-800"
                    >
                      View plan →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {managedPage &&
        [
          managedPage.coverageText,
          managedPage.activationText,
          managedPage.compatibilityText,
          managedPage.hotspotText,
        ].some(Boolean) ? (
          <section className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ["Coverage and networks", managedPage.coverageText],
              ["Activation", managedPage.activationText],
              ["Device compatibility", managedPage.compatibilityText],
              ["Hotspot and tethering", managedPage.hotspotText],
            ]
              .filter((item): item is [string, string] => Boolean(item[1]))
              .map(([title, text]) => (
                <article
                  key={title}
                  className="rounded-[1.5rem] border border-blue-100 bg-white p-6 shadow-sm"
                >
                  <h2 className="text-xl font-black text-slate-950">{title}</h2>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </article>
              ))}
          </section>
        ) : null}

        {editorialGuide ? (
          <section className="mt-10 overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_20px_55px_rgba(37,83,215,0.1)]">
            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-orange-50 px-6 py-7 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Connected travel guide
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Plan your connected trip to {displayName}
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-600">
                {editorialGuide.overview ||
                  "Practical guidance for choosing your data allowance and arriving with the information you need already available."}
              </p>
            </div>

            <div className="grid lg:grid-cols-2">
              <article className="border-b border-blue-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-700">
                  How much data do you need?
                </p>
                <p className="mt-3 leading-7 text-slate-600">
                  {editorialGuide.dataAdvice}
                </p>
                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Common mobile data uses
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {editorialGuide.useCases.map((useCase) => (
                    <span
                      key={useCase}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-700"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      {useCase}
                    </span>
                  ))}
                </div>
              </article>

              <article className="p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-700">
                  Arrive connected
                </p>
                <p className="mt-3 leading-7 text-slate-600">
                  {editorialGuide.arrivalAdvice}
                </p>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.15em] text-slate-500">
                  Popular stops
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {editorialGuide.places.map((place) => (
                    <span
                      key={place}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                    >
                      {place}
                    </span>
                  ))}
                </div>
              </article>
            </div>

            {editorialGuide.connectivityTips?.length ? (
              <div className="border-t border-blue-100 bg-[#fbfcff] px-6 py-7 sm:px-8">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-700">
                  Before you travel
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {editorialGuide.connectivityTips.map((tip, index) => (
                    <div
                      key={tip}
                      className="grid grid-cols-[2rem_1fr] gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-[10px] font-black text-blue-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm leading-6 text-slate-600">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {editorialGuide.officialLinks?.length ? (
              <div className="border-t border-blue-100 px-6 py-7 sm:px-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-orange-700">
                      Verified travel resources
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                      Continue with an official source
                    </h3>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-right">
                    Entry and travel information can change. Check the official source before departure.
                  </p>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {editorialGuide.officialLinks.map((resource) => (
                    <a
                      key={resource.href}
                      href={resource.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex min-h-32 flex-col justify-between rounded-2xl border border-blue-100 bg-blue-50/50 p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                    >
                      <span>
                        <span className="block text-sm font-black text-slate-950 group-hover:text-blue-800">
                          {resource.label}
                        </span>
                        <span className="mt-2 block text-xs leading-5 text-slate-600">
                          {resource.description}
                        </span>
                      </span>
                      <span className="mt-4 text-xs font-black text-blue-700">
                        Open official website ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {managedPage ? (
          <aside className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-black text-emerald-700">
                ✓
              </span>
              <div>
                <p className="font-black text-slate-950">Reviewed by DALO</p>
                <p>
                  Destination guidance and active catalog information
                  {contentReviewedAt ? ` · Updated ${contentReviewedAt}` : ""}
                </p>
              </div>
            </div>
            <p className="max-w-lg leading-6 sm:text-right">
              Plan availability and prices come from the current DALO catalog.
              Emergency details are displayed only with a verified official source.
            </p>
          </aside>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-[2rem] bg-[#0b2f78] text-white shadow-xl shadow-blue-200">
          <div className="grid items-center gap-6 p-7 sm:p-9 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                DALO recommendation engine
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Not sure which {displayName} eSIM fits your trip?
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-blue-100">
                Match your destination, trip length and expected data usage with
                one clear plan recommendation instead of comparing every package.
              </p>
            </div>
            <Link
              href="/#quiz"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 font-black text-blue-800 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Find my eSIM <span aria-hidden="true" className="ml-2">→</span>
            </Link>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <h2 className="text-3xl font-black text-slate-950">
            Popular eSIM destinations
          </h2>

          <p className="mt-3 max-w-3xl text-slate-600">
            Explore other popular travel eSIM destinations and find the right
            data plan for your next trip.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {popularDestinations
              .filter((destination) => destination.href !== `/esim/${slug}`)
              .map((destination) => (
                <Link
                  key={destination.href}
                  href={destination.href}
                  className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
                >
                  {destination.name} eSIM
                </Link>
              ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <h2 className="text-3xl font-black text-slate-950">
            {displayName} eSIM FAQ
          </h2>

          <div className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-bold text-slate-950">{faq.question}</h3>
                <p className="mt-2 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
      <DestinationAtAGlance slug={slug} />
      <DestinationNetworkCoverage slug={slug} />
      <SiteFooter />
    </main>
  );
}
