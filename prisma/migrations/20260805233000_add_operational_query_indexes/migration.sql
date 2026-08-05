-- Product discovery and destination filtering
CREATE INDEX "Product_active_country_idx" ON "Product"("active", "country");
CREATE INDEX "Product_active_region_idx" ON "Product"("active", "region");

-- Customer session and order history lookups
CREATE INDEX "CustomerSession_customerId_idx" ON "CustomerSession"("customerId");
CREATE INDEX "CustomerSession_expiresAt_idx" ON "CustomerSession"("expiresAt");
CREATE INDEX "Order_customerId_createdAt_idx" ON "Order"("customerId", "createdAt");
CREATE INDEX "Order_customer_createdAt_idx" ON "Order"("customer", "createdAt");

-- Admin payment and fulfillment queues
CREATE INDEX "Order_payment_createdAt_idx" ON "Order"("payment", "createdAt");
CREATE INDEX "Order_fulfillment_createdAt_idx" ON "Order"("fulfillment", "createdAt");
CREATE INDEX "Order_esimStatus_idx" ON "Order"("esimStatus");
CREATE INDEX "Order_productId_idx" ON "Order"("productId");

-- Customer and admin support queues
CREATE INDEX "SupportRequest_status_createdAt_idx" ON "SupportRequest"("status", "createdAt");
CREATE INDEX "SupportRequest_customerId_idx" ON "SupportRequest"("customerId");
CREATE INDEX "SupportRequest_orderId_idx" ON "SupportRequest"("orderId");
