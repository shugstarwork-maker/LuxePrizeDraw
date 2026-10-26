import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openTable, deal, act } from '../api/bragTable';
import { worldStanding } from '../api/worldRanking';
import type { Store } from '../api/accounts';

function memoryStore(): Store {
  const data = new Map<string, string>();
  const counts = new Map<string, number>();
  return {
    async get(k) { return data.get(k) ?? null; },
    async set(k, v) { data.set(k, v); },
    async take(k) { const v = data.get(k) ?? null; data.delete(k); return v; },
    async incr(k) { const n = (counts.get(k) ?? 0) + 1; counts.set(k, n); return n; },
  } as unknown as Store;
}

test('the dealer cards are hidden and the deck is never sent until the hand is revealed', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:e', 25);
  const r = await deal(s, 'anon:e', null, 25);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal('deck' in r.view, false);
  assert.equal(r.view.dealerRevealed, false);
  assert.equal(r.view.dealer.length, 3);
  assert.ok(r.view.dealer.every((c) => c.value === 0));
});

test('antes outside the table limits are refused and a hand must be decided before the next', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:f', 25);
  assert.deepEqual(await deal(s, 'anon:f', null, 5), { ok: false, error: 'bad_bet' });
  assert.deepEqual(await deal(s, 'anon:f', null, 300), { ok: false, error: 'bad_bet' });
  assert.ok((await deal(s, 'anon:f', null, 25)).ok);
  assert.deepEqual(await deal(s, 'anon:f', null, 25), { ok: false, error: 'hand_in_progress' });
});

test('play and fold are only allowed while the hand is waiting for the player', async () => {
  const s = memoryStore();
  assert.deepEqual(await act(s, 'anon:g', null, 'play'), { ok: false, error: 'no_table' });
  await openTable(s, 'anon:g', 50);
  assert.deepEqual(await act(s, 'anon:g', null, 'bluff'), { ok: false, error: 'bad_action' });
  assert.deepEqual(await act(s, 'anon:g', null, 'play'), { ok: false, error: 'not_your_turn' });
});

test('a signed-in hand is decided once and recorded in the world ranking', async () => {
  const s = memoryStore();
  await openTable(s, 'ACC-brag', 25);
  const dealt = await deal(s, 'ACC-brag', 'Ivy', 25);
  assert.ok(dealt.ok);
  const decided = await act(s, 'ACC-brag', 'Ivy', 'fold');
  assert.ok(decided.ok);
  if (!decided.ok) return;
  assert.equal(decided.view.phase, 'settled');
  assert.equal(decided.view.dealerRevealed, true);
  assert.equal((await worldStanding(s, 'ACC-brag')).perGame.brag.games, 1);
  assert.deepEqual(await act(s, 'ACC-brag', 'Ivy', 'fold'), { ok: false, error: 'not_your_turn' });
  assert.equal((await worldStanding(s, 'ACC-brag')).perGame.brag.games, 1);
});

test('anonymous brag hands are played but not ranked', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:h', 25);
  await deal(s, 'anon:h', null, 25);
  await act(s, 'anon:h', null, 'play');
  assert.equal((await worldStanding(s, 'anon:h')).total, 0);
});
