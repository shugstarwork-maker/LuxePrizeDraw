import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LuxePotChips, potChipCount } from '../src/components/LuxePotChips';
test('pot stack is bounded and absent before betting', () => {
  assert.equal(potChipCount(0), 0); assert.equal(potChipCount(-1), 0);
  assert.equal(potChipCount(NaN), 0); assert.equal(potChipCount(150), 1);
  assert.equal(potChipCount(100000), 9);
  assert.equal(renderToStaticMarkup(createElement(LuxePotChips, { pot:0 })), '');
});
test('branded pot uses exact live amount rather than claiming denomination per token', () => {
  const html = renderToStaticMarkup(createElement(LuxePotChips, { pot:1750 }));
  for (const value of ['LUXE','POKER','1,750','virtual chips','illustrative']) assert.ok(html.includes(value));
  assert.equal((html.match(/class="luxe-pot-chip"/g) || []).length, 7);
});
