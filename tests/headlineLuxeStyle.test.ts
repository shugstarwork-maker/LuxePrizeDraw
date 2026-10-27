import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('headline card uses gold header styling without green note illustration or flashing amounts', () => {
  const s = readFileSync(new URL('../src/components/FeaturedDraws.tsx', import.meta.url), 'utf8');
  assert.match(s, /headline-luxe-card/);
  assert.match(s, /<HeadlinePrizeChoice compact \/>/);
  assert.match(s, /Approval pending · Entries and payments disabled/);
  assert.doesNotMatch(s, /cash-note-frame|headline-prize-flash|headline-entry-flash/);
  assert.match(s, /cta="Enter"/);
  assert.match(s, /navigate\("\/launch-build"\)/);
  assert.match(s, /does not submit an entry or take a payment/);
  assert.doesNotMatch(s, /navigate\("\/draws"\)/);
});
