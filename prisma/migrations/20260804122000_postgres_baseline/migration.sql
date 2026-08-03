-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminSession" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'READ_ONLY',
    "permissions" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "billingAddressLine1" TEXT,
    "billingAddressLine2" TEXT,
    "billingCity" TEXT,
    "billingCompany" TEXT,
    "billingCountry" TEXT,
    "billingPostalCode" TEXT,
    "billingState" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerEvent" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "productId" TEXT,
    "sessionId" TEXT,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerSession" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DestinationPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "heroImage" TEXT,
    "heroImageAlt" TEXT,
    "coverageText" TEXT,
    "activationText" TEXT,
    "compatibilityText" TEXT,
    "hotspotText" TEXT,
    "faq" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "indexable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DestinationPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT,
    "customer" TEXT NOT NULL,
    "customerId" TEXT,
    "productId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "buyPriceAtPurchase" DOUBLE PRECISION,
    "productNameAtPurchase" TEXT,
    "countryAtPurchase" TEXT,
    "dataAtPurchase" TEXT,
    "validityDaysAtPurchase" INTEGER,
    "providerAtPurchase" TEXT,
    "providerProductIdAtPurchase" TEXT,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "legalAcceptedAt" TIMESTAMP(3),
    "legalVersion" TEXT,
    "immediateDeliveryAcceptedAt" TIMESTAMP(3),
    "immediateDeliveryVersion" TEXT,
    "payment" TEXT NOT NULL,
    "fulfillment" TEXT NOT NULL,
    "esimStatus" TEXT,
    "providerOrderId" TEXT,
    "iccid" TEXT,
    "qrCodeUrl" TEXT,
    "activationCode" TEXT,
    "iosInstallUrl" TEXT,
    "androidInstallUrl" TEXT,
    "totalDataGb" DOUBLE PRECISION,
    "usedDataGb" DOUBLE PRECISION,
    "remainingDataGb" DOUBLE PRECISION,
    "expiresAt" TIMESTAMP(3),
    "lastUsageSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isoCode" TEXT,
    "region" TEXT,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "planType" TEXT NOT NULL,
    "usageFit" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "buyPrice" DOUBLE PRECISION NOT NULL,
    "sellPrice" DOUBLE PRECISION NOT NULL,
    "oldPrice" DOUBLE PRECISION,
    "provider" TEXT NOT NULL,
    "providerProductId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "seoText" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProviderConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "baseUrl" TEXT,
    "apiKeyEnvName" TEXT,
    "productSearchQuery" TEXT,
    "fulfillmentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "catalogueEnabled" BOOLEAN NOT NULL DEFAULT false,
    "usageSyncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecommendationSetting" (
    "id" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "gbPerDay" DOUBLE PRECISION NOT NULL,
    "minimumGb" DOUBLE PRECISION NOT NULL,
    "maxBestMatchMultiple" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "budgetMinNeedMultiple" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "comfortMinNeedMultiple" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "heavyMinGb" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SupportRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "orderNumber" TEXT,
    "iccid" TEXT,
    "productName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminUserId_idx" ON "public"."AdminAuditLog"("adminUserId" ASC);

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "public"."AdminAuditLog"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "AdminAuditLog_resource_idx" ON "public"."AdminAuditLog"("resource" ASC);

-- CreateIndex
CREATE INDEX "AdminSession_adminUserId_idx" ON "public"."AdminSession"("adminUserId" ASC);

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "public"."AdminSession"("expiresAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "public"."AdminSession"("tokenHash" ASC);

-- CreateIndex
CREATE INDEX "AdminUser_active_idx" ON "public"."AdminUser"("active" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "public"."AdminUser"("email" ASC);

-- CreateIndex
CREATE INDEX "AdminUser_role_idx" ON "public"."AdminUser"("role" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "public"."Customer"("email" ASC);

-- CreateIndex
CREATE INDEX "CustomerEvent_createdAt_idx" ON "public"."CustomerEvent"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "CustomerEvent_customerId_idx" ON "public"."CustomerEvent"("customerId" ASC);

-- CreateIndex
CREATE INDEX "CustomerEvent_eventType_idx" ON "public"."CustomerEvent"("eventType" ASC);

-- CreateIndex
CREATE INDEX "CustomerEvent_orderId_idx" ON "public"."CustomerEvent"("orderId" ASC);

-- CreateIndex
CREATE INDEX "CustomerEvent_productId_idx" ON "public"."CustomerEvent"("productId" ASC);

-- CreateIndex
CREATE INDEX "CustomerEvent_sessionId_idx" ON "public"."CustomerEvent"("sessionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSession_token_key" ON "public"."CustomerSession"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DestinationPage_slug_key" ON "public"."DestinationPage"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "public"."Order"("orderNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "public"."Order"("stripeSessionId" ASC);

-- CreateIndex
CREATE INDEX "PasswordResetToken_customerId_idx" ON "public"."PasswordResetToken"("customerId" ASC);

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "public"."PasswordResetToken"("expiresAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "public"."PasswordResetToken"("tokenHash" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Product_providerProductId_key" ON "public"."Product"("providerProductId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "public"."Product"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ProviderConfig_slug_key" ON "public"."ProviderConfig"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationSetting_usageType_key" ON "public"."RecommendationSetting"("usageType" ASC);

-- AddForeignKey
ALTER TABLE "public"."AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "public"."AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "public"."AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerEvent" ADD CONSTRAINT "CustomerEvent_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerEvent" ADD CONSTRAINT "CustomerEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerEvent" ADD CONSTRAINT "CustomerEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerSession" ADD CONSTRAINT "CustomerSession_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupportRequest" ADD CONSTRAINT "SupportRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SupportRequest" ADD CONSTRAINT "SupportRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
