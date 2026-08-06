import { config } from "dotenv";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Next.js loads .env.local automatically. Direct scripts and Prisma helpers do
// not, so load it first and keep .env as a local fallback.
config({ path: ".env.local" });
config();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaSchemaVersion: string | undefined;
};

const PRISMA_SCHEMA_VERSION = "2026-08-07-esim-go-lifecycle";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be configured.");
}

const canReuseGlobal =
  globalForPrisma.prismaSchemaVersion === PRISMA_SCHEMA_VERSION;

const pool =
  (canReuseGlobal ? globalForPrisma.prismaPool : undefined) ??
  new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 2 : 5,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    allowExitOnIdle: true,
  });

// node-postgres removes broken idle clients from the pool after this event.
// Registering a listener prevents a dropped Neon socket from becoming an
// unhandled process error; the next request receives a fresh pooled client.
pool.on("error", () => undefined);

const adapter = new PrismaPg(pool);

export const prisma =
  (canReuseGlobal ? globalForPrisma.prisma : undefined) ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaPool = pool;
  globalForPrisma.prismaSchemaVersion = PRISMA_SCHEMA_VERSION;
}
