import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "../../../lib/db";
import { getSeoLandingPage } from "../../../lib/seo-pages";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
  return landingPages[slug] || {
    name: slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
    countryMatches: [slug],
    title: `${slug} eSIM | Compare Travel eSIM Plans | DALO`,
    description: `Compare eSIM plans for ${slug}. Find travel data plans with transparent pricing on DALO.`,
  };
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

async function getProducts(slug: string) {
  const page = getPage(slug);

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
      page.countryMatches.includes(product.country) ||
      page.countryMatches.includes(product.region || "")
    );
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  const seoPage = getSeoLandingPage(slug);

  const title = seoPage?.title || page.title;
  const description = seoPage?.description || page.description;

  const pageUrl = `${baseUrl}/esim/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
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
  const page = getPage(slug);
  const seoPage = getSeoLandingPage(slug);
  const displayName = seoPage?.name || page.name;
  const pageUrl = `${baseUrl}/esim/${slug}`;
  const headline = seoPage?.headline || `${displayName} eSIM plans for your trip`;
  const introText =
    seoPage?.intro ||
    `Find available eSIM plans for ${displayName}. DALO helps travelers find simple mobile data options with transparent prices, validity, and data volume.`;
  const faqs =
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

  const products = await getProducts(slug);
  const bestProduct = products[0];

  const productSchema = bestProduct
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: bestProduct.name,
        description: bestProduct.seoDescription || bestProduct.description,
        brand: {
          "@type": "Brand",
          name: bestProduct.provider,
        },
        offers: {
          "@type": "Offer",
          price: bestProduct.sellPrice,
          priceCurrency: "EUR",
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
          name: product.provider,
        },
        offers: {
          "@type": "Offer",
          price: product.sellPrice,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
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

      <section className="mx-auto max-w-6xl px-6 py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500"
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

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
            Travel eSIM recommendation
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            {headline}
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {introText}
          </p>

          {bestProduct?.seoText ? (
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
              {bestProduct.seoText}
            </p>
          ) : null}
        </div>

        {products.length ? (
          <section className="mt-10 grid gap-6 md:grid-cols-3">
            {products.map((product) => {
              return (
              <article
                key={product.id}
                className={
                  product.data.toLowerCase().includes("5gb")
                    ? "rounded-[1.5rem] border-2 border-blue-600 bg-white p-6 shadow-xl shadow-blue-200"
                    : "rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100"
                }
              >
                {product.data.toLowerCase().includes("5gb") ? (
                  <p className="mb-4 inline-flex rounded-full bg-blue-700 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                    DALO pick
                  </p>
                ) : null}
                <p className="text-sm font-semibold text-blue-700">
                  {product.provider}
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
                        €{product.oldPrice.toFixed(2)}
                      </p>
                    ) : null}
                    <p className="text-3xl font-black text-slate-950">
                      €{product.sellPrice.toFixed(2)}
                    </p>
                  </div>

                  <Link
                    href="/#quiz"
                    className="rounded-full bg-blue-700 px-5 py-3 text-sm font-bold text-white"
                  >
                    Find best match
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
    </main>
  );
}
