"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & { standalone?: boolean };
type Platform = "ios" | "samsung" | "android" | "desktop";

export default function PwaInstallExperience({ installUrl }: { installUrl: string }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as NavigatorWithStandalone).standalone === true;
    const userAgent = navigator.userAgent;
    const ios =
      /iPhone|iPad|iPod/i.test(userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(userAgent);
    const samsung = /SamsungBrowser/i.test(userAgent);

    setInstalled(standalone);
    setPlatform(ios ? "ios" : samsung ? "samsung" : android ? "android" : "desktop");
    setReady(true);

    function captureInstallPrompt(event: Event) {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    }

    function markInstalled() {
      setInstalled(true);
      setPrompt(null);
      setNotice("DALO was added successfully.");
    }

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        setNotice("Installation is temporarily unavailable. You can still use DALO in your browser.");
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  async function installDalo() {
    if (installed) {
      setNotice("DALO is already installed on this device.");
      return;
    }

    if (platform === "samsung") {
      setNotice("For the best Android installation, open this page in Google Chrome and choose Install app from the Chrome menu.");
      document.getElementById("install-steps")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setPrompt(null);
      setNotice(
        choice.outcome === "accepted"
          ? "DALO is being added to your device."
          : "Installation was cancelled. You can try again from your browser menu.",
      );
      return;
    }

    setNotice(
      platform === "ios"
        ? "Use Safari's Share button, then choose Add to Home Screen."
        : platform === "samsung"
          ? "For the best Android installation, open this page in Google Chrome and choose Install app."
        : "Open your browser menu and choose Install app or Add to Home screen.",
    );
    document.getElementById("install-steps")?.scrollIntoView({ behavior: "smooth" });
  }

  async function shareInstallPage() {
    const shareData = {
      title: "Install DALO eSIM",
      text: "Add DALO eSIM to your phone for quick access to your travel eSIMs.",
      url: installUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(installUrl);
      setNotice("Install link copied.");
    } catch {
      setNotice(installUrl);
    }
  }

  const platformLabel =
    platform === "ios"
      ? "iPhone or iPad"
      : platform === "samsung"
        ? "Samsung"
      : platform === "android"
        ? "Android phone"
        : "this device";

  const installButtonLabel = installed
    ? "DALO is installed"
    : prompt
      ? `Install on ${platformLabel}`
      : platform === "ios"
        ? "Show iPhone install steps"
        : platform === "samsung"
          ? "Use Chrome to install"
        : platform === "android"
          ? "Show Android install steps"
          : "Show installation steps";

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#2148c0] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            DALO on your Home Screen
          </div>
          <h1 className="mt-6 max-w-2xl text-4xl font-black tracking-[-0.045em] text-[#10233a] sm:text-5xl lg:text-[4rem] lg:leading-[1.02]">
            Your travel eSIMs, one tap away.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Add DALO to your phone for faster access to installation details, usage, orders and support. No App Store download is required.
          </p>

          <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-3">
            {["Quick account access", "Installation details", "Usage and support"].map((item) => (
              <div key={item} className="rounded-2xl border border-white bg-white/75 p-4 text-sm font-bold text-slate-700 shadow-[0_12px_35px_rgba(35,75,145,0.08)] backdrop-blur">
                <span className="mb-3 block h-1.5 w-8 rounded-full bg-[#2148c0]" />
                {item}
              </div>
            ))}
          </div>

          {ready && platform === "samsung" ? (
            <div className="mt-6 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-6 text-amber-950">
              <strong className="font-black">Installing from Samsung Internet?</strong>{" "}
              Samsung Internet may show an Android compatibility warning created by its app installer. DALO recommends opening this page in Chrome for a warning-free installation.
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={installDalo} disabled={!ready} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#2148c0] px-6 py-3.5 font-black text-white shadow-[0_16px_35px_rgba(33,72,192,0.24)] transition hover:-translate-y-0.5 hover:bg-[#17389b] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-wait disabled:opacity-60">
              <DownloadIcon />
              {installButtonLabel}
            </button>
            <button type="button" onClick={shareInstallPage} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-blue-200 bg-white px-6 py-3.5 font-black text-[#17389b] transition hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
              <ShareIcon />
              Share install link
            </button>
          </div>

          {notice ? (
            <p role="status" className="mt-4 max-w-xl rounded-xl border border-blue-100 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700">
              {notice}
            </p>
          ) : null}
        </section>

        <section className="relative mx-auto w-full max-w-lg">
          <div className="absolute -left-8 top-14 h-40 w-40 rounded-full bg-[#f2a45f]/25 blur-3xl" />
          <div className="absolute -right-8 bottom-14 h-52 w-52 rounded-full bg-blue-400/25 blur-3xl" />
          <div className="relative rounded-[2.5rem] border border-white/90 bg-white/75 p-5 shadow-[0_30px_80px_rgba(23,56,155,0.18)] backdrop-blur-xl sm:p-7">
            <div className="mx-auto max-w-[21rem] rounded-[2.3rem] border-[8px] border-[#10233a] bg-[#f5f8ff] p-4 shadow-2xl">
              <div className="mx-auto mb-5 h-5 w-20 rounded-full bg-[#10233a]" />
              <div className="rounded-[1.6rem] bg-white p-5 shadow-sm">
                <Image src="/pwa-icon-192-v4.png" alt="DALO eSIM app icon" width={192} height={192} className="mx-auto h-24 w-24 rounded-[1.7rem] shadow-[0_12px_28px_rgba(33,72,192,0.2)]" priority />
                <p className="mt-4 text-center text-xl font-black text-[#10233a]">DALO eSIM</p>
                <p className="mt-1 text-center text-sm text-slate-500">Travel connected with clarity</p>
              </div>
              <div className="mt-4 rounded-[1.6rem] bg-[#10233a] p-5 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-200">Your eSIM account</p>
                <p className="mt-2 text-lg font-black">Plans, setup and support</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {["Plans", "Usage", "Help"].map((item) => (
                    <div key={item} className="rounded-xl bg-white/10 px-2 py-3 text-center text-xs font-bold text-slate-200">{item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="install-steps" className="mt-16 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_20px_60px_rgba(30,64,120,0.1)] sm:p-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2148c0]">Installation guide</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-[#10233a]">Choose your device</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-500">DALO is a Progressive Web App. Installation happens through your browser, not through an app store.</p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <InstallSteps title="iPhone and iPad" accent="blue" steps={["Open this page in Safari.", "Tap the Share button at the bottom of Safari.", "Scroll down and choose Add to Home Screen.", "Tap Add to place DALO on your Home Screen."]} />
          <InstallSteps title="Android phones" accent="warm" steps={["For the most consistent installation, open this page in Google Chrome.", "Tap Install DALO above or choose Install app from Chrome's three-dot menu.", "Confirm the installation to add DALO to your apps and Home screen.", "You can continue using Samsung Internet normally after DALO is installed."]} />
          <InstallSteps title="Laptop or desktop" accent="slate" steps={["Open this page in Chrome or Microsoft Edge.", "Look for the install icon in the address bar.", "Select Install DALO eSIM.", "Open DALO like a normal desktop app."]} />
        </div>
      </section>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs font-bold text-slate-500">
        <span>Secure HTTPS installation</span>
        <span>Uses your existing DALO account</span>
        <span>Remove anytime from your device</span>
      </div>
    </div>
  );
}

function InstallSteps({ title, steps, accent }: { title: string; steps: string[]; accent: "blue" | "warm" | "slate" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    warm: "bg-orange-50 text-orange-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <ol className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-6 text-slate-600">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${colors[accent]}`}>{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

function DownloadIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 15v3.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V15" strokeLinecap="round"/></svg>;
}

function ShareIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 0 4 4m-4-4L8 7" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 11v7.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V11" strokeLinecap="round"/></svg>;
}
