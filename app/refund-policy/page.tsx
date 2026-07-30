import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { siteUrl as baseUrl } from "../../lib/site-url";

export const metadata: Metadata = {
  title: "Refund Policy | DALO",
  description:
    "Understand when a DALO travel eSIM purchase may qualify for a full or partial refund and how to submit a request.",
  alternates: {
    canonical: `${baseUrl}/refund-policy`,
  },
  openGraph: {
    title: "Refund Policy | DALO",
    description:
      "Refund eligibility and request process for DALO travel eSIM purchases.",
    url: `${baseUrl}/refund-policy`,
    type: "website",
  },
};

const eligibleCases = [
  {
    title: "eSIM not issued",
    text: "Payment was completed but DALO or its fulfilment provider could not issue the purchased eSIM within a reasonable time.",
  },
  {
    title: "Confirmed technical defect",
    text: "The eSIM cannot be installed or used because of a technical problem attributable to DALO, the supplied eSIM or the fulfilment provider, and reasonable troubleshooting does not resolve it.",
  },
  {
    title: "Incorrect product supplied",
    text: "The delivered eSIM materially differs from the destination, data allowance or validity shown in the confirmed order.",
  },
  {
    title: "Duplicate or incorrect charge",
    text: "The same order was charged more than once or the charged amount does not match the confirmed DALO checkout amount.",
  },
  {
    title: "Material service failure",
    text: "A supported destination has no usable service for a substantial part of the plan because of a verified provider-side failure. Depending on usage, a full or proportional refund may be appropriate.",
  },
];

const normallyExcludedCases = [
  {
    title: "Incompatible or carrier-locked device",
    text: "The phone does not support eSIM, does not allow a new eSIM or is locked to another carrier, where compatibility requirements were clearly disclosed before purchase.",
  },
  {
    title: "Wrong destination or plan selected",
    text: "The customer selected the wrong country, region, data allowance or validity period and the eSIM has already been issued.",
  },
  {
    title: "Change of mind after digital delivery",
    text: "The activation details have already been supplied and immediate digital delivery began with the customer's request and acknowledgement where required by law.",
  },
  {
    title: "eSIM deleted or instructions not followed",
    text: "The customer deleted an installed eSIM, attempted unsupported transfers or did not follow the supplied installation and troubleshooting instructions.",
  },
  {
    title: "Expired or unused data",
    text: "The plan validity period ended, data expired or the customer did not use the purchased allowance before expiry.",
  },
  {
    title: "Expected network variation",
    text: "Speed, 4G or 5G availability, indoor coverage or congestion varies without amounting to a material failure of the purchased service.",
  },
  {
    title: "Third-party costs",
    text: "Roaming charges, device costs, replacement purchases or other expenses charged by a mobile carrier, bank, hotel or third party.",
  },
];

