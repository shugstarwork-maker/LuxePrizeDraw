import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// localStorage stub must exist before the libs are imported
const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

const lb = await import("../src/lib/leaderboard.ts");
const sg = await import("../src/lib/skillGames.ts");
const arena = readFileSync(new URL("../src/components/SkillGamesArena.tsx", import.meta.url), "utf8");

test("ladder includes the player at their live rating and sorts high to low", () => {
  const ladder = lb.leaderboard("chess");
  const you = ladder.find((e) => e.you);
  assert.ok(you, "player row must be present");
  assert.equal(you.rating, sg.START_RATING, "fresh player starts at 800");
  for (let i = 1; i < ladder.length; i++) assert.ok(ladder[i - 1].rating >= ladder[i].rating, "ladder must be sorted");
});

test("ladder rank reacts to rating changes", () => {
  sg.applyResult("chess", true, 800); // 816
  sg.applyResult("chess", true, 800); // ~832
  sg.applyResult("chess", true, 800); // ~848+
  const rank = lb.ladderRank("chess");
  assert.ok(rank >= 2 && rank <= 6, `rank ${rank} should be inside the field`);
});

test("tier labels map sensibly to rating bands", () => {
  assert.equal(lb.ladderTier(950), "Diamond");
  assert.equal(lb.ladderTier(840), "Platinum");
  assert.equal(lb.ladderTier(800), "Gold");
  assert.equal(lb.ladderTier(750), "Silver");
  assert.equal(lb.ladderTier(700), "Bronze");
});

test("match history records outcomes, caps the feed and tallies the record", () => {
  store.clear();
  lb.recordResult({ game: "connect4", outcome: "win", opponent: "Ruby C.", ratingDelta: 16, format: "casual" });
  lb.recordResult({ game: "connect4", outcome: "loss", opponent: "Ruby C.", ratingDelta: -16, format: "casual" });
  lb.recordResult({ game: "chess", outcome: "draw", opponent: "Onyx O.", ratingDelta: 0, format: "casual" });
  const c4 = lb.matchHistory("connect4");
  assert.equal(c4.length, 2);
  assert.equal(c4[0].outcome, "loss", "newest first");
  const sum = lb.recordSummary("connect4");
  assert.deepEqual(sum, { wins: 1, draws: 0, losses: 1 });
  const all = lb.recordSummary();
  assert.deepEqual(all, { wins: 1, draws: 1, losses: 1 });
  // cap at 50
  for (let i = 0; i < 60; i++) lb.recordResult({ game: "draughts", outcome: "win", opponent: "Marcus B.", ratingDelta: 10, format: "casual" });
  assert.ok(lb.matchHistory(undefined, 100).length <= 50, "history feed must stay capped");
});

test("arena UI renders the ladder, rank badge, record strip and results feed", () => {
  assert.match(arena, /data-testid="arena-leaderboard"/);
  assert.match(arena, /data-testid="arena-rank"/);
  assert.match(arena, /data-testid="arena-record"/);
  assert.match(arena, /data-testid="arena-history"/);
  assert.match(arena, /data-testid=\{e\.you \? "ladder-you" : undefined\}/);
  // results are recorded when a local match finishes
  assert.match(arena, /recordResult\(\{ game, outcome: result, opponent: SIDES\[game\]\.b\.name/);
  // honesty line stays with the ladder
  assert.match(arena, /\{LEADERBOARD_NOTE\}/);
});
