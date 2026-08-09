export function formatCurrencyAmount(
  amount: number,
  currencyCode?: string | null,
) {
  const currency = (currencyCode || "USD").trim().toUpperCase();

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: /^[A-Z]{3}$/.test(currency) ? currency : "USD",
  }).format(amount);
}
