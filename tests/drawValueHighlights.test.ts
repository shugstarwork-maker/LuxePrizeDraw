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
