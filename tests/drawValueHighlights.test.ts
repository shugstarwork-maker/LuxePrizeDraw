import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DrawValueHighlights } from '../src/components/DrawValueHighlights';

test('entry and cash values are labelled, prominent and explicitly pending approval', () => {
  const html = renderToStaticMarkup(createElement(DrawValueHighlights, { entry: '1p', prize: '£250,000', prizeLabel: 'Proposed cash prize' }));
  for (const text of ['Proposed entry', '1p', 'Proposed cash prize', '£250,000', 'Approval pending', 'Entries not open']) assert.ok(html.includes(text));
  assert.equal((html.match(/<dd>/g) || []).length, 2);
  assert.doesNotMatch(html, /<button|<form/);
});

test('unconfirmed fees and valuations remain pending, never fabricated cash amounts', () => {
  const html = renderToStaticMarkup(createElement(DrawValueHighlights));
  assert.match(html, /Pending approval/);
  assert.match(html, /Valuation pending/);
  assert.doesNotMatch(html, /£|cash alternative|Free/);
});

test('cash cards can keep the existing prize heading without duplicating a prize panel', () => {
  const html = renderToStaticMarkup(createElement(DrawValueHighlights, { entry: '80p', prize: '£12,500', hidePrize: true }));
  assert.match(html, /80p/);
  assert.doesNotMatch(html, /Proposed prize value|£12,500|draw-value-highlights__prize/);
});

test('cash entry and existing prize heading share larger gold serif styling', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /cash-prize-heading \{ font-size:clamp\(2\.8rem,8vw,4\.5rem\)/);
  assert.match(css, /draw-value-highlights__grid--entry-only dd \{ font-family:Georgia/);
  assert.match(css, /font-size:clamp\(2\.6rem,7vw,4rem\)/);
});
