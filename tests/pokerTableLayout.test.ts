import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

test("seat slots are inset from the felt edge — no badge clipping", () => {
  assert.match(src, /50 \+ 38 \* Math\.cos\(th\)/);      // horizontal radius pulled in from 42
  assert.match(src, /46 - 28 \* Math\.sin\(th\)/);       // vertical radius centred at 46%
});

test("bet amounts render as chip stacks on the felt, not as pills on the seat badges", () => {
  assert.match(src, /function BetChips\(/);
  assert.match(src, /data-testid="bet-chips"/);
  assert.match(src, /poker-bet-chips__stack/);
  // inline bet pills removed from both seat renders
  assert.ok(!src.includes('>bet {p.bet.toLocaleString()}<'), "inline bet pill still present on a seat badge");
});

test("bet chips sit between the seat and the pot, clear of the board", () => {
  assert.match(src, /slot\.px \+ \(50 - slot\.px\) \* 0\.3/);   // nudged toward centre
  assert.match(src, /slot\.py \+ \(46 - slot\.py\) \* 0\.3/);
});

test("bet chips CSS keeps them off the seat layer and non-interactive", () => {
  assert.match(css, /\.poker-bet-chips \{[^}]*z-index:4/);      // board layer (seats are z 5+)
  assert.match(css, /\.poker-bet-chips \{[^}]*pointer-events:none/);
  assert.match(css, /\.poker-bet-chips__stack i \{/);           // stacked gold chips
});

test("your own bet is labelled distinctly", () => {
  assert.match(src, /isYou && <em>your bet<\/em>/);
});

test("no CSS override can force a seat badge on top of another seat", () => {
  const forbidden = [
    /\.poker-live-seats[^\n{]*\{[^}]*left:9[0-9]%/,   // seat pinned to far-right rim
    /\.poker-seat-you[^}]*left:[78][0-9]%/,           // your seat forced into the right column
  ];
  for (const re of forbidden) assert.ok(!re.test(css), `found obstructing seat override: ${re}`);
});

test("pot chip stack renders centre-felt under the board in landscape", () => {
  assert.match(css, /\.poker-playing-page \.luxe-pot-chips \{ left:50%; top:56%/);
});

test("tournament ticker docks to the bottom of the table HUD, clear of the action dock", () => {
  assert.match(css, /\.poker-ticker \{\s*position: fixed; bottom: 0/);
  assert.match(css, /border-radius: \.7rem \.7rem 0 0/);         // flipped for the bottom edge
  assert.match(css, /\.poker-playing-page \.poker-ticker \{[^}]*bottom:4\.6rem/); // landscape: lifted above the dock
  assert.doesNotMatch(css, /\.poker-ticker \{[^}]*top: 0/);       // no longer pinned to the top
});

test("wide landscape hands the black side columns to the UI rails", () => {
  assert.match(css, /min-aspect-ratio:2\/1/);                       // wide-screen rail mode exists
  assert.match(css, /\.poker-table-artwork \{ left:9%; width:82%/); // felt shrinks to the centre channel
  assert.match(css, /\.poker-action-dock \{ position:fixed; right:1%/); // actions live in the right rail
  assert.match(css, /\.poker-ticker \{ left:1%; bottom:auto; top:22%/); // ticker lives in the left rail
});

test("your seat badge never drifts off its slot onto the board", () => {
  assert.ok(!src.includes("slot.py + 8"), "seat-you vertical drift is back");
});
