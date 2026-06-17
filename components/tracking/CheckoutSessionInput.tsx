"use client";

import { useEffect, useState } from "react";

export default function CheckoutSessionInput() {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const storageKey = "dalo_session_id";
    let currentSessionId = window.localStorage.getItem(storageKey);

    if (!currentSessionId) {
      currentSessionId = crypto.randomUUID();
      window.localStorage.setItem(storageKey, currentSessionId);
    }

    setSessionId(currentSessionId);
  }, []);

  return <input type="hidden" name="sessionId" value={sessionId} />;
}
