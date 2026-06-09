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

  console.log("Seeding DALO demo orders...");

  const demoOrders = [
    {
      id: "DALO-1001",
      customer: "customer@example.com",
      productId: "europe-smart-5gb-15d",
      payment: "Paid",
      fulfillment: "Delivered",
    },
    {
      id: "DALO-1002",
      customer: "traveler@example.com",
      productId: "europe-unlimited-15d",
      payment: "Paid",
      fulfillment: "Provisioning",
    },
    {
      id: "DALO-1003",
      customer: "demo@example.com",
      productId: "europe-essential-1gb-7d",
      payment: "Pending",
      fulfillment: "Waiting",
    },
    {
      id: "DALO-1004",
      customer: "support@example.com",
      productId: "europe-pro-10gb-30d",
      payment: "Paid",
      fulfillment: "Failed",
    },
  ];

  for (const order of demoOrders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {
        customer: order.customer,
        productId: order.productId,
        payment: order.payment,
        fulfillment: order.fulfillment,
      },
      create: order,
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