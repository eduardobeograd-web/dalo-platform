import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma migrations should use Neon's direct connection. Runtime application
// queries continue to use the pooled DATABASE_URL configured in lib/db.ts.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL_UNPOOLED"] || process.env["DATABASE_URL"],
  },
});
