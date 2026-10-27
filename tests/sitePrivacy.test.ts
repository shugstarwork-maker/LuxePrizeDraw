import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { readFileSync } from "node:fs";
import { codeMatches, installSitePrivacy, requestHasSiteAccess, siteAccessExempt, siteAccessSeal, siteIsPrivate } from "../api/sitePrivacy";

const originalEnv = { NODE_ENV: process.env.NODE_ENV, SITE_ACCESS_CODE: process.env.SITE_ACCESS_CODE };

test.afterEach(() => {
  if (originalEnv.NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalEnv.NODE_ENV;
  if (originalEnv.SITE_ACCESS_CODE === undefined) delete process.env.SITE_ACCESS_CODE;
  else process.env.SITE_ACCESS_CODE = originalEnv.SITE_ACCESS_CODE;
});

test("production is private even before an access code is chosen", () => {
  delete process.env.SITE_ACCESS_CODE;
  process.env.NODE_ENV = "production";
  assert.equal(siteIsPrivate(), true);
  assert.equal(requestHasSiteAccess({ headers: {} }), false);
  process.env.NODE_ENV = "development";
  delete process.env.SITE_ACCESS_CODE;
  assert.equal(siteIsPrivate(), false);
  assert.equal(requestHasSiteAccess({ headers: {} }), true);
});

test("the access cookie matches only the configured code", () => {
  process.env.SITE_ACCESS_CODE = "owner-door-1944";
  process.env.NODE_ENV = "development";
  assert.equal(codeMatches("owner-door-1944", "owner-door-1944"), true);
  assert.equal(codeMatches("guess", "owner-door-1944"), false);
  const seal = siteAccessSeal("owner-door-1944");
  assert.equal(requestHasSiteAccess({ headers: { cookie: `luxe_site_access=${seal}` } }), true);
  assert.equal(requestHasSiteAccess({ headers: { cookie: "luxe_site_access=nope" } }), false);
});

test("health, stripe and the ticket worker stay outside the public gate", () => {
  assert.equal(siteAccessExempt("GET", "/health"), true);
  assert.equal(siteAccessExempt("POST", "/api/stripe/webhook"), true);
  assert.equal(siteAccessExempt("POST", "/api/ticket-draws/worker"), true);
  assert.equal(siteAccessExempt("GET", "/draws"), false);
  assert.equal(siteAccessExempt("GET", "/api/launch-readiness"), false);
});

test("a private server hides the catalogue and opens only with the access code", async () => {
  process.env.NODE_ENV = "production";
  process.env.SITE_ACCESS_CODE = "velvet-key";
  const app = express();
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  installSitePrivacy(app);
  app.get("/draws", (_req, res) => res.type("html").send("<h1>Draws</h1>"));
  app.get("/api/launch-readiness", (_req, res) => res.json({ launchReady: false }));
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  const base = `http://127.0.0.1:${port}`;
  try {
    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    const page = await fetch(`${base}/draws`);
    const html = await page.text();
    assert.equal(page.status, 401);
    assert.match(html, /Private preview/);
    assert.doesNotMatch(html, /velvet-key/);
    const api = await fetch(`${base}/api/launch-readiness`);
    assert.equal(api.status, 401);
    const denied = await fetch(`${base}/api/site-access`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: "wrong" }) });
    assert.equal(denied.status, 401);
    const opened = await fetch(`${base}/api/site-access`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: "velvet-key" }) });
    assert.equal(opened.status, 200);
    const cookie = opened.headers.get("set-cookie") ?? "";
    assert.match(cookie, /luxe_site_access=/);
    assert.match(cookie, /HttpOnly/);
    const inside = await fetch(`${base}/draws`, { headers: { cookie: cookie.split(";")[0] } });
    assert.equal(inside.status, 200);
    assert.match(await inside.text(), /Draws/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
});

test("the production server installs the privacy gate after the health route", () => {
  const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8");
  const health = server.indexOf('app.get("/health"');
  const gate = server.indexOf("installSitePrivacy(app)");
  assert.ok(health > -1 && gate > health);
  const poker = readFileSync(new URL("../api/pokerMultiplayer.ts", import.meta.url), "utf8");
  assert.match(poker, /if \(!requestHasSiteAccess\(req\)\) \{ ws\.close\(\); return; \}/);
});
