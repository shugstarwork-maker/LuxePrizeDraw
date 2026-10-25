import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// The account file store lives under process.cwd(); run against a throwaway directory.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "luxe-accounts-"));
process.chdir(dir);
delete process.env.KV_REST_API_URL;
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

test("a successful sign-in clears earlier failures", async () => {
  await accounts.createAccount("reset@luxeprize.test", "long-password-4", "R");
  for (let i = 0; i < 9; i++) await accounts.login("reset@luxeprize.test", "wrong-password");
  assert.ok((await accounts.login("reset@luxeprize.test", "long-password-4")).ok);
  for (let i = 0; i < 9; i++) await accounts.login("reset@luxeprize.test", "wrong-password");
  assert.ok((await accounts.login("reset@luxeprize.test", "long-password-4")).ok);
});
