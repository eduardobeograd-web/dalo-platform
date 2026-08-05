"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export default function PwaInstallButton({
  mobileLabel = "Install",
  label = "Install DALO",
  appName = "DALO",
}: {
  mobileLabel?: string;
  label?: string;
  appName?: string;
} = {}) {
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);
  const [showAppleInstructions, setShowAppleInstructions] = useState(false);
  const [appleDevice, setAppleDevice] = useState(false);
  const [installed, setInstalled] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as NavigatorWithStandalone).standalone === true;

    if (standalone) {
      setInstalled(true);
      return;
    }

    const userAgent = navigator.userAgent;
    const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent);
    const isIPadOs =
      navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

    setAppleDevice(isAppleMobile || isIPadOs);
    setInstalled(false);

    function captureInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    function markInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
      setShowAppleInstructions(false);
    }

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installation remains optional; account access must never be blocked.
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  if (installed || (!appleDevice && !installPrompt)) {
    return null;
  }

  async function installDalo() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    setShowAppleInstructions((current) => !current);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={installDalo}
        aria-expanded={showAppleInstructions}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-[#1738a0] transition hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:rounded-xl sm:px-4 sm:text-sm"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 3v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 15v3.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V15" strokeLinecap="round" />
        </svg>
        <span className="sm:hidden">{mobileLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </button>

      {showAppleInstructions ? (
        <div className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-[0_20px_55px_rgba(15,35,70,0.2)]">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700">
            Add {appName} to your Home Screen
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Open Safari&apos;s Share menu, then choose{" "}
            <strong className="text-slate-900">Add to Home Screen</strong>.
          </p>
          <button
            type="button"
            onClick={() => setShowAppleInstructions(false)}
            className="mt-3 text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
