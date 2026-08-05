export const CONSENT_COOKIE_NAME = "dalo_consent_v1";
export const CONSENT_CHANGED_EVENT = "dalo:consent-changed";
export const OPEN_CONSENT_EVENT = "dalo:open-consent";
export const CONSENT_VERSION = 1;

export type OptionalConsentCategory = "analytics" | "marketing";

export type ConsentPreferences = {
  version: number;
  analytics: boolean;
  marketing: boolean;
  updatedAt: number;
};

export function serializeConsent(preferences: ConsentPreferences) {
  return [
    `v${preferences.version}`,
    `a${preferences.analytics ? 1 : 0}`,
    `m${preferences.marketing ? 1 : 0}`,
    `t${preferences.updatedAt}`,
  ].join(".");
}

export function parseConsentValue(value?: string | null) {
  if (!value) return null;

  const match = value.match(/^v(\d+)\.a([01])\.m([01])\.t(\d+)$/);
  if (!match) return null;

  const preferences: ConsentPreferences = {
    version: Number(match[1]),
    analytics: match[2] === "1",
    marketing: match[3] === "1",
    updatedAt: Number(match[4]),
  };

  if (
    preferences.version !== CONSENT_VERSION ||
    !Number.isFinite(preferences.updatedAt)
  ) {
    return null;
  }

  return preferences;
}

export function readConsent() {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE_NAME}=`));

  return parseConsentValue(
    cookie ? decodeURIComponent(cookie.slice(CONSENT_COOKIE_NAME.length + 1)) : null
  );
}

export function hasConsent(category: OptionalConsentCategory) {
  return readConsent()?.[category] === true;
}

function clearOptionalTrackingStorage() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem("dalo_session_id");

  for (let index = window.sessionStorage.length - 1; index >= 0; index--) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith("dalo_product_view_")) {
      window.sessionStorage.removeItem(key);
    }
    if (key?.startsWith("dalo_page_view_")) {
      window.sessionStorage.removeItem(key);
    }
  }
}

export function saveConsent(
  preferences: Pick<ConsentPreferences, "analytics" | "marketing">
) {
  const completePreferences: ConsentPreferences = {
    version: CONSENT_VERSION,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    updatedAt: Date.now(),
  };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    serializeConsent(completePreferences)
  )}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${secure}`;

  if (!completePreferences.analytics && !completePreferences.marketing) {
    clearOptionalTrackingStorage();
  }

  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGED_EVENT, {
      detail: completePreferences,
    })
  );

  return completePreferences;
}

export function getEventConsentCategory(eventType: string) {
  if (
    [
      "checkout_email_entered",
      "abandoned_checkout_email_sent",
      "product_interest_email_sent",
      "marketing_email_clicked",
    ].includes(eventType)
  ) {
    return "marketing" as const;
  }

  if (
    [
      "product_view",
      "page_view",
      "category_view",
      "search",
      "add_to_cart",
      "checkout_started",
    ].includes(eventType)
  ) {
    return "analytics" as const;
  }

  return "necessary" as const;
}