export default function RefundPolicyPage() {
  const policySchema = {
    "@context": "https://schema.org",
    "@type": "MerchantReturnPolicy",
    name: "DALO Refund Policy",
    url: `${baseUrl}/refund-policy`,
    dateModified: "2026-07-28",
    merchantReturnDays: 30,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
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
          <span className="text-slate-900">Refund Policy</span>
        </nav>

        <div className="dalo-content-hero overflow-hidden rounded-[2rem] bg-[#10233a] p-8 text-white shadow-[0_24px_70px_rgba(16,35,58,0.2)] md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f2a45f]">
            Fair digital-product support
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            DALO Refund Policy
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            DALO reviews refund requests fairly based on whether the eSIM was
            issued, installed, activated or used and on the source of the
            problem.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Effective date: 28 July 2026
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Request window",
              value: "30 days",
              text: "Submit the request within 30 days of purchase and, for service issues, while the plan can still be investigated.",
            },
            {
              label: "Refund method",
              value: "Original payment",
              text: "Approved refunds are returned to the original payment method used at checkout.",
            },
            {
              label: "Customer rights",
              value: "Always preserved",
              text: "Mandatory rights for defective or incorrectly supplied digital products are not excluded.",
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">
                {item.label}
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {item.value}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-7 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
            Before digital delivery
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Orders that have not been issued
          </h2>
          <p className="mt-4 max-w-4xl leading-8 text-slate-700">
            If payment was completed but the eSIM has not been issued or its
            activation details have not been made available, contact DALO
            immediately. Unless fulfilment has already become irreversible or
            another legal exception applies, DALO can cancel the order and
            return the payment.
          </p>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
              Full or partial refund may apply
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Eligible situations
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {eligibleCases.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-emerald-200 bg-white p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 font-black text-emerald-700">
                    ✓
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
              Normally not refundable
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Situations outside DALO’s responsibility
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {normallyExcludedCases.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.5rem] border border-amber-200 bg-white p-6"
              >
                <h3 className="text-lg font-black text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-blue-50 p-5 text-sm leading-6 text-blue-950">
            “Normally not refundable” does not override a mandatory legal
            right. DALO will consider the actual facts, product status and
            applicable consumer law.
          </p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-black text-slate-950">
              Partial refunds
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              If a plan worked for part of its validity or some data was used
              before a verified provider-side failure, DALO may offer a
              proportional refund or replacement reflecting the unused service.
              No refund will exceed the amount paid for the affected order.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-black text-slate-950">
              Fraud and unauthorised purchases
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO may request verification before refunding a disputed or
              unauthorised purchase. Refunds may be refused where there is
              evidence of fraud, abuse, resale, manipulated evidence or a
              material breach of the DALO Terms and Conditions.
            </p>
          </article>
        </section>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              How to request a refund
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Give support enough information to investigate
            </h2>
          </div>
          <ol className="grid gap-0 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Contact DALO",
                text: "Use the contact form within 30 days and identify the request as an order or refund issue.",
              },
              {
                number: "02",
                title: "Provide evidence",
                text: "Include the order number, purchase email, destination, device model, screenshots and a description of the problem.",
              },
              {
                number: "03",
                title: "Complete troubleshooting",
                text: "Keep the eSIM installed and cooperate with reasonable checks while the plan and network issue can still be examined.",
              },
            ].map((step) => (
              <li
                key={step.number}
                className="border-t border-slate-100 p-6 md:border-l md:border-t-0 md:first:border-l-0"
              >
                <span className="text-sm font-black text-blue-700">
                  {step.number}
                </span>
                <h3 className="mt-2 text-xl font-black text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-7">
            <h2 className="text-2xl font-black text-slate-950">
              Processing an approved refund
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Approved refunds are submitted to the original payment method.
              The customer&apos;s bank or card issuer controls when the credit
              appears and may apply its own exchange rate. A typical card
              refund can take approximately 5–10 business days after DALO
              submits it, but timing is not guaranteed by DALO.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-7">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              Seller
            </p>
            <h2 className="mt-2 text-xl font-black text-slate-950">
              DALO ESIM SOLUTIONS LLC
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              16192 Coastal Highway
              <br />
              Lewes, Delaware 19958
              <br />
              United States
              <br />
              Delaware File Number: 7164048
            </p>
          </article>
        </section>

        <section className="mt-8 rounded-[2rem] bg-[#10233a] p-8 text-white md:p-10">
          <h2 className="text-3xl font-black tracking-tight">
            Need help with an order?
          </h2>
          <p className="mt-4 max-w-4xl leading-8 text-slate-300">
            Contact DALO before deleting the eSIM or purchasing a replacement.
            Early troubleshooting gives support the best chance to resolve the
            issue and verify refund eligibility.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-white px-6 py-3 font-bold text-[#10233a] transition hover:bg-blue-50"
            >
              Start a support request
            </Link>
            <Link
              href="/terms"
              className="rounded-xl border border-white/25 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Terms and Conditions
            </Link>
          </div>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
