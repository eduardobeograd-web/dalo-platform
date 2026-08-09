type OrderDeliveryEvidence = {
  fulfillment: string;
  esimStatus?: string | null;
  esimProfileId?: string | null;
  iccid?: string | null;
  activationCode?: string | null;
  iosInstallUrl?: string | null;
  androidInstallUrl?: string | null;
};

const DELIVERED_ESIM_STATUSES = new Set([
  "ready",
  "installed",
  "active",
  "low_data",
  "no_data",
  "expired",
  "suspended",
]);

export function wasOrderEsimDelivered(order: OrderDeliveryEvidence) {
  const fulfillment = order.fulfillment.trim().toLowerCase();
  const esimStatus = order.esimStatus?.trim().toLowerCase() || "";

  return Boolean(
    fulfillment === "delivered" ||
      DELIVERED_ESIM_STATUSES.has(esimStatus) ||
      order.esimProfileId ||
      order.iccid ||
      order.activationCode ||
      order.iosInstallUrl ||
      order.androidInstallUrl,
  );
}
