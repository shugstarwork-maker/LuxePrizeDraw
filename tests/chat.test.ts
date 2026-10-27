import { test } from 'node:test';
import assert from 'node:assert/strict';
import { postMessage, listMessages, report, blockAuthor, banAccount, unbanAccount, confirmAge, openReports, resolveReport, findBlockedWord, CHAT_PER_MINUTE } from '../api/chat';
import type { Store } from '../api/accounts';

function memoryStore(): Store {
  const data = new Map<string, string>();
  return {
    async get(k) { return data.get(k) ?? null; },
    async set(k, v) { data.set(k, v); },
    async take(k) { const v = data.get(k) ?? null; data.delete(k); return v; },
    async incr(k) { const n = Number(data.get(k) ?? 0) + 1; data.set(k, String(n)); return n; },
    async del(k) { data.delete(k); },
  } as unknown as Store;
}

const ana = { id: 'ACC-ana', name: 'Ana' };
const ben = { id: 'ACC-ben', name: 'Ben' };

function withChat(on: boolean, fn: () => Promise<void>) {
  return async () => {
    const before = process.env.CHAT_ENABLED;
    process.env.CHAT_ENABLED = on ? 'true' : 'false';
    try { await fn(); } finally { if (before === undefined) delete process.env.CHAT_ENABLED; else process.env.CHAT_ENABLED = before; }
  };
}

test('chat is off unless switched on', withChat(false, async () => {
  const s = memoryStore();
  await confirmAge(s, ana.id);
  assert.deepEqual(await postMessage(s, ana, 'hello'), { ok: false, error: 'chat_disabled' });
}));

test('a player must confirm they are 18 or over before posting', withChat(true, async () => {
  const s = memoryStore();
  assert.deepEqual(await postMessage(s, ana, 'hello'), { ok: false, error: 'age_not_confirmed' });
  await confirmAge(s, ana.id);
  assert.equal((await postMessage(s, ana, 'hello')).ok, true);
}));

test('banned words are refused and the attempt is logged', withChat(true, async () => {
  const s = memoryStore();
  await confirmAge(s, ana.id);
  assert.deepEqual(await postMessage(s, ana, 'you should KYS'), { ok: false, error: 'blocked_words' });
  assert.equal(findBlockedWord('k y s'), 'kys', 'spaced-out words are caught too');
  assert.equal(findBlockedWord('kys'), 'kys');
}));

test('posting is rate limited', withChat(true, async () => {
  const s = memoryStore();
  await confirmAge(s, ana.id);
  const now = Date.now();
  for (let i = 0; i < CHAT_PER_MINUTE; i++) assert.equal((await postMessage(s, ana, `msg ${i}`, now)).ok, true);
  assert.deepEqual(await postMessage(s, ana, 'one more', now), { ok: false, error: 'slow_down' });
}));

test('a banned account cannot post until unbanned', withChat(true, async () => {
  const s = memoryStore();
  await confirmAge(s, ana.id);
  await banAccount(s, ana.id, 'abuse of others');
  assert.deepEqual(await postMessage(s, ana, 'hi'), { ok: false, error: 'banned' });
  await unbanAccount(s, ana.id);
  assert.equal((await postMessage(s, ana, 'hi')).ok, true);
}));

test('blocking hides an author from the viewer only', withChat(true, async () => {
  const s = memoryStore();
  await confirmAge(s, ana.id); await confirmAge(s, ben.id);
  await postMessage(s, ana, 'from ana');
  await postMessage(s, ben, 'from ben');
  await blockAuthor(s, ben.id, ana.id);
  assert.deepEqual((await listMessages(s, ben.id)).map((m) => m.authorId), ['ACC-ben']);
  assert.equal((await listMessages(s, ana.id)).length, 2);
}));

test('a report is stored, logged and can be resolved', withChat(true, async () => {
  const s = memoryStore();
  await confirmAge(s, ana.id);
  const posted = await postMessage(s, ana, 'something to report');
  assert.ok(posted.ok);
  if (!posted.ok) return;
  const rep = await report(s, ben.id, posted.value.id, 'abusive');
  assert.ok(rep.ok);
  assert.equal((await openReports(s)).length, 1);
  if (rep.ok) assert.equal(await resolveReport(s, rep.value, 'upheld'), true);
  assert.equal((await openReports(s)).length, 0);
}));
