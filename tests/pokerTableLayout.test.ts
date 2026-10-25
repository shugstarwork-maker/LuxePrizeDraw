import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

test("seat slots sit on the gold racetrack of the clean oval felt", () => {
  assert.match(src, /50 \+ 43 \* Math\.cos\(th\)/);      // horizontal radius on the racetrack
  assert.match(src, /Math\.min\(86, 50 - 44 \* Math\.sin\(th\)\)/); // vertical radius, bottom seat clamped clear of the rail
});

test("bet amounts render as chip stacks on the felt, not as pills on the seat badges", () => {
  assert.match(src, /function BetChips\(/);
  assert.match(src, /data-testid="bet-chips"/);
  assert.match(src, /poker-bet-chips__stack/);
  // seats are avatar + name plate only — no inline bet pills, no mini cards
  assert.ok(!src.includes('>bet {p.bet.toLocaleString()}<'), "inline bet pill still present on a seat badge");
  assert.ok(!src.includes("poker-seat-hand"), "mini cards still duplicated on a seat badge");
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

test("wide landscape becomes a control room: felt edge-to-edge left, black console column right", () => {
  assert.match(css, /min-aspect-ratio:2\/1/);                                            // wide-screen console mode exists
  assert.match(css, /\.poker-playing-page:has\(\.poker-console\) \.poker-playing-wrap \{ position:absolute; left:0; top:0; bottom:0; right:auto; width:83%/); // felt fills the left channel
  assert.match(css, /\.poker-playing-page:has\(\.poker-console\) \.poker-table-artwork > img \{ object-fit:cover/);        // edge-to-edge felt
  assert.match(css, /\.poker-playing-page \.poker-console \{ position:fixed; top:0; right:0; bottom:0; left:auto; width:17%/); // console owns the right column
});

test("console column stacks stats, chat, your cards on a black pad and the dock at its foot", () => {
  assert.match(css, /\.poker-console \.poker-ticker \{ order:3; position:static/);        // ticker in the stack
  assert.match(css, /\.poker-console \.hud-zone--bl \.hud-chat-pop \{ position:static/);  // chat inline, never over the felt
  assert.match(css, /\.poker-console \.poker-console-hand \{ order:8;[^}]*background:#000/); // cards pop on black
  assert.match(css, /\.poker-console \.poker-action-dock \{ order:9; position:static/);   // dock at the foot
});

test("console minimises into a tab strip, one tab per option, and the felt takes the space back", () => {
  const hud = readFileSync(new URL("../src/components/PokerHudFrame.tsx", import.meta.url), "utf8");
  assert.match(hud, /poker-console__collapse/);                       // minimise control
  assert.match(hud, /data-testid="poker-console-tabs"/);              // the tab strip
  assert.match(hud, /aria-label="Expand console"/);
  assert.match(hud, /poker-console-min/);                             // class-driven toggle
  assert.match(css, /\.poker-playing-page\.poker-console-min \.poker-playing-wrap \{ width:calc\(100% - 3\.6rem\)/); // felt widens
  assert.match(css, /\.poker-console-min \.poker-console \{ width:3\.4rem/);           // strip width
  assert.match(css, /\.poker-console-min \.poker-console \.poker-console-tabs \{ display:flex/);
  // actions stay reachable while minimised — dock floats bottom-centre
  assert.match(css, /\.poker-console-min \.poker-console \.poker-action-dock \{ position:fixed/);
});

test("console offers players roster and how-to-play popovers from the options row", () => {
  const hud = readFileSync(new URL("../src/components/PokerHudFrame.tsx", import.meta.url), "utf8");
  assert.match(hud, /data-testid="poker-console-quick"/);
  assert.match(hud, /aria-label="Players at the table"/);
  assert.match(hud, /aria-label="How to play"/);
  assert.match(hud, /No-Limit Texas Hold'em/);
  assert.match(src, /players=\{game \? game\.players\.map/);          // roster wired from the live game
});

test("console matches the pro-app sidebar: labelled nav, sections and a TABLE OPTIONS chevron list", () => {
  const hud = readFileSync(new URL("../src/components/PokerHudFrame.tsx", import.meta.url), "utf8");
  assert.match(hud, /<span>Leaderboard<\/span>/);                    // labelled nav buttons
  assert.match(hud, /<span>Sound<\/span>/);
  assert.match(hud, /Seat &amp; Stacks/);                            // section headers
  assert.match(hud, /Table Options/);
  assert.match(hud, /data-testid="poker-console-options"/);
  for (const row of ["Table Info", "Leaderboard", "Chat", "How to Play", "Leave Table"]) {
    assert.ok(hud.includes(`<span>${row}</span>`), `missing option row: ${row}`);
  }
  assert.match(css, /\.poker-console \.console-option-row \{[^}]*width:100%/);   // full-width rows
  assert.match(css, /\.poker-console \.console-section \{[^}]*text-transform:uppercase/);
  assert.match(hud, /onSettings/);                                   // settings cycles the theme
  assert.match(src, /setTableTheme\(\(t\) => t === "classic"/);
});

test("console wrapper is transparent outside wide landscape — classic layout untouched", () => {
  assert.match(css, /\.poker-console \{ display: contents; \}/);
  assert.match(css, /\.poker-console-hand \{ display: none; \}/);
});

test("HUD frame exposes the console slots and the league table wires them", () => {
  const hud = readFileSync(new URL("../src/components/PokerHudFrame.tsx", import.meta.url), "utf8");
  assert.match(hud, /data-testid="poker-console"/);
  assert.match(hud, /ticker\?: ReactNode/);
  assert.match(hud, /handStrip\?: ReactNode/);
  assert.match(hud, /dock\?: ReactNode/);
  assert.match(src, /ticker=\{<PokerTournamentTicker playersRemaining=\{alivePlayers\}/);
  assert.match(src, /handStrip=\{you && you\.cards\.length > 0/);
  assert.match(src, /dock=\{<>/);
});

test("your seat badge never drifts off its slot onto the board", () => {
  assert.ok(!src.includes("slot.py + 8"), "seat-you vertical drift is back");
});
