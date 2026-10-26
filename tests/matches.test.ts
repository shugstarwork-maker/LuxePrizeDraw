import { test } from 'node:test';
import assert from 'node:assert/strict';
import { joinQueue, makeMove, currentMatch, MOVE_TIMEOUT_MS } from '../api/matches';
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

const ana = { id: 'ACC-a', name: 'Ana' };
const ben = { id: 'ACC-b', name: 'Ben' };

async function pairedChess(s: Store, now = 1000) {
  const first = await joinQueue(s, ana, 'chess', now);
  assert.ok(first.ok && first.waiting);
  const second = await joinQueue(s, ben, 'chess', now);
  assert.ok(second.ok && second.view);
  return second.ok && second.view ? second.view.matchId : '';
}

test('two players in the queue are paired, and the first player is side a', async () => {
  const s = memoryStore();
  await pairedChess(s);
  const a = await currentMatch(s, ana.id, 1000);
  const b = await currentMatch(s, ben.id, 1000);
  assert.ok(a.ok && a.view && b.ok && b.view);
  if (a.ok && a.view && b.ok && b.view) {
    assert.equal(a.view.you, 'a');
    assert.equal(b.view.you, 'b');
    assert.equal(a.view.turn, 'a');
    assert.equal(a.view.opponent, 'Ben');
  }
});

test('moves are checked for turn and legality by the server', async () => {
  const s = memoryStore();
  const id = await pairedChess(s);
  assert.deepEqual(await makeMove(s, ben.id, id, { from: 'e7', to: 'e5' }, 1000), { ok: false, error: 'not_your_turn' });
  assert.deepEqual(await makeMove(s, ana.id, id, { from: 'e2', to: 'e5' }, 1000), { ok: false, error: 'illegal_move' });
  const ok = await makeMove(s, ana.id, id, { from: 'e2', to: 'e4' }, 1000);
  assert.ok(ok.ok && ok.view && ok.view.turn === 'b');
});

test('a player outside the match cannot move in it', async () => {
  const s = memoryStore();
  const id = await pairedChess(s);
  assert.deepEqual(await makeMove(s, 'ACC-x', id, { from: 'e2', to: 'e4' }, 1000), { ok: false, error: 'not_in_match' });
});

test('a finished connect four game ranks both players once', async () => {
  const s = memoryStore();
  await joinQueue(s, ana, 'connect4', 1000);
  await joinQueue(s, ben, 'connect4', 1000);
  // Red (a) plays column 0 and yellow (b) plays column 1 four times, giving red four in column 0.
  const plays = [0, 1, 0, 1, 0, 1, 0];
  let last: Awaited<ReturnType<typeof makeMove>> | null = null;
  for (let i = 0; i < plays.length; i++) {
    const who = i % 2 === 0 ? ana.id : ben.id;
    last = await makeMove(s, who, (await currentMatch(s, ana.id, 1000)).ok && (await currentMatch(s, ana.id, 1000)).view ? (await currentMatch(s, ana.id, 1000)).view!.matchId : '', { column: plays[i] }, 1000);
  }
  assert.ok(last && last.ok && last.view && last.view.status === 'finished' && last.view.winner === 'a');
  assert.equal((await worldStanding(s, ana.id, new Date(1000))).perGame.connect4.wins, 1);
  assert.equal((await worldStanding(s, ben.id, new Date(1000))).perGame.connect4.wins, 0);
  assert.equal((await worldStanding(s, ben.id, new Date(1000))).perGame.connect4.games, 1);
});

test('a player who runs out of time forfeits, and the result is ranked', async () => {
  const s = memoryStore();
  const id = await pairedChess(s, 1000);
  const late = 1000 + MOVE_TIMEOUT_MS + 1;
  const out = await makeMove(s, ana.id, id, { from: 'e2', to: 'e4' }, late);
  assert.deepEqual(out, { ok: false, error: 'timed_out' });
  const view = await currentMatch(s, ben.id, late);
  assert.ok(view.ok && view.view && view.view.winner === 'b' && view.view.status === 'finished');
  assert.equal((await worldStanding(s, ben.id, new Date(late))).perGame.chess.wins, 1);
});

test('a finished game does not block joining the queue again', async () => {
  const s = memoryStore();
  const id = await pairedChess(s, 1000);
  assert.ok(id);
  const late = 1000 + MOVE_TIMEOUT_MS + 1;
  await makeMove(s, ana.id, id, { from: 'e2', to: 'e4' }, late);
  const again = await joinQueue(s, ana, 'chess', late);
  assert.ok(again.ok && again.waiting, 'a new queue entry should wait, not return the finished game');
});

test('unknown games are refused', async () => {
  assert.deepEqual(await joinQueue(memoryStore(), ana, 'poker' as never, 1000), { ok: false, error: 'bad_game' });
});
