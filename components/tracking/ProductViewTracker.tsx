"use client";

import { useEffect, useRef } from "react";
import { trackClientEvent } from "@/lib/track-client-event";

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
    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;

    const dedupeKey = `dalo_product_view_${productId}`;

    if (typeof window !== "undefined") {
      const alreadyTracked = window.sessionStorage.getItem(dedupeKey);

      if (alreadyTracked) {
        return;
      }

      window.sessionStorage.setItem(dedupeKey, "true");
    }

    trackClientEvent({
      eventType: "product_view",
      productId,
      metadata,
    });
  }, [productId, metadata]);

  return null;
}
