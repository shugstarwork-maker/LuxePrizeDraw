import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('seat denial is displayed before lounge cards with exact chip requirement', () => {
  const s = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.ok(s.indexOf('role="alert"') < s.indexOf('{visibleTables.map'));
  assert.match(s, /setSeatError\(message\)/);
  assert.match(s, /Choose a lower entry or collect free daily chips/);
  assert.match(s, /aria-label=\{`Take seat at/);
});
