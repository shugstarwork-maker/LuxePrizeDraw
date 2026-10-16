import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import { LaunchCatalogue, LaunchCategoryShowcase, LaunchGauge } from '../src/components/LaunchShowcase';
import { SEED_DRAWS, publicDraw } from '../api/launch-build';

const draws = SEED_DRAWS.map(draw => publicDraw(draw));

test('showcase groups all uploaded proposals and exposes accessible filters', () => {
  const html = renderToStaticMarkup(createElement(LaunchCatalogue, { draws }));
  for (const label of ['Cash draws', 'Luxury holidays', 'Experiences draws']) assert.ok(html.includes(`${label} showcase`));
  assert.equal((html.match(/class="launch-card"/g) || []).length, 17);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal((html.match(/aria-pressed="false"/g) || []).length, 3);
  assert.doesNotMatch(html, /Live draws|0%|NaN|TICKETS SOLD|<form|type="date"/);
  assert.match(html, /Verified sales unavailable/);
  const buttons = html.match(/<button[^>]*class="launch-button"[^>]*>/g) || [];
  assert.equal(buttons.length, 20);
  assert.ok(buttons.every(button => button.includes('disabled')));
});

test('unknown sales use an unavailable gauge, never a numeric progress value', () => {
  const html = renderToStaticMarkup(createElement(LaunchGauge));
  assert.equal((html.match(/<line /g) || []).length, 48);
  assert.match(html, /aria-label="Verified sales unavailable"/);
  assert.doesNotMatch(html, /aria-valuenow|0%|stroke-dasharray/);
});

test('single and empty showcases handle navigation and paused state safely', () => {
  assert.equal(renderToStaticMarkup(createElement(LaunchCategoryShowcase, { items: [], label: 'Empty' })), '');
  const html = renderToStaticMarkup(createElement(LaunchCategoryShowcase, { items: [{ ...draws[0], paused: true }], label: 'Cash' }));
  assert.match(html, /1 of 1: £10 Cash Prize/);
  assert.match(html, /Previous Cash draw" disabled/);
  assert.match(html, /Next Cash draw" disabled/);
  assert.match(html, />Paused<\/button>/);
  assert.match(html, /aria-current="true"/);
});

test('gold HUD styles are scoped, responsive, and reduce motion', () => {
  const css = fs.readFileSync(new URL('../src/components/launchShowcase.css', import.meta.url), 'utf8');
  assert.match(css, /--launch-gold: #d4af37/);
  assert.match(css, /minmax\(min\(100%,340px\),1fr\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /(^|\n)(body|:root|button|h1|\.card)\s*\{/);
});
