import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openTable, deal, act, viewOf } from '../api/blackjackTable';
import { worldStanding } from '../api/worldRanking';
import { createBjTable } from '../src/games/blackjack';
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

test('the server view never includes the deck or the dealer hole card', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:a', 25);
  const r = await deal(s, 'anon:a', null, 25);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal('deck' in r.view, false);
  if (r.view.phase === 'playing') {
    assert.equal(r.view.dealerHoleHidden, true);
    assert.equal(r.view.dealer[1].suit, '♠');
    assert.equal(r.view.dealer[1].value, 0);
  }
});

test('bets outside the table limits are refused and only one hand can be in play', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:b', 25);
  assert.deepEqual(await deal(s, 'anon:b', null, 10), { ok: false, error: 'bad_bet' });
  assert.deepEqual(await deal(s, 'anon:b', null, 260), { ok: false, error: 'bad_bet' });
  assert.deepEqual(await deal(s, 'anon:b', null, 25.5), { ok: false, error: 'bad_bet' });
  const first = await deal(s, 'anon:b', null, 25);
  assert.ok(first.ok);
  if (first.ok && first.view.phase === 'playing') {
    assert.deepEqual(await deal(s, 'anon:b', null, 25), { ok: false, error: 'hand_in_progress' });
  }
});

test('actions are rejected for unknown tables and unknown moves', async () => {
  const s = memoryStore();
  assert.deepEqual(await act(s, 'anon:c', null, 'hit'), { ok: false, error: 'no_table' });
  await openTable(s, 'anon:c', 50);
  assert.deepEqual(await act(s, 'anon:c', null, 'split'), { ok: false, error: 'bad_action' });
});

test('a settled hand is recorded once in the world ranking for signed-in players', async () => {
  const s = memoryStore();
  await openTable(s, 'ACC-9', 25);
  let view = await deal(s, 'ACC-9', 'Hal', 25);
  for (let i = 0; i < 10 && view.ok && view.view.phase === 'playing'; i++) {
    view = await act(s, 'ACC-9', 'Hal', 'stand');
  }
  assert.ok(view.ok);
  if (!view.ok) return;
  assert.equal(view.view.phase, 'settled');
  const standing = await worldStanding(s, 'ACC-9');
  const games = standing.perGame.blackjack.games;
  assert.equal(games, 1);
  // Settled hands cannot be settled again.
  assert.deepEqual(await act(s, 'ACC-9', 'Hal', 'stand'), { ok: false, error: 'not_your_turn' });
  assert.equal((await worldStanding(s, 'ACC-9')).perGame.blackjack.games, 1);
});

test('anonymous hands are played on the server but not ranked', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:d', 25);
  let view = await deal(s, 'anon:d', null, 25);
  for (let i = 0; i < 10 && view.ok && view.view.phase === 'playing'; i++) view = await act(s, 'anon:d', null, 'stand');
  assert.ok(view.ok);
  assert.equal((await worldStanding(s, 'anon:d')).total, 0);
});

test('the view strips the deck from a table state', () => {
  const state = createBjTable({ playerChips: 0, botCount: 2, botChips: 1000, minBet: 25 });
  assert.equal('deck' in viewOf(state), false);
});
