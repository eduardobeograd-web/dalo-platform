ALTER TABLE "Order"
ADD COLUMN "recommendationProductId" TEXT,
ADD COLUMN "recommendationDataGb" DOUBLE PRECISION,
ADD COLUMN "recommendationTripLength" TEXT,
ADD COLUMN "recommendationUsageType" TEXT,
ADD COLUMN "recommendationChoice" TEXT,
ADD COLUMN "orderKind" TEXT NOT NULL DEFAULT 'new_esim',
ADD COLUMN "sourceOrderId" TEXT;

CREATE INDEX "Order_recommendationProductId_idx" ON "Order"("recommendationProductId");
CREATE INDEX "Order_orderKind_createdAt_idx" ON "Order"("orderKind", "createdAt");
