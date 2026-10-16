import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { CashPoundRain } from '../src/components/CashPoundRain';

test('pound rain is decorative, bounded and has no visible pause button', () => {
  const html = renderToStaticMarkup(createElement(CashPoundRain));
  assert.match(html, /aria-hidden="true"/);
  assert.equal((html.match(/<span/g) || []).length, 24);
  assert.doesNotMatch(html, /<button|Pause £ rain|Resume £ rain/);
  for (const [, duration] of html.matchAll(/animation-duration:(\d+)s/g)) assert.ok(Number(duration) >= 18 && Number(duration) <= 24);
});
test('cash rain respects reduced motion and value colours are explicitly gold and emerald', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /draw-value-highlights__entry dd \{ color: #ffd700/);
  assert.match(css, /draw-value-highlights__prize dd \{ color: #69ffb4/);
  assert.match(css, /focus-within \.cash-pound-rain span \{ animation-play-state: paused/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.cash-pound-rain/);
});
