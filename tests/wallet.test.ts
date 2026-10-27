import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balance, debit, credit, claimDaily, STARTING_CHIPS, DAILY_CHIPS } from '../api/wallet';
import { openTable, deal, act, type BjResult } from '../api/blackjackTable';
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

test('a new wallet starts with the standard chips and debits refuse overdrafts', async () => {
  const s = memoryStore();
  assert.equal(await balance(s, 'ACC-w'), STARTING_CHIPS);
  assert.deepEqual(await debit(s, 'ACC-w', 400), { ok: true, chips: STARTING_CHIPS - 400 });
  assert.deepEqual(await debit(s, 'ACC-w', 10_000), { ok: false });
  assert.equal(await balance(s, 'ACC-w'), STARTING_CHIPS - 400);
});

test('a credit adds to the balance and a non-positive debit is refused', async () => {
  const s = memoryStore();
  assert.equal(await credit(s, 'ACC-x', 250), STARTING_CHIPS + 250);
  assert.deepEqual(await debit(s, 'ACC-x', 0), { ok: false });
  assert.deepEqual(await debit(s, 'ACC-x', -5), { ok: false });
});

test('the daily chips are granted once per day', async () => {
  const s = memoryStore();
  const day1 = new Date('2026-10-27T09:00:00Z');
  const first = await claimDaily(s, 'ACC-d', day1);
  assert.deepEqual(first, { granted: true, chips: STARTING_CHIPS + DAILY_CHIPS });
  assert.deepEqual(await claimDaily(s, 'ACC-d', new Date('2026-10-27T20:00:00Z')), { granted: false, chips: STARTING_CHIPS + DAILY_CHIPS });
  assert.equal((await claimDaily(s, 'ACC-d', new Date('2026-10-28T08:00:00Z'))).granted, true);
});

test('a blackjack hand takes the reserve at the deal and pays the return on settlement', async () => {
  const s = memoryStore();
  await openTable(s, 'anon:wallet', 25);
  const dealt = await deal(s, 'anon:wallet', null, 25);
  assert.ok(dealt.ok);
  if (!dealt.ok) return;
  assert.equal(dealt.view.balance, STARTING_CHIPS - 50, 'the reserve is taken when the hand is dealt');
  let view: BjResult = dealt;
  for (let i = 0; i < 10 && view.ok && view.view.phase === 'playing'; i++) view = await act(s, 'anon:wallet', null, 'stand');
  assert.ok(view.ok && view.view.phase === 'settled');
  if (!view.ok) return;
  const you = view.view.returned ?? 0;
  assert.equal(view.view.balance, STARTING_CHIPS - 50 + you, 'the wallet is credited with what the hand returned');
});

test('a hand cannot be dealt when the wallet cannot cover the reserve', async () => {
  const s = memoryStore();
  await debit(s, 'anon:broke', STARTING_CHIPS - 40);
  await openTable(s, 'anon:broke', 25);
  assert.deepEqual(await deal(s, 'anon:broke', null, 25), { ok: false, error: 'insufficient_chips' });
});
