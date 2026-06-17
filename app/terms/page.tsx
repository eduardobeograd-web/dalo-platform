import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Terms of Service | DALO",
  description:
    "Read the DALO terms of service for using the website, travel eSIM recommendations and related digital services.",
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: "Terms of Service | DALO",
    description:
      "Read the DALO terms of service for travel eSIM recommendations, website use and related digital services.",
    url: `${baseUrl}/terms`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | DALO",
    description:
      "Read the DALO terms of service for travel eSIM recommendations, website use and related digital services.",
  },
};

export default function TermsPage() {
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DALO Terms of Service",
    url: `${baseUrl}/terms`,
    description:
      "Terms of service page for DALO travel eSIM recommendations and website use.",
  };

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
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
          <span className="text-slate-900">Terms</span>
        </nav>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 md:p-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
            Terms of Service
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            DALO terms of service
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            These terms explain the general rules for using DALO, including the
            website, travel eSIM recommendations, destination pages and related
            digital services.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            This page is a practical draft for launch preparation and should be
            reviewed with your final legal, payment and supplier setup before
            going live.
          </p>
        </div>

        <section className="mt-10 space-y-6">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Use of DALO
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO provides travel eSIM information and recommendation tools to
              help users make more informed decisions. Users are responsible for
              checking destination coverage, phone compatibility and plan
              details before purchase.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              eSIM recommendations
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Recommendations are based on available product information,
              destination, trip length and expected data needs. DALO aims to
              make choices easier, but users should review the final plan
              details before ordering.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Digital products
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              eSIMs are digital products. Delivery, activation, validity and
              refund eligibility may depend on the selected plan, provider,
              network conditions and whether the eSIM has already been issued,
              installed, activated or used.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Device compatibility
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Users should make sure their device supports eSIM and is not
              locked to a carrier before buying. DALO cannot guarantee that a
              plan will work on an incompatible or locked device.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Changes to these terms
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO may update these terms as the product, provider setup,
              checkout process or legal requirements change.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <h2 className="text-3xl font-black text-slate-950">
            Questions about these terms?
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            Contact DALO support if you have questions about using the website,
            eSIM recommendations or digital eSIM purchases.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white"
            >
              Contact DALO
            </Link>

            <Link
              href="/refund-policy"
              className="rounded-full bg-blue-50 px-6 py-3 text-sm font-bold text-blue-700"
            >
              Refund policy
            </Link>
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
