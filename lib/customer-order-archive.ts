import { getEsimLifecycleStatus } from "./esim-lifecycle";

const ARCHIVABLE_STATUSES = new Set<ReturnType<typeof getEsimLifecycleStatus>>([
  "expired",
  "no_data",
  "refunded",
]);

export function canCustomerArchiveOrder(
  order: Parameters<typeof getEsimLifecycleStatus>[0],
) {
  return ARCHIVABLE_STATUSES.has(getEsimLifecycleStatus(order));
}
