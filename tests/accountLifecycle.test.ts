import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// File-store accounts in a throwaway directory, with Resend replaced by a capture.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "luxe-lifecycle-"));
process.chdir(dir);
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;
delete process.env.REDIS_URL;
const sent: { to: string[]; text: string }[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  if (String(url) === "https://api.resend.com/emails") { sent.push(JSON.parse(String(init?.body))); return new Response("{}", { status: 200 }); }
  return realFetch(url, init);
}) as typeof fetch;
const accounts = await import("../api/accounts.ts");
test.after(() => { globalThis.fetch = realFetch; fs.rmSync(dir, { recursive: true, force: true }); });

const withEmail = () => { process.env.RESEND_API_KEY = "re_test"; process.env.MAIL_FROM = "LuxePrizeDraw <no-reply@luxeprize.test>"; process.env.APP_URL = "https://luxeprize.test"; };
const linkToken = (text: string) => /token=([0-9a-f]{64})/.exec(text)?.[1] ?? "";

test("export returns the profile without password material", async () => {
  const c = await accounts.createAccount("export@luxeprize.test", "long-password-1", "Ex");
  assert.ok(c.ok);
  const data = await accounts.exportAccount(c.token);
  const json = JSON.stringify(data);
  assert.match(json, /export@luxeprize\.test/);
  assert.doesNotMatch(json, /scrypt\$|passHash|salt/);
  assert.equal(await accounts.exportAccount("f".repeat(64)), null);
});

test("delete needs the password, then removes the account and every session", async () => {
  const c = await accounts.createAccount("delete@luxeprize.test", "long-password-2", "Del");
  const other = await accounts.login("delete@luxeprize.test", "long-password-2");
  assert.ok(c.ok && other.ok);
  assert.deepEqual(await accounts.deleteAccount(c.token, "wrong-password"), { ok: false, error: "bad_credentials" });
  assert.deepEqual(await accounts.deleteAccount(c.token, "long-password-2"), { ok: true });
  assert.equal(await accounts.profileForToken(c.token), null);
  assert.equal(await accounts.profileForToken(other.token), null);
  assert.deepEqual(await accounts.login("delete@luxeprize.test", "long-password-2"), { ok: false, error: "bad_credentials" });
  const store = fs.readFileSync(path.join(dir, "data", "accounts.json"), "utf8");
  assert.doesNotMatch(store, /acc:email:delete@/, "no email index left");
  assert.doesNotMatch(store, /\\"email\\":\\"delete@/, "no account record left");
  const again = await accounts.createAccount("delete@luxeprize.test", "long-password-3", "Back");
  assert.ok(again.ok, "the address can sign up again");
});

test("password reset is unavailable until email is configured", async () => {
  delete process.env.RESEND_API_KEY;
  assert.deepEqual(await accounts.requestPasswordReset("anyone@luxeprize.test"), { ok: false, error: "email_unavailable" });
});

test("reset emails a one-time link that sets the password and signs out everywhere", async () => {
  withEmail();
  const c = await accounts.createAccount("reset@luxeprize.test", "old-password-1", "R");
  assert.ok(c.ok);
  sent.length = 0;
  assert.deepEqual(await accounts.requestPasswordReset("Reset@LuxePrize.test"), { ok: true });
  assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].to, ["reset@luxeprize.test"]);
  const token = linkToken(sent[0].text);
  assert.match(sent[0].text, /^[\s\S]*https:\/\/luxeprize\.test\/reset-password\?token=/);
  assert.deepEqual(await accounts.confirmPasswordReset(token, "short"), { ok: false, error: "password_too_short" });
  assert.deepEqual(await accounts.confirmPasswordReset(token, "new-password-1"), { ok: true });
  assert.equal(await accounts.profileForToken(c.token), null, "old sessions are signed out");
  assert.deepEqual(await accounts.login("reset@luxeprize.test", "old-password-1"), { ok: false, error: "bad_credentials" });
  assert.ok((await accounts.login("reset@luxeprize.test", "new-password-1")).ok);
  assert.deepEqual(await accounts.confirmPasswordReset(token, "another-password"), { ok: false, error: "invalid_reset_link" }, "links are single-use");
});

test("two simultaneous uses of one reset link: only one succeeds", async () => {
  withEmail();
  await accounts.createAccount("race@luxeprize.test", "old-password-2", "R");
  sent.length = 0;
  await accounts.requestPasswordReset("race@luxeprize.test");
  const token = linkToken(sent[0].text);
  const results = await Promise.all([accounts.confirmPasswordReset(token, "first-password-1"), accounts.confirmPasswordReset(token, "second-password-1")]);
  assert.equal(results.filter((r) => r.ok).length, 1);
});

test("reset requests for unknown emails look the same and send nothing", async () => {
  withEmail();
  sent.length = 0;
  assert.deepEqual(await accounts.requestPasswordReset("nobody@luxeprize.test"), { ok: true });
  assert.equal(sent.length, 0);
});

test("reset requests are capped per email", async () => {
  withEmail();
  await accounts.createAccount("capped@luxeprize.test", "long-password-4", "C");
  sent.length = 0;
  for (let i = 0; i < 5; i++) assert.deepEqual(await accounts.requestPasswordReset("capped@luxeprize.test"), { ok: true });
  assert.equal(sent.length, 3);
});
