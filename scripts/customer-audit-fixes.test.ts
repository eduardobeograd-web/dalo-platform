import assert from "node:assert/strict";
import test from "node:test";
import { getCheckoutSuccessCopy } from "../lib/checkout-success-copy";
import { pendingCheckoutWhere } from "../lib/payment-event-guards";

for (const payment of ["Pending", "Failed", "Expired", "Refunded", "Unknown"]) {
  test(`${payment} never claims a confirmed purchase`, () => {
    for (const isTestMode of [false, true]) {
      for (const isDeliveryReady of [false, true]) {
        const copy = getCheckoutSuccessCopy({ payment, isTestMode, isDeliveryReady });
        assert.equal(copy.confirmed, false);
        assert.notEqual(copy.label, "Order confirmed");
        assert.doesNotMatch(copy.statusMessage, /payment (was received|confirmed)/i);
      }
    }
  });
}

test("Stripe test payment does not label a real delivered eSIM as a test eSIM", () => {
  const copy = getCheckoutSuccessCopy({ payment: "Paid", isTestMode: true, isDeliveryReady: true });
  assert.equal(copy.confirmed, true);
  assert.match(copy.statusMessage, /does not mean the eSIM is a test eSIM/);
  assert.match(copy.deliveryMessage, /eSIM delivered/);
});

test("paid awaiting delivery and delivered orders have different instructions", () => {
  const input = { payment: "Paid", isTestMode: false };
  assert.match(getCheckoutSuccessCopy({ ...input, isDeliveryReady: false }).deliveryMessage, /do not order again/);
  assert.match(getCheckoutSuccessCopy({ ...input, isDeliveryReady: true }).deliveryMessage, /Installation details/);
});

test("partial refund remains visible instead of a generic success", () => {
  const copy = getCheckoutSuccessCopy({ payment: "Partially Refunded", isTestMode: false, isDeliveryReady: true });
  assert.equal(copy.label, "Partial refund");
});

test("failure/expiry UPDATE guard rejects a changed payment or another checkout", () => {
  const where = pendingCheckoutWhere("order-1", "checkout-1");
  const matches = (row: typeof where) => Object.entries(where).every(([key, value]) => row[key as keyof typeof row] === value);
  assert.equal(matches({ ...where }), true);
  for (const payment of ["Paid", "Refunded", "Partially Refunded", "Expired", "Failed"]) {
    assert.equal(matches({ ...where, payment }), false);
  }
  assert.equal(matches({ ...where, stripeSessionId: "checkout-old" }), false);
  assert.equal(matches({ ...where, id: "another-order" }), false);
});
