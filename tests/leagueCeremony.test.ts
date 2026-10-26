import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lounge = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
const ceremony = readFileSync(new URL("../src/components/LeagueCelebration.tsx", import.meta.url), "utf8");

test("the weekly move ceremony shows on every lounge screen, not just the League tab", () => {
  assert.match(lounge, /const ceremony = <LeagueCelebration/);
  assert.equal(lounge.match(/\{ceremony\}/g)?.length, 4, "welcome, lobby and both table screens");
  assert.match(ceremony, /createPortal\(/);
});

test("the ceremony waits for Continue and states the real promotion rule", () => {
  assert.ok(!/setTimeout\([^)]*onDone/.test(ceremony), "must not auto-dismiss");
  assert.match(ceremony, /onClick=\{onDone\}/);
  assert.match(ceremony, /top \$\{PROMOTE_COUNT\}/);
  assert.ok(!ceremony.includes("Top half"), "old, wrong copy");
});

test("league tab shows the division ladder", () => {
  assert.match(lounge, /<LeagueLadder tierIndex=\{league\.tierIndex\} \/>/);
});
