import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('cash entry is unboxed and slow text swell respects reduced motion', () => {
 const css=readFileSync(new URL('../src/index.css',import.meta.url),'utf8');
 assert.match(css,/entry-only > \.draw-value-highlights__entry \{ border:0; background:transparent/);
 assert.match(css,/cash-letter-swell 7s ease-in-out/);
 assert.match(css,/prefers-reduced-motion:reduce\) \{ \.cash-swell-card/);
 const source=readFileSync(new URL('../src/components/CashPrizesCarousel.tsx',import.meta.url),'utf8');
 assert.match(source,/cash-swell-card coverflow-draw/);
});

test('attention pulse is slow and never hides entry or prize amounts', () => {
 const css=readFileSync(new URL('../src/index.css',import.meta.url),'utf8');
 assert.match(css,/cash-amount-glow 3s ease-in-out infinite/);
 assert.match(css,/@keyframes cash-amount-glow[^}]*\} 50% \{ opacity:\.65/);
 assert.match(css,/animation:none; opacity:1; filter:none/);
});
