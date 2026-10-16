import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('salon cards use the real table imagery and preserve functional seating', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.match(source, /salon-table-preview__image/);
  assert.match(source, /src="\/games\/luxe-poker-table.png"/);
  assert.match(source, /onClick=\{\(\) => join\(table\)\}/);
  assert.match(source, /LUXE POKER LOUNGE/);
  assert.doesNotMatch(source, /#451256/);
});
