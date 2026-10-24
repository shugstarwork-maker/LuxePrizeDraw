import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// localStorage stub
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

const v = await import("../src/lib/verification.ts");
const sql = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

// ── Schema SQL covers every compliance module ───────────────────────────────

test("schema defines all core verification tables", () => {
  for (const table of ["users", "device_fingerprints", "phone_verifications", "kyc_verifications", "payout_methods", "withdrawals", "collusion_signals", "enforcement_actions", "redemption_items", "redemption_orders"]) {
    assert.match(sql, new RegExp(`create table ${table} `), `missing table ${table}`);
  }
});

test("Module A: one phone and one payout method per person, enforced by unique locks", () => {
  assert.match(sql, /phone_e164\s+text not null unique/);
  assert.match(sql, /account_hash\s+text not null unique/);           // duplicate PayPal lock
  assert.match(sql, /create index device_fingerprints_hash_idx/);     // cross-account device lookup
});

test("Module B: at most one approved KYC per user", () => {
  assert.match(sql, /create unique index kyc_one_approved_per_user[\s\S]*where status = 'approved'/);
  assert.match(sql, /check \(provider in \('yoti','veriff','onfido'\)\)/);
});

test("withdrawals enforce £20 minimum and require approved KYC", () => {
  assert.match(sql, /amount_pence\s+integer not null check \(amount_pence >= 2000\)/);
  assert.match(sql, /constraint withdrawals_requires_kyc check \(kyc_approved_at is not null\)/);
});

test("£500 daily cap is computed from a daily-totals view", () => {
  assert.match(sql, /create view v_daily_withdrawal_totals/);
  assert.match(sql, /date_trunc\('day', requested_at\)/);
});

test("Module C: collusion signals link two distinct users", () => {
  assert.match(sql, /signal_type in\s*\('shared_device','shared_ip','shared_wifi','shared_payout','shared_phone'\)/);
  assert.match(sql, /check \(user_id_a <> user_id_b\)/);
});

// ── TS mirror stays in sync with the SQL ────────────────────────────────────

test("SCHEMA_MAP covers every table in the SQL file", () => {
  const sqlTables = [...sql.matchAll(/create table (\w+) /g)].map((m) => m[1]);
  const mapped = v.SCHEMA_MAP.map((t) => t.name);
  for (const t of sqlTables) assert.ok(mapped.includes(t), `${t} missing from SCHEMA_MAP`);
  assert.equal(mapped.length, sqlTables.length);
});

test("withdrawal thresholds match the schema constants", () => {
  assert.equal(v.WITHDRAWAL_MIN_PENCE, 2000);
  assert.equal(v.WITHDRAWAL_DAILY_CAP_PENCE, 50000);
});

test("demo device fingerprint is stable and anonymous", () => {
  store.clear();
  const a = v.demoDeviceFingerprint();
  const b = v.demoDeviceFingerprint();
  assert.equal(a, b);
  assert.match(a, /^demo-[0-9a-f]{16}$/);
});

test("verification checklist: account done, device demo, providers locked", () => {
  const steps = v.verificationSteps();
  assert.equal(steps.length, 5);
  const byId = Object.fromEntries(steps.map((s) => [s.id, s.status]));
  assert.equal(byId.account, "done");
  assert.equal(byId.device, "demo");
  assert.equal(byId.sms, "locked");
  assert.equal(byId.kyc, "locked");
  assert.equal(byId.payout, "locked");
  const progress = v.verificationProgress(steps);
  assert.ok(progress > 0 && progress < 100, "progress must reflect partial completion");
});

const component = readFileSync(new URL("../src/components/VerificationCenter.tsx", import.meta.url), "utf8");

test("VerificationCenter renders progress, steps, schema map and honesty footer", () => {
  assert.match(component, /data-testid="verify-progress"/);
  assert.match(component, /data-testid="verify-steps"/);
  assert.match(component, /data-testid="schema-map"/);
  assert.match(component, /data-testid="payout-policy"/);
  assert.match(component, /Pre-launch simulation/);
  assert.match(component, /no decisions are enforced yet/i);
});
