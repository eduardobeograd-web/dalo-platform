import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import { siteUrl as baseUrl } from "../../lib/site-url";

export const metadata: Metadata = {
  title: "eSIM FAQ: Plans, Installation & Compatibility | DALO",
  description:
    "Clear answers about choosing, buying, installing and using a DALO travel eSIM, including compatibility, delivery, payment and support.",
  alternates: {
    canonical: `${baseUrl}/faq`,
  },
  openGraph: {
    title: "Travel eSIM Questions, Answered | DALO",
    description:
      "Understand eSIM compatibility, plan selection, installation, payment and travel data before you buy.",
    url: `${baseUrl}/faq`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Travel eSIM Questions, Answered | DALO",
    description:
      "Clear guidance for choosing, installing and using your travel eSIM.",
  },
};

const faqGroups = [
  {
    id: "choosing",
    number: "01",
    title: "Choosing your eSIM",
    intro: "Start with the trip, not a wall of nearly identical plans.",
    questions: [
      {
        question: "How does DALO recommend a plan?",
        answer:
          "DALO uses your destination, trip length and expected data use to identify a suitable plan. You can review the data allowance, validity and complete price before checkout.",
      },
      {
        question: "How much data do I need for my trip?",
        answer:
          "Light use such as maps, messaging and email needs less data than video, hotspot use or remote work. Choose the usage profile closest to your habits and consider an upgrade if you want more room.",
      },
      {
        question: "Can I buy a plan for more than one country?",
        answer:
          "Some plans cover one destination and others cover a region. Always check the countries listed in the package details before payment, especially for a multi-country trip.",
      },
    ],
  },
  {
    id: "compatibility",
    number: "02",
    title: "Device compatibility",
    intro: "A quick check before payment prevents most setup problems.",
    questions: [
      {
        question: "How do I know whether my phone supports eSIM?",
        answer:
          "Use DALO's compatibility check as a helpful first indication, then confirm eSIM support in your phone settings or with the manufacturer. Your device must also be carrier-unlocked.",
      },
      {
        question: "Can DALO guarantee compatibility from my browser?",
        answer:
          "No. Browser detection can identify a device family but not every exact model, regional variation or carrier lock. The final check should always be made on the device itself.",
      },
      {
        question: "Can I keep my normal SIM active?",
        answer:
          "Most modern dual-SIM phones let you keep your normal SIM active while the DALO eSIM provides mobile data. Your home carrier may still charge for calls, messages or roaming on your regular SIM.",
      },
    ],
  },
  {
    id: "installation",
    number: "03",
    title: "Installation & activation",
    intro: "Install with a stable connection and activate at the right moment.",
    questions: [
      {
        question: "When should I install my eSIM?",
        answer:
          "Install before departure while you have reliable Wi-Fi, but follow the plan's activation instructions carefully. Some plans begin when installed and others begin when they first connect to a supported network.",
      },
      {
        question: "Where do I find my QR code and installation details?",
        answer:
          "After successful delivery, the QR code and available installation options are sent by email and stored with the order in your DALO account.",
      },
      {
        question: "Do I need internet to install an eSIM?",
        answer:
          "Yes. Your phone needs a stable internet connection to download the eSIM profile. Wi-Fi is recommended during installation.",
      },
    ],
  },
  {
    id: "using",
    number: "04",
    title: "Using data abroad",
    intro: "Know what the plan includes before you start travelling.",
    questions: [
      {
        question: "Do DALO eSIMs include a phone number, calls or SMS?",
        answer:
          "Most travel eSIMs offered through DALO are data-only. Use internet-based services for calls and messages unless the selected package explicitly states otherwise.",
      },
      {
        question: "Can I use hotspot or tethering?",
        answer:
          "Hotspot availability can depend on the selected package, device and network. Check the package details before checkout if connecting a laptop or another traveller is important to you.",
      },
      {
        question: "How do I avoid charges from my normal carrier?",
        answer:
          "Set the DALO eSIM as your mobile-data line and disable data roaming for your home SIM. Your regular carrier's terms still apply to calls, texts and any traffic sent through that line.",
      },
    ],
  },
  {
    id: "orders",
    number: "05",
    title: "Orders, delivery & account",
    intro: "Your essential order information stays together after purchase.",
    questions: [
      {
        question: "How quickly will my eSIM arrive?",
        answer:
          "Delivery is digital and normally begins after successful payment and provider fulfilment. If delivery is delayed, check your spam folder and then contact DALO support with your order number.",
      },
      {
        question: "Do I need a DALO account to place an order?",
        answer:
          "You can complete the purchase flow with your email address. Creating or accessing your DALO account makes it easier to find installation details, order status and available usage information later.",
      },
      {
        question: "What are the order number and ICCID for?",
        answer:
          "Your DALO order number identifies the purchase. The ICCID identifies the individual eSIM profile. Keep both available because support may request them to investigate delivery, installation or usage questions.",
      },
    ],
  },
  {
    id: "payment",
    number: "06",
    title: "Payment, refunds & support",
    intro: "Clear payment handling and a defined path when something goes wrong.",
    questions: [
      {
        question: "Does DALO store my complete card details?",
        answer:
          "No. Complete card details are entered and processed by Stripe. DALO stores the order and payment status information needed for delivery, account access and customer support.",
      },
      {
        question: "Can I receive an invoice or payment receipt?",
        answer:
          "Available payment documentation is provided through the checkout and order flow. Enter accurate billing information when it is requested so the document can reflect the correct customer details.",
      },
      {
        question: "Can I get a refund if I cannot use the eSIM?",
        answer:
          "Refund eligibility depends on the order status, whether the eSIM has been delivered, installed or used, and the reason for the request. Review the Refund Policy and contact support before deleting the eSIM from your device.",
      },
    ],
  },
];

