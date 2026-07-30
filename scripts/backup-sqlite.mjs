import "dotenv/config";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import Database from "better-sqlite3";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl?.startsWith("file:")) {
  throw new Error("db:backup currently supports SQLite DATABASE_URL values only.");
}

const rawPath = databaseUrl.slice("file:".length).split("?")[0];
const sourcePath = path.resolve(rawPath);
const backupDirectory = path.resolve("backups");
const timestamp = new Date().toISOString().replaceAll(":", "-");
const destinationPath = path.join(
  backupDirectory,
  `dalo-${timestamp}.sqlite`,
);

await mkdir(backupDirectory, { recursive: true });

const database = new Database(sourcePath, {
  fileMustExist: true,
  readonly: true,
});

try {
  await database.backup(destinationPath);
} finally {
  database.close();
}

console.log(`SQLite backup created: ${destinationPath}`);
