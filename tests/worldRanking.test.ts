import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordWorldResult, worldRanking, worldStanding, weekStart, WORLD_DAILY_XP_CAP, WORLD_RESULTS_PER_HOUR } from '../api/worldRanking';
import type { Store } from '../api/accounts';

function memoryStore(): Store {
  const data = new Map<string, string>();
  return {
    async get(k) { return data.get(k) ?? null; },
    async set(k, v) { data.set(k, v); },
    async take(k) { const v = data.get(k) ?? null; data.delete(k); return v; },
    async incr(k) { const n = Number(data.get(k) ?? 0) + 1; data.set(k, String(n)); return n; },
  } as unknown as Store;
}

const monday = new Date('2026-10-26T10:00:00Z'); // a Monday

test('the server awards XP by outcome and rejects unknown games and outcomes', async () => {
  const s = memoryStore();
  const win = await recordWorldResult(s, 'ACC-1', 'Ana', 'blackjack', 'win', monday);
  assert.deepEqual(win, { ok: true, awarded: 10, weekXP: 10, games: 1, wins: 1 });
  assert.deepEqual(await recordWorldResult(s, 'ACC-1', 'Ana', 'poker', 'win', monday), { ok: false, error: 'bad_game' });
  assert.deepEqual(await recordWorldResult(s, 'ACC-1', 'Ana', 'chess', 'forfeit', monday), { ok: false, error: 'bad_outcome' });
});

test('a game cannot give more than the daily cap, and the cap resets the next day', async () => {
  const s = memoryStore();
  let last = { ok: true as const, awarded: 0, weekXP: 0, games: 0, wins: 0 };
  for (let i = 0; i < 20; i++) {
    const r = await recordWorldResult(s, 'ACC-2', 'Ben', 'chess', 'win', new Date('2026-10-26T12:00:00Z'));
    if (r.ok) last = r;
  }
  assert.equal(last.weekXP, WORLD_DAILY_XP_CAP);
  const nextDay = await recordWorldResult(s, 'ACC-2', 'Ben', 'chess', 'win', new Date('2026-10-27T12:00:00Z'));
  assert.ok(nextDay.ok && nextDay.awarded === 10);
});

test('results are limited per account per hour', async () => {
  const s = memoryStore();
  const at = new Date('2026-10-26T09:30:00Z');
  for (let i = 0; i < WORLD_RESULTS_PER_HOUR; i++) await recordWorldResult(s, 'ACC-3', 'Cy', 'brag', 'loss', at);
  assert.deepEqual(await recordWorldResult(s, 'ACC-3', 'Cy', 'brag', 'loss', at), { ok: false, error: 'rate_limited' });
});

test('the ranking adds up real results across games and never lists players without XP', async () => {
  const s = memoryStore();
  await recordWorldResult(s, 'ACC-4', 'Dee', 'chess', 'win', monday);
  await recordWorldResult(s, 'ACC-4', 'Dee', 'connect4', 'draw', monday);
  await recordWorldResult(s, 'ACC-5', 'Eli', 'brag', 'loss', monday);
  const all = await worldRanking(s, 'all', 50, monday);
  assert.deepEqual(all.map((r) => [r.rank, r.name, r.xp]), [[1, 'Dee', 14], [2, 'Eli', 2]]);
  const chessOnly = await worldRanking(s, 'chess', 50, monday);
  assert.deepEqual(chessOnly.map((r) => r.name), ['Dee']);
});

test('a standing shows each game separately', async () => {
  const s = memoryStore();
  await recordWorldResult(s, 'ACC-6', 'Fay', 'draughts', 'win', monday);
  const me = await worldStanding(s, 'ACC-6', monday);
  assert.equal(me.total, 10);
  assert.deepEqual(me.perGame.draughts, { xp: 10, games: 1, wins: 1 });
  assert.deepEqual(me.perGame.chess, { xp: 0, games: 0, wins: 0 });
});

test('weeks start on Monday and results from a new week start fresh', async () => {
  assert.equal(weekStart(new Date('2026-10-28T23:00:00Z')), '2026-10-26');
  const s = memoryStore();
  await recordWorldResult(s, 'ACC-7', 'Gus', 'blackjack', 'win', monday);
  const nextWeek = await worldRanking(s, 'all', 50, new Date('2026-11-02T10:00:00Z'));
  assert.deepEqual(nextWeek, []);
});
