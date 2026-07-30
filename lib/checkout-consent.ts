export const CHECKOUT_LEGAL_VERSION = "2026-07-28";

export function hasRequiredCheckoutConsent(formData: FormData) {
  return (
    formData.get("legalAccepted") === "yes" &&
    formData.get("immediateDeliveryAccepted") === "yes"
  );
}
