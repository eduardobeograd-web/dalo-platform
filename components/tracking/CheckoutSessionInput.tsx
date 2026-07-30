"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_CHANGED_EVENT,
  hasConsent,
} from "@/lib/consent";

export default function CheckoutSessionInput() {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    function updateSessionId() {
      if (!hasConsent("analytics") && !hasConsent("marketing")) {
        setSessionId("");
        return;
      }

      const storageKey = "dalo_session_id";
      let currentSessionId = window.localStorage.getItem(storageKey);

      if (!currentSessionId) {
        currentSessionId = crypto.randomUUID();
        window.localStorage.setItem(storageKey, currentSessionId);
      }

      setSessionId(currentSessionId);
    }

    updateSessionId();
    window.addEventListener(CONSENT_CHANGED_EVENT, updateSessionId);
    return () =>
      window.removeEventListener(CONSENT_CHANGED_EVENT, updateSessionId);
  }, []);

  return <input type="hidden" name="sessionId" value={sessionId} />;
}
