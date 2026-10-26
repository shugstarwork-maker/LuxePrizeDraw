import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");

test("seat slots pin badges to the rail — the marked positions around the table edge", () => {
  assert.match(src, /\{ px: 17, py: 14, sc: 0\.72 \}/);  // left rail — upper
  assert.match(src, /\{ px: 85, py: 25, sc: 0\.76 \}/);  // right rail — upper
  assert.match(src, /\{ px: 13, py: 68, sc: 0\.9 \}/);   // left rail — lower
  assert.match(src, /\{ px: 86, py: 72, sc: 0\.9 \}/);   // right rail — lower
  assert.match(src, /\{ px: 63, py: 82, sc: 1 \}/);      // bottom rail, right of the hero
  assert.match(src, /\{ px: 45, py: 75, sc: 1\.06 \}/);  // hero — bottom centre
});

test("bet amounts render as chip stacks on the felt, not as pills on the seat badges", () => {
  assert.match(src, /function BetChips\(/);
  assert.match(src, /data-testid="bet-chips"/);
  assert.match(src, /poker-bet-chips__stack/);
  // inline bet pills removed from both seat renders
  assert.ok(!src.includes('>bet {p.bet.toLocaleString()}<'), "inline bet pill still present on a seat badge");
});

test("bet chips sit between the seat and the pot, clear of the board", () => {
  assert.match(src, /const BET_SPOTS = \[/);                       // one measured spot per seat
  assert.match(src, /\{ bx: 33, by: 70 \},  \/\/ hero/);          // your stack sits to your left, off your cards
  assert.match(src, /spot=\{BET_SPOTS\[slotIndex\]\}/);
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

test("in console mode the ticker leaves the column and becomes a bar across the top of the felt", () => {
  assert.match(css, /\.poker-console \.poker-ticker \{ position:fixed; top:max\(\.35rem/); // top bar, not a console card
  assert.match(css, /\.poker-console \.poker-ticker \{[^}]*left:41\.5%/);                  // centred on the 83% felt channel
  assert.match(css, /\.poker-console \.poker-ticker \{[^}]*border-radius:999px/);          // pill bar styling
  assert.match(css, /\.poker-console-min \.poker-console \.poker-ticker \{ left:calc\(50% - 1\.8rem\)/); // stays put when minimised
});

test("wide landscape becomes a control room: felt edge-to-edge left, black console column right", () => {
  assert.match(css, /min-aspect-ratio:2\/1/);                                            // wide-screen console mode exists
  assert.match(css, /\.poker-playing-page:has\(\.poker-console\) \.poker-playing-wrap \{ position:absolute; left:0; top:0; bottom:0; right:auto; width:83%/); // felt fills its own channel — the glass console never covers the rail's chips or cards
  assert.match(css, /\.poker-playing-page:has\(\.poker-console\) \.poker-table-artwork > img \{ object-fit:cover/);        // edge-to-edge felt
  assert.match(css, /\.poker-playing-page \.poker-console \{ position:fixed; top:0; right:0; bottom:0; left:auto; width:17%/); // console owns the right column
});

test("console keeps only the option panels — cards and actions live on the felt as bars", () => {
  assert.match(css, /\.poker-console \.hud-zone--bl \.hud-chat-pop \{ position:static/);   // chat inline, never over the felt
  assert.match(css, /\.poker-console \.hud-zone--bl \.hud-icon-btn \{ display:none/);      // no duplicate chat button
  assert.match(css, /\.poker-console \.poker-console-hand \{ display:none/);               // hero cards ride the seat badge
  assert.match(css, /\.poker-console \.poker-action-dock \{ position:fixed; left:auto; right:calc\(17%/); // action bar along the felt bottom, right of your avatar
  assert.match(css, /\.poker-console \.poker-deal-dock \{ position:fixed; left:auto; right:calc\(17%/);   // deal bar rides the same slot
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

test("console matches the pro-app sidebar: coin table card, ring quick icons and a TABLE OPTIONS chevron list", () => {
  const hud = readFileSync(new URL("../src/components/PokerHudFrame.tsx", import.meta.url), "utf8");
  assert.match(hud, /<span>Leaderboard<\/span>/);                    // labelled nav buttons
  assert.match(hud, /<span>Sound<\/span>/);
  assert.match(hud, /console-table-card__coin/);                     // crown coin emblem on the table card
  assert.match(hud, /console-seat-panel__icon/);                     // framed wallet icon on SEAT & STACKS
  assert.match(hud, /Seat &amp; Stacks/);                            // section headers
  assert.match(hud, /Table Options/);
  assert.match(hud, /data-testid="poker-console-options"/);
  for (const row of ["Table Info", "How to Play", "Leave Table"]) {
    assert.ok(hud.includes(`<span>${row}</span>`), `missing option row: ${row}`);
  }
  // Leaderboard, Chat and Sound already sit in the nav and quick rows — no duplicate option rows.
  assert.ok(!hud.includes('aria-label="Open leaderboard"'), "duplicate Leaderboard option row is back");
  assert.match(css, /\.console-table-card__coin \{[^}]*border-radius: 50%/);            // gold coin disc
  assert.match(css, /poker-console-quick \.console-nav-btn svg \{[^}]*border-radius: ?50%/); // circular quick rings
  assert.match(css, /\.poker-console \.poker-console-quick \{[^}]*border:1px solid/);       // framed quick panel
  assert.match(css, /\.poker-console \.poker-console-options \{[^}]*border:1px solid/);     // framed options panel
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

test("in-play chips are black-and-gold Luxe stacks with a spade face, like the rail artwork", () => {
  assert.match(src, /poker-bet-chips__face/);                                   // spade face on the top chip
  assert.match(css, /\.poker-bet-chips__stack i \{[^}]*repeating-conic-gradient\(#f0c86e/); // gold rim segments
  assert.match(css, /\.poker-bet-chips__stack i \{[^}]*#0d0a04/);               // black lacquer chip face
  assert.match(css, /\.poker-bet-chips__stack i \{[^}]*border:2px solid #d9b764/); // gold rim
  assert.match(css, /\.poker-bet-chips__face \{[^}]*color:#f0c86e/);            // gold spade
});

test("lobby offers a way back to a live table — League/lobby visits no longer strand the player", () => {
  assert.match(src, /data-testid="back-to-table"/);
  assert.match(src, /setScreen\("table"\); \}\} className="rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-4/);
  // The back button only shows while a seat is still live.
  assert.match(src, /\{activeTable && game && <button onClick=\{\(\) => \{ play\("button"\); setScreen\("table"\)/);
});
