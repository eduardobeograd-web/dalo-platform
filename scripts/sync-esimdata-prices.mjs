import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const SOURCE_URL = "https://esimdata.co/sitemap.xml";
const APPLY = process.argv.includes("--apply");
const CONCURRENCY = 5;

function extractUrls(xml) {
  return [...xml.matchAll(/<loc>(https:\/\/esimdata\.co\/[^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => url.endsWith(".html"));
}

function extractVariants(html, pageUrl) {
  const match = html.match(
    /pub\.product\.variant\.init\('(\{.*?\})',\s*'orderFrm'/s
  );

  if (!match) {
    return [];
  }

  const sourceIsoCode =
    html.match(/data-code>(?:[A-Z]+-)?([A-Z]{2})<\/strong>/i)?.[1]?.toUpperCase() ||
    null;

  let variants;

  try {
    variants = JSON.parse(match[1]);
  } catch {
    throw new Error(`Could not parse product variants from ${pageUrl}`);
  }

  return Object.values(variants)
    .filter(
      (variant) =>
        variant &&
        typeof variant.code === "string" &&
        variant.code.trim() &&
        Number.isFinite(Number(variant.price)) &&
        Number(variant.price) > 0 &&
        variant.inStock !== false
    )
    .map((variant) => {
      const option = String(variant.optionsName || "");
      const fixedPlan = option.match(
        /(\d+(?:\.\d+)?)\s*GB\s*\/\s*(\d+)\s*Days?/i
      );

      return {
        providerProductId: variant.code.trim(),
        priceUsd: Number(variant.price),
        option,
        pageUrl,
        sourceIsoCode,
        data: fixedPlan ? `${Number(fixedPlan[1])}GB` : null,
        validityDays: fixedPlan ? Number(fixedPlan[2]) : null,
      };
    });
}

async function fetchText(url, attempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "DALO price synchronization/1.0",
          accept: "text/html,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(20_000),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return response.text();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  throw lastError;
}

async function mapWithConcurrency(items, limit, task) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await task(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );

  return results;
}

const sitemap = await fetchText(SOURCE_URL);
const productPageUrls = extractUrls(sitemap);

if (productPageUrls.length === 0) {
  throw new Error("No esimdata.co product pages were found in the sitemap.");
}

const fetchErrors = [];
const pageResults = await mapWithConcurrency(
  productPageUrls,
  CONCURRENCY,
  async (pageUrl) => {
    try {
      const html = await fetchText(pageUrl);
      return extractVariants(html, pageUrl);
    } catch (error) {
      fetchErrors.push({
        pageUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }
);

if (fetchErrors.length > Math.max(10, productPageUrls.length * 0.1)) {
  throw new Error(
    `Too many product pages failed (${fetchErrors.length}/${productPageUrls.length}). No prices were changed.`
  );
}

const allSourceVariants = pageResults.flat();
const variantsByCode = new Map();
const variantsByIsoPlan = new Map();
const sourceConflicts = [];

for (const variant of allSourceVariants) {
  const codeVariants = variantsByCode.get(variant.providerProductId) || [];

  if (
    codeVariants.some((existing) => existing.priceUsd !== variant.priceUsd)
  ) {
    sourceConflicts.push({
      providerProductId: variant.providerProductId,
      variants: [...codeVariants, variant],
    });
  }

  codeVariants.push(variant);
  variantsByCode.set(variant.providerProductId, codeVariants);

  if (variant.sourceIsoCode && variant.data && variant.validityDays) {
    const isoPlanKey = `${variant.sourceIsoCode}|${variant.data}|${variant.validityDays}`;
    const isoPlanVariants = variantsByIsoPlan.get(isoPlanKey) || [];
    isoPlanVariants.push(variant);
    variantsByIsoPlan.set(isoPlanKey, isoPlanVariants);
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.startsWith("file:")) {
  throw new Error("DATABASE_URL must point to the DALO SQLite database.");
}

const databasePath = decodeURIComponent(databaseUrl.slice("file:".length));
const database = new Database(databasePath);
const products = database
  .prepare(
    `SELECT id, country, isoCode, name, data, validityDays,
            providerProductId, sellPrice, active
     FROM Product
     ORDER BY country, name`
  )
  .all();

const matched = [];
const unmatchedDaloProducts = [];
const ambiguousDaloProducts = [];

for (const product of products) {
  const exactCodeCandidates =
    variantsByCode.get(product.providerProductId) || [];
  let candidates = exactCodeCandidates;

  const sameIsoCandidates = candidates.filter(
    (variant) =>
      product.isoCode &&
      variant.sourceIsoCode === product.isoCode.toUpperCase()
  );

  if (sameIsoCandidates.length > 0) {
    candidates = sameIsoCandidates;
  }

  const samePlanCandidates = candidates.filter(
    (variant) =>
      variant.data === product.data &&
      variant.validityDays === product.validityDays
  );

  if (samePlanCandidates.length > 0) {
    candidates = samePlanCandidates;
  }

  if (
    candidates.length !== 1 &&
    product.isoCode &&
    product.data &&
    product.validityDays
  ) {
    const isoPlanKey = `${product.isoCode.toUpperCase()}|${product.data}|${product.validityDays}`;
    candidates = variantsByIsoPlan.get(isoPlanKey) || [];
  }

  if (candidates.length > 1) {
    const uniquePrices = new Set(
      candidates.map((variant) => variant.priceUsd)
    );

    if (uniquePrices.size === 1) {
      candidates = [candidates[0]];
    }
  }

  const source = candidates.length === 1 ? candidates[0] : null;

  if (!source) {
    const unresolvedProduct = {
      id: product.id,
      country: product.country,
      isoCode: product.isoCode,
      name: product.name,
      data: product.data,
      validityDays: product.validityDays,
      providerProductId: product.providerProductId,
      currentPriceUsd: product.sellPrice,
      active: Boolean(product.active),
      candidates,
    };

    if (candidates.length > 1) {
      ambiguousDaloProducts.push(unresolvedProduct);
    } else {
      unmatchedDaloProducts.push(unresolvedProduct);
    }
    continue;
  }

  matched.push({
    id: product.id,
    country: product.country,
    name: product.name,
    providerProductId: product.providerProductId,
    currentPriceUsd: product.sellPrice,
    sourcePriceUsd: source.priceUsd,
    changed: Math.abs(product.sellPrice - source.priceUsd) > 0.0001,
    sourceOption: source.option,
    sourceUrl: source.pageUrl,
    active: Boolean(product.active),
  });
}

const changed = matched.filter((product) => product.changed);
const unmatchedActiveProducts = unmatchedDaloProducts.filter(
  (product) => product.active
);
const matchedSources = new Set(
  matched.map(
    (product) =>
      `${product.sourceUrl}|${product.sourceOption}|${product.sourcePriceUsd}`
  )
);
const sourceOnlyVariants = allSourceVariants.filter(
  (variant) =>
    !matchedSources.has(
      `${variant.pageUrl}|${variant.option}|${variant.priceUsd}`
    )
);
const generatedAt = new Date().toISOString();
const audit = {
  generatedAt,
  mode: APPLY ? "applied" : "preview",
  sourceCurrency: "USD",
  targetCurrency: "USD",
  source: "https://esimdata.co",
  summary: {
    sitemapPages: productPageUrls.length,
    pagesFailed: fetchErrors.length,
    sourceVariants: allSourceVariants.length,
    daloProducts: products.length,
    matchedProducts: matched.length,
    changedProducts: changed.length,
    unchangedProducts: matched.length - changed.length,
    unmatchedDaloProducts: unmatchedDaloProducts.length,
    unmatchedActiveProducts: unmatchedActiveProducts.length,
    ambiguousDaloProducts: ambiguousDaloProducts.length,
    sourceOnlyVariants: sourceOnlyVariants.length,
    conflictingSourceCodes: sourceConflicts.length,
  },
  sampleChanges: changed.slice(0, 40),
  unmatchedDaloProducts,
  ambiguousDaloProducts,
  sourceOnlyVariants,
  sourceConflicts,
  fetchErrors,
};

const dataDirectory = path.join(process.cwd(), "data");
fs.mkdirSync(dataDirectory, { recursive: true });
const auditPath = path.join(
  dataDirectory,
  "esimdata-price-sync-preview.json"
);
fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2));

if (APPLY) {
  const updateProduct = database.prepare(
    `UPDATE Product
     SET sellPrice = ?, oldPrice = NULL, updatedAt = ?
     WHERE id = ?`
  );
  const deactivateProduct = database.prepare(
    `UPDATE Product
     SET active = 0, updatedAt = ?
     WHERE id = ?`
  );
  const applyUpdates = database.transaction((updates, productsToDeactivate) => {
    for (const product of updates) {
      updateProduct.run(product.sourcePriceUsd, generatedAt, product.id);
    }

    for (const product of productsToDeactivate) {
      deactivateProduct.run(generatedAt, product.id);
    }
  });

  applyUpdates(changed, unmatchedActiveProducts);
}

database.close();

console.log(
  JSON.stringify(
    {
      mode: audit.mode,
      auditPath,
      ...audit.summary,
      sampleChanges: audit.sampleChanges.slice(0, 12),
    },
    null,
    2
  )
);
