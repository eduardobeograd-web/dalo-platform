import "server-only";

function enabled(name: string) {
  return process.env[name]?.trim().toLowerCase() === "true";
}

export function getEsimGoReadiness() {
  const apiKeyConfigured = Boolean(process.env.ESIM_GO_API_KEY?.trim());
  const readAccessRequested = enabled("ESIM_GO_READ_ENABLED");
  const validationRequested = enabled("ESIM_GO_VALIDATE_ENABLED");
  const liveTransactionsRequested = enabled(
    "ESIM_GO_LIVE_FULFILLMENT_ENABLED",
  );
  const automaticFulfillmentRequested = enabled(
    "ESIM_GO_AUTOMATIC_FULFILLMENT_ENABLED",
  );
  const webhookRequested = enabled("ESIM_GO_WEBHOOK_ENABLED");
  const topUpsRequested = enabled("ESIM_GO_TOP_UPS_ENABLED");

  const readAccessEnabled = apiKeyConfigured && readAccessRequested;
  const validationEnabled = readAccessEnabled && validationRequested;
  const liveTransactionsEnabled =
    validationEnabled && liveTransactionsRequested;
  const automaticFulfillmentEnabled =
    liveTransactionsEnabled && automaticFulfillmentRequested;
  const webhookEnabled = apiKeyConfigured && webhookRequested;
  const topUpsEnabled = liveTransactionsEnabled && topUpsRequested;

  return {
    apiKeyConfigured,
    readAccessRequested,
    readAccessEnabled,
    validationRequested,
    validationEnabled,
    liveTransactionsRequested,
    liveTransactionsEnabled,
    automaticFulfillmentRequested,
    automaticFulfillmentEnabled,
    webhookRequested,
    webhookEnabled,
    topUpsRequested,
    topUpsEnabled,
    baseUrl: (
      process.env.ESIM_GO_BASE_URL || "https://api.esim-go.com/v2.5"
    ).replace(/\/$/, ""),
  };
}

export type EsimGoCapability = "read" | "validate" | "transaction" | "webhook";

export function requireEsimGoCapability(capability: EsimGoCapability) {
  const readiness = getEsimGoReadiness();

  if (!readiness.apiKeyConfigured) {
    throw new Error("ESIM_GO_API_KEY is not configured.");
  }

  const allowed =
    capability === "read"
      ? readiness.readAccessEnabled
      : capability === "validate"
        ? readiness.validationEnabled
        : capability === "transaction"
          ? readiness.liveTransactionsEnabled
          : readiness.webhookEnabled;

  if (!allowed) {
    throw new Error(`eSIM Go ${capability} capability is disabled.`);
  }

  return {
    apiKey: process.env.ESIM_GO_API_KEY!.trim(),
    baseUrl: readiness.baseUrl,
  };
}
