import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openTable, deal, act, leave, current, tableDef, HOLDEM_TURN_TIMEOUT_MS } from '../api/holdemTable';
import { balance, STARTING_CHIPS } from '../api/wallet';
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

const tier = 'league:1'; // 25/50, buy-in 500
const buyIn = tableDef(tier)!.buyIn;

test('sitting down takes the buy-in from the wallet', async () => {
  const s = memoryStore();
  const r = await openTable(s, 'anon:poker-a', tier);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.view.balance, STARTING_CHIPS - buyIn);
    assert.equal('deck' in r.view.state, false);
  }
  assert.deepEqual(await openTable(s, 'anon:poker-a', tier), { ok: false, error: 'already_seated' });
});

test('a buy-in the wallet cannot cover is refused', async () => {
  const s = memoryStore();
  assert.deepEqual(await openTable(s, 'anon:poker-b', 'league:4'), { ok: false, error: 'insufficient_chips' });
  assert.deepEqual(await openTable(s, 'anon:poker-b', 'league:99'), { ok: false, error: 'bad_table' });
});

test('chips are conserved across hands: the table total never changes', async () => {
  const s = memoryStore();
  // Once a hand is over its winnings are already in the stacks; the pot field is stale, so count it only mid-hand.
  const total = (state: { players: { chips: number }[]; pot: number; handOver: boolean }) => state.players.reduce((n, p) => n + p.chips, 0) + (state.handOver ? 0 : state.pot);
  await openTable(s, 'anon:poker-c', tier);
  const expected = buyIn * 6;
  let dealt = await deal(s, 'anon:poker-c');
  assert.ok(dealt.ok);
  for (let hand = 0; hand < 3 && dealt.ok; hand++) {
    for (let i = 0; i < 200 && dealt.ok && !dealt.view.state.handOver; i++) {
      const v = dealt.view;
      assert.equal(total(v.state), expected, 'total chips on the table stay the same during the hand');
      dealt = v.state.players[v.state.turnIndex]?.id === 'you' ? await act(s, 'anon:poker-c', 'call', 0) : dealt;
      if (dealt.ok && dealt.view.state.handOver) break;
      if (dealt.ok && dealt.view.state.players[dealt.view.state.turnIndex]?.id !== 'you') break;
    }
    if (!dealt.ok) break;
    assert.equal(total(dealt.view.state), expected, 'total chips stay the same after the hand');
    if (dealt.view.state.handOver) dealt = await deal(s, 'anon:poker-c');
  }
  assert.ok(dealt.ok);
});

test('social tables are available with their own buy-in', async () => {
  const s = memoryStore();
  const r = await openTable(s, 'anon:poker-s', 'rookie');
  assert.ok(r.ok && r.view.table.buyIn === 100);
});

test('leaving returns the stack to the wallet and closes the table', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:poker-d', tier);
  const out = await leave(s, 'anon:poker-d');
  assert.ok(out.ok);
  assert.equal(await balance(s, 'anon:poker-d'), STARTING_CHIPS, 'an unplayed buy-in comes back');
  assert.deepEqual(await current(s, 'anon:poker-d'), null);
});

test('a player who sits on their turn past the timeout is folded', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:poker-e', tier);
  const dealt = await deal(s, 'anon:poker-e');
  assert.ok(dealt.ok);
  if (!dealt.ok || dealt.view.state.handOver) return;
  const later = Date.now() + HOLDEM_TURN_TIMEOUT_MS + 1000;
  const timed = await current(s, 'anon:poker-e', later);
  assert.ok(timed && timed.ok && timed.view.state.handOver, 'the hand ends once the player times out');
});
