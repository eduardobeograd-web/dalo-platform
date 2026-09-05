type PaymentOrder = { id: string; stripeSessionId: string | null; amount: number | null; currency: string | null };
type PaymentSession = { id: string; metadata: { [key: string]: string } | null; payment_status: string; amount_total: number | null; currency: string | null };

export function paymentMatchesOrder(order: PaymentOrder, session: PaymentSession) {
  return session.payment_status === "paid" &&
    session.metadata?.orderId === order.id && order.stripeSessionId === session.id &&
    typeof order.amount === "number" && Number.isFinite(order.amount) && order.amount > 0 &&
    session.amount_total === Math.round(order.amount * 100) &&
    Boolean(order.currency) && session.currency?.toUpperCase() === order.currency?.toUpperCase();
}

export function automaticPurchaseAllowed(live: boolean, orderId: string, testOrderIds = "") {
  return live || testOrderIds.split(",").map((id) => id.trim()).filter(Boolean).includes(orderId);
}

export function validateProviderQuote(result: { valid?: boolean; total?: number; currency?: string }, maximum: number) {
  if (result.valid !== true || result.currency?.toUpperCase() !== "USD" ||
      typeof result.total !== "number" || !Number.isFinite(result.total) || result.total < 0 ||
      !Number.isFinite(maximum) || maximum < 0 || result.total > maximum + 0.01) {
    throw new Error("Provider validation is incomplete, rejected or exceeds the approved cost.");
  }
}

type BundleIdentity = { id: string; providerAssignmentId: string | null; providerAssignmentReference: string | null; providerBundleName: string };

export function matchBundle<T extends BundleIdentity>(bundles: T[], name: string | null, id: string | null, reference: string | null): T | null {
  const exact = bundles.filter((bundle) => (id && bundle.providerAssignmentId === id) ||
    (reference && bundle.providerAssignmentReference === reference));
  if (exact.length > 1) throw new Error("Conflicting provider assignment identifiers.");
  if (exact.length === 1) {
    const bundle = exact[0];
    if ((name && bundle.providerBundleName !== name) ||
        (id && bundle.providerAssignmentId && bundle.providerAssignmentId !== id) ||
        (reference && bundle.providerAssignmentReference && bundle.providerAssignmentReference !== reference)) {
      throw new Error("Provider assignment does not match the stored bundle.");
    }
    return bundle;
  }
  if (!name || (!id && !reference)) return null;
  const pending = bundles.filter((bundle) => bundle.providerBundleName === name &&
    !bundle.providerAssignmentId && !bundle.providerAssignmentReference);
  if (pending.length > 1) throw new Error("Multiple unassigned packages require reconciliation.");
  return pending[0] || null;
}

export function quantity(value: unknown): number | null {
  if (typeof value !== "number" && (typeof value !== "string" || !value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
