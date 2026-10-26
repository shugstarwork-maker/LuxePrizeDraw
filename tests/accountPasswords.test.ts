import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

const { hashPassword, verifyPassword, needsRehash } = await import("../api/accounts.ts");

test("new passwords are scrypt-hashed and verify", async () => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await hashPassword("correct horse battery", salt);
  assert.match(hash, /^scrypt\$32768\$8\$1\$[0-9a-f]{64}$/);
  assert.equal(needsRehash(hash), false);
  assert.equal(await verifyPassword("correct horse battery", salt, hash), true);
  assert.equal(await verifyPassword("wrong password", salt, hash), false);
});

test("legacy SHA-256 hashes still verify and are flagged for re-hashing", async () => {
  const salt = "abc123";
  const legacy = crypto.createHash("sha256").update(`${salt}:hunter2hunter2`).digest("hex");
  assert.equal(needsRehash(legacy), true);
  assert.equal(await verifyPassword("hunter2hunter2", salt, legacy), true);
  assert.equal(await verifyPassword("nope-nope", salt, legacy), false);
});

test("malformed stored hashes never verify", async () => {
  assert.equal(await verifyPassword("anything", "salt", "scrypt$32768$8$1$"), false);
  assert.equal(await verifyPassword("anything", "salt", ""), false);
});
