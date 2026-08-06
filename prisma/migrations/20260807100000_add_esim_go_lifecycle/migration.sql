-- Separate reusable eSIM profiles from the individual data bundles purchased
-- for them. Provider operations and callbacks are stored independently so a
-- transaction can be claimed once and reconciled safely after failures.

ALTER TABLE "Order" ADD COLUMN "esimProfileId" TEXT;

CREATE TABLE "EsimProfile" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'eSIM Go',
    "iccid" TEXT NOT NULL,
    "customerReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'provisioning',
    "matchingId" TEXT,
    "smdpAddress" TEXT,
    "pin" TEXT,
    "puk" TEXT,
    "profileStatus" TEXT,
    "iosInstallUrl" TEXT,
    "androidInstallUrl" TEXT,
    "qrCodeUrl" TEXT,
    "firstInstalledAt" TIMESTAMP(3),
    "firstAttachedAt" TIMESTAMP(3),
    "firstUsedAt" TIMESTAMP(3),
    "reusableUntil" TIMESTAMP(3),
    "deletionScheduledAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "lastLocation" TEXT,
    "lastNetwork" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EsimProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EsimBundle" (
    "id" TEXT NOT NULL,
    "esimProfileId" TEXT NOT NULL,
    "orderId" TEXT,
    "productId" TEXT,
    "providerBundleName" TEXT NOT NULL,
    "providerAssignmentId" TEXT,
    "providerAssignmentReference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "countryCode" TEXT,
    "dataGb" DOUBLE PRECISION,
    "initialQuantityBytes" DOUBLE PRECISION,
    "remainingQuantityBytes" DOUBLE PRECISION,
    "unlimited" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "lastUsageSyncAt" TIMESTAMP(3),
    "lastUsageAlertPercent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EsimBundle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderOperation" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "esimProfileId" TEXT,
    "esimBundleId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'eSIM Go',
    "operationKind" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "requestFingerprint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "providerReference" TEXT,
    "requestSummary" JSONB,
    "responseSummary" JSONB,
    "lastErrorCode" TEXT,
    "lastErrorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderOperation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProviderWebhookEvent" (
    "id" TEXT NOT NULL,
    "esimProfileId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'eSIM Go',
    "eventKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "iccid" TEXT,
    "assignmentId" TEXT,
    "assignmentReference" TEXT,
    "signatureValid" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EsimProfile_iccid_key" ON "EsimProfile"("iccid");
CREATE INDEX "EsimProfile_customerId_createdAt_idx" ON "EsimProfile"("customerId", "createdAt");
CREATE INDEX "EsimProfile_status_updatedAt_idx" ON "EsimProfile"("status", "updatedAt");

CREATE UNIQUE INDEX "EsimBundle_orderId_key" ON "EsimBundle"("orderId");
CREATE UNIQUE INDEX "EsimBundle_providerAssignmentId_key" ON "EsimBundle"("providerAssignmentId");
CREATE UNIQUE INDEX "EsimBundle_providerAssignmentReference_key" ON "EsimBundle"("providerAssignmentReference");
CREATE INDEX "EsimBundle_esimProfileId_status_idx" ON "EsimBundle"("esimProfileId", "status");
CREATE INDEX "EsimBundle_providerBundleName_idx" ON "EsimBundle"("providerBundleName");
CREATE INDEX "EsimBundle_expiresAt_idx" ON "EsimBundle"("expiresAt");

CREATE UNIQUE INDEX "ProviderOperation_idempotencyKey_key" ON "ProviderOperation"("idempotencyKey");
CREATE INDEX "ProviderOperation_orderId_createdAt_idx" ON "ProviderOperation"("orderId", "createdAt");
CREATE INDEX "ProviderOperation_status_updatedAt_idx" ON "ProviderOperation"("status", "updatedAt");
CREATE INDEX "ProviderOperation_providerReference_idx" ON "ProviderOperation"("providerReference");

CREATE UNIQUE INDEX "ProviderWebhookEvent_eventKey_key" ON "ProviderWebhookEvent"("eventKey");
CREATE INDEX "ProviderWebhookEvent_iccid_receivedAt_idx" ON "ProviderWebhookEvent"("iccid", "receivedAt");
CREATE INDEX "ProviderWebhookEvent_status_receivedAt_idx" ON "ProviderWebhookEvent"("status", "receivedAt");
CREATE INDEX "ProviderWebhookEvent_eventType_receivedAt_idx" ON "ProviderWebhookEvent"("eventType", "receivedAt");

CREATE INDEX "Order_esimProfileId_createdAt_idx" ON "Order"("esimProfileId", "createdAt");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_esimProfileId_fkey"
FOREIGN KEY ("esimProfileId") REFERENCES "EsimProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EsimProfile"
ADD CONSTRAINT "EsimProfile_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EsimBundle"
ADD CONSTRAINT "EsimBundle_esimProfileId_fkey"
FOREIGN KEY ("esimProfileId") REFERENCES "EsimProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EsimBundle"
ADD CONSTRAINT "EsimBundle_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProviderOperation"
ADD CONSTRAINT "ProviderOperation_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProviderOperation"
ADD CONSTRAINT "ProviderOperation_esimProfileId_fkey"
FOREIGN KEY ("esimProfileId") REFERENCES "EsimProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProviderOperation"
ADD CONSTRAINT "ProviderOperation_esimBundleId_fkey"
FOREIGN KEY ("esimBundleId") REFERENCES "EsimBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProviderWebhookEvent"
ADD CONSTRAINT "ProviderWebhookEvent_esimProfileId_fkey"
FOREIGN KEY ("esimProfileId") REFERENCES "EsimProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
