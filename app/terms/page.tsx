import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { siteUrl as baseUrl } from "../../lib/site-url";

export const metadata: Metadata = {
  title: "Terms and Conditions | DALO",
  description:
    "Terms governing DALO travel eSIM recommendations, purchases, digital delivery, activation and support.",
  alternates: {
    canonical: `${baseUrl}/terms`,
  },
  openGraph: {
    title: "Terms and Conditions | DALO",
    description:
      "Terms for DALO travel eSIM recommendations and digital eSIM purchases.",
    url: `${baseUrl}/terms`,
    type: "website",
  },
};

const sections = [
  {
    number: "01",
    title: "About DALO and these terms",
    paragraphs: [
      "These Terms and Conditions govern access to the DALO website, recommendation engine, destination information, customer account, checkout and travel eSIM services provided by DALO ESIM SOLUTIONS LLC.",
      "By placing an order, you agree to the version of these terms presented at checkout. If you do not agree, do not submit an order. Mandatory consumer rights that apply in your country remain unaffected.",
    ],
  },
  {
    number: "02",
    title: "The DALO service",
    paragraphs: [
      "DALO helps travelers select a data plan using destination, trip length and expected data usage. Recommendations are generated from products available in the DALO catalogue and are intended to simplify comparison.",
      "A recommendation is not a guarantee that a plan will satisfy every individual use case. You must review the destination, coverage, data allowance, validity period, activation conditions and device requirements shown before payment.",
    ],
  },
  {
    number: "03",
    title: "Eligibility and customer information",
    paragraphs: [
      "You must have legal capacity to enter into a purchase contract and provide accurate, current information. A working email address is essential because confirmations, installation details and support communication are delivered electronically.",
      "You are responsible for safeguarding account access, order references, activation codes and QR codes. Contact DALO promptly if you believe an account or order has been used without permission.",
    ],
  },
  {
    number: "04",
    title: "Orders and contract formation",
    paragraphs: [
      "An order is submitted when you choose a plan, provide the required information, accept the checkout terms and complete the payment process. The purchase contract is formed when payment is successfully confirmed and DALO accepts the order.",
      "DALO may reject or cancel an order and return the payment where a product is unavailable, pricing information is clearly erroneous, payment cannot be verified, fraud is suspected or fulfilment is not reasonably possible.",
    ],
  },
  {
    number: "05",
    title: "Prices and payment",
    paragraphs: [
      "DALO prices are displayed and charged in United States dollars unless the checkout expressly states otherwise. Your card issuer or bank may apply exchange rates or additional charges that are outside DALO's control.",
      "Payments are processed securely by Stripe. DALO receives payment status and transaction references but does not receive or store complete payment-card numbers. Any applicable tax or mandatory charge must be disclosed before the customer confirms payment.",
    ],
  },
  {
    number: "06",
    title: "Digital delivery",
    paragraphs: [
      "Travel eSIMs are digital products. After successful payment and fulfilment, installation information may be delivered by email and made available through the customer order area. Delivery time can be affected by provider processing, email filtering, inaccurate customer information or technical incidents.",
      "If delivery does not arrive within a reasonable time, check the email address and spam folder and contact DALO before purchasing a duplicate plan.",
    ],
  },
  {
    number: "07",
    title: "Device compatibility and SIM lock",
    paragraphs: [
      "Before purchase, you must confirm that the intended device supports eSIM, allows installation of a new eSIM and is not restricted by a carrier lock. Browser-based device detection and compatibility lists are guidance only because regional device variants and carrier restrictions may differ.",
      "The presence of an EID and an “Add eSIM” option are useful indicators but do not replace confirmation from the device manufacturer or carrier. DALO cannot make an incompatible or carrier-locked device compatible.",
    ],
  },
  {
    number: "08",
    title: "Installation, activation and validity",
    paragraphs: [
      "Follow the installation instructions supplied with the order. Do not delete an installed eSIM unless instructed by support, because a QR code or activation code may be usable only once.",
      "The activation trigger and validity period depend on the selected plan. Some plans begin when installed, connected to a supported destination network or first used. The product details shown at purchase control. Unused data normally expires when the plan validity period ends and does not roll over unless expressly stated.",
    ],
  },
  {
    number: "09",
    title: "Coverage, speed and service availability",
    paragraphs: [
      "Coverage is provided through third-party mobile networks and may vary by destination, location, device, building conditions, congestion, maintenance, local regulation and network availability. References to 4G or 5G describe potential network access and are not guarantees of continuous speed or availability.",
      "Unless a product expressly includes them, DALO travel eSIM plans provide mobile data only and do not include a telephone number, voice calls or SMS. Internet-based communication applications may work when sufficient data connectivity is available.",
    ],
  },
  {
    number: "10",
    title: "Acceptable use",
    paragraphs: [
      "You may use the eSIM only for lawful personal or business connectivity consistent with the selected plan. You must not resell activation details, interfere with networks, commit fraud, distribute malware, send unlawful communications or use the service in a way that violates applicable law or provider rules.",
      "DALO or the network provider may restrict or suspend service where reasonably necessary to address fraud, abuse, security risk, legal requirements or material breach of these terms.",
    ],
  },
  {
    number: "11",
    title: "Cancellations, withdrawal and refunds",
    paragraphs: [
      "Refund eligibility depends on the order status, whether the eSIM has been issued, installed, activated or used, the source of the problem and mandatory consumer law. The DALO Refund Policy forms part of these terms.",
      "Because an eSIM is supplied digitally, the right to cancel may be affected once immediate digital delivery begins with the customer's express request and acknowledgement where applicable law permits. This does not remove rights relating to a defective or incorrectly supplied product.",
    ],
  },
  {
    number: "12",
    title: "Support and customer cooperation",
    paragraphs: [
      "DALO will make reasonable efforts to investigate delivery, installation and connectivity problems. You may be asked to provide the order number, destination, device model, screenshots, settings and troubleshooting results.",
      "You should contact support while the plan is still valid and before deleting the eSIM. A refund or technical resolution may be unavailable where necessary information is withheld or reasonable troubleshooting is refused.",
    ],
  },
  {
    number: "13",
    title: "Liability",
    paragraphs: [
      "To the extent permitted by law, DALO is not responsible for failures caused by unsupported or locked devices, incorrect customer information, actions of mobile networks, destination restrictions, device settings, force majeure or use contrary to supplied instructions.",
      "DALO does not exclude or limit liability where doing so is prohibited, including liability that cannot lawfully be excluded under applicable consumer law. Subject to those rights, DALO is not liable for indirect or consequential loss, loss of opportunity or third-party roaming charges, and aggregate contractual liability will not exceed the amount paid for the affected order.",
    ],
  },
  {
    number: "14",
    title: "Privacy and communications",
    paragraphs: [
      "Personal information is handled as explained in the DALO Privacy Policy and Cookie Policy. Transactional messages required to confirm, deliver or support an order are separate from optional marketing communications.",
      "Analytics and marketing storage remain disabled until the relevant consent is provided. Consent may be changed through Cookie settings without affecting essential checkout, account or order functions.",
    ],
  },
  {
    number: "15",
    title: "Intellectual property",
    paragraphs: [
      "The DALO name, interface, recommendation presentation, original text, graphics and software are protected by applicable intellectual-property laws. These terms do not transfer ownership or permit copying, scraping, resale or commercial reuse except where law expressly allows it.",
    ],
  },
  {
    number: "16",
    title: "Governing law and disputes",
    paragraphs: [
      "These terms are governed by the laws of the State of Delaware, United States, without applying conflict-of-law rules. Courts with jurisdiction over DALO ESIM SOLUTIONS LLC may hear disputes.",
      "If you are a consumer, this choice does not deprive you of mandatory protections or courts available under the law of your habitual residence. Please contact DALO first so that the parties can attempt to resolve a concern directly.",
    ],
  },
  {
    number: "17",
    title: "Changes and severability",
    paragraphs: [
      "DALO may update these terms for future orders when products, providers, payment processes or legal requirements change. The terms accepted at the time of an order continue to govern that order unless a change is required by law or agreed with the customer.",
      "If a provision is found invalid or unenforceable, the remaining provisions continue to apply to the extent legally possible.",
    ],
  },
];

