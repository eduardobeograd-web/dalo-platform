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
  const usedDataGb = input.usedDataGb || 0;
  const isRefunded = input.payment.toLowerCase().includes("refund");
  const hasDeliveryIssue =
    input.fulfillment === "Failed" || input.esimStatus === "failed";
  const isActivated = usedDataGb > 0 || Boolean(input.activatedAt);
  const isDataUsed =
    isActivated &&
    (input.totalDataGb || 0) > 0 &&
    ((input.remainingDataGb ?? input.totalDataGb ?? 0) <= 0 ||
      usedDataGb >= (input.totalDataGb || 0));
  const isExpired =
    input.esimStatus === "expired" ||
    (input.expiresAt ? input.expiresAt <= now : false) ||
    (!isActivated && getActivationDeadline(input) <= now);
  const isReady =
    input.payment === "Paid" &&
    input.fulfillment === "Delivered" &&
    input.esimStatus === "ready";

  if (isRefunded) return "refunded" as const;
  if (hasDeliveryIssue) return "delivery_issue" as const;
  if (isExpired) return "expired" as const;
  if (isDataUsed) return "data_used" as const;
  if (isActivated) return "active" as const;
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
