import {
  getEventConsentCategory,
  hasConsent,
} from "@/lib/consent";

type TrackClientEventInput = {
  eventType: string;
  customerId?: string | null;
  orderId?: string | null;
  productId?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, unknown>;
};

function getSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKey = "dalo_session_id";
  const existingSessionId = window.localStorage.getItem(storageKey);

  if (existingSessionId) {
    return existingSessionId;
  }

  const newSessionId = crypto.randomUUID();
  window.localStorage.setItem(storageKey, newSessionId);

  return newSessionId;
}

export async function trackClientEvent(input: TrackClientEventInput) {
  const consentCategory = getEventConsentCategory(input.eventType);

  if (
    consentCategory !== "necessary" &&
    !hasConsent(consentCategory)
  ) {
    return;
  }

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...input,
        metadata: {
          ...input.metadata,
          pagePath: window.location.pathname,
        },
        sessionId:
          input.sessionId ??
          (consentCategory === "necessary" ? null : getSessionId()),
      }),
    });
  } catch (error) {
    console.error("Client event tracking failed:", error);
  }
}
