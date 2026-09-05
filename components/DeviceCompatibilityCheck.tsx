"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CONSENT_CHANGED_EVENT,
  readConsent,
} from "@/lib/consent";

const hiddenPrefixes = ["/admin", "/customer"];
const OPEN_DEVICE_CHECK_EVENT = "dalo:open-device-check";
const DEVICE_COMPATIBILITY_CONFIRMED_KEY =
  "dalo_device_compatibility_confirmed_v1";
type DevicePlatform = "iphone" | "ipad" | "samsung" | "android" | "other";

function detectDevicePlatform(): DevicePlatform {
  if (typeof navigator === "undefined") return "other";

  const userAgent = navigator.userAgent;
  const isIPadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  if (/iPhone|iPod/i.test(userAgent)) return "iphone";
  if (/iPad/i.test(userAgent) || isIPadOs) return "ipad";
  if (/Android/i.test(userAgent) && /Samsung|SM-[A-Z0-9]+/i.test(userAgent)) {
    return "samsung";
  }
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

function readCompatibilityConfirmation() {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.localStorage.getItem(DEVICE_COMPATIBILITY_CONFIRMED_KEY) ===
      "true"
    );
  } catch {
    return false;
  }
}

export default function DeviceCompatibilityCheck({ variant = "floating" }: { variant?: "floating" | "quiz" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [platform] = useState<DevicePlatform>(detectDevicePlatform);
  const [consentDecided, setConsentDecided] = useState(() =>
    typeof window === "undefined" ? false : Boolean(readConsent()),
  );
  const [compatibilityConfirmed, setCompatibilityConfirmed] = useState(
    readCompatibilityConfirmation,
  );

  useEffect(() => {
    function showAfterConsentChoice() {
      setConsentDecided(true);
    }

    window.addEventListener(CONSENT_CHANGED_EVENT, showAfterConsentChoice);
    return () =>
      window.removeEventListener(
        CONSENT_CHANGED_EVENT,
        showAfterConsentChoice
      );
  }, []);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (variant !== "floating") return;

    function openDeviceCheck() {
      setOpen(true);
    }

    window.addEventListener(OPEN_DEVICE_CHECK_EVENT, openDeviceCheck);
    return () => window.removeEventListener(OPEN_DEVICE_CHECK_EVENT, openDeviceCheck);
  }, [variant]);

  if (
    !consentDecided ||
    hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return null;
  }

  const hideFloatingLauncher =
    variant === "floating" && compatibilityConfirmed;

  const platformLabel =
    platform === "iphone"
      ? "iPhone detected"
      : platform === "ipad"
        ? "iPad detected"
      : platform === "samsung"
        ? "Samsung Galaxy detected"
      : platform === "android"
        ? "Android device detected"
        : "Check your device";
  const compatibilitySignal =
    platform === "iphone"
      ? "Many recent iPhones are eSIM ready. Your exact model and region still need one quick check."
      : platform === "ipad"
        ? "Many cellular iPads support eSIM. Your exact model and carrier settings still need one quick check."
        : platform === "samsung"
          ? "Many recent Samsung Galaxy devices are eSIM ready. Regional variants can differ, so please confirm below."
          : platform === "android"
            ? "Your Android device may support eSIM. Support depends on the exact model, region and carrier."
            : "We cannot identify your phone from this browser. You can still confirm eSIM support in a few seconds.";
  const detectionHeadline =
    platform === "iphone"
      ? "We detected an iPhone."
      : platform === "ipad"
        ? "We detected an iPad."
        : platform === "samsung"
          ? "We detected a Samsung Galaxy."
          : platform === "android"
            ? "We detected an Android device."
            : "Let's check your device.";
  const deviceRecognized = platform !== "other";
  const settingsStep =
    platform === "iphone" || platform === "ipad"
      ? {
          title: "Open Cellular settings",
          text: "Go to Settings → Cellular or Mobile Data. Look for “Add eSIM” or “Add Cellular Plan”.",
        }
        : platform === "android" || platform === "samsung"
        ? {
            title: "Open SIM settings",
            text: "Go to Settings → Network & internet or Connections → SIM Manager. Look for “Add eSIM”.",
          }
        : {
            title: "Look for “Add eSIM”",
            text: "Open your phone’s Mobile Data, Cellular or SIM Manager settings. An “Add eSIM” option is the clearest sign of support.",
          };

  return (
    <>
      {!hideFloatingLauncher ? (
        <button
          type="button"
          onClick={() => {
            if (variant === "quiz") {
              window.dispatchEvent(new Event(OPEN_DEVICE_CHECK_EVENT));
              return;
            }
            setOpen(true);
          }}
          aria-haspopup="dialog"
          aria-label="Check device compatibility"
          className={variant === "quiz"
            ? "group relative flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/90 px-2.5 py-1.5 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            : `group fixed bottom-24 right-3 z-40 h-12 w-auto items-center justify-center gap-2 rounded-2xl border border-blue-400 bg-blue-800 px-2.5 text-left text-white shadow-[0_14px_35px_rgba(13,54,140,0.32)] transition hover:-translate-y-1 hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:bottom-5 sm:right-5 sm:h-auto sm:min-w-[330px] sm:justify-start sm:gap-3 sm:px-4 sm:py-3.5 ${pathname === "/" ? "hidden" : "flex"}`}
        >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white sm:h-11 sm:w-11" aria-hidden="true">
          <span className="flex h-9 w-6 flex-col items-center justify-center gap-1 rounded-lg border-2 border-blue-900 bg-slate-950 p-1 shadow-[0_4px_12px_rgba(15,23,42,0.35)]">
            <span className="h-2 w-2 rounded-full bg-red-950 ring-1 ring-red-600/60" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-amber-100 shadow-[0_0_12px_3px_rgba(251,191,36,0.85)] motion-safe:animate-pulse">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber-300 opacity-45 motion-reduce:animate-none" />
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-950 ring-1 ring-emerald-600/60" />
          </span>
        </span>
        <span className="block min-w-0 pr-1 sm:hidden">
          <span className={`block max-w-[8rem] truncate text-[10px] font-black uppercase tracking-[0.06em] ${variant === "quiz" ? "text-blue-700" : "text-blue-100"}`}>
            {platformLabel}
          </span>
          <span className={`block text-xs font-extrabold ${variant === "quiz" ? "text-[#10233a]" : "text-white"}`}>
            {variant === "quiz" ? "Verify eSIM →" : "Check eSIM readiness"}
          </span>
        </span>
        <span className="hidden min-w-0 flex-1 sm:block">
          <span className={`block truncate text-[11px] font-bold uppercase tracking-[0.16em] ${variant === "quiz" ? "text-blue-700" : "text-blue-100"}`}>
            {variant === "quiz" && platform === "other" ? "Phone compatibility" : platformLabel}
          </span>
          <span className={`block text-[15px] font-extrabold ${variant === "quiz" ? "text-[#10233a]" : "text-white"}`}>
            {variant === "quiz" ? "Check before buying →" : "Check device compatibility"}
          </span>
        </span>
        <span className={`${variant === "quiz" ? "hidden" : "hidden sm:block"} shrink-0 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-black uppercase tracking-wide transition group-hover:bg-white group-hover:text-blue-900`}>
          Check now
        </span>
        </button>
      ) : null}

      {variant === "floating" && open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="device-check-title"
            className="w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-[#f8fbff] shadow-[0_28px_90px_rgba(15,38,79,0.28)]"
          >
            <div className="flex items-start justify-between border-b border-blue-100 bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  DALO device check · {platformLabel}
                </p>
                <h2
                  id="device-check-title"
                  className="mt-1 text-2xl font-black tracking-tight text-slate-950"
                >
                  Is your phone eSIM ready?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close device compatibility check"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-xl text-slate-600 transition hover:border-slate-400 hover:text-slate-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 px-5 py-5 sm:px-7 sm:py-6">
              <div className="rounded-2xl border border-blue-500 bg-[#173f91] px-5 py-4 text-white shadow-[0_12px_30px_rgba(23,63,145,0.2)]">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-200">
                  <span className={`h-2.5 w-2.5 rounded-full ${deviceRecognized ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {deviceRecognized ? "Positive device signal" : "Manual check needed"}
                </div>
                <p className="mt-1.5 text-xl font-black tracking-tight">
                  {detectionHeadline}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-blue-50">
                  {compatibilitySignal}
                </p>
              </div>

              {[
                {
                  number: "01",
                  title: settingsStep.title,
                  text: settingsStep.text,
                },
                {
                  number: "02",
                  title: "Check for an EID",
                  text: "Dial *#06#. If an EID number appears, your device includes eSIM hardware.",
                },
                {
                  number: "03",
                  title: "Confirm it is unlocked",
                  text: "Your phone must not be restricted to one mobile carrier. Ask your carrier if you are unsure.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}

              <p className="rounded-2xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-950">
                Browser detection cannot reliably confirm a specific phone
                model or regional variant. Complete all three checks before
                purchasing.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.localStorage.setItem(
                        DEVICE_COMPATIBILITY_CONFIRMED_KEY,
                        "true",
                      );
                    } catch {
                      // The current session still remembers the choice.
                    }
                    setCompatibilityConfirmed(true);
                    setOpen(false);
                  }}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-blue-700 px-5 font-bold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  My device is compatible
                </button>
                <Link
                  href="/support"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-bold text-slate-800 transition hover:border-blue-400 hover:text-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  Get compatibility help
                </Link>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
