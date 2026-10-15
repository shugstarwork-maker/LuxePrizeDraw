import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('cash-led Bitcoin hero preserves prize choice and clear preview safeguards', () => {
  const source = readFileSync(new URL('../src/components/FeaturedDraws.tsx', import.meta.url), 'utf8');
  for (const text of ['/prizes/cash-bitcoin-stacks.svg', '£100,000 OF BITCOIN', 'OR CHOOSE £100,000 CASH', 'Illustrative image · Pre-launch · Entries not yet open', 'Eligibility, free-entry information', 'href="/terms"']) assert.ok(source.includes(text), text);
  const svg = readFileSync(new URL('../public/prizes/cash-bitcoin-stacks.svg', import.meta.url), 'utf8');
  assert.match(svg, /PRIZE ILLUSTRATION/);
  assert.match(svg, /₿/);
  assert.doesNotMatch(svg, /<script/);
});
