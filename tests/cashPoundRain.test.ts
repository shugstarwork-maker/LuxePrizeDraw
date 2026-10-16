import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { CashPoundRain } from '../src/components/CashPoundRain';

test('pound rain is decorative, bounded and exposes a pause control', () => {
  const html = renderToStaticMarkup(createElement(CashPoundRain));
  assert.match(html, /aria-hidden="true"/);
  assert.equal((html.match(/<span/g) || []).length, 12);
  assert.match(html, /Pause £ rain/);
  assert.match(html, /aria-pressed="false"/);
});
test('cash rain respects reduced motion and value colours are explicitly gold and emerald', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /draw-value-highlights__entry dd \{ color: #ffd700/);
  assert.match(css, /draw-value-highlights__prize dd \{ color: #69ffb4/);
  assert.match(css, /cash-pound-rain--paused span \{ animation-play-state: paused/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.cash-pound-rain/);
});
