"use client";

import { useEffect, useRef } from "react";
import { trackClientEvent } from "@/lib/track-client-event";
import {
  CONSENT_CHANGED_EVENT,
  hasConsent,
} from "@/lib/consent";

type ProductViewTrackerProps = {
  productId: string;
  metadata?: Record<string, unknown>;
};

export default function ProductViewTracker({
  productId,
  metadata,
}: ProductViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    function trackProductView() {
      if (trackedRef.current || !hasConsent("analytics")) {
        return;
      }

      const dedupeKey = `dalo_product_view_${productId}`;
      const alreadyTracked = window.sessionStorage.getItem(dedupeKey);

      if (alreadyTracked) {
        trackedRef.current = true;
        return;
      }

      window.sessionStorage.setItem(dedupeKey, "true");
      trackedRef.current = true;

      trackClientEvent({
        eventType: "product_view",
        productId,
        metadata,
      });
    }

    trackProductView();
    window.addEventListener(CONSENT_CHANGED_EVENT, trackProductView);
    return () =>
      window.removeEventListener(CONSENT_CHANGED_EVENT, trackProductView);
  }, [productId, metadata]);

  return null;
}
