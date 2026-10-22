import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('landscape keeps turn/error messages visible and separates player badge from hand', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /poker-round-status \{ display:block; position:fixed/);
  assert.match(css, /data-seat-index="5"\] \{ left:83% !important/);
  assert.match(css, /poker-live-hand \{ top:62%; left:50%; pointer-events:none/);
});
test('insufficient chips are denied entry before the table screen opens', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  const join = source.split('const join =')[1].split('const sendGift')[0];
  assert.ok(join.indexOf('chips < table.buyIn') > -1);
  assert.ok(join.indexOf('chips < table.buyIn') < join.indexOf('setScreen("table")'));
});

test('dealer portrait has no visible two-card hand while opponent evaluation is preserved', () => {
  const source = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /className="poker-live-host/);
  assert.match(source, /className="poker-live-hand/);
  const engine = readFileSync(new URL('../src/games/holdem.ts', import.meta.url), 'utf8');
  assert.match(engine, /evaluateHand\(\[\.\.\.p\.cards/);
});


test('player seat has a distinct lower-right position from Theo', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /data-seat-index="4"\] \{ left:91% !important; top:43%/);
  assert.match(css, /data-seat-index="5"\] \{ left:83% !important; top:78%/);
});
