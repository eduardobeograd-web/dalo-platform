"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CookieConsent = dynamic(() => import("./CookieConsent"), {
  ssr: false,
});

export default function DeferredCookieConsent() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number }
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(() => setReady(true), {
        timeout: 1500,
      });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(handle);
  }, []);

  return ready ? <CookieConsent /> : null;
}
