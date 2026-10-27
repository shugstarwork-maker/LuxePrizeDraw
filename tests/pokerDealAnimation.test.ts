import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("hole cards deal round-robin, one card to each seat before the second", () => {
  const source = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.match(source, /p\.cards\.map\(\(c, cardIndex\) =>/);
  assert.match(source, /cardIndex \* game\.players\.length \+ game\.players\.indexOf\(p\)/);
  assert.match(source, /\["--seat-x" as string\]: slot\.px/);
});

test("community cards drop in one after another", () => {
  const source = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.match(source, /className="poker-board-deal" style=\{\{ animationDelay: `\$\{i \* 0\.12\}s` \}\}/);
});

test("deal animations flyin from the table centre and respect reduced motion", () => {
  const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
  assert.match(css, /@keyframes poker-card-fly \{ from \{ opacity:0; transform:translate\(calc\(\(50 - var\(--seat-x\)\) \* 1cqw\)/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{ \.poker-deal-card, \.poker-board-deal \{ animation:none; \} \}/);
});

test("any chips going into the pot play the chip sound", () => {
  const source = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.equal((source.match(/data-no-tap-sound onClick=\{\(\) => act\("raise"\)\}/g) ?? []).length, 1);
  assert.match(source, /const yourBet = you\?\.bet \?\? 0;/);
  assert.match(source, /if \(yourBet > lastBets\.current\.table\) play\("chipDrop"\);/);
});
