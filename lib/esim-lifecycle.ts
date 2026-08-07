type EsimLifecycleInput = {
  payment: string;
  fulfillment: string;
  esimStatus?: string | null;
  usedDataGb?: number | null;
  remainingDataGb?: number | null;
  totalDataGb?: number | null;
  paidAt?: Date | null;
  createdAt: Date;
  activationDeadlineAt?: Date | null;
  activatedAt?: Date | null;
  expiresAt?: Date | null;
};

type ProviderEsimStatusInput = {
  providerState?: string | null;
  profileStatus?: string | null;
  firstInstalledAt?: Date | null;
  bundleStatus?: string | null;
  initialQuantityBytes?: number | null;
  remainingQuantityBytes?: number | null;
  startedAt?: Date | null;
  expiresAt?: Date | null;
  now?: Date;
};

function normalized(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

export function getProviderEsimStatus(input: ProviderEsimStatusInput) {
  const now = input.now || new Date();
  const providerState = normalized(input.providerState);
  const profileStatus = normalized(input.profileStatus);
  const bundleStatus = normalized(input.bundleStatus);
  const initialBytes = input.initialQuantityBytes;
  const remainingBytes = input.remainingQuantityBytes;
  const usedBytes =
    initialBytes !== null &&
    initialBytes !== undefined &&
    remainingBytes !== null &&
    remainingBytes !== undefined
      ? Math.max(0, initialBytes - remainingBytes)
      : 0;

  const isSuspended =
    providerState === "suspended" ||
    providerState === "deactivated" ||
    profileStatus === "suspended" ||
    profileStatus === "deactivated" ||
    profileStatus === "unavailable";
  const isExpired =
    bundleStatus === "expired" ||
    Boolean(input.expiresAt && input.expiresAt <= now);
  const hasNoData =
    bundleStatus === "depleted" ||
    (typeof remainingBytes === "number" && remainingBytes <= 0);
  const hasLowData =
    typeof initialBytes === "number" &&
    initialBytes > 0 &&
    typeof remainingBytes === "number" &&
    remainingBytes > 0 &&
    remainingBytes / initialBytes <= 0.2 &&
    (Boolean(input.startedAt) || usedBytes > 0);
  const isActive =
    bundleStatus === "active" || Boolean(input.startedAt) || usedBytes > 0;
  const isInstalled =
    profileStatus === "installed" || Boolean(input.firstInstalledAt);

  if (isSuspended) return "suspended" as const;
  if (isExpired) return "expired" as const;
  if (hasNoData) return "no_data" as const;
  if (hasLowData) return "low_data" as const;
  if (isActive) return "active" as const;
  if (isInstalled) return "installed" as const;
  return "ready" as const;
}

export function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getActivationDeadline(input: EsimLifecycleInput) {
  return input.activationDeadlineAt || addMonths(input.paidAt || input.createdAt, 6);
}

export function getEsimLifecycleStatus(input: EsimLifecycleInput) {
  const now = new Date();
  const storedStatus = normalized(input.esimStatus);
  const usedDataGb = input.usedDataGb || 0;
  const isRefunded = input.payment.toLowerCase().includes("refund");
  const hasDeliveryIssue =
    input.fulfillment === "Failed" || storedStatus === "failed";
  const isSuspended = storedStatus === "suspended";
  const isActivated =
    storedStatus === "active" || usedDataGb > 0 || Boolean(input.activatedAt);
  const isDataUsed =
    isActivated &&
    (input.totalDataGb || 0) > 0 &&
    ((input.remainingDataGb ?? input.totalDataGb ?? 0) <= 0 ||
      usedDataGb >= (input.totalDataGb || 0));
  const isExpired =
    storedStatus === "expired" ||
    (input.expiresAt ? input.expiresAt <= now : false) ||
    (!isActivated && getActivationDeadline(input) <= now);
  const isReady =
    input.payment === "Paid" &&
    input.fulfillment === "Delivered" &&
    storedStatus === "ready";
  const hasLowData =
    storedStatus === "low_data" ||
    (isActivated &&
      (input.totalDataGb || 0) > 0 &&
      (input.remainingDataGb || 0) > 0 &&
      (input.remainingDataGb || 0) / (input.totalDataGb || 1) <= 0.2);
  const isInstalled = storedStatus === "installed";

  if (isRefunded) return "refunded" as const;
  if (hasDeliveryIssue) return "delivery_issue" as const;
  if (isSuspended) return "suspended" as const;
  if (isExpired) return "expired" as const;
  if (isDataUsed || storedStatus === "no_data") return "no_data" as const;
  if (hasLowData) return "low_data" as const;
  if (isActivated) return "active" as const;
  if (isInstalled) return "installed" as const;
  if (isReady) return "ready" as const;
  return "pending" as const;
}

export function getFirstUsageLifecycleUpdate(input: {
  previousUsedDataGb?: number | null;
  nextUsedDataGb?: number | null;
  activatedAt?: Date | null;
  expiresAt?: Date | null;
  validityDays?: number | null;
  detectedAt?: Date;
}) {
  const firstUsageDetected =
    (input.previousUsedDataGb || 0) <= 0 &&
    (input.nextUsedDataGb || 0) > 0 &&
    !input.activatedAt;

  if (!firstUsageDetected) return {};

  const activatedAt = input.detectedAt || new Date();

  return {
    activatedAt,
    expiresAt:
      input.expiresAt ||
      (input.validityDays ? addDays(activatedAt, input.validityDays) : undefined),
    esimStatus: "active",
  };
}
