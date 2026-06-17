import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "About DALO | Travel eSIM Recommendations",
  description:
    "Learn about DALO, a travel eSIM recommendation platform that helps travelers find simple mobile data options for their trips.",
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: "About DALO | Travel eSIM Recommendations",
    description:
      "DALO helps travelers find the right eSIM plan by destination, trip length and data needs.",
    url: `${baseUrl}/about`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About DALO | Travel eSIM Recommendations",
    description:
      "DALO helps travelers find the right eSIM plan by destination, trip length and data needs.",
  },
};

export default function AboutPage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DALO",
    url: baseUrl,
    description:
      "DALO is a travel eSIM recommendation platform that helps travelers find simple mobile data options for their trips.",
  };

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <section className="mx-auto max-w-5xl px-6 py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500"
        >
          <Link href="/" className="text-blue-700 hover:text-blue-900">
            DALO
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900">About</span>
        </nav>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 md:p-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
            About DALO
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Helping travelers find the right eSIM without confusion
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            DALO is built for travelers who want a simple answer before a trip:
            which eSIM plan fits my destination, travel length and data needs?
            Instead of forcing users to compare endless plans, DALO focuses on
            clear recommendations and easy decision-making.
          </p>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-xl font-black text-slate-950">
              Simple recommendations
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO helps turn destination, trip length and data usage into a
              clearer eSIM recommendation.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-xl font-black text-slate-950">
              Travel-focused
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Our pages are designed around real travel needs like maps,
              messaging, taxis, bookings and avoiding roaming surprises.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-xl font-black text-slate-950">
              Clear next step
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Travelers can start with a destination page or use the DALO quiz
              to find a suitable eSIM option.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <h2 className="text-3xl font-black text-slate-950">
            Why DALO exists
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            Buying travel connectivity should not feel complicated. Many
            travelers only need to know whether a plan is enough for their trip,
            how long it is valid and what it costs. DALO is being developed to
            make that process easier, clearer and more useful for real travel
            decisions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#quiz"
              className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white"
            >
              Find your eSIM match
            </Link>

            <Link
              href="/esim"
              className="rounded-full bg-blue-50 px-6 py-3 text-sm font-bold text-blue-700"
            >
              Explore destinations
            </Link>
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
