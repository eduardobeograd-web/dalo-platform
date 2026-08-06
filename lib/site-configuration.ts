import { prisma } from "./db";

const CONFIGURATION_ID = "default";
const CACHE_TTL_MS = 10_000;

let cachedTeamAccess:
  | {
      enabled: boolean;
      expiresAt: number;
    }
  | undefined;

export async function getTeamAccessEnabled() {
  const now = Date.now();

  if (cachedTeamAccess && cachedTeamAccess.expiresAt > now) {
    return cachedTeamAccess.enabled;
  }

  const configuration = await prisma.siteConfiguration.findUnique({
    where: { id: CONFIGURATION_ID },
    select: { teamAccessEnabled: true },
  });
  const enabled = configuration?.teamAccessEnabled ?? true;

  cachedTeamAccess = {
    enabled,
    expiresAt: now + CACHE_TTL_MS,
  };

  return enabled;
}

export async function setTeamAccessEnabled(enabled: boolean) {
  await prisma.siteConfiguration.upsert({
    where: { id: CONFIGURATION_ID },
    update: { teamAccessEnabled: enabled },
    create: {
      id: CONFIGURATION_ID,
      teamAccessEnabled: enabled,
    },
  });

  cachedTeamAccess = {
    enabled,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}
