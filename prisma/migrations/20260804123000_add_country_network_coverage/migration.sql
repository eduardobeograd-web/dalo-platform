CREATE TABLE "CountryNetworkCoverage" (
    "id" TEXT NOT NULL,
    "isoCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "networks" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'eSIM Go',
    "syncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryNetworkCoverage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CountryNetworkCoverage_isoCode_key"
ON "CountryNetworkCoverage"("isoCode");
