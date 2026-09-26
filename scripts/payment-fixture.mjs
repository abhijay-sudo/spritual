/** Server-only contract fixture, NOT a deployed endpoint, checkout or payment integration.
 * Official verification protocol: https://razorpay.com/docs/webhooks/validate-test/
 * Delivery ordering: https://razorpay.com/docs/webhooks/best-practices/
 * Needs durable transaction/idempotency storage, real provider configuration and reconciliation before deployment.
 * Offers/order ownership below are supplied by trusted server configuration, never a browser amount.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
export function verifySignedWebhook(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody) || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature) || typeof secret !== 'string' || !secret.length) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
export function createPaymentFixture(offer) {
  if (!offer || !Number.isSafeInteger(offer.amountMinor) || offer.amountMinor <= 0 || offer.currency !== 'INR' || !offer.orderId || !offer.paymentId || !offer.accountId || !offer.userId) throw new Error('A server-owned offer, account, order and payment mapping are required.');
  return { fixture: true, offer: { ...offer }, seenEvents: [], captured: false, refunded: false, directAccess: false };
}
export function applyPaymentFixture(state, { rawBody, signature, eventId, secret }) {
  if (!verifySignedWebhook(rawBody, signature, secret)) throw new Error('Invalid webhook signature.');
  if (typeof eventId !== 'string' || !eventId.trim()) throw new Error('Provider event id is required.');
  if (state.seenEvents.includes(eventId)) return structuredClone(state);
  const event = JSON.parse(rawBody.toString('utf8'));
  if (event.account_id !== state.offer.accountId) throw new Error('Account mismatch.');
  const next = structuredClone(state);
  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity;
    if (!payment || payment.id !== state.offer.paymentId || payment.order_id !== state.offer.orderId || payment.amount !== state.offer.amountMinor || payment.currency !== state.offer.currency || payment.status !== 'captured' || payment.captured !== true) throw new Error('Captured payment does not match the server-owned offer.');
    next.captured = true;
  } else if (event.event === 'refund.processed') {
    const refund = event.payload?.refund?.entity;
    if (!refund || refund.payment_id !== state.offer.paymentId || refund.status !== 'processed' || refund.currency !== state.offer.currency || !Number.isSafeInteger(refund.amount) || refund.amount <= 0 || refund.amount > state.offer.amountMinor) throw new Error('Refund does not match the mapped payment.');
    // This bounded fixture supports full refunds only. Partial refunds require explicit policy/reconciliation.
    if (refund.amount !== state.offer.amountMinor) throw new Error('Partial refunds require reconciliation; no automatic entitlement change.');
    next.refunded = true;
  } else if (event.event !== 'payment.authorized' && event.event !== 'payment.failed') {
    throw new Error('Unsupported fixture event.');
  }
  next.seenEvents.push(eventId);
  next.directAccess = next.captured && !next.refunded;
  return next;
}
