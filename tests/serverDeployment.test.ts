import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { engines?: { node?: string } };
const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
const nvmrc = readFileSync(new URL("../.nvmrc", import.meta.url), "utf8").trim();
const submission = readFileSync(new URL("../docs/app-store-submission.md", import.meta.url), "utf8");

test("runtime is locked to an LTS Node (v20+) everywhere", () => {
  assert.ok(pkg.engines?.node, "package.json must declare engines.node");
  assert.match(pkg.engines!.node!, />=20/);
  assert.equal(nvmrc, "20");
  assert.match(dockerfile, /FROM node:20-slim/);
});

test("NODE_ENV=production is enforced in the image and gates secure behaviour", () => {
  assert.match(dockerfile, /ENV NODE_ENV=production/);
  // production branch serves the built bundle, never the dev middleware
  assert.match(server, /if \(process\.env\.NODE_ENV !== "production"\)/);
});

test("production refuses a non-SSL database handshake", () => {
  assert.match(server, /NODE_ENV === "production" && databaseUrl && !\/\[\?&\]sslmode=/);
  assert.match(server, /must enforce SSL/);
});

test("app store pack exists with review-mode disclosure and no-gambling statements", () => {
  assert.match(submission, /Review Mode/);
  assert.match(submission, /No real-money gambling is present/);
  assert.match(submission, /No purchase is ever required/);
  assert.match(submission, /GamCare,\s*\n?BeGambleAware and GAMSTOP|GamCare, BeGambleAware and GAMSTOP/);
  assert.match(submission, /UK Gambling Act 2005/);
});
