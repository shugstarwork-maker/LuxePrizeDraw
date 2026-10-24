import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const landing = readFileSync(new URL('../src/components/PokerLeagueLanding.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

test('poker league landing page is honest free-play with real routes', () => {
  assert.match(landing, /100% free-play league ecosystem/);
  assert.match(landing, /no deposits, no wagering, no cash-out/);
  assert.match(landing, /Virtual chips only/);
  for (const route of ['"/poker"', '"/portal"']) {
    assert.ok(landing.includes(`go(${route})`), route);
  }
  for (const href of ['href: "/blackjack"', 'href: "/brag"', 'href: "/poker"']) {
    assert.ok(landing.includes(href), href);
  }
  assert.match(landing, /onClick=\{\(\) => go\(l\.href\)\}/);
  assert.match(landing, /Smart HUD intelligence/);
  assert.match(landing, /Trophy room & career/);
  assert.match(landing, /Texas Hold'em/);
  assert.match(landing, /Luxe Blackjack/);
  assert.match(landing, /3-Card Brag/);
});

test('landing ticker marquee exists and respects reduced motion', () => {
  assert.match(landing, /league-marquee/);
  assert.match(css, /@keyframes league-marquee-scroll/);
  assert.match(css, /prefers-reduced-motion/);
});

test('landing page is routed at /league', () => {
  assert.match(app, /PokerLeagueLanding/);
  assert.match(app, /path === "\/league"/);
});
