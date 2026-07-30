-- Preserve the commercial and product state that was agreed at checkout.
ALTER TABLE "Order" ADD COLUMN "amount" REAL;
ALTER TABLE "Order" ADD COLUMN "currency" TEXT;
ALTER TABLE "Order" ADD COLUMN "buyPriceAtPurchase" REAL;
ALTER TABLE "Order" ADD COLUMN "productNameAtPurchase" TEXT;
ALTER TABLE "Order" ADD COLUMN "countryAtPurchase" TEXT;
ALTER TABLE "Order" ADD COLUMN "dataAtPurchase" TEXT;
ALTER TABLE "Order" ADD COLUMN "validityDaysAtPurchase" INTEGER;
ALTER TABLE "Order" ADD COLUMN "providerAtPurchase" TEXT;
ALTER TABLE "Order" ADD COLUMN "providerProductIdAtPurchase" TEXT;
ALTER TABLE "Order" ADD COLUMN "stripeSessionId" TEXT;
ALTER TABLE "Order" ADD COLUMN "stripePaymentIntentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "paidAt" DATETIME;

CREATE UNIQUE INDEX "Order_stripeSessionId_key"
ON "Order"("stripeSessionId");
