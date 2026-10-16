import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GET, POST, launchConfig, publicDraw, SEED_DRAWS } from '../api/launch-build';
import { LaunchDrawCard } from '../src/components/LaunchBuildPage';

const request = (action: string, body: unknown = {}, token = '') => new Request(`https://example.test/api/launch-build?action=${encodeURIComponent(action)}`, {
  method: 'POST', headers: { authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify(body),
});

test('uploaded catalogue retains all 17 unique proposals and never invents verified sales', async () => {
  delete process.env.LAUNCH_BUILD_DATABASE_URL;
  assert.equal(SEED_DRAWS.length, 17);
  assert.equal(new Set(SEED_DRAWS.map(draw => draw.id)).size, 17);
  const response = await GET(new Request('https://example.test/api/launch-build?action=draws'));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const { draws, storageConfigured } = await response.json();
  assert.equal(storageConfigured, false);
  assert.equal(draws.find(draw => draw.id === 'cash10').price, .1);
  assert.equal(draws.find(draw => draw.id === 'btc100').target, 500000);
  for (const draw of draws) {
    assert.equal(draw.proposed, true);
    assert.equal(draw.revenue, null);
    assert.equal(draw.sold, null);
    assert.equal(draw.pct, null);
    assert.equal(draw.unlocked, false);
    assert.equal(draw.winner, null);
  }
});

test('environment switches and recorded evidence cannot unlock imported entry routes', async () => {
  const previous = { ...process.env };
  try {
    for (const key of ['CASH_LAUNCH_ENABLED', 'LAUNCH_MODE', 'LEGAL_REVIEW_APPROVAL_REFERENCE', 'OFFICIAL_RULES_URL', 'OFFICIAL_RULES_VERSION', 'PRIZE_FUND_ATTESTATION_REFERENCE', 'FUNDS_SAFEGUARDING_PROVIDER', 'FUNDS_SAFEGUARDING_ACCOUNT_REFERENCE', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_MEMBERSHIP_PRICE_ID']) process.env[key] = 'private-evidence';
    process.env.CASH_LAUNCH_ENABLED = 'true';
    process.env.LAUNCH_MODE = 'live';
    const config = launchConfig();
    assert.equal(config.proofs.every(proof => proof.ok), true);
    assert.equal(config.launchReady, false);
    assert.equal(config.paidEntriesEnabled, false);
    assert.equal(config.prizeIssuanceEnabled, false);
    assert.doesNotMatch(JSON.stringify(config), /private-evidence/);
    for (const action of ['checkout', 'self-exclude']) assert.equal((await POST(request(action))).status, 423);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});

test('admin controls require a dedicated token, reject malformed inputs and fail closed without storage', async () => {
  delete process.env.LAUNCH_BUILD_DATABASE_URL;
  delete process.env.LAUNCH_BUILD_ADMIN_TOKEN;
  assert.equal((await POST(request('admin/proofs'))).status, 401);
  process.env.LAUNCH_BUILD_ADMIN_TOKEN = 'test-only-not-a-credential';
  const token = process.env.LAUNCH_BUILD_ADMIN_TOKEN;
  try {
    assert.equal((await GET(new Request('https://example.test/api/launch-build?action=admin/state'))).status, 401);
    assert.equal((await POST(request('admin/proofs', {}, 'wrong'))).status, 401);
    assert.equal((await POST(request('admin/proofs', { key: 'unknown', ok: true }, token))).status, 400);
    assert.equal((await POST(request('admin/proofs', { key: 'officialRules', ok: 'false' }, token))).status, 400);
    assert.equal((await POST(request('admin/proofs', null, token))).status, 400);
    assert.equal((await POST(request('admin/proofs', { key: 'officialRules', ok: true, note: 'x'.repeat(40000) }, token))).status, 413);
    assert.equal((await POST(request('admin/draws/unknown/pause', {}, token))).status, 404);
    assert.equal((await POST(request('admin/draws/cash10/draw', {}, token))).status, 423);
    const postal = await POST(request('admin/postal', {}, token));
    assert.equal(postal.status, 409);
    assert.equal((await postal.json()).path, '/postal-intake');
    assert.equal((await POST(request('admin/proofs', { key: 'officialRules', ok: true }, token))).status, 503);
    assert.equal((await POST(request('admin/draws/cash10/pause', {}, token))).status, 503);
  } finally { delete process.env.LAUNCH_BUILD_ADMIN_TOKEN; }
});

test('public cards retain the proposal disclosure and never advertise active checkout', () => {
  const html = renderToStaticMarkup(createElement(LaunchDrawCard, { draw: publicDraw(SEED_DRAWS[0]) }));
  assert.match(html, /Proposed/);
  assert.match(html, /Not open/);
  assert.match(html, /Verified sales unavailable/);
  assert.match(html, /<button[^>]*disabled/);
  assert.doesNotMatch(html, /<form/);
});
