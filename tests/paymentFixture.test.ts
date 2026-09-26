import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  applyPaymentFixture,
  createPaymentFixture,
  verifySignedWebhook,
} from "../scripts/payment-fixture.mjs";
const secret = "synthetic-test-secret-not-a-provider-credential";
const offer = {
  accountId: "account_fixture",
  orderId: "order_fixture",
  paymentId: "pay_fixture",
  userId: "member_fixture",
  amountMinor: 12345,
  currency: "INR",
};
const captured = {
  account_id: offer.accountId,
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: offer.paymentId,
        order_id: offer.orderId,
        amount: offer.amountMinor,
        currency: offer.currency,
        status: "captured",
        captured: true,
      },
    },
  },
};
const refunded = {
  account_id: offer.accountId,
  event: "refund.processed",
  payload: {
    refund: {
      entity: {
        payment_id: offer.paymentId,
        amount: offer.amountMinor,
        currency: offer.currency,
        status: "processed",
      },
    },
  },
};
function signed(event: unknown, eventId = "evt-1") {
  const rawBody = Buffer.from(JSON.stringify(event));
  return {
    rawBody,
    signature: createHmac("sha256", secret).update(rawBody).digest("hex"),
    eventId,
    secret,
  };
}
test("raw bytes signature accepts only exact body and full HMAC digest", () => {
  const value = signed(captured);
  assert.equal(
    verifySignedWebhook(value.rawBody, value.signature, secret),
    true,
  );
  assert.equal(
    verifySignedWebhook(
      Buffer.concat([value.rawBody, Buffer.from(" ")]),
      value.signature,
      secret,
    ),
    false,
  );
  assert.equal(verifySignedWebhook(value.rawBody, "short", secret), false);
  assert.equal(verifySignedWebhook(value.rawBody, value.signature, ""), false);
});
test("server offer in integer minor units is authoritative and duplicate capture is idempotent", () => {
  const initial = createPaymentFixture(offer);
  const paid = applyPaymentFixture(initial, signed(captured));
  assert.equal(initial.directAccess, false);
  assert.equal(paid.directAccess, true);
  assert.equal(paid.fixture, true);
  assert.deepEqual(applyPaymentFixture(paid, signed(captured)), paid);
  const wrongAmount = structuredClone(captured);
  wrongAmount.payload.payment.entity.amount = 1;
  assert.throws(
    () => applyPaymentFixture(initial, signed(wrongAmount)),
    /server-owned/,
  );
  assert.throws(
    () => createPaymentFixture({ ...offer, amountMinor: 12.34 }),
    /server-owned/,
  );
});
test("full refund wins across out-of-order delivery and does not touch unrelated grants", () => {
  const initial = createPaymentFixture(offer);
  const refundFirst = applyPaymentFixture(initial, signed(refunded, "refund"));
  const lateCapture = applyPaymentFixture(
    refundFirst,
    signed(captured, "capture"),
  );
  assert.equal(lateCapture.directAccess, false);
  assert.equal(lateCapture.refunded, true);
  const captureFirst = applyPaymentFixture(
    initial,
    signed(captured, "capture"),
  );
  const laterRefund = applyPaymentFixture(
    captureFirst,
    signed(refunded, "refund"),
  );
  assert.equal(laterRefund.directAccess, false);
  assert.equal("institutionAccess" in laterRefund, false);
});
test("authorization does not grant access; wrong account and partial refunds require explicit handling", () => {
  const initial = createPaymentFixture(offer);
  assert.equal(
    applyPaymentFixture(
      initial,
      signed({ account_id: offer.accountId, event: "payment.authorized" }),
    ).directAccess,
    false,
  );
  assert.throws(
    () =>
      applyPaymentFixture(
        initial,
        signed({ ...captured, account_id: "other-account" }),
      ),
    /Account/,
  );
  const partial = structuredClone(refunded);
  partial.payload.refund.entity.amount = 1;
  assert.throws(
    () => applyPaymentFixture(initial, signed(partial)),
    /reconciliation/,
  );
});
