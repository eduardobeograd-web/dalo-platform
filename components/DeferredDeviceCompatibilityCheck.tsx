"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CONSENT_CHANGED_EVENT,
  readConsent,
} from "@/lib/consent";

const DeviceCompatibilityCheck = dynamic(
  () => import("./DeviceCompatibilityCheck"),
  {
    ssr: false,
  }
);

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function DeferredDeviceCompatibilityCheck() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const isInternalRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/support-console");

  useEffect(() => {
    if (isInternalRoute) {
      setReady(false);
      return;
    }

    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    function scheduleDeviceCheck() {
      const idleWindow = window as IdleWindow;

      if (idleHandle !== undefined || timeoutHandle !== undefined) {
        return;
      }

      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(() => setReady(true), {
          timeout: 5000,
        });
        return;
      }

      timeoutHandle = window.setTimeout(() => setReady(true), 4000);
    }

    if (readConsent()) {
      scheduleDeviceCheck();
    }

    window.addEventListener(CONSENT_CHANGED_EVENT, scheduleDeviceCheck);

    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, scheduleDeviceCheck);
      if (idleHandle !== undefined) {
        (window as IdleWindow).cancelIdleCallback?.(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [isInternalRoute]);

  return !isInternalRoute && ready ? <DeviceCompatibilityCheck /> : null;
}
