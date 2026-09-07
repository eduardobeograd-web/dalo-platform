// These conditions must be checked by the database in the UPDATE, not only
// against an earlier read: a paid event may arrive while another event waits.
export function pendingCheckoutWhere(orderId: string, sessionId: string) {
  return { id: orderId, stripeSessionId: sessionId, payment: "Pending" };
}
