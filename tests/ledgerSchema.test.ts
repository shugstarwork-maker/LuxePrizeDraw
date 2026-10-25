import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("../db/schema_v2_ledger.sql", import.meta.url), "utf8");
const api = readFileSync(new URL("../docs/api-endpoints.md", import.meta.url), "utf8");
const ls = await import("../src/lib/ledgerSchema.ts");

test("extensions and all four enum types are defined exactly", () => {
  assert.match(sql, /create extension if not exists "uuid-ossp"/);
  assert.match(sql, /create type kyc_status_type as enum \('PENDING_SUBMISSION', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'\)/);
  assert.match(sql, /create type risk_tier_type as enum \('LOW', 'SHADOW_FLAG', 'MATCH_KILL', 'HARDWARE_BANNED'\)/);
  assert.match(sql, /create type payout_status_type as enum \('PENDING_REVIEW', 'PROCESSING', 'DISPATCHED', 'FAILED'\)/);
  // TS mirror matches the SQL enums member-for-member
  for (const s of ls.KYC_STATUSES) assert.ok(sql.includes(`'${s}'`));
  for (const s of ls.RISK_TIERS) assert.ok(sql.includes(`'${s}'`));
  for (const s of ls.PAYOUT_STATUSES) assert.ok(sql.includes(`'${s}'`));
});

test("users table carries the hardware hash and its multi-account index", () => {
  assert.match(sql, /device_hardware_hash VARCHAR\(64\) NOT NULL/);
  assert.match(sql, /create index idx_users_device_hash on users\(device_hardware_hash\)/);
  assert.match(sql, /create index idx_users_risk_tier on users\(risk_tier\)/);
});

test("wallet keeps the three currencies isolated with non-negative checks and defaults", () => {
  assert.match(sql, /gold_coins_balance BIGINT DEFAULT 1000 CHECK \(gold_coins_balance >= 0\)/);
  assert.match(sql, /sweep_tickets_balance INT DEFAULT 1 CHECK \(sweep_tickets_balance >= 0\)/);
  assert.match(sql, /prize_points_balance INT DEFAULT 0 CHECK \(prize_points_balance >= 0\)/);
  assert.equal(ls.WALLET_DEFAULTS.goldCoins, 1000);
  assert.equal(ls.WALLET_DEFAULTS.sweepTickets, 1);
});

test("telemetry table feeds the admin queue with the >= 75 partial index", () => {
  assert.match(sql, /engine_match_percentage NUMERIC\(5, 2\)/);
  assert.match(sql, /move_time_standard_deviation NUMERIC\(6, 3\)/);
  assert.match(sql, /app_focus_lost_count INT DEFAULT 0/);
  assert.match(sql, /calculated_risk_score BETWEEN 0 AND 100/);
  assert.match(sql, /where calculated_risk_score >= 75/);
  assert.equal(ls.RISK_KILL_THRESHOLD, 75);
});

test("prize_redemptions carries the AML review queue index", () => {
  assert.match(sql, /create index idx_payouts_review_queue on prize_redemptions\(payout_status\) where payout_status = 'PENDING_REVIEW'/);
  assert.match(sql, /equivalent_gbp_value NUMERIC\(10, 2\) NOT NULL/);
  assert.equal(ls.AML_REVIEW_GBP, 500);
});

test("Rule 1: redemption runs in a SERIALIZABLE transaction with a row lock", () => {
  assert.match(sql, /set local transaction isolation level serializable/);
  assert.match(sql, /for update;/);
  assert.match(sql, /raise exception 'insufficient prize points/);
  assert.match(api, /BEGIN ISOLATION LEVEL SERIALIZABLE/);
});

test("Rule 2: hardware-ban cascade trigger bans every account on the device hash", () => {
  assert.match(sql, /create or replace function cascade_hardware_ban\(\)/);
  assert.match(sql, /create trigger trg_users_hardware_ban_cascade/);
  assert.match(sql, /where device_hardware_hash = new\.device_hardware_hash/);
});

test("ledger write guard: tickets are never sold, coins are one-way", () => {
  assert.match(sql, /sweep tickets may only be granted free of charge/);
  assert.match(sql, /store purchases credit gold coins only/);
  assert.deepEqual(ls.ledgerEntryValid("SWEEP_TICKETS", 5, "POSTAL_AMOE"), { ok: true });
  assert.equal(ls.ledgerEntryValid("SWEEP_TICKETS", 5, "STORE_PURCHASE").ok, false);
  assert.equal(ls.ledgerEntryValid("PRIZE_POINTS", 100, "STORE_PURCHASE").ok, false);
  assert.deepEqual(ls.ledgerEntryValid("GOLD_COINS", 5000, "STORE_PURCHASE"), { ok: true });
});

test("drift view compares wallets against the ledger projection", () => {
  assert.match(sql, /create view wallet_ledger_drift as/);
  assert.match(sql, /coalesce\(sum\(l\.amount_delta\) filter \(where l\.currency_type = 'GOLD_COINS'\), 0\) \+ 1000/);
});

test("API spec covers daily bonus, atomic redemption, AMOE credit and ban cascade", () => {
  assert.match(api, /POST \/api\/v1\/wallet\/daily-bonus/);
  assert.match(api, /POST \/api\/v1\/redemptions/);
  assert.match(api, /POST \/api\/admin\/v1\/amoe\/postal-credit/);
  assert.match(api, /hardware-ban/);
  assert.match(api, /GET \/api\/admin\/v1\/ledger\/drift/);
});
