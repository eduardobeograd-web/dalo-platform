import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { siteUrl as baseUrl } from "../../lib/site-url";

export const metadata: Metadata = {
  title: "Cookie Policy | DALO",
  description:
    "Learn which cookies and browser storage technologies DALO uses, why they are used and how to manage your choices.",
  alternates: {
    canonical: `${baseUrl}/cookie-policy`,
  },
  openGraph: {
    title: "Cookie Policy | DALO",
    description:
      "Details about necessary, analytics and marketing storage used by DALO.",
    url: `${baseUrl}/cookie-policy`,
    type: "website",
  },
};

const storageItems = [
  {
    name: "dalo_consent_v1",
    type: "First-party cookie",
    category: "Necessary",
    duration: "180 days",
    purpose:
      "Stores your analytics and marketing choices so DALO can respect them across pages and future visits.",
  },
  {
    name: "dalo_customer_session_v2",
    type: "HTTP-only first-party cookie",
    category: "Necessary",
    duration: "30 days",
    purpose:
      "Keeps a customer securely signed in and enables access to the customer account and orders.",
  },
  {
    name: "dalo_admin",
    type: "HTTP-only first-party cookie",
    category: "Necessary",
    duration: "24 hours",
    purpose:
      "Keeps an authorised administrator signed in. It is only used in the protected administration area.",
  },
  {
    name: "dalo_session_id",
    type: "Local storage",
    category: "Analytics / Marketing",
    duration: "Until consent is withdrawn or browser data is cleared",
    purpose:
      "Creates a random DALO visitor reference used to connect consented product, checkout and campaign events. It is not created before optional consent.",
  },
  {
    name: "dalo_product_view_[product ID]",
    type: "Session storage",
    category: "Analytics",
    duration: "Current browser tab session",
    purpose:
      "Prevents the same product view from being counted repeatedly during one browsing session.",
  },
];

export default function CookiePolicyPage() {
  const policySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DALO Cookie Policy",
    url: `${baseUrl}/cookie-policy`,
    dateModified: "2026-07-28",
  };

  return (
    <main className="dalo-page dalo-content-page min-h-screen bg-[#F6F8FF] text-slate-900">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(policySchema) }}
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
          <span className="text-slate-900">Cookie Policy</span>
        </nav>

        <div className="dalo-content-hero overflow-hidden rounded-[2rem] bg-[#10233a] p-8 text-white shadow-[0_24px_70px_rgba(16,35,58,0.2)] md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f2a45f]">
            Privacy controls
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            DALO Cookie Policy
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            This policy explains which cookies and browser storage technologies
            DALO currently uses, what they do and how you can control optional
            analytics and marketing storage.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Last updated: 28 July 2026
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Necessary",
              text: "Required for consent choices, security, login, checkout and orders. These cannot be disabled through DALO settings.",
              tone: "border-emerald-200 bg-emerald-50",
            },
            {
              title: "Analytics",
              text: "Helps DALO understand product interest and the customer journey. It remains off until you agree.",
              tone: "border-blue-200 bg-blue-50",
            },
            {
              title: "Marketing",
              text: "Supports campaign attribution and optional checkout follow-up. It remains off until you agree.",
              tone: "border-amber-200 bg-amber-50",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-[1.5rem] border p-6 ${item.tone}`}
            >
              <h2 className="text-xl font-black text-slate-950">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6 md:p-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Storage currently used by DALO
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Cookies are small browser files. Local storage and session
              storage are similar browser technologies and are covered by the
              same DALO privacy controls.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Name</th>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Duration</th>
                  <th className="px-6 py-4 font-bold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {storageItems.map((item) => (
                  <tr key={item.name} className="border-t border-slate-100">
                    <td className="px-6 py-5 font-mono text-sm font-bold text-blue-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {item.type}
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-900">
                      {item.category}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {item.duration}
                    </td>
                    <td className="px-6 py-5 text-sm leading-6 text-slate-600">
                      {item.purpose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-black text-slate-950">
              DALO’s internal event system
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              With analytics consent, DALO may record product views, searches
              and checkout starts. With marketing consent, DALO may connect
              campaign references or an unfinished checkout to a session.
              Operational records required to complete a purchase, deliver an
              eSIM or provide support are treated separately as necessary
              service data.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-black text-slate-950">
              Google Analytics and Meta
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO does not currently use Google Analytics, Google Ads tags,
              Meta Pixel, Meta Conversions API, Hotjar or similar external
              advertising and analytics tags. This policy and the consent
              controls will be updated before any such service is activated.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-black text-slate-950">
              Service providers and external requests
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Stripe processes payment and checkout information when you choose
              to purchase. Resend processes transactional email delivery. Some
              travel images are currently delivered by Unsplash, which means
              the visitor&apos;s browser may connect directly to Unsplash and
              transmit technical connection information such as an IP address
              and user agent.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-black text-slate-950">
              Change or withdraw your choice
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Open “Cookie settings” in the footer at any time. Rejecting
              optional storage does not prevent you from browsing, using the
              recommendation quiz, purchasing an eSIM or accessing an order.
              You can also remove stored data through your browser settings.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-blue-200 bg-blue-50 p-8">
          <h2 className="text-2xl font-black text-slate-950">
            Questions about cookies?
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Contact DALO if you have a question about these technologies or how
            your privacy choice is applied.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Contact DALO
          </Link>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