export default function TermsPage() {
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DALO Terms and Conditions",
    url: `${baseUrl}/terms`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
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
          <span className="text-slate-900">Terms and Conditions</span>
        </nav>

        <div className="dalo-content-hero overflow-hidden rounded-[2rem] bg-[#10233a] p-8 text-white shadow-[0_24px_70px_rgba(16,35,58,0.2)] md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f2a45f]">
            DALO customer terms
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
            Terms and Conditions
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Clear rules for recommendations, digital eSIM purchases, delivery,
            activation, support and refunds.
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-400">
            Effective date: 28 July 2026
          </p>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="h-fit rounded-[1.75rem] border border-blue-200 bg-blue-50 p-7 lg:sticky lg:top-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              Seller
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
            <div className="mt-6 grid gap-2">
              <Link
                href="/contact"
                className="rounded-xl bg-blue-700 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-800"
              >
                Contact DALO
              </Link>
              <Link
                href="/refund-policy"
                className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-center font-bold text-blue-800 transition hover:border-blue-400"
              >
                Refund policy
              </Link>
            </div>
          </aside>

          <div className="space-y-4">
            {sections.map((section) => (
              <article
                key={section.number}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 md:p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">
                    {section.number}
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">
                      {section.title}
                    </h2>
                    <div className="mt-3 space-y-3">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="leading-7 text-slate-600"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] bg-[#10233a] p-8 text-white md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f2a45f]">
            Questions or concerns
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">
            Contact DALO before purchasing if anything is unclear
          </h2>
          <p className="mt-4 max-w-4xl leading-8 text-slate-300">
            Compatibility, activation and coverage can depend on the selected
            plan and device. DALO support can help clarify product information
            before payment or investigate an existing order.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-white px-6 py-3 font-bold text-[#10233a] transition hover:bg-blue-50"
            >
              Contact support
            </Link>
            <Link
              href="/privacy-policy"
              className="rounded-xl border border-white/25 px-6 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Privacy policy
            </Link>
          </div>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
