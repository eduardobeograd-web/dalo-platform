ALTER TABLE "Customer"
ADD COLUMN "marketingEmailConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "marketingEmailConsentAt" TIMESTAMP(3),
ADD COLUMN "marketingEmailConsentRevokedAt" TIMESTAMP(3),
ADD COLUMN "marketingEmailConsentSource" TEXT,
ADD COLUMN "marketingEmailConsentVersion" TEXT;
