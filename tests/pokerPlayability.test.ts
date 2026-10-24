import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('landscape keeps turn/error messages visible and separates player badge from hand', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /poker-round-status \{ display:block; position:fixed/);
  assert.match(css, /data-seat-index="5"[\s\S]{0,120}left:80% !important/);
  // Your cards ride on your seat badge, not a centre-felt strip.
  assert.match(css, /poker-seat-hand span \{ height:1\.9rem/);
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
  // Your hand renders face-up on your seat badge (outside the felt), like every other seat.
  assert.match(source, /poker-seat-hand/);
  assert.doesNotMatch(source, /className="poker-live-hand flex/);
  const engine = readFileSync(new URL('../src/games/holdem.ts', import.meta.url), 'utf8');
  assert.match(engine, /evaluateHand\(\[\.\.\.p\.cards/);
});


test('player seat sits on the right rim, clear of Theo and the action dock', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /data-seat-index="4"\] \{ left:91% !important; top:43%/);
  assert.match(css, /data-seat-index="5"[\s\S]{0,120}left:80% !important; top:62%/);
});
