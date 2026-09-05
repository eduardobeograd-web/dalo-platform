import { test } from "node:test";
import assert from "node:assert/strict";
import { paymentMatchesOrder, automaticPurchaseAllowed, matchBundle, quantity, validateProviderQuote } from "../lib/purchase-safety";

test("payment must match order, session, amount and currency", () => {
  const order = { id: "o", stripeSessionId: "s", amount: 4.99, currency: "EUR" };
  const session = { id: "s", metadata: { orderId: "o" }, payment_status: "paid", amount_total: 499, currency: "eur" };
  assert.equal(paymentMatchesOrder(order, session), true);
  for (const patch of [{ id: "other" }, { amount_total: 1 }, { currency: "usd" }, { payment_status: "unpaid" }, { metadata: { orderId: "other" } }]) {
    assert.equal(paymentMatchesOrder(order, { ...session, ...patch }), false);
  }
});
test("test payments cannot trigger purchases without exact order approval", () => {
  assert.equal(automaticPurchaseAllowed(false, "o"), false);
  assert.equal(automaticPurchaseAllowed(false, "o", "other"), false);
  assert.equal(automaticPurchaseAllowed(false, "o", " o,other"), true);
});
test("provider quotes fail closed", () => {
  validateProviderQuote({ valid: true, currency: "USD", total: 1 }, 1);
  for (const quote of [{}, { valid: false, currency: "USD", total: 1 }, { valid: true, currency: "EUR", total: 1 }, { valid: true, currency: "USD", total: 2 }]) assert.throws(() => validateProviderQuote(quote, 1));
});
test("missing usage is never treated as zero", () => {
  for (const value of [null, undefined, "", false, -1, NaN]) assert.equal(quantity(value), null);
  assert.equal(quantity(0), 0);
  assert.equal(quantity("500"), 500);
});
test("bundle matching rejects ambiguous orders and conflicting identities", () => {
  const first = { id: "a", providerBundleName: "plan", providerAssignmentId: "x", providerAssignmentReference: "r" };
  const pending = { id: "b", providerBundleName: "plan", providerAssignmentId: null, providerAssignmentReference: null };
  assert.equal(matchBundle([first, pending], "plan", "x", "r")?.id, "a");
  assert.equal(matchBundle([first, pending], "plan", "new", null)?.id, "b");
  assert.throws(() => matchBundle([pending, { ...pending, id: "c" }], "plan", "new", null));
  assert.throws(() => matchBundle([first], "plan", "wrong", "r"));
  assert.equal(matchBundle([first], "plan", null, null), null);
});
