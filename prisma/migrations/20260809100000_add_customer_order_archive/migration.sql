ALTER TABLE "Order" ADD COLUMN "customerArchivedAt" TIMESTAMP(3);

CREATE INDEX "Order_customerId_customerArchivedAt_createdAt_idx"
ON "Order"("customerId", "customerArchivedAt", "createdAt");

CREATE INDEX "Order_customer_customerArchivedAt_createdAt_idx"
ON "Order"("customer", "customerArchivedAt", "createdAt");
