import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// The CLI is evaluated with a synthetic environment, without dotenv, network or DB access.
const source = fs.readFileSync(new URL('check-production-env.mjs', import.meta.url), 'utf8')
  .replace('import "dotenv/config";', '');
const baseline = {
  NEXT_PUBLIC_SITE_URL: 'https://shop.example', DATABASE_URL: 'postgresql://test:fake@db.example/test',
  RESEND_API_KEY: 'fake-mail-key', DALO_EMAIL_FROM: 'orders@shop.example', DALO_EMAIL_REPLY_TO: 'support@shop.example',
  STRIPE_SECRET_KEY: 'sk_live_fake', STRIPE_WEBHOOK_SECRET: 'whsec_fake', ESIM_GO_API_KEY: 'fake-provider-key',
  ESIM_GO_READ_ENABLED: 'true', ESIM_GO_VALIDATE_ENABLED: 'true', ESIM_GO_WEBHOOK_ENABLED: 'true',
  ESIM_GO_LIVE_FULFILLMENT_ENABLED: 'true', ESIM_GO_AUTOMATIC_FULFILLMENT_ENABLED: 'true',
};
function check(patch = {}, launch = true) {
  const logs = [];
  const process = { env: { ...baseline, ...patch }, argv: launch ? ['node', 'check', '--launch'] : ['node', 'check'], exitCode: 0 };
  vm.runInNewContext(source, { process, URL, console: { log: x => logs.push(x), error: x => logs.push(x) } });
  return { code: process.exitCode, text: logs.join('\n') };
}
test('passing configuration does not claim a completed launch', () => {
  const result = check();
  assert.equal(result.code, 0);
  assert.match(result.text, /does not certify launch readiness/);
  assert.doesNotMatch(result.text, /fake-mail-key|sk_live_fake|whsec_fake|fake-provider-key/);
});
test('test Stripe is allowed for preflight but blocked for launch', () => {
  assert.equal(check({ STRIPE_SECRET_KEY: 'sk_test_fake' }, false).code, 0);
  assert.equal(check({ STRIPE_SECRET_KEY: 'sk_test_fake' }).code, 1);
});
for (const name of ['STRIPE_WEBHOOK_SECRET', 'ESIM_GO_API_KEY', 'RESEND_API_KEY', 'ESIM_GO_READ_ENABLED', 'ESIM_GO_VALIDATE_ENABLED', 'ESIM_GO_WEBHOOK_ENABLED', 'ESIM_GO_LIVE_FULFILLMENT_ENABLED', 'ESIM_GO_AUTOMATIC_FULFILLMENT_ENABLED']) {
  test(`missing ${name} blocks launch`, () => assert.equal(check({ [name]: '' }).code, 1));
}
test('mock delivery and test purchase exceptions block launch', () => {
  assert.equal(check({ DALO_AUTO_MOCK_FULFILLMENT: 'true' }).code, 1);
  assert.equal(check({ ESIM_GO_TEST_ORDER_IDS: 'fake-order' }).code, 1);
});
test('SQLite and malformed URLs do not pass with the PostgreSQL adapter', () => {
  for (const DATABASE_URL of ['file:./dev.db', 'not-a-url']) assert.equal(check({ DATABASE_URL }).code, 1);
});
test('local or insecure site URL blocks launch', () => {
  for (const NEXT_PUBLIC_SITE_URL of ['http://shop.example', 'https://localhost', 'invalid']) assert.equal(check({ NEXT_PUBLIC_SITE_URL }).code, 1);
});
