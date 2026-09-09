import "dotenv/config";

const errors = [];
const warnings = [];
const launch = process.argv.includes("--launch");

function value(name) {
  return process.env[name]?.trim() || "";
}

function requireValue(name, message) {
  if (!value(name)) {
    errors.push(message);
  }
}

function enabled(name) {
  return value(name).toLowerCase() === "true";
}

const siteUrl = value("NEXT_PUBLIC_SITE_URL");

requireValue(
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SITE_URL is missing. Set the final public DALO domain.",
);

if (siteUrl) {
  try {
    const url = new URL(siteUrl);

    if (url.protocol !== "https:") {
      errors.push("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
    }

    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
      errors.push("NEXT_PUBLIC_SITE_URL still points to a local address.");
    }

    if (url.pathname !== "/" || url.search || url.hash) {
      errors.push("NEXT_PUBLIC_SITE_URL must contain only the site origin.");
    }
  } catch {
    errors.push("NEXT_PUBLIC_SITE_URL is not a valid URL.");
  }
}

const databaseUrl = value("DATABASE_URL");
requireValue("DATABASE_URL", "DATABASE_URL is missing.");

if (databaseUrl) {
  try {
    const protocol = new URL(databaseUrl).protocol;
    if (!["postgres:", "postgresql:"].includes(protocol)) {
      errors.push("DATABASE_URL must use PostgreSQL for the current PrismaPg adapter.");
    }
  } catch {
    errors.push("DATABASE_URL is not a valid PostgreSQL URL.");
  }
}

requireValue(
  "RESEND_API_KEY",
  "RESEND_API_KEY is missing, so transactional emails cannot be delivered.",
);

const emailFrom = value("DALO_EMAIL_FROM");
requireValue(
  "DALO_EMAIL_FROM",
  "DALO_EMAIL_FROM is missing. Use an address on the verified sender domain.",
);

requireValue(
  "DALO_EMAIL_REPLY_TO",
  "DALO_EMAIL_REPLY_TO is missing. Use an inbox that is actively monitored by DALO support.",
);

if (emailFrom.includes("onboarding@resend.dev")) {
  errors.push(
    "DALO_EMAIL_FROM still uses the Resend onboarding sender. Verify a DALO domain.",
  );
}

const stripeKey = value("STRIPE_SECRET_KEY");

if (value("DALO_AUTO_MOCK_FULFILLMENT").toLowerCase() === "true") {
  if (stripeKey.startsWith("sk_live_")) {
    errors.push("DALO_AUTO_MOCK_FULFILLMENT cannot be used with a live Stripe key.");
  } else {
    warnings.push(
      "DALO_AUTO_MOCK_FULFILLMENT is active for test purchases. Disable it before launch.",
    );
  }
}

if (!stripeKey) {
  warnings.push("Stripe is not configured.");
} else if (stripeKey.startsWith("sk_test_")) {
  warnings.push("Stripe remains in test mode as requested.");
} else if (stripeKey.startsWith("sk_live_")) {
  warnings.push("Stripe is using a live key.");
} else {
  warnings.push("STRIPE_SECRET_KEY has an unrecognized format.");
}

const esimGoKey = value("ESIM_GO_API_KEY");
const esimGoReadEnabled = enabled("ESIM_GO_READ_ENABLED");
const esimGoValidateEnabled = enabled("ESIM_GO_VALIDATE_ENABLED");
const esimGoWebhookEnabled = enabled("ESIM_GO_WEBHOOK_ENABLED");
const esimGoLiveEnabled = enabled("ESIM_GO_LIVE_FULFILLMENT_ENABLED");
const esimGoTopUpsEnabled = enabled("ESIM_GO_TOP_UPS_ENABLED");

if (
  (esimGoReadEnabled ||
    esimGoValidateEnabled ||
    esimGoWebhookEnabled ||
    esimGoLiveEnabled ||
    esimGoTopUpsEnabled) &&
  !esimGoKey
) {
  errors.push("An eSIM Go capability is enabled but ESIM_GO_API_KEY is missing.");
}

if (esimGoValidateEnabled && !esimGoReadEnabled) {
  errors.push("ESIM_GO_VALIDATE_ENABLED requires ESIM_GO_READ_ENABLED.");
}

if (esimGoLiveEnabled && !esimGoValidateEnabled) {
  errors.push(
    "ESIM_GO_LIVE_FULFILLMENT_ENABLED requires staged validation to be enabled first.",
  );
}

if (esimGoLiveEnabled && !esimGoWebhookEnabled) {
  errors.push(
    "Live eSIM Go fulfillment requires ESIM_GO_WEBHOOK_ENABLED for lifecycle and usage updates.",
  );
}

if (esimGoTopUpsEnabled && !esimGoLiveEnabled) {
  errors.push(
    "ESIM_GO_TOP_UPS_ENABLED requires live fulfillment to be enabled and proven first.",
  );
}

if (
  esimGoKey &&
  !esimGoReadEnabled &&
  !esimGoValidateEnabled &&
  !esimGoWebhookEnabled &&
  !esimGoLiveEnabled &&
  !esimGoTopUpsEnabled
) {
  warnings.push(
    "The eSIM Go key is configured, but every provider capability remains safely disabled.",
  );
}

if (esimGoLiveEnabled) {
  if (!stripeKey.startsWith("sk_live_")) {
    warnings.push(
      "Live eSIM Go fulfillment is enabled while Stripe is not using a recognized live key.",
    );
  }
  warnings.push(
    "eSIM Go live fulfillment is enabled. Confirm the separate DALO provider account and Admin fulfillment switch.",
  );
}

if (launch) {
  if (!stripeKey.startsWith("sk_live_")) {
    errors.push("Launch requires a live Stripe secret key; test mode is not a sales launch.");
  }
  if (!value("STRIPE_WEBHOOK_SECRET").startsWith("whsec_")) {
    errors.push("Launch requires STRIPE_WEBHOOK_SECRET for verified payment notifications.");
  }
  if (enabled("DALO_AUTO_MOCK_FULFILLMENT")) {
    errors.push("Mock fulfillment must be disabled before a sales launch.");
  }
  if (value("ESIM_GO_TEST_ORDER_IDS")) {
    errors.push("Remove test-order purchase exceptions before a sales launch.");
  }
  for (const flag of [
    "ESIM_GO_READ_ENABLED",
    "ESIM_GO_VALIDATE_ENABLED",
    "ESIM_GO_LIVE_FULFILLMENT_ENABLED",
    "ESIM_GO_AUTOMATIC_FULFILLMENT_ENABLED",
    "ESIM_GO_WEBHOOK_ENABLED",
  ]) {
    if (!enabled(flag)) errors.push(`Automated sales launch requires ${flag}. Do not enable it without approval.`);
  }
  warnings.push("Not checked here: deployed environment, Admin purchase switches, callback delivery, mail delivery, provider balance, backups and end-to-end purchase approval.");
}

console.log(launch ? "DALO sales-launch configuration check" : "DALO configuration preflight (not a launch approval)");
console.log("-------------------------");

for (const warning of warnings) {
  console.log(`WARNING: ${warning}`);
}

for (const error of errors) {
  console.error(`ERROR: ${error}`);
}

if (errors.length > 0) {
  console.error(`\nResult: blocked by ${errors.length} configuration issue(s).`);
  process.exitCode = 1;
} else {
  console.log("\nResult: checked configuration requirements pass. This does not certify launch readiness.");
}
