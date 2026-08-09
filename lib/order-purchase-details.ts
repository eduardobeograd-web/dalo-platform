type OrderPurchaseSnapshot = {
  productNameAtPurchase: string | null;
  countryAtPurchase: string | null;
  dataAtPurchase: string | null;
  validityDaysAtPurchase: number | null;
  providerAtPurchase?: string | null;
  providerProductIdAtPurchase?: string | null;
};

type ProductFallback = {
  name: string;
  country: string;
  data: string;
  validityDays: number;
  provider?: string | null;
  providerProductId?: string | null;
};

export function getOrderPurchaseDetails(
  order: OrderPurchaseSnapshot,
  product?: ProductFallback | null,
) {
  return {
    productName:
      order.productNameAtPurchase || product?.name || "DALO eSIM",
    country:
      order.countryAtPurchase || product?.country || "Destination unavailable",
    data: order.dataAtPurchase || product?.data || "Not available",
    validityDays:
      order.validityDaysAtPurchase ?? product?.validityDays ?? null,
    provider: order.providerAtPurchase || product?.provider || null,
    providerProductId:
      order.providerProductIdAtPurchase || product?.providerProductId || null,
  };
}
