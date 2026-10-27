// Runs the account flow against a real Redis when REDIS_URL is set (for example Render Key Value).
// Skipped otherwise, so the suite still runs without a database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { after } from 'node:test';
import { createAccount, login, profileForToken, logout, closeAccountStore } from '../api/accounts';

const url = process.env.REDIS_URL;
after(() => closeAccountStore());

test('sign up, sign in and sign out work against Redis', { skip: url ? false : 'REDIS_URL not set' }, async () => {
  const email = `redis-test-${Date.now()}@example.com`;
  const created = await createAccount(email, 'Test-pass-12345', 'Redis Test');
  assert.ok(created.ok);
  if (!created.ok) return;
  const profile = await profileForToken(created.token);
  assert.equal(profile?.email, email);
  const again = await login(email, 'Test-pass-12345');
  assert.ok(again.ok);
  if (again.ok) await logout(again.token);
  assert.equal(await profileForToken(again.ok ? again.token : ''), null);
});
