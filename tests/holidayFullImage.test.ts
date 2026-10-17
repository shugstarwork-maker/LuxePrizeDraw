import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LuxuryHolidaysSection } from '../src/components/LuxuryHolidaysSection';
import { readFileSync } from 'node:fs';
test('holiday cards use full-bleed destination photos and retain disclosures', () => {
  const html = renderToStaticMarkup(createElement(LuxuryHolidaysSection));
  assert.match(html, /holiday-card-photo absolute inset-0 h-full w-full/);
  assert.match(html, /holiday-card-shade/);
  assert.match(html, /Santorini/);
  assert.match(html, /Approval pending/);
  assert.match(html, /Proposed total package value/);
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /holiday-card-photo \{ height:100%; \}/);
  assert.match(css, /holiday-card-shade \{ background:none/);
  assert.doesNotMatch(css, /coverflow-holiday > img \{ height:12rem/);
});
