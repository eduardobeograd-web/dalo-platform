import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";

type Row = Record<string, unknown>;
type ModelPlanItem = {
  table: string;
  delegate: string;
  booleans?: readonly string[];
  dates?: readonly string[];
  json?: readonly string[];
};

const sourceEnvironment = dotenv.parse(fs.readFileSync(".env"));
const targetEnvironment = dotenv.parse(
  fs.readFileSync(".env.vercel.local"),
);
const sourceUrl = sourceEnvironment.DATABASE_URL;
const targetUrl =
  targetEnvironment.DATABASE_URL ||
  targetEnvironment.POSTGRES_PRISMA_URL ||
  targetEnvironment.POSTGRES_URL;

if (!sourceUrl?.startsWith("file:")) {
  throw new Error("The source DATABASE_URL in .env must point to SQLite.");
}

if (!targetUrl?.startsWith("postgres")) {
  throw new Error(
    "No PostgreSQL URL was found in .env.vercel.local.",
  );
}

const sourcePathValue = sourceUrl.slice("file:".length);
const sourcePath = path.isAbsolute(sourcePathValue)
  ? sourcePathValue
  : path.resolve(process.cwd(), sourcePathValue);

if (!fs.existsSync(sourcePath)) {
  throw new Error(`SQLite source database was not found at ${sourcePath}.`);
}

const sqlite = new Database(sourcePath, { readonly: true });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: targetUrl }),
});

const modelPlan: ModelPlanItem[] = [
  {
    table: "RecommendationSetting",
    delegate: "recommendationSetting",
    booleans: ["active"],
    dates: ["createdAt", "updatedAt"],
  },
  {
    table: "Product",
    delegate: "product",
    booleans: ["active"],
    dates: ["createdAt", "updatedAt"],
  },
  {
    table: "Customer",
    delegate: "customer",
    booleans: ["active"],
    dates: ["createdAt", "updatedAt"],
  },
  {
    table: "ProviderConfig",
    delegate: "providerConfig",
    booleans: [
      "active",
      "fulfillmentEnabled",
      "catalogueEnabled",
      "usageSyncEnabled",
    ],
    dates: ["createdAt", "updatedAt"],
  },
  {
    table: "DestinationPage",
    delegate: "destinationPage",
    booleans: ["published", "indexable"],
    dates: ["createdAt", "updatedAt"],
    json: ["faq"],
  },
  {
    table: "AdminUser",
    delegate: "adminUser",
    booleans: ["active", "mustChangePassword"],
    dates: ["lastLoginAt", "createdAt", "updatedAt"],
    json: ["permissions"],
  },
  {
    table: "Order",
    delegate: "order",
    dates: [
      "paidAt",
      "legalAcceptedAt",
      "immediateDeliveryAcceptedAt",
      "expiresAt",
      "lastUsageSyncAt",
      "createdAt",
    ],
  },
  {
    table: "CustomerSession",
    delegate: "customerSession",
    dates: ["expiresAt", "usedAt", "createdAt"],
  },
  {
    table: "PasswordResetToken",
    delegate: "passwordResetToken",
    dates: ["expiresAt", "usedAt", "createdAt"],
  },
  {
    table: "SupportRequest",
    delegate: "supportRequest",
    dates: ["createdAt", "updatedAt"],
  },
  {
    table: "CustomerEvent",
    delegate: "customerEvent",
    dates: ["createdAt"],
    json: ["metadata"],
  },
  {
    table: "AdminSession",
    delegate: "adminSession",
    dates: ["expiresAt", "createdAt"],
  },
  {
    table: "AdminAuditLog",
    delegate: "adminAuditLog",
    dates: ["createdAt"],
    json: ["metadata"],
  },
];

function toDate(value: unknown) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;

  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : null;

  return numericValue === null ? new Date(String(value)) : new Date(numericValue);
}

function toJson(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function transformRows(
  rows: Row[],
  booleans: readonly string[] = [],
  dates: readonly string[] = [],
  json: readonly string[] = [],
) {
  return rows.map((sourceRow) => {
    const row = { ...sourceRow };

    for (const field of booleans) {
      if (field in row) row[field] = Boolean(row[field]);
    }

    for (const field of dates) {
      if (field in row) row[field] = toDate(row[field]);
    }

    for (const field of json) {
      if (field in row) row[field] = toJson(row[field]);
    }

    return row;
  });
}

async function migrate() {
  const delegates = prisma as unknown as Record<
    string,
    {
      count: () => Promise<number>;
      createMany: (input: { data: Row[] }) => Promise<{ count: number }>;
    }
  >;

  for (const model of modelPlan) {
    const targetCount = await delegates[model.delegate].count();

    if (targetCount > 0) {
      throw new Error(
        `Target model ${model.table} is not empty. Migration stopped safely.`,
      );
    }
  }

  for (const model of modelPlan) {
    const sourceRows = sqlite
      .prepare(`SELECT * FROM "${model.table}"`)
      .all() as Row[];
    const rows = transformRows(
      sourceRows,
      model.booleans,
      model.dates,
      model.json,
    );

    if (rows.length === 0) {
      console.log(`${model.table}: 0 rows`);
      continue;
    }

    const result = await delegates[model.delegate].createMany({ data: rows });
    console.log(`${model.table}: ${result.count} rows`);
  }
}

migrate()
  .then(() => {
    console.log("SQLite to PostgreSQL migration completed.");
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });
