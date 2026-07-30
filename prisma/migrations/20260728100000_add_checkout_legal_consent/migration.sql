ALTER TABLE "Order" ADD COLUMN "legalAcceptedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "legalVersion" TEXT;
ALTER TABLE "Order" ADD COLUMN "immediateDeliveryAcceptedAt" DATETIME;
ALTER TABLE "Order" ADD COLUMN "immediateDeliveryVersion" TEXT;
