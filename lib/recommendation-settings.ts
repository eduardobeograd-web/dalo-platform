import { randomUUID } from "crypto";
import { prisma } from "./db";

export type RecommendationUsageKey = "essential" | "everyday" | "power";
export type NormalizedRecommendationUsage = "light" | "normal" | "heavy";

export type RecommendationUsageSetting = {
  id: string;
  usageType: string;
  label: string;
  gbPerDay: number;
  minimumGb: number;
  maxBestMatchMultiple: number;
  budgetMinNeedMultiple: number;
  comfortMinNeedMultiple: number;
  heavyMinGb: number;
  active: boolean;
};

export const DEFAULT_RECOMMENDATION_SETTINGS = [
  {
    usageType: "essential",
    label: "Essential",
    gbPerDay: 0.5,
    minimumGb: 1,
    maxBestMatchMultiple: 2.5,
    budgetMinNeedMultiple: 0.5,
    comfortMinNeedMultiple: 1.8,
    heavyMinGb: 10,
  },
  {
    usageType: "everyday",
    label: "Everyday",
    gbPerDay: 1.0,
    minimumGb: 3,
    maxBestMatchMultiple: 2.5,
    budgetMinNeedMultiple: 0.6,
    comfortMinNeedMultiple: 1.5,
    heavyMinGb: 20,
  },
  {
    usageType: "power",
    label: "Power",
    gbPerDay: 2.0,
    minimumGb: 5,
    maxBestMatchMultiple: 2.5,
    budgetMinNeedMultiple: 0.7,
    comfortMinNeedMultiple: 1.3,
    heavyMinGb: 30,
  },
];

export function getUsageSettingKey(
  usage: NormalizedRecommendationUsage
): RecommendationUsageKey {
  if (usage === "light") return "essential";
  if (usage === "heavy") return "power";
  return "everyday";
}

export function getFallbackSetting(
  usage: NormalizedRecommendationUsage
): RecommendationUsageSetting {
  const usageType = getUsageSettingKey(usage);
  const fallback =
    DEFAULT_RECOMMENDATION_SETTINGS.find(
      (setting) => setting.usageType === usageType
    ) || DEFAULT_RECOMMENDATION_SETTINGS[1];

  return {
    id: usageType,
    usageType: fallback.usageType,
    label: fallback.label,
    gbPerDay: fallback.gbPerDay,
    minimumGb: fallback.minimumGb,
    maxBestMatchMultiple: fallback.maxBestMatchMultiple,
    budgetMinNeedMultiple: fallback.budgetMinNeedMultiple,
    comfortMinNeedMultiple: fallback.comfortMinNeedMultiple,
    heavyMinGb: fallback.heavyMinGb,
    active: true,
  };
}

function normalizeSetting(row: any): RecommendationUsageSetting {
  return {
    id: String(row.id),
    usageType: String(row.usageType),
    label: String(row.label),
    gbPerDay: Number(row.gbPerDay),
    minimumGb: Number(row.minimumGb),
    maxBestMatchMultiple: Number(row.maxBestMatchMultiple),
    budgetMinNeedMultiple: Number(row.budgetMinNeedMultiple),
    comfortMinNeedMultiple: Number(row.comfortMinNeedMultiple),
    heavyMinGb: Number(row.heavyMinGb),
    active: Boolean(row.active),
  };
}

export async function ensureRecommendationSettings() {
  const now = new Date().toISOString();

  for (const setting of DEFAULT_RECOMMENDATION_SETTINGS) {
    const existing = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "RecommendationSetting" WHERE "usageType" = ? LIMIT 1`,
      setting.usageType
    );

    if (existing.length > 0) {
      continue;
    }

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "RecommendationSetting" (
        "id",
        "usageType",
        "label",
        "gbPerDay",
        "minimumGb",
        "maxBestMatchMultiple",
        "budgetMinNeedMultiple",
        "comfortMinNeedMultiple",
        "heavyMinGb",
        "active",
        "createdAt",
        "updatedAt"
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      randomUUID(),
      setting.usageType,
      setting.label,
      setting.gbPerDay,
      setting.minimumGb,
      setting.maxBestMatchMultiple,
      setting.budgetMinNeedMultiple,
      setting.comfortMinNeedMultiple,
      setting.heavyMinGb,
      1,
      now,
      now
    );
  }
}

export async function getRecommendationSettings() {
  await ensureRecommendationSettings();

  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "RecommendationSetting" ORDER BY "gbPerDay" ASC`
  );

  return rows.map(normalizeSetting);
}

export async function getRecommendationSettingForUsage(
  usage: NormalizedRecommendationUsage
): Promise<RecommendationUsageSetting> {
  const usageType = getUsageSettingKey(usage);

  await ensureRecommendationSettings();

  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM "RecommendationSetting" WHERE "usageType" = ? LIMIT 1`,
    usageType
  );

  if (rows.length === 0) {
    return getFallbackSetting(usage);
  }

  const setting = normalizeSetting(rows[0]);

  if (!setting.active) {
    return getFallbackSetting(usage);
  }

  return setting;
}

export async function updateRecommendationSettingById({
  id,
  gbPerDay,
  minimumGb,
  maxBestMatchMultiple,
  budgetMinNeedMultiple,
  comfortMinNeedMultiple,
  heavyMinGb,
}: {
  id: string;
  gbPerDay: number;
  minimumGb: number;
  maxBestMatchMultiple: number;
  budgetMinNeedMultiple: number;
  comfortMinNeedMultiple: number;
  heavyMinGb: number;
}) {
  await prisma.$executeRawUnsafe(
    `
    UPDATE "RecommendationSetting"
    SET
      "gbPerDay" = ?,
      "minimumGb" = ?,
      "maxBestMatchMultiple" = ?,
      "budgetMinNeedMultiple" = ?,
      "comfortMinNeedMultiple" = ?,
      "heavyMinGb" = ?,
      "updatedAt" = ?
    WHERE "id" = ?
    `,
    gbPerDay,
    minimumGb,
    maxBestMatchMultiple,
    budgetMinNeedMultiple,
    comfortMinNeedMultiple,
    heavyMinGb,
    new Date().toISOString(),
    id
  );
}

export function parseSettingNumber(value: FormDataEntryValue | null) {
  const parsed = Number(String(value || "").replace(",", "."));

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
