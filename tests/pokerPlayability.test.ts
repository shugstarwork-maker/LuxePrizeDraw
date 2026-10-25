import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('landscape keeps turn/error messages visible and separates player badge from hand', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /poker-round-status \{ display:block; position:fixed/);
  // Seat positions come from inline SEAT_SLOTS geometry; no CSS override may pin a badge.
  assert.doesNotMatch(css, /poker-seat-you[^}]*left:[0-9]+% !important/);
  // Your cards live once, on the console's black pad — never duplicated on the seat.
  assert.match(css, /poker-console-hand \{[^}]*background:#000/);
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
  // Seats show avatar + name plate only; your hand shows once on the console pad.
  assert.match(source, /poker-seat-plate/);
  assert.doesNotMatch(source, /poker-seat-hand/);
  assert.doesNotMatch(source, /className="poker-live-hand flex/);
  const engine = readFileSync(new URL('../src/games/holdem.ts', import.meta.url), 'utf8');
  assert.match(engine, /evaluateHand\(\[\.\.\.p\.cards/);
});


test('player seat is spaced from neighbours by the inline seat geometry, not CSS pins', () => {
  const src = readFileSync(new URL('../src/components/LuxePokerLeague.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  // SEAT_SLOTS places every avatar on the gold racetrack (43/44 radii, bottom clamped).
  assert.match(src, /50 \+ 43 \* Math\.cos\(th\)/);
  // No leftover !important seat pins that can drag badges on top of each other.
  assert.doesNotMatch(css, /data-seat-index="4"[^}]*left:[0-9]+% !important/);
  assert.doesNotMatch(css, /poker-seat-you[^}]*left:[0-9]+% !important/);
});
