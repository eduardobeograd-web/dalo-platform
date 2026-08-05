import "dotenv/config";

const errors = [];
const warnings = [];

function value(name) {
  return process.env[name]?.trim() || "";
}

function requireValue(name, message) {
  if (!value(name)) {
    errors.push(message);
  }
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

if (databaseUrl && !databaseUrl.startsWith("file:")) {
  warnings.push(
    "DATABASE_URL is not SQLite. Confirm the production adapter before deployment.",
  );
}

if (databaseUrl.startsWith("file:")) {
  warnings.push(
    "SQLite requires one persistent server instance and persistent disk storage.",
  );
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

console.log("DALO production readiness");
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
  console.log("\nResult: required production configuration is present.");
}
