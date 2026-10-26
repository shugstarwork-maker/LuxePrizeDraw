import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { secureIndex, secureShuffle } from "../src/lib/secureRandom.ts";
import { CASINO_RULES, FAIR_PLAY } from "../src/components/CasinoRulesSheet.tsx";

const bj = readFileSync(new URL("../src/games/blackjack.ts", import.meta.url), "utf8");
const brag = readFileSync(new URL("../src/games/brag.ts", import.meta.url), "utf8");
const lounge = readFileSync(new URL("../src/components/CardLounge.tsx", import.meta.url), "utf8");

test("secure shuffle is a permutation and stays in range", () => {
  for (let i = 0; i < 2000; i++) { const n = 1 + (i % 52); const k = secureIndex(n); assert.ok(k >= 0 && k < n); }
  const deck = Array.from({ length: 52 }, (_, i) => i);
  assert.deepEqual([...secureShuffle([...deck])].sort((a, b) => a - b), deck);
});

test("both card games shuffle with the cryptographic generator", () => {
  assert.match(bj, /return secureShuffle\(shoe\);/);
  assert.match(brag, /secureShuffle\(d\);/);
});

test("published rules match what the engines do", () => {
  const bjText = CASINO_RULES.blackjack.sections.flatMap((s) => s.items).join(" ");
  assert.match(bj, /while \(dv\.total < 17\)/); assert.match(bjText, /stands on all 17s/);
  assert.match(bj, /Math\.floor\(p\.bet \* 1\.5\)/); assert.match(bjText, /3 to 2/);
  assert.match(bj, /\[\.\.\.one, \.\.\.one, \.\.\.one, \.\.\.one\]/); assert.match(bjText, /four-deck shoe/);
  const bragText = CASINO_RULES.brag.sections.flatMap((s) => s.items).join(" ");
  assert.match(brag, /dv\[1\] >= 12; \/\/ Queen-high or better/); assert.match(bragText, /Queen-high or better/);
  assert.match(brag, /pay \+= p\.ante \* 4/); assert.match(bragText, /prial \+4×/);
  assert.match(brag, /vals\[0\] === 3 \? 15/); assert.match(bragText, /Three 3s is the best prial/);
});

test("the table enforces the published maximum bet and shows the rules", () => {
  assert.ok(FAIR_PLAY.some((f) => /maximum bet of ten times its minimum/.test(f)));
  assert.match(lounge, /if \(bet > table\.minBet \* 10\)/);
  assert.match(lounge, /<CasinoRulesSheet game=\{game\}/);
  assert.ok(!lounge.includes("const play = () => {};"), "card lounge sounds are wired, not a no-op");
});

test("chip taps never take the stake outside the table's limits", async () => {
  const { nextStake } = await import("../src/components/CardLounge.tsx");
  assert.equal(nextStake(50, 25, 50, 500), 75, "a 25 chip on a 50-minimum table adds, never drops to 25");
  assert.equal(nextStake(100, 25, 100, 1000), 125);
  assert.equal(nextStake(25, 100, 25, 250), 100, "first bigger chip replaces the minimum");
  assert.equal(nextStake(225, 100, 25, 250), 250, "capped at the maximum");
  const lounge = readFileSync(new URL("../src/components/CardLounge.tsx", import.meta.url), "utf8");
  assert.match(lounge, /if \(bet < table\.minBet\)/);
});

test("last-move and check highlights survive the 3D board's bevel styling", () => {
  const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
  assert.match(css, /\.luxe-chess-table--3d \.luxe-chess-grid > button\.luxe-chess-square--last \{/);
  assert.match(css, /\.luxe-chess-table--3d \.luxe-chess-grid > button\.luxe-chess-square--check \{/);
});
