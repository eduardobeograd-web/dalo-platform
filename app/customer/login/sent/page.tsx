import SiteFooter from "../../../../components/SiteFooter";
import SiteHeader from "../../../../components/SiteHeader";

export default function CustomerLoginSentPage() {
  return (
    <main className="dalo-page min-h-screen bg-[#F6F8FF] text-slate-950">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-blue-100">
          <div className="text-5xl">📩</div>

          <h1 className="mt-5 text-4xl font-bold">
            Check your login link
          </h1>

          <p className="mt-3 text-slate-600">
            In development mode, the login link is printed in your terminal.
            Later this will be sent by email.
          </p>

          <a
            href="/"
            className="mt-8 inline-block rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white"
          >
            Back to website
          </a>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
