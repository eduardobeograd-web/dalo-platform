import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const destinations = [
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

export const metadata: Metadata = {
  title: "Travel eSIM Destinations | DALO",
  description:
    "Explore popular travel eSIM destinations with DALO and find the right mobile data plan for your trip.",
  alternates: {
    canonical: `${baseUrl}/esim`,
  },
  openGraph: {
    title: "Travel eSIM Destinations | DALO",
    description:
      "Explore popular travel eSIM destinations and find the right eSIM plan for your trip with DALO.",
    url: `${baseUrl}/esim`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel eSIM Destinations | DALO",
    description:
      "Explore popular travel eSIM destinations and find the right eSIM plan for your trip with DALO.",
  },
};

export default function EsimHubPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Travel eSIM destinations",
    itemListElement: destinations.map((destination, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${destination.name} eSIM`,
      url: `${baseUrl}${destination.href}`,
    })),
  };

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
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
          <span className="text-slate-900">eSIM</span>
        </nav>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
            Travel eSIM destinations
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Find travel eSIM plans by destination
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Choose your destination and let DALO help you find a clear travel
            eSIM option based on your trip length, data needs and destination.
          </p>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <Link
              key={destination.href}
              href={destination.href}
              className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-2xl font-black text-slate-950">
                {destination.name} eSIM
              </h2>

              <p className="mt-3 text-slate-600">
                View available travel eSIM plans for {destination.name}.
              </p>

              <p className="mt-5 font-bold text-blue-700">
                View destination →
              </p>
            </Link>
          ))}
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
