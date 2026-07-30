"use client";

import { OPEN_CONSENT_EVENT } from "@/lib/consent";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="block text-left hover:text-[#2148c0]"
    >
      Cookie settings
    </button>
  );
}
