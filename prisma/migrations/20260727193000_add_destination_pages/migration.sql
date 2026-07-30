CREATE TABLE "DestinationPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "DestinationPage_slug_key" ON "DestinationPage"("slug");
