"use server";

import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

type SheetPreview = {
  name: string;
  totalRows: number;
  headers: string[];
  sampleRows: Record<string, string>[];
};

function cleanCell(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export async function analyzeRateSheet(formData: FormData) {
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
      },
      null,
      2
    )
  );

  redirect("/admin/products/import/preview");
}