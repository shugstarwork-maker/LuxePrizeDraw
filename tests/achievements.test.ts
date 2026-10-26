import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};
const ach = await import("../src/lib/achievements.ts");

test("badges unlock once when their target is reached", () => {
  store.clear();
  assert.deepEqual(ach.bumpStat("pokerHandsWon").map((a) => a.id), ["first-pot"]);
  assert.deepEqual(ach.bumpStat("pokerHandsWon"), [], "already unlocked — not announced twice");
  for (let i = 0; i < 22; i++) ach.bumpStat("pokerHandsWon");
  assert.deepEqual(ach.bumpStat("pokerHandsWon").map((a) => a.id), ["grinder"]);
});

test("max-style stats only ever rise", () => {
  store.clear();
  assert.deepEqual(ach.setStatMax("pokerBigPot", 1500).map((a) => a.id), ["high-roller"]);
  assert.deepEqual(ach.setStatMax("pokerBigPot", 200), []);
  assert.equal(ach.achievementCase().find((a) => a.id === "high-roller")?.current, 1500);
});

test("explorer badges count distinct games only", () => {
  store.clear();
  for (const g of ["holdem", "holdem", "blackjack", "brag"]) ach.markTried(g);
  assert.equal(ach.achievementCase().find((a) => a.id === "explorer")?.current, 3);
  assert.deepEqual(ach.markTried("chess").map((a) => a.id), ["explorer"]);
});

test("every badge tracks a stat some game actually reports", () => {
  const src = ["components/LuxePokerLeague.tsx", "components/CardLounge.tsx", "components/ChallengeLounge.tsx", "components/LuxeChessPage.tsx", "lib/pokerLeague.ts", "App.tsx"]
    .map((f) => readFileSync(new URL(`../src/${f}`, import.meta.url), "utf8")).join("\n");
  for (const a of ach.ACHIEVEMENTS) {
    const reported = a.stat === "gamesTried" ? /markTried\(/.test(src)
      : a.stat.endsWith("Finished") ? src.includes(`"${a.stat}"`) || src.includes("`${game}Finished`")
      : src.includes(`"${a.stat}"`);
    assert.ok(reported, `${a.id} tracks ${a.stat}, which nothing reports`);
  }
});

test("the toaster is mounted once at the app root", () => {
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.equal(app.match(/<AchievementToaster \/>/g)?.length, 1);
});

test("card lounge counts wins from the engine result, not returned chips (a push is not a win)", () => {
  const lounge = readFileSync(new URL("../src/components/CardLounge.tsx", import.meta.url), "utf8");
  assert.ok(!/const won = back > committed/.test(lounge), "returned chips include the unused reserve");
  assert.match(lounge, /const won = result === "win" \|\| result === "blackjack";/);
  assert.match(lounge, /\{ blackjack\?: boolean \}\)\.blackjack\) bumpStat\("bjNaturals"\)/);
});
