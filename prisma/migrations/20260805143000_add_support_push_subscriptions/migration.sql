CREATE TABLE "SupportPushSubscription" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastSuccessAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SupportPushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupportPushSubscription_endpoint_key" ON "SupportPushSubscription"("endpoint");
CREATE INDEX "SupportPushSubscription_adminUserId_idx" ON "SupportPushSubscription"("adminUserId");
ALTER TABLE "SupportPushSubscription" ADD CONSTRAINT "SupportPushSubscription_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
