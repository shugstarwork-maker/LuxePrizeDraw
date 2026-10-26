import test from "node:test";
import assert from "node:assert/strict";

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};
const season = await import("../src/lib/pokerSeason.ts");
const DAY = 86400000;

test("season XP includes weeks in which the season view was never opened", () => {
  // A reference date in week 3 of some season, so weeks 1 and 2 are in the same season.
  let ref = new Date();
  while (season.seasonInfo(ref).weekInSeason !== 3) ref = new Date(ref.getTime() + DAY);
  const at = (weeksAgo: number) => ref.getTime() - weeksAgo * 7 * DAY;
  store.set("luxe-poker-ledger", JSON.stringify([
    { id: "a", at: at(2), amount: 120, label: "w1", status: "confirmed" },
    { id: "b", at: at(1), amount: 80, label: "w2", status: "confirmed" },
    { id: "c", at: ref.getTime(), amount: 15, label: "w3", status: "confirmed" },
  ]));
  const st = { weekSnapshots: {} as Record<string, number>, seasonXP: 0 } as Parameters<typeof season.syncWeekSnapshots>[0];
  assert.equal(season.syncWeekSnapshots(st, ref), true);
  assert.equal(st.seasonXP, 215);
});

test("a past week's snapshot never drops when the ledger has trimmed old entries", () => {
  let ref = new Date();
  while (season.seasonInfo(ref).weekInSeason !== 2) ref = new Date(ref.getTime() + DAY);
  const lastWeek = (season as unknown as { seasonInfo: (d: Date) => { week: string } }).seasonInfo(new Date(ref.getTime() - 7 * DAY)).week;
  store.set("luxe-poker-ledger", "[]");
  const st = { weekSnapshots: { [lastWeek]: 300 }, seasonXP: 300 } as Parameters<typeof season.syncWeekSnapshots>[0];
  season.syncWeekSnapshots(st, ref);
  assert.equal(st.weekSnapshots[lastWeek], 300);
  assert.equal(st.seasonXP, 300);
});

test("backfilling a past season never lowers its final week, even if the ledger was trimmed", () => {
  // ref is not the live week (as at rollover, where ref is the finished season's
  // final week); search forward so the loop always terminates.
  let ref = new Date(Date.now() + 7 * DAY);
  while (season.seasonInfo(ref).weekInSeason !== 4) ref = new Date(ref.getTime() + DAY);
  const finalWeek = season.seasonInfo(ref).week;
  store.set("luxe-poker-ledger", "[]");
  const st = { weekSnapshots: { [finalWeek]: 500 }, seasonXP: 500 } as Parameters<typeof season.syncWeekSnapshots>[0];
  season.syncWeekSnapshots(st, ref);
  assert.equal(st.weekSnapshots[finalWeek], 500);
  assert.equal(st.seasonXP, 500);
});
