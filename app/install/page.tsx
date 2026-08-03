import type { Metadata } from "next";
import SiteFooter from "../../components/SiteFooter";
import SiteHeader from "../../components/SiteHeader";
import PwaInstallExperience from "../../components/PwaInstallExperience";
import { siteUrl } from "../../lib/site-url";

export const metadata: Metadata = {
  title: "Install the DALO eSIM App",
  description:
    "Add DALO eSIM to your iPhone, Android phone or desktop for quick access to your eSIMs, installation details, usage and support.",
  alternates: { canonical: `${siteUrl}/install` },
  openGraph: {
    title: "Install the DALO eSIM App",
    description:
      "Keep your travel eSIMs, installation details and support one tap away.",
    url: `${siteUrl}/install`,
    type: "website",
  },
};

export default function InstallPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f8ff] text-slate-950">
      <div className="relative bg-[radial-gradient(circle_at_12%_18%,rgba(104,173,255,0.28),transparent_32%),radial-gradient(circle_at_92%_12%,rgba(242,164,95,0.2),transparent_26%),linear-gradient(180deg,#eef5ff_0%,#f8fbff_68%,#ffffff_100%)] pb-16">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(33,72,192,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(33,72,192,0.08)_1px,transparent_1px)] [background-size:56px_56px]" />
        <SiteHeader />
        <PwaInstallExperience installUrl={`${siteUrl}/install`} />
      </div>
      <SiteFooter />
    </main>
  );
}
