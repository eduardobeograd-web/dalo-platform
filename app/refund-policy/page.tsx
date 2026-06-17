import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Refund Policy | DALO",
  description:
    "Read the DALO refund policy for travel eSIM recommendations and digital eSIM purchases.",
  alternates: {
    canonical: `${baseUrl}/refund-policy`,
  },
  openGraph: {
    title: "Refund Policy | DALO",
    description:
      "Read the DALO refund policy for travel eSIM recommendations and digital eSIM purchases.",
    url: `${baseUrl}/refund-policy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Refund Policy | DALO",
    description:
      "Read the DALO refund policy for travel eSIM recommendations and digital eSIM purchases.",
  },
};

export default function RefundPolicyPage() {
  const policySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Refund Policy",
    url: `${baseUrl}/refund-policy`,
    description:
      "Refund policy page for DALO travel eSIM recommendations and digital eSIM purchases.",
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
          <span className="text-slate-900">Refund Policy</span>
        </nav>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 md:p-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
            Refund Policy
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            DALO refund policy
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            This page explains the general refund approach for digital eSIM
            purchases through DALO. Because eSIMs are digital products, refund
            eligibility can depend on whether the eSIM has already been issued,
            installed, activated or used.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            This policy is a practical customer information page and should be
            reviewed before launch together with your final payment provider,
            supplier terms and legal requirements.
          </p>
        </div>

        <section className="mt-10 space-y-6">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Before activation
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              If an eSIM has not yet been installed, activated or used, you may
              contact DALO support to request help with your order. Refund
              eligibility may depend on whether the eSIM was already issued by
              the provider.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              After activation or use
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Once an eSIM has been activated or mobile data has been used, it
              may no longer be refundable. This is because the product is
              delivered digitally and network access may already have started.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Technical issues
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              If you experience a technical issue, contact support with your
              order details, destination, device model and screenshots if
              available. DALO will review the issue and help identify the next
              possible step.
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Wrong destination or incompatible device
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Before buying an eSIM, customers should check that the destination
              is correct and that their phone supports eSIM and is not locked to
              a carrier. If you are unsure, contact support before purchase.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <h2 className="text-3xl font-black text-slate-950">
            Need help with an order?
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            Contact DALO support with your order details and a short explanation
            of the issue. The more information you include, the easier it is to
            review your request.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white"
            >
              Contact support
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
      <SiteFooter />
    </main>
  );
}
