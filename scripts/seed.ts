import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { products } from "../lib/products";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding DALO products...");

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        country: product.country,
        region: product.region,
        name: product.name,
        data: product.data,
        validityDays: product.validityDays,
        planType: product.planType,
        usageFit: product.usageFit,
        role: product.role,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        oldPrice: product.oldPrice,
        provider: product.provider,
        providerProductId: product.providerProductId,
        image: product.image,
        description: product.description,
        active: product.active,
      },
      create: {
        id: product.id,
        country: product.country,
        region: product.region,
        name: product.name,
        data: product.data,
        validityDays: product.validityDays,
        planType: product.planType,
        usageFit: product.usageFit,
        role: product.role,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        oldPrice: product.oldPrice,
        provider: product.provider,
        providerProductId: product.providerProductId,
        image: product.image,
        description: product.description,
        active: product.active,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });