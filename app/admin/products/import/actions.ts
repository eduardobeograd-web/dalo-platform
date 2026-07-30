"use server";

import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { prisma } from "../../../../lib/db";
import { ADMIN_PERMISSIONS } from "../../../../lib/admin-permissions";
import { requireAdminPermission } from "../../../../lib/admin-auth";

type SheetPreview = {
  name: string;
  totalRows: number;
  headers: string[];
  sampleRows: Record<string, string>[];
};

type ImportProductPreview = {
  country: string;
  isoCode: string;
  name: string;
  data: string;
  validityDays: number;
  planType: string;
  usageFit: string;
  role: string;
  buyPrice: number;
  sellPrice: number;
  provider: string;
  providerProductId: string;
  image: string;
  description: string;
};

function cleanCell(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null;

  const cleaned = String(value)
    .replace("$", "")
    .replace(",", ".")
    .trim();

  if (!cleaned || cleaned.toUpperCase() === "NA") return null;

  const number = Number(cleaned);

  if (Number.isNaN(number)) return null;

  return number;
}

function calculateSellPrice(buyPrice: number) {
  // Simple first margin. We can make this smarter later.
  const markedUp = buyPrice * 1.65;
  return Math.ceil(markedUp * 100) / 100;
}

function getUsageFit(dataGb: number, validityDays: number) {
  // Important: for long trips, very small data packages should not be recommended.
  if (validityDays >= 30) {
    if (dataGb < 3) return "Too Low";
    if (dataGb <= 5) return "Light";
    if (dataGb <= 15) return "Standard";
    if (dataGb <= 30) return "Heavy";
    return "Power";
  }

  if (validityDays >= 15) {
    if (dataGb < 2) return "Too Low";
    if (dataGb <= 3) return "Light";
    if (dataGb <= 10) return "Standard";
    if (dataGb <= 30) return "Heavy";
    return "Power";
  }

  if (dataGb <= 2) return "Light";
  if (dataGb <= 10) return "Standard";
  if (dataGb <= 20) return "Heavy";
  return "Power";
}

function getRole(dataGb: number, validityDays: number) {
  // Do not let tiny long-duration plans look like real recommendations.
  if (validityDays >= 30 && dataGb < 3) return "emergency-only";
  if (validityDays >= 15 && dataGb < 2) return "emergency-only";

  if (dataGb <= 2) return "cheapest";
  if (dataGb >= 5 && dataGb <= 20) return "best-value";
  if (dataGb >= 50) return "most-data";

  return "recommended";
}

function normalizeFixedProducts(rows: Record<string, unknown>[]) {
  const bundles = [
    {
      dataGb: 1,
      validityDays: 7,
      priceColumn: "1GB/7days (USD)",
      refColumn: "eSIM Go 1GB Ref",
    },
    {
      dataGb: 2,
      validityDays: 15,
      priceColumn: "2GB/15days (USD)",
      refColumn: "eSIM Go 2GB Ref",
    },
    {
      dataGb: 3,
      validityDays: 30,
      priceColumn: "3GB/30days (USD)",
      refColumn: "eSIM Go 3GB Ref",
    },
    {
      dataGb: 5,
      validityDays: 30,
      priceColumn: "5GB/30days (USD)",
      refColumn: "eSIM Go 5GB Ref",
    },
    {
      dataGb: 10,
      validityDays: 30,
      priceColumn: "10GB/30days (USD)",
      refColumn: "eSIM Go 10GB Ref",
    },
    {
      dataGb: 20,
      validityDays: 30,
      priceColumn: "20GB/30days (USD)",
      refColumn: "eSIM Go 20GB Ref",
    },
    {
      dataGb: 50,
      validityDays: 30,
      priceColumn: "50GB/30days (USD)",
      refColumn: "eSIM Go 50GB Ref",
    },
    {
      dataGb: 100,
      validityDays: 30,
      priceColumn: "100GB/30days (USD)",
      refColumn: "eSIM Go 100GB Ref",
    },
  ];

  const products: ImportProductPreview[] = [];

  for (const row of rows) {
    const country = cleanCell(row.Country);
    const isoCode = cleanCell(row.ISOCode).toUpperCase();

    if (!country || !isoCode) continue;

    // For now, only import real single-country products.
    // Regional bundles often use ISO lists like "DE;FR;IT;ES".
    // Those should later become upsells, not normal country products.
    if (isoCode.length !== 2 || isoCode.includes(";")) continue;

    for (const bundle of bundles) {
      const buyPrice = toNumber(row[bundle.priceColumn]);
      const providerProductId = cleanCell(row[bundle.refColumn]);

      if (buyPrice === null) continue;
      if (!providerProductId || providerProductId.toUpperCase() === "NA") {
        continue;
      }

      const data = `${bundle.dataGb}GB`;
      const sellPrice = calculateSellPrice(buyPrice);

      products.push({
        country,
        isoCode,
        name: `${country} eSIM ${data} / ${bundle.validityDays} days`,
        data,
        validityDays: bundle.validityDays,
        planType: "Fixed",
        usageFit: getUsageFit(bundle.dataGb, bundle.validityDays),
        role: getRole(bundle.dataGb, bundle.validityDays),
        buyPrice,
        sellPrice,
        provider: "eSIM Go",
        providerProductId,
        image: "/dalo-logo.png",
        description: `${data} mobile data for ${country}. Valid for ${bundle.validityDays} days.`,
      });
    }
  }

  return products;
}

export async function analyzeRateSheet(formData: FormData) {
  await requireAdminPermission(ADMIN_PERMISSIONS.IMPORTS_WRITE);
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No file uploaded");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = XLSX.read(buffer, {
    type: "buffer",
  });

  const previews: SheetPreview[] = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    const headers =
      rows.length > 0
        ? Object.keys(rows[0]).map((header) => cleanCell(header))
        : [];

    const sampleRows = rows.slice(0, 5).map((row) => {
      const cleanedRow: Record<string, string> = {};

      for (const [key, value] of Object.entries(row)) {
        cleanedRow[cleanCell(key)] = cleanCell(value);
      }

      return cleanedRow;
    });

    return {
      name: sheetName,
      totalRows: rows.length,
      headers,
      sampleRows,
    };
  });

  const fixedSheet = workbook.Sheets["Standard - Fixed"];

  if (!fixedSheet) {
    throw new Error("Sheet 'Standard - Fixed' not found in uploaded rate sheet");
  }

  const fixedRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(fixedSheet, {
    defval: "",
  });

  const importProducts = normalizeFixedProducts(fixedRows);

  const dataDirectory = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
  }

  fs.writeFileSync(
    path.join(dataDirectory, "rate-sheet-preview.json"),
    JSON.stringify(
      {
        fileName: file.name,
        analyzedAt: new Date().toISOString(),
        sheets: previews,
        importProducts,
        importSummary: {
          provider: "eSIM Go",
          sheet: "Standard - Fixed",
          productsFound: importProducts.length,
        },
      },
      null,
      2
    )
  );

  redirect("/admin/products/import/preview");
}

export async function confirmRateSheetImport() {
  await requireAdminPermission(ADMIN_PERMISSIONS.IMPORTS_WRITE);
  const previewPath = path.join(process.cwd(), "data", "rate-sheet-preview.json");

  if (!fs.existsSync(previewPath)) {
    throw new Error("No analyzed rate sheet found. Please upload the Excel file again.");
  }

  const previewData = JSON.parse(fs.readFileSync(previewPath, "utf8")) as {
    importProducts?: ImportProductPreview[];
  };

  const products = previewData.importProducts ?? [];

  if (products.length === 0) {
    throw new Error("No importable products found.");
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: {
        providerProductId: product.providerProductId,
      },
      update: {
        country: product.country,
        isoCode: product.isoCode,
        region: null,
        name: product.name,
        data: product.data,
        validityDays: product.validityDays,
        planType: product.planType,
        usageFit: product.usageFit,
        role: product.role,
        buyPrice: product.buyPrice,
        provider: product.provider,
        image: product.image,
        description: product.description,
        active: true,
      },
      create: {
        country: product.country,
        isoCode: product.isoCode,
        region: null,
        name: product.name,
        data: product.data,
        validityDays: product.validityDays,
        planType: product.planType,
        usageFit: product.usageFit,
        role: product.role,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        provider: product.provider,
        providerProductId: product.providerProductId,
        image: product.image,
        description: product.description,
        active: true,
      },
    });
  }

  redirect("/admin/products");
}
