CREATE TABLE IF NOT EXISTS "public"."SiteConfiguration" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "teamAccessEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfiguration_pkey" PRIMARY KEY ("id")
);

INSERT INTO "public"."SiteConfiguration" (
    "id",
    "teamAccessEnabled",
    "createdAt",
    "updatedAt"
) VALUES (
    'default',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
