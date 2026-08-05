"use client";

import { useEffect, useState } from "react";

type PushState = "checking" | "off" | "working" | "on" | "blocked" | "unsupported" | "unconfigured";

function decodePublicKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replaceAll("-", "+").replaceAll("_", "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export default function SupportPushNotifications({ publicKey }: { publicKey: string }) {
  const [state, setState] = useState<PushState>(publicKey ? "checking" : "unconfigured");

  useEffect(() => {
    if (!publicKey) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("blocked");
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setState(subscription ? "on" : "off"))
      .catch(() => setState("unsupported"));
  }, [publicKey]);

  async function togglePush() {
    if (state === "working" || state === "unsupported" || state === "unconfigured") return;
    setState("working");

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();

      if (existing) {
        const response = await fetch("/api/support-console/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
        if (!response.ok) throw new Error("Could not disable notifications");
        await existing.unsubscribe();
        setState("off");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodePublicKey(publicKey),
      });
      const response = await fetch("/api/support-console/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!response.ok) {
        await subscription.unsubscribe();
        throw new Error("Could not save notifications");
      }
      setState("on");
    } catch {
      setState("off");
    }
  }

  const label =
    state === "on" ? "Push on" :
    state === "working" || state === "checking" ? "Checking" :
    state === "blocked" ? "Push blocked" :
    state === "unconfigured" ? "Push setup needed" :
    state === "unsupported" ? "Push unavailable" : "Enable push";
  const disabled = ["checking", "working", "unsupported", "unconfigured", "blocked"].includes(state);

  return (
    <button
      type="button"
      onClick={togglePush}
      disabled={disabled}
      title={label}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-xs font-black transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-65 ${state === "on" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
      <span className="hidden lg:inline">{label}</span>
      {state === "on" ? <span aria-label="enabled" className="h-2 w-2 rounded-full bg-emerald-500" /> : null}
    </button>
  );
}
