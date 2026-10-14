import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { prizeUnlock } from '../src/lib/prizeUnlock';
import { PrizeUnlockBar } from '../src/components/PrizeUnlockBar';

test('GBP grades use inclusive ceilings and revenue multipliers', () => {
  for (const [value, grade, multiplier] of [[50000,1,6],[50000.01,2,7],[75000,2,7],[75000.01,3,8],[100000,3,8],[100000.01,4,9],[150000,4,9],[150000.01,5,10],[1000000,5,10]]) {
    const state = prizeUnlock(value)!;
    assert.equal(state.grade, grade);
    assert.equal(state.multiplier, multiplier);
    assert.equal(state.targetGBP, Math.round(value * 100) * multiplier / 100);
  }
});
test('only known paid revenue reaches the threshold, capped at 100%', () => {
  assert.equal(prizeUnlock(100000)?.progress, undefined);
  assert.equal(prizeUnlock(100000, 400000)?.progress, 50);
  assert.equal(prizeUnlock(100000, 799999.99)?.unlocked, false);
  assert.equal(prizeUnlock(100000, 800000)?.unlocked, true);
  assert.equal(prizeUnlock(100000, 900000)?.progress, 100);
  for (const value of [0, -1, NaN, Infinity]) assert.equal(prizeUnlock(value), null);
  for (const revenue of [-1, NaN, Infinity]) assert.equal(prizeUnlock(50, revenue)?.progress, undefined);
});
test('unknown sales do not masquerade as a verified zero', () => {
  const html = renderToStaticMarkup(createElement(PrizeUnlockBar, { valueGBP: 100000 }));
  assert.match(html, /Grade 3 · 8×/);
  assert.match(html, /£800,000/);
  assert.match(html, /Sales data unavailable/);
  assert.doesNotMatch(html, /aria-valuenow/);
  const known = renderToStaticMarkup(createElement(PrizeUnlockBar, { valueGBP: 100000, revenueGBP: 400000 }));
  assert.match(known, /aria-valuenow="50"/);
  const unknownValue = renderToStaticMarkup(createElement(PrizeUnlockBar));
  assert.match(unknownValue, /Valuation pending/);
});
