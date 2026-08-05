"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackClientEvent } from "@/lib/track-client-event";
import { CONSENT_CHANGED_EVENT, hasConsent } from "@/lib/consent";

const INTERNAL_PATHS = ["/admin", "/support-console", "/test-access"];

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    function trackPageView() {
      if (
        !pathname ||
        INTERNAL_PATHS.some((prefix) => pathname.startsWith(prefix)) ||
        !hasConsent("analytics")
      ) {
        return;
      }

      const dedupeKey = `dalo_page_view_${pathname}`;
      if (window.sessionStorage.getItem(dedupeKey)) {
        return;
      }

      window.sessionStorage.setItem(dedupeKey, "true");
      trackClientEvent({
        eventType: "page_view",
        metadata: { pageTitle: document.title },
      });
    }

    trackPageView();
    window.addEventListener(CONSENT_CHANGED_EVENT, trackPageView);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, trackPageView);
  }, [pathname]);

  return null;
}
