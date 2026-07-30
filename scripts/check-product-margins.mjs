import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DEACTIVATE_LOSSES = process.argv.includes("--deactivate-losses");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.startsWith("file:")) {
  throw new Error("DATABASE_URL must point to the DALO SQLite database.");
}

const databasePath = decodeURIComponent(databaseUrl.slice("file:".length));
const database = new Database(databasePath);
const products = database
  .prepare(
    `SELECT id, country, name, providerProductId, buyPrice, sellPrice, active
     FROM Product
     ORDER BY country, name`
  )
  .all();
const MIN_MARGIN_PERCENT = 30;
const CRITICAL_MARGIN_PERCENT = 20;
const MIN_GROSS_PROFIT = 3;
const CRITICAL_GROSS_PROFIT = 1;

function getMarginPercent(product) {
  if (product.sellPrice <= 0) return 0;
  return ((product.sellPrice - product.buyPrice) / product.sellPrice) * 100;
}

function getMarginStatus(product) {
  const profit = product.sellPrice - product.buyPrice;
  const margin = getMarginPercent(product);

  if (
    margin < CRITICAL_MARGIN_PERCENT ||
    profit < CRITICAL_GROSS_PROFIT
  ) {
    return "critical";
  }

  if (margin < MIN_MARGIN_PERCENT || profit < MIN_GROSS_PROFIT) {
    return "review";
  }

  return "healthy";
}

const activeLossProducts = products.filter(
  (product) => product.active && product.sellPrice <= product.buyPrice
);
const inactiveLossProducts = products.filter(
  (product) => !product.active && product.sellPrice <= product.buyPrice
);
const checkedAt = new Date().toISOString();
const activeProducts = products.filter((product) => product.active);
const criticalProducts = activeProducts.filter(
  (product) => getMarginStatus(product) === "critical"
);
const reviewProducts = activeProducts.filter(
  (product) => getMarginStatus(product) === "review"
);
const healthyProducts = activeProducts.filter(
  (product) => getMarginStatus(product) === "healthy"
);

if (DEACTIVATE_LOSSES && activeLossProducts.length > 0) {
  const deactivateProduct = database.prepare(
    `UPDATE Product
     SET active = 0, updatedAt = ?
     WHERE id = ?`
  );
  const deactivateAll = database.transaction((productsToDeactivate) => {
    for (const product of productsToDeactivate) {
      deactivateProduct.run(checkedAt, product.id);
    }
  });

  deactivateAll(activeLossProducts);
}

const report = {
  checkedAt,
  mode: DEACTIVATE_LOSSES ? "deactivate-losses" : "check-only",
  guardrails: {
    minimumMarginPercent: MIN_MARGIN_PERCENT,
    criticalMarginPercent: CRITICAL_MARGIN_PERCENT,
    minimumGrossProfitUsd: MIN_GROSS_PROFIT,
    criticalGrossProfitUsd: CRITICAL_GROSS_PROFIT,
  },
  summary: {
    productsChecked: products.length,
    activeProducts: activeProducts.length,
    criticalProducts: criticalProducts.length,
    reviewProducts: reviewProducts.length,
    healthyProducts: healthyProducts.length,
    activeLossProductsBeforeAction: activeLossProducts.length,
    productsDeactivated: DEACTIVATE_LOSSES
      ? activeLossProducts.length
      : 0,
    inactiveLossProductsBeforeAction: inactiveLossProducts.length,
  },
  criticalProducts: criticalProducts.map((product) => ({
    ...product,
    grossProfit: product.sellPrice - product.buyPrice,
    marginPercent: getMarginPercent(product),
  })),
  reviewProducts: reviewProducts.map((product) => ({
    ...product,
    grossProfit: product.sellPrice - product.buyPrice,
    marginPercent: getMarginPercent(product),
  })),
  activeLossProducts,
};

const dataDirectory = path.join(process.cwd(), "data");
fs.mkdirSync(dataDirectory, { recursive: true });
const reportPath = path.join(dataDirectory, "product-margin-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
database.close();

console.log(JSON.stringify({ reportPath, ...report.summary }, null, 2));

if (!DEACTIVATE_LOSSES && activeLossProducts.length > 0) {
  process.exitCode = 1;
}
