// Execute the actual route/action code with strictly substituted dependencies.
// No application DB, Stripe client, email sender or provider module is loaded.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(relative, dependencies, extra = '') {
  const source = fs.readFileSync(path.join(root, relative), 'utf8') + extra;
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    exports: module.exports, module, Date, URL, console,
    process: { env: { NODE_ENV: 'production' } },
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unmocked dependency blocked: ${name}`);
    },
  }, { filename: relative });
  return module.exports;
}
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
const auth = {
  CUSTOMER_SESSION_COOKIE: 'test-session', hashCustomerToken: hash,
  createCustomerToken: () => crypto.randomBytes(32).toString('hex'),
};
const nextServer = { NextResponse: { redirect(url) {
  const response = new Response(null, { status: 307, headers: { location: String(url) } });
  response.cookieValues = [];
  response.cookies = { set: (...args) => response.cookieValues.push(args) };
  return response;
} } };

function magicFixture(overrides = {}) {
  const rows = new Map();
  rows.set('legacy', { id: 'legacy', customerId: 'customer-test', token: hash('legacy-link'),
    usedAt: null, expiresAt: new Date(Date.now() + 60000), customer: { active: true }, ...overrides });
  const customerSession = {
    async findUnique({ where }) { const row = [...rows.values()].find(row => row.token === where.token); return row ? { ...row } : null; },
    async updateMany({ where, data }) {
      const row = rows.get(where.id);
      if (!row || row.usedAt !== where.usedAt || row.expiresAt <= where.expiresAt.gt || row.customer.active !== where.customer.active) return { count: 0 };
      Object.assign(row, data); return { count: 1 };
    },
    async delete({ where }) { rows.delete(where.id); },
    async create({ data }) { rows.set('new', { id: 'new', ...data }); },
  };
  const prisma = { customerSession, $transaction: fn => fn({ customerSession }) };
  const { GET } = load('app/customer/magic/route.ts', { 'next/server': nextServer,
    '../../../lib/db': { prisma }, '../../../lib/customer-auth': auth });
  return { rows, request: () => GET({ nextUrl: new URL('https://test.invalid/customer/magic?token=legacy-link'), url: 'https://test.invalid/customer/magic?token=legacy-link' }) };
}

test('legacy login is consumed once and replaced by a different secure session', async () => {
  const f = magicFixture();
  const response = await f.request();
  assert.equal(response.headers.get('location'), 'https://test.invalid/customer/dashboard');
  const [, token, options] = response.cookieValues[0];
  assert.notEqual(token, 'legacy-link');
  assert.equal(options.httpOnly, true); assert.equal(options.secure, true);
  assert.equal(f.rows.has('legacy'), false);
  assert.equal(f.rows.get('new').token, hash(token));
  const replay = await f.request();
  assert.equal(replay.headers.get('location'), 'https://test.invalid/customer/login');
  assert.equal(replay.cookieValues.length, 0);
});

test('concurrent legacy-link requests issue only one session in atomic-store simulation', async () => {
  const f = magicFixture();
  const replies = await Promise.all([f.request(), f.request()]);
  assert.equal(replies.filter(r => r.cookieValues.length === 1).length, 1);
  assert.equal(f.rows.size, 1);
});

for (const [name, override] of [
  ['expired', { expiresAt: new Date(0) }], ['used', { usedAt: new Date() }], ['inactive', { customer: { active: false } }],
]) test(`${name} login link is rejected without changing sessions`, async () => {
  const f = magicFixture(override);
  const response = await f.request();
  assert.equal(response.cookieValues.length, 0);
  assert.equal(f.rows.has('legacy'), true);
});

test('password reset sets a cookie directly and cannot be replayed', async () => {
  let usedAt = null;
  const sessions = [], cookies = [], passwords = [];
  const tx = {
    $executeRaw: async () => { if (usedAt) return 0; usedAt = new Date(); return 1; },
    customer: { update: async args => passwords.push(args.data.passwordHash) },
    customerSession: { deleteMany: async () => {}, create: async args => sessions.push(args.data) },
  };
  const prisma = {
    $queryRaw: async () => [{ id: 'reset-test', customerId: 'customer-test', expiresAt: new Date(Date.now() + 60000), usedAt }],
    $transaction: fn => fn(tx),
  };
  const { setCustomerPassword } = load('app/customer/set-password/actions.ts', {
    bcryptjs: require('bcryptjs'), crypto,
    'next/navigation': { redirect(url) { throw new Error(`REDIRECT:${url}`); } },
    'next/cache': { revalidatePath() {} }, '../../../lib/db': { prisma },
    '../../../lib/customer-auth': { ...auth, setCustomerSessionCookie: async token => cookies.push(token) },
  });
  const form = new FormData();
  form.set('token', 'isolated-reset-token'); form.set('password', 'Isolated-Password-Only-2026'); form.set('confirmPassword', 'Isolated-Password-Only-2026');
  await assert.rejects(setCustomerPassword(form), /REDIRECT:\/customer\/dashboard$/);
  assert.equal(cookies.length, 1); assert.equal(sessions[0].token, hash(cookies[0]));
  assert.equal(await require('bcryptjs').compare(form.get('password'), passwords[0]), true);
  await assert.rejects(setCustomerPassword(form), /error=invalid$/);
  assert.equal(cookies.length, 1);

  const { loginCustomer } = load('app/customer/login/actions.ts', {
    bcryptjs: require('bcryptjs'),
    'next/headers': { headers: async () => new Headers() },
    'next/navigation': { redirect(url) { throw new Error(`REDIRECT:${url}`); } },
    '../../../lib/db': { prisma: {
      customer: { findUnique: async () => ({ id: 'customer-test', active: true, passwordHash: passwords[0] }) },
      customerSession: tx.customerSession,
    } },
    '../../../lib/customer-auth': { ...auth, setCustomerSessionCookie: async token => cookies.push(token) },
    '../../../lib/security-rate-limit': { allowSecurityAttempt: async () => true },
  });
  const login = new FormData();
  login.set('email', 'isolated@example.invalid'); login.set('password', form.get('password'));
  await assert.rejects(loginCustomer(login), /REDIRECT:\/customer\/dashboard$/);
  assert.equal(cookies.length, 2);
  login.set('password', 'wrong-password');
  await assert.rejects(loginCustomer(login), /customer\/login\?error=1$/);
  assert.equal(cookies.length, 2);
});

function paymentFixture({ payment = 'Pending', changedPayment, storedSession = 'checkout-test', intent = 'intent-test' } = {}) {
  const row = { id: 'order-test', orderNumber: 'TEST', payment, stripeSessionId: storedSession, stripePaymentIntentId: null };
  const writes = [];
  const order = {
    async findUnique() { const snapshot = { ...row }; if (changedPayment) row.payment = changedPayment; return snapshot; },
    async updateMany({ where, data }) {
      if (where.id !== row.id || where.payment !== row.payment || where.stripeSessionId !== row.stripeSessionId) return { count: 0 };
      if (where.OR && !where.OR.some(clause => clause.stripePaymentIntentId === row.stripePaymentIntentId)) return { count: 0 };
      Object.assign(row, data); writes.push(data); return { count: 1 };
    },
  };
  const dependencies = { 'next/server': nextServer, '@/lib/db': { prisma: { order } },
    '@/lib/stripe': { stripe: { checkout: { sessions: { retrieve: async id => ({ id, payment_intent: intent }) } } } },
    '@/lib/payment-event-guards': load('lib/payment-event-guards.ts', {}),
  };
  // These unrelated imports must never be invoked by the failure paths.
  for (const name of ['mock-fulfillment', 'order-confirmation-email', 'internal-order-notification', 'payment-confirmation-email', 'customer-events', 'refund-confirmation-email', 'esim-lifecycle', 'order-delivery', 'providers/esim-go/config', 'providers/esim-go/fulfillment', 'checkout-email-routing', 'purchase-safety']) {
    dependencies[`@/lib/${name}`] = new Proxy({}, { get() { throw new Error(`Unexpected side effect: ${name}`); } });
  }
  const handlers = load('app/api/stripe/webhook/route.ts', dependencies, '\nexport { markCheckoutExpired, markPaymentFailed };');
  return { ...handlers, row, writes };
}
const checkout = { id: 'checkout-test', metadata: { orderId: 'order-test' } };
const intent = { id: 'intent-test', metadata: { orderId: 'order-test' } };

for (const payment of ['Paid', 'Refunded', 'Partially Refunded']) test(`late failures cannot overwrite ${payment} after the initial read`, async () => {
  for (const handler of ['expiry', 'intent']) {
    const f = paymentFixture({ changedPayment: payment });
    const result = handler === 'expiry' ? await f.markCheckoutExpired(checkout) : await f.markPaymentFailed(intent);
    assert.equal(result.updated, false); assert.equal(f.row.payment, payment); assert.equal(f.writes.length, 0);
  }
});
test('mismatched checkout and payment intent cannot mutate an order', async () => {
  const f = paymentFixture({ storedSession: 'another-checkout', intent: 'another-intent' });
  assert.equal((await f.markCheckoutExpired(checkout)).updated, false);
  assert.equal((await f.markPaymentFailed(intent)).updated, false);
  assert.equal(f.writes.length, 0);
});
test('asynchronous payment failure is Failed, not Expired', async () => {
  const f = paymentFixture();
  assert.equal((await f.markCheckoutExpired(checkout, 'Failed')).updated, true);
  assert.equal(f.row.payment, 'Failed');
});
