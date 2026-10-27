import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The account file store lives under process.cwd(); run against a throwaway directory.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "luxe-accounts-"));
process.chdir(dir);
delete process.env.KV_REST_API_URL;
delete process.env.REDIS_URL;
delete process.env.KV_REST_API_TOKEN;
const accounts = await import("../api/accounts.ts");
const storeFile = path.join(dir, "data", "accounts.json");
test.after(() => fs.rmSync(dir, { recursive: true, force: true }));

test("sign out everywhere revokes every session for the account", async () => {
  const created = await accounts.createAccount("everywhere@luxeprize.test", "long-password-1", "E");
  assert.ok(created.ok);
  const second = await accounts.login("everywhere@luxeprize.test", "long-password-1");
  assert.ok(second.ok);
  assert.ok(await accounts.profileForToken(created.token));
  assert.equal(await accounts.logoutEverywhere(second.token), true);
  assert.equal(await accounts.profileForToken(created.token), null);
  assert.equal(await accounts.profileForToken(second.token), null);
  const fresh = await accounts.login("everywhere@luxeprize.test", "long-password-1");
  assert.ok(fresh.ok && (await accounts.profileForToken(fresh.token)));
});

test("sessions in the old bare-id format are no longer accepted", async () => {
  const created = await accounts.createAccount("legacy@luxeprize.test", "long-password-2", "L");
  assert.ok(created.ok);
  const all = JSON.parse(fs.readFileSync(storeFile, "utf8"));
  const legacyToken = "a".repeat(64);
  all[`sess:${legacyToken}`] = { value: created.profile.id };
  fs.writeFileSync(storeFile, JSON.stringify(all));
  assert.equal(await accounts.profileForToken(legacyToken), null);
});

test("repeated failed sign-ins are refused until the window expires", async () => {
  const created = await accounts.createAccount("locked@luxeprize.test", "long-password-3", "K");
  assert.ok(created.ok);
  for (let i = 0; i < 10; i++) {
    const out = await accounts.login("locked@luxeprize.test", "wrong-password");
    assert.deepEqual(out, { ok: false, error: "bad_credentials" });
  }
  assert.deepEqual(await accounts.login("locked@luxeprize.test", "long-password-3"), { ok: false, error: "too_many_attempts" });
});

test("the lockout expires with its window, even after many failures", async () => {
  await accounts.createAccount("expiry@luxeprize.test", "long-password-5", "X");
  for (let i = 0; i < 12; i++) await accounts.login("expiry@luxeprize.test", "wrong-password");
  const all = JSON.parse(fs.readFileSync(storeFile, "utf8"));
  const entry = all["attempts:expiry@luxeprize.test"];
  assert.ok(entry.expiresAt, "the counter always has an expiry");
  assert.ok(entry.expiresAt <= Date.now() + 15 * 60 * 1000 + 1000);
  entry.expiresAt = Date.now() - 1;
  fs.writeFileSync(storeFile, JSON.stringify(all));
  assert.ok((await accounts.login("expiry@luxeprize.test", "long-password-5")).ok);
});

test("parallel wrong guesses can't get past the attempt limit", async () => {
  await accounts.createAccount("parallel@luxeprize.test", "long-password-7", "P");
  const results = await Promise.all(Array.from({ length: 30 }, () => accounts.login("parallel@luxeprize.test", "wrong-password")));
  const checked = results.filter((r) => !r.ok && (r as { error: string }).error === "bad_credentials").length;
  assert.equal(checked, 10, "only 10 guesses are actually checked");
  assert.deepEqual(await accounts.login("parallel@luxeprize.test", "long-password-7"), { ok: false, error: "too_many_attempts" });
});

test("a sign-in finishing after sign out everywhere does not undo the revocation", async () => {
  const created = await accounts.createAccount("race@luxeprize.test", "long-password-6", "Q");
  const other = await accounts.login("race@luxeprize.test", "long-password-6");
  assert.ok(created.ok && other.ok);
  const pending = accounts.login("race@luxeprize.test", "long-password-6");
  // Revoke while the sign-in is busy hashing (after it has read the account record).
  await new Promise((r) => setTimeout(r, 15));
  assert.equal(await accounts.logoutEverywhere(created.token), true);
  await pending;
  assert.equal(await accounts.profileForToken(other.token), null);
});

test("a successful sign-in clears earlier failures", async () => {
  await accounts.createAccount("reset@luxeprize.test", "long-password-4", "R");
  for (let i = 0; i < 9; i++) await accounts.login("reset@luxeprize.test", "wrong-password");
  assert.ok((await accounts.login("reset@luxeprize.test", "long-password-4")).ok);
  for (let i = 0; i < 9; i++) await accounts.login("reset@luxeprize.test", "wrong-password");
  assert.ok((await accounts.login("reset@luxeprize.test", "long-password-4")).ok);
});
