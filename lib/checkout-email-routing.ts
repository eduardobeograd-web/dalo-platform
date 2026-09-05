import { wasOrderEsimDelivered } from "./order-delivery";

type CheckoutEmailOrder = {
  payment: string;
  fulfillment: string;
  esimStatus?: string | null;
  activationCode?: string | null;
  qrCodeUrl?: string | null;
  iosInstallUrl?: string | null;
  androidInstallUrl?: string | null;
  esimProfileId?: string | null;
  iccid?: string | null;
};

export function getCheckoutCustomerEmailKind(
  order?: CheckoutEmailOrder | null,
) {
  if (!order) return null;

  const hasInstallDetails = Boolean(
    order.activationCode ||
      order.qrCodeUrl ||
      order.iosInstallUrl ||
      order.androidInstallUrl,
  );
  const isDeliveryReady =
    order.payment === "Paid" &&
    hasInstallDetails &&
    wasOrderEsimDelivered(order);

  return isDeliveryReady
    ? ("order_confirmation" as const)
    : ("payment_confirmation" as const);
}
