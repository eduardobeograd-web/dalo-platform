"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  OPEN_CONSENT_EVENT,
  ConsentPreferences,
  readConsent,
  saveConsent,
} from "@/lib/consent";

const hiddenPrefixes = ["/admin", "/customer"];

export default function CookieConsent() {
  const pathname = usePathname();
  const [preferences, setPreferences] = useState<ConsentPreferences | null>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const storedPreferences = readConsent();
    setPreferences(storedPreferences);
    setAnalytics(storedPreferences?.analytics ?? false);
    setMarketing(storedPreferences?.marketing ?? false);

    function openSettings() {
      const currentPreferences = readConsent();
      setAnalytics(currentPreferences?.analytics ?? false);
      setMarketing(currentPreferences?.marketing ?? false);
      setSettingsOpen(true);
    }

    window.addEventListener(OPEN_CONSENT_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, openSettings);
  }, []);

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  function applyConsent(nextAnalytics: boolean, nextMarketing: boolean) {
    const savedPreferences = saveConsent({
      analytics: nextAnalytics,
      marketing: nextMarketing,
    });

    setPreferences(savedPreferences);
    setAnalytics(savedPreferences.analytics);
    setMarketing(savedPreferences.marketing);
    setSettingsOpen(false);
  }

  return (
    <>
      {preferences === null && !settingsOpen ? (
        <section
          aria-label="Cookie choices"
          className="fixed bottom-3 left-3 right-3 z-[70] mx-auto max-w-5xl rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_28px_90px_rgba(15,35,70,0.28)] sm:bottom-5 sm:p-6"
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                Your privacy, your choice
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                DALO uses optional analytics and marketing storage
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Necessary cookies keep login, checkout and orders working.
                Optional storage helps us understand product interest and
                marketing performance. Nothing optional is activated without
                your choice.{" "}
                <Link
                  href="/cookie-policy"
                  className="font-bold text-blue-700 hover:text-blue-900"
                >
                  Cookie details
                </Link>
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[490px]">
              <button
                type="button"
                onClick={() => applyConsent(false, false)}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-blue-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                Necessary only
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-blue-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={() => applyConsent(true, true)}
                className="min-h-12 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                Accept all
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {settingsOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && preferences) {
              setSettingsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#f8fbff] shadow-[0_30px_100px_rgba(15,35,70,0.3)]"
          >
            <div className="border-b border-blue-100 bg-white px-5 py-5 sm:px-7">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                DALO privacy controls
              </p>
              <h2
                id="cookie-settings-title"
                className="mt-1 text-2xl font-black tracking-tight text-slate-950"
              >
                Choose what DALO may use
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You can change this choice at any time through Cookie settings
                in the footer.
              </p>
            </div>

            <div className="space-y-3 p-5 sm:p-7">
              <div className="flex items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <h3 className="font-extrabold text-slate-950">Necessary</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Login, security, checkout, orders and your saved consent
                    choice.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  Always active
                </span>
              </div>

              {[
                {
                  key: "analytics",
                  title: "Analytics",
                  text: "Measures product views, checkout starts and the customer journey using DALO’s own event system.",
                  checked: analytics,
                  change: setAnalytics,
                },
                {
                  key: "marketing",
                  title: "Marketing",
                  text: "Allows campaign attribution and optional follow-up related to an unfinished checkout or product interest.",
                  checked: marketing,
                  change: setMarketing,
                },
              ].map((option) => (
                <label
                  key={option.key}
                  className="flex cursor-pointer items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <span>
                    <span className="block font-extrabold text-slate-950">
                      {option.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                      {option.text}
                    </span>
                  </span>
                  <span className="relative mt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={option.checked}
                      onChange={(event) => option.change(event.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="block h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-blue-700 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-200" />
                    <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  </span>
                </label>
              ))}

              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => applyConsent(false, false)}
                  className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 font-bold text-slate-800 transition hover:border-blue-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  Use necessary only
                </button>
                <button
                  type="button"
                  onClick={() => applyConsent(analytics, marketing)}
                  className="min-h-12 rounded-xl bg-blue-700 px-5 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  Save my choices
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
