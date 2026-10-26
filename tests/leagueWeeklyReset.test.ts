import test from "node:test";
import assert from "node:assert/strict";

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};
const league = await import("../src/lib/pokerLeague.ts");
const WEEK_MS = 7 * 86400000;
const lastWeek = league.weekKey(new Date(Date.now() - WEEK_MS));

const seed = (entries: { at: number; amount: number }[], st: object) => {
  store.clear();
  store.set("luxe-poker-ledger", JSON.stringify(entries.map((e, i) => ({ id: `E${i}`, label: "t", status: "confirmed", ...e }))));
  store.set("luxe-poker-league", JSON.stringify(st));
};

test("weekly XP only counts points earned this week", () => {
  seed([{ at: Date.now() - WEEK_MS, amount: 5000 }, { at: Date.now() - 1000, amount: 40 }], { week: league.weekKey(), tierIndex: 2, xp: 0, seed: 1, weeksInLeague: 3 });
  assert.equal(league.confirmedXP(), 40);
  assert.equal(league.confirmedXP(lastWeek), 5000);
});

test("a big week promotes once, then the new week starts from zero", () => {
  seed([{ at: Date.now() - WEEK_MS, amount: 99999 }], { week: lastWeek, tierIndex: 2, xp: 0, seed: 1, weeksInLeague: 3 });
  const st = league.ensureWeek();
  assert.equal(st.tierIndex, 3, "top of last week's board promotes");
  assert.equal(st.moved, "promote");
  assert.equal(league.confirmedXP(), 0, "new week starts at zero");
  const you = league.weeklyBoard(league.currentLeague()).find((r) => r.you);
  assert.equal(you?.xp, 0);
});

test("a week with no points relegates, it isn't propped up by older weeks", () => {
  seed([{ at: Date.now() - 3 * WEEK_MS, amount: 99999 }], { week: lastWeek, tierIndex: 4, xp: 0, seed: 1, weeksInLeague: 3 });
  const st = league.ensureWeek();
  assert.equal(st.tierIndex, 3);
  assert.equal(st.moved, "demote");
});
