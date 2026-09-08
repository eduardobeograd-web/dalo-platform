import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function fixture() {
  const state = { connected: false, pages: [], products: [] };
  const query = (key) => async (args) => {
    assert.equal(state.connected, true, 'database reads must follow connection()');
    if (key === 'pages') {
      assert.equal(args.where.published, true);
      assert.equal(args.where.indexable, true);
      return state.pages.filter(p => p.published && p.indexable);
    }
    assert.equal(args.where.active, true);
    return state.products.filter(p => p.active);
  };
  const modules = {
    'next/server': { connection: async () => { state.connected = true; } },
    '../lib/db': { prisma: { product: { findMany: query('products') }, destinationPage: { findMany: query('pages') } } },
    '../lib/site-url': { siteUrl: 'https://example.test' },
    '../lib/catalog-readiness': { getDestinationSeoIssues: p => p.issues || [] },
    '../lib/destination-pages': { slugifyDestination: s => s.toLowerCase().replaceAll(' ', '-') },
  };
  const source = readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: id => {
    if (!(id in modules)) throw new Error(`Unexpected import: ${id}`);
    return modules[id];
  } });
  return { state, sitemap: exports.default };
}

test('a newly approved destination appears on the next sitemap request', async () => {
  const { state, sitemap } = fixture();
  state.products = [{ active: true, country: 'Serbia', updatedAt: new Date('2026-08-01') }];
  state.pages = [{ slug: 'serbia', published: true, indexable: false, updatedAt: new Date('2026-09-08') }];
  assert.equal((await sitemap()).some(p => p.url.endsWith('/serbia')), false);
  state.pages[0].indexable = true;
  state.connected = false;
  const entry = (await sitemap()).find(p => p.url.endsWith('/serbia'));
  assert.ok(entry);
  assert.equal(entry.lastModified.toISOString(), '2026-09-08T00:00:00.000Z');
  state.pages[0].indexable = false;
  assert.equal((await sitemap()).some(p => p.url.endsWith('/serbia')), false);
});

test('unpublished, incomplete and inactive destinations remain excluded', async () => {
  const { state, sitemap } = fixture();
  state.pages = [
    { slug: 'serbia', published: false, indexable: true },
    { slug: 'croatia', published: true, indexable: true, issues: ['Incomplete'] },
    { slug: 'albania', published: true, indexable: true },
  ];
  state.products = ['Serbia', 'Croatia', 'Albania'].map(country => ({ country, active: country !== 'Albania', updatedAt: new Date() }));
  assert.equal((await sitemap()).filter(p => p.url.includes('/esim/')).length, 0);
});
