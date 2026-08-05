CREATE TABLE "SupportReply" (
    "id" TEXT NOT NULL,
    "supportRequestId" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
    "providerMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportReply_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupportReply_supportRequestId_createdAt_idx" ON "SupportReply"("supportRequestId", "createdAt");
CREATE INDEX "SupportReply_adminUserId_idx" ON "SupportReply"("adminUserId");
ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_supportRequestId_fkey" FOREIGN KEY ("supportRequestId") REFERENCES "SupportRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportReply" ADD CONSTRAINT "SupportReply_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