const allFaqs = faqGroups.flatMap((group) => group.questions);

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="dalo-page dalo-content-page min-h-screen bg-[#f6f8ff] text-slate-900">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pt-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex items-center gap-2 text-sm font-semibold text-slate-500"
        >
          <Link href="/" className="text-blue-700 transition hover:text-blue-900">
            DALO
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900">FAQ</span>
        </nav>

        <div className="relative overflow-hidden rounded-[2rem] bg-[#10233a] px-6 py-10 text-white shadow-[0_24px_70px_rgba(16,35,58,0.2)] sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-2/5 bg-gradient-to-l from-[#2148c0]/40 to-transparent" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f2a45f]">
              DALO travel answers
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Understand your eSIM before you travel.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Clear answers about choosing a plan, checking your phone,
              installing your eSIM and getting help after purchase.
            </p>
          </div>

          <div className="relative mt-8 grid gap-3 border-t border-white/10 pt-6 text-sm sm:grid-cols-3">
            {["No subscription", "Secure Stripe payment", "Digital delivery"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 font-bold text-slate-100">
                  <span className="h-2 w-2 rounded-full bg-[#f2a45f]" />
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-2 rounded-2xl border border-blue-100 bg-white p-3 shadow-[0_12px_35px_rgba(30,64,120,0.06)] sm:grid-cols-2 lg:grid-cols-3">
          {faqGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="flex min-h-14 items-center gap-3 rounded-xl border border-transparent bg-[#f8faff] px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-[#eef3ff] hover:text-[#2148c0] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[10px] font-black tracking-[0.08em] text-[#2148c0] shadow-sm">
                {group.number}
              </span>
              <span className="leading-5">{group.title}</span>
            </a>
          ))}
        </div>

        <div className="mt-10 space-y-7">
          {faqGroups.map((group) => (
            <section
              key={group.id}
              id={group.id}
              className="scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(30,64,120,0.07)]"
            >
              <div className="grid gap-4 border-b border-slate-200 bg-[#fbfcff] px-6 py-6 sm:grid-cols-[3.5rem_1fr] sm:px-8">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2148c0] text-xs font-black tracking-[0.08em] text-white">
                  {group.number}
                </span>
                <div>
                  <h2 className="text-2xl font-black tracking-[-0.025em] text-slate-950 sm:text-3xl">
                    {group.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{group.intro}</p>
                </div>
              </div>

              <div className="divide-y divide-slate-200 px-6 sm:px-8">
                {group.questions.map((faq) => (
                  <details key={faq.question} className="group py-1">
                    <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 marker:hidden">
                      <span className="text-base font-extrabold leading-6 text-slate-950 sm:text-lg">
                        {faq.question}
                      </span>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-blue-100 bg-[#f7f9ff] text-xl font-light text-[#2148c0] transition group-hover:border-blue-300 group-open:rotate-45 group-open:border-[#2148c0] group-open:bg-[#eef3ff]">
                        +
                      </span>
                    </summary>
                    <p className="max-w-4xl pb-6 pr-4 text-sm leading-7 text-slate-600 sm:text-base">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 grid gap-6 overflow-hidden rounded-[2rem] bg-[#2148c0] p-7 text-white shadow-[0_22px_60px_rgba(33,72,192,0.22)] sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
              Need help with an order?
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Bring your order number. We&apos;ll take it from there.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
              For delivery, installation or usage problems, contact support and include your DALO order number and ICCID when available.
            </p>
          </div>
          <Link
            href="/support"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-black text-[#2148c0] transition hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            Contact DALO support →
          </Link>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}
