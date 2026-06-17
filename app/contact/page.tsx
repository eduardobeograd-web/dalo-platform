import type { Metadata } from "next";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Contact DALO | Travel eSIM Support",
  description:
    "Contact DALO for questions about travel eSIM recommendations, destinations, mobile data plans and support.",
  alternates: {
    canonical: `${baseUrl}/contact`,
  },
  openGraph: {
    title: "Contact DALO | Travel eSIM Support",
    description:
      "Get in touch with DALO for travel eSIM questions, destination support and mobile data plan guidance.",
    url: `${baseUrl}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact DALO | Travel eSIM Support",
    description:
      "Get in touch with DALO for travel eSIM questions, destination support and mobile data plan guidance.",
  },
};

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact DALO",
    url: `${baseUrl}/contact`,
    description:
      "Contact page for DALO travel eSIM recommendations and support.",
  };

  return (
    <main className="min-h-screen bg-[#F6F8FF] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
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
          <span className="text-slate-900">Contact</span>
        </nav>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100 md:p-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">
            Contact DALO
          </p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Questions about travel eSIMs?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            DALO helps travelers find simple eSIM recommendations by
            destination, trip length and data usage. If you have a question
            about destinations, recommendations or support, you can contact us.
          </p>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Support questions
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              For questions about eSIM recommendations, destination pages or
              travel data needs, use the DALO quiz or contact support.
            </p>

            <div className="mt-6 rounded-2xl bg-blue-50 p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                Email
              </p>
              <p className="mt-2 text-lg font-black text-slate-950">
                support@dalo.app
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg shadow-blue-100">
            <h2 className="text-2xl font-black text-slate-950">
              Start with the quiz
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              The fastest way to find a suitable eSIM option is to answer a few
              short questions about your destination, trip length and expected
              data use.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
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
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <h2 className="text-3xl font-black text-slate-950">
            What to include in your message
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="font-black text-slate-950">Destination</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tell us where you are traveling.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="font-black text-slate-950">Trip length</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tell us how many days you need mobile data.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="font-black text-slate-950">Data needs</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tell us whether you need light, normal or heavy data use.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
