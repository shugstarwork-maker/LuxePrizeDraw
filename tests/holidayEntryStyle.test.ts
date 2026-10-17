import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('holiday entry matches unboxed gold prize styling without inventing an entry price', () => {
 const css=readFileSync(new URL('../src/index.css',import.meta.url),'utf8');
 assert.match(css,/luxury-holidays \.draw-value-highlights__grid > div \{ border:0; background:transparent/);
 assert.match(css,/luxury-holidays \.draw-value-highlights :is\(dt,dd\) \{ font-family:Georgia/);
 const source=readFileSync(new URL('../src/components/LuxuryHolidaysSection.tsx',import.meta.url),'utf8');
 assert.match(source,/entry="Pending approval" prize="£50,000"/);
});
