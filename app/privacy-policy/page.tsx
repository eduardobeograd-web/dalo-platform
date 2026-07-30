import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { siteUrl as baseUrl } from "../../lib/site-url";

export const metadata: Metadata = {
  title: "Privacy Policy | DALO",
  description:
    "Learn how DALO ESIM SOLUTIONS LLC collects, uses and protects personal information when providing travel eSIM recommendations and services.",
  alternates: {
    canonical: `${baseUrl}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy | DALO",
    description:
      "Privacy information for DALO travel eSIM recommendations, checkout, delivery and support.",
    url: `${baseUrl}/privacy-policy`,
    type: "website",
  },
};

const dataSections = [
  {
    title: "Recommendation data",
    text: "Destination, trip length and expected data usage entered into the DALO recommendation engine.",
  },
  {
    title: "Account and contact data",
    text: "Email address, encrypted password information, account status, session records and messages sent to support.",
  },
  {
    title: "Order and eSIM data",
    text: "Selected plan, price, currency, order status, provider references, ICCID, activation details, installation links, usage information and expiry information where available.",
  },
  {
    title: "Payment information",
    text: "Payment status, Stripe checkout references and transaction identifiers. DALO does not receive or store complete card numbers.",
  },
  {
    title: "Technical and consent data",
    text: "Security logs, browser session references, consent choices and, where permitted, product views, checkout events and campaign references.",
  },
  {
    title: "Support information",
    text: "Device model, destination, screenshots and other information voluntarily supplied to investigate installation, connectivity or refund requests.",
  },
];

const purposes = [
  {
    purpose: "Provide recommendations and requested website functions",
    basis: "Performance of requested services and legitimate interests in operating DALO",
  },
  {
    purpose: "Process payment, fulfil orders and deliver eSIM details",
    basis: "Performance of a contract",
  },
  {
    purpose: "Maintain customer accounts and provide support",
    basis: "Performance of a contract and legitimate interests in customer service",
  },
  {
    purpose: "Prevent fraud, protect accounts and maintain service security",
    basis: "Legitimate interests and, where applicable, legal obligations",
  },
  {
    purpose: "Maintain accounting, transaction and compliance records",
    basis: "Legal obligations",
  },
  {
    purpose: "Measure product interest and the customer journey",
    basis: "Consent",
  },
  {
    purpose: "Campaign attribution and optional marketing follow-up",
    basis: "Consent",
  },
];

export default function PrivacyPolicyPage() {
  const policySchema = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    name: "DALO Privacy Policy",
    url: `${baseUrl}/privacy-policy`,
    dateModified: "2026-07-28",
    publisher: {
      "@type": "Organization",
      name: "DALO ESIM SOLUTIONS LLC",
    },
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
          <span className="text-slate-900">Privacy Policy</span>
        </nav>

        <div className="dalo-content-hero overflow-hidden rounded-[2rem] bg-[#10233a] p-8 text-white shadow-[0_24px_70px_rgba(16,35,58,0.2)] md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f2a45f]">
            Privacy at DALO
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Clear information about your data
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            This policy explains how DALO ESIM SOLUTIONS LLC handles personal
            information when you browse, request a recommendation, purchase an
            eSIM, create an account or contact support.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Last updated: 28 July 2026
          </p>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              Data controller
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              DALO ESIM SOLUTIONS LLC
            </h2>
            <address className="mt-4 not-italic leading-7 text-slate-700">
              16192 Coastal Highway
              <br />
              Lewes, Delaware 19958
              <br />
              United States
            </address>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Delaware File Number: 7164048
              <br />
              Registered Agent: Harvard Business Services, Inc.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-black text-slate-950">
              Contacting DALO about privacy
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Until the final DALO domain email is activated, privacy requests
              can be submitted through the contact form. Include “Privacy
              request” and the email address connected to your account or
              order. A direct privacy email address will be added before the
              public production launch.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Submit a privacy request
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              Information DALO handles
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Data categories
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dataSections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-black text-slate-950">
                  {section.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {section.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6 md:p-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Why information is used
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              The applicable legal basis may depend on where you live and the
              service you request.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Purpose</th>
                  <th className="px-6 py-4 font-bold">Legal basis</th>
                </tr>
              </thead>
              <tbody>
                {purposes.map((item) => (
                  <tr key={item.purpose} className="border-t border-slate-100">
                    <td className="px-6 py-5 font-bold text-slate-950">
                      {item.purpose}
                    </td>
                    <td className="px-6 py-5 text-sm leading-6 text-slate-600">
                      {item.basis}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          {[
            {
              title: "Service providers and recipients",
              text: "DALO shares information only where needed with providers supporting hosting, payment processing, transactional email, customer support and eSIM fulfilment. Stripe processes payment information, Resend supports email delivery, and the eSIM fulfilment provider receives the order details needed to issue and manage the purchased service. These providers may process information only for their assigned role and applicable legal duties.",
            },
            {
              title: "International data transfers",
              text: "DALO ESIM SOLUTIONS LLC is established in the United States and serves international travelers. Information may therefore be processed in the United States and other countries where service providers operate. Where transfer rules require safeguards, DALO will rely on an applicable legal mechanism such as contractual protections.",
            },
            {
              title: "Retention",
              text: "DALO keeps information only for as long as needed for the purpose collected, including account access, order fulfilment, support, fraud prevention and legal recordkeeping. Consent choices are stored for 180 days and customer sessions for up to 30 days. Transaction records may be retained longer where accounting, tax, dispute or legal obligations require it. A detailed operational deletion schedule will be finalised before production launch.",
            },
            {
              title: "Security",
              text: "DALO uses measures intended to protect personal information, including restricted administration access, encrypted transport in production, HTTP-only session cookies and password hashing. No online service can guarantee absolute security, so suspected account or order misuse should be reported promptly.",
            },
            {
              title: "Automated recommendations",
              text: "The DALO quiz uses destination, trip length and expected usage to rank available eSIM products. This recommendation helps simplify product selection. It does not make a decision that produces legal or similarly significant effects, and customers can review the plan before payment.",
            },
            {
              title: "Children",
              text: "DALO is intended for people arranging travel connectivity and is not directed to children. DALO does not knowingly seek to collect personal information from children through optional analytics or marketing activities.",
            },
          ].map((section) => (
            <article
              key={section.title}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-7"
            >
              <h2 className="text-2xl font-black text-slate-950">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">{section.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] bg-[#10233a] p-8 text-white md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f2a45f]">
            Your privacy rights
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">
            Access, correction and control
          </h2>
          <p className="mt-4 max-w-4xl leading-8 text-slate-300">
            Depending on your location, you may have rights to request access,
            correction, deletion, restriction, objection or portability of
            personal information. Where processing is based on consent, consent
            may be withdrawn at any time without affecting earlier processing.
            You may also have the right to complain to the competent data
            protection authority in your country.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-white px-6 py-3 font-bold text-[#10233a] transition hover:bg-blue-50"
            >
              Contact DALO
            </Link>
            <Link
              href="/cookie-policy"
              className="rounded-xl border border-white/25 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Cookie policy
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-7">
          <h2 className="text-2xl font-black text-slate-950">
            Changes to this policy
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            This policy may be updated when DALO changes providers, introduces
            new measurement tools, changes retention periods or launches the
            final production domain. The date at the top will identify the most
            recent version. Material changes affecting consent will be
            reflected in the DALO privacy controls.
          </p>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
