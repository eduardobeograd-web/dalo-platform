import type { Metadata } from "next";
import { siteUrl as baseUrl } from "../../lib/site-url";
import Link from "next/link";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";

export const metadata: Metadata = {
  title: "DALO Support | Travel eSIM Help",
  description:
    "Get support for DALO travel eSIM recommendations, destination questions, data usage and eSIM setup guidance.",
  alternates: {
    canonical: `${baseUrl}/support`,
  },
  openGraph: {
    title: "DALO Support | Travel eSIM Help",
    description:
      "Find support for travel eSIM recommendations, destination questions and mobile data planning with DALO.",
    url: `${baseUrl}/support`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DALO Support | Travel eSIM Help",
    description:
      "Find support for travel eSIM recommendations, destination questions and mobile data planning with DALO.",
  },
};

export default function SupportPage() {
  const supportSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "DALO Support",
    url: `${baseUrl}/support`,
    description:
      "Support page for DALO travel eSIM recommendations and customer questions.",
  };

  const faqs = [
    {
      question: "How do I choose the right eSIM plan?",
      answer:
        "Start with your destination, trip length and expected data use. DALO uses these details to make the choice easier.",
    },
    {
      question: "Can I use an eSIM and my normal SIM together?",
      answer:
        "On most modern eSIM-compatible phones, you can keep your normal SIM active and use the eSIM for mobile data.",
    },
    {
      question: "What should I check before buying an eSIM?",
      answer:
        "Check that your phone supports eSIM, is not carrier-locked and that the plan covers your destination and trip length.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="dalo-page dalo-content-page min-h-screen bg-[#F6F8FF] text-slate-900">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(supportSchema) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
          <span className="text-slate-900">Support</span>
        </nav>

        <div className="dalo-content-hero rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 md:p-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
            DALO Support
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Help with travel eSIM recommendations
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            DALO is designed to make travel connectivity easier. If you need
            help choosing a plan, understanding data amounts or preparing your
            phone for travel, this page gives you a clear starting point.
          </p>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/90 bg-white/90 p-6 shadow-[0_16px_38px_rgba(30,64,120,0.1)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(30,64,120,0.14)]">
            <h2 className="text-xl font-black text-slate-950">
              Before you travel
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Check your destination, trip length, phone compatibility and how
              much mobile data you expect to use.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/90 bg-white/90 p-6 shadow-[0_16px_38px_rgba(30,64,120,0.1)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(30,64,120,0.14)]">
            <h2 className="text-xl font-black text-slate-950">
              Choosing a plan
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              DALO helps compare practical needs like maps, messaging, taxi
              apps, bookings, video use and longer trips.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/90 bg-white/90 p-6 shadow-[0_16px_38px_rgba(30,64,120,0.1)] transition hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(30,64,120,0.14)]">
            <h2 className="text-xl font-black text-slate-950">
              Need more help?
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Contact DALO support with your destination, travel dates and
              expected data needs.
            </p>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <h2 className="text-3xl font-black text-slate-950">
            Frequently asked support questions
          </h2>

          <div className="mt-6 space-y-5">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl bg-slate-50 p-5">
                <h3 className="font-black text-slate-950">{faq.question}</h3>
                <p className="mt-2 leading-7 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#quiz"
              className="rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white"
            >
              Find your eSIM match
            </Link>

            <Link
              href="/contact"
              className="rounded-full bg-blue-50 px-6 py-3 text-sm font-bold text-blue-700"
            >
              Contact support
            </Link>
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
