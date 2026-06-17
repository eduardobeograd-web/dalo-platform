import type { Metadata } from "next";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Privacy Policy | DALO",
  description:
    "Read the DALO privacy policy and learn how DALO handles information for travel eSIM recommendations and support.",
  alternates: {
    canonical: `${baseUrl}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy | DALO",
    description:
      "Read the DALO privacy policy for travel eSIM recommendations, customer support and website use.",
    url: `${baseUrl}/privacy-policy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | DALO",
    description:
      "Read the DALO privacy policy for travel eSIM recommendations, customer support and website use.",
  },
};

export default function PrivacyPolicyPage() {
  const policySchema = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    name: "DALO Privacy Policy",
    url: `${baseUrl}/privacy-policy`,
    description:
      "Privacy policy page for DALO travel eSIM recommendations and website use.",
  };

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(policySchema) }}
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
          <span className="text-slate-900">Privacy Policy</span>
        </nav>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 md:p-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
            Privacy Policy
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            How DALO handles privacy
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            This privacy policy explains how DALO may collect, use and protect
            information when people use the website, request eSIM
            recommendations or contact support.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            This page is a practical draft for launch preparation and should be
            reviewed with your final legal, payment and provider setup before
            going live.
          </p>
        </div>

        <section className="mt-10 space-y-6">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Information you provide
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO may collect information you choose to provide, such as your
              destination, trip length, expected data usage, contact details or
              support messages.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Website and usage data
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO may use basic website data to understand how visitors use the
              site, improve recommendations, fix errors and make the experience
              clearer for travelers.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              How information is used
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Information may be used to provide recommendations, process
              support requests, improve the website, communicate with users and
              keep DALO services reliable.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Service providers
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO may work with trusted service providers for hosting,
              analytics, payments, email, support or eSIM delivery. These
              providers should only process information needed for their role.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Your choices
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              You can contact DALO to ask questions about your information or to
              request help with privacy-related concerns.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <h2 className="text-3xl font-black text-slate-950">
            Contact about privacy
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            For privacy questions, contact DALO support with a clear explanation
            of your request.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white"
            >
              Contact DALO
            </Link>

            <Link
              href="/support"
              className="rounded-full bg-blue-50 px-6 py-3 text-sm font-bold text-blue-700"
            >
              Visit support
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
