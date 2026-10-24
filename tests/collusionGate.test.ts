import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

const col = await import("../src/lib/collusion.ts");

const me = { userId: "you", ip: "203.0.113.10", networkId: "net-a" };
const stranger = { userId: "opp-1", ip: "198.51.100.77", networkId: "net-b" };

// ── Proximity gate ──────────────────────────────────────────────────────────

test("clean opponents are seated", () => {
  assert.deepEqual(col.checkPrizeSeating(me, stranger, []), { allowed: true });
});

test("shared IP blocks prize seating with player-facing copy", () => {
  const v = col.checkPrizeSeating(me, { ...stranger, ip: me.ip }, []);
  assert.equal(v.allowed, false);
  if (!v.allowed) {
    assert.equal(v.reason, "shared_ip");
    assert.match(v.detail, /casual social room/i);
  }
});

test("shared Wi-Fi network blocks prize seating", () => {
  const v = col.checkPrizeSeating(me, { ...stranger, networkId: "net-a" }, []);
  assert.equal(v.allowed, false);
  if (!v.allowed) assert.equal(v.reason, "shared_network");
});

test("5+ prize matches vs the same opponent in 30 days blocks seating", () => {
  const now = Date.now();
  const history = Array.from({ length: 5 }, (_, i) => ({ opponentId: "opp-1", stakes: "prize" as const, at: now - i * 4 * 24 * 3600 * 1000 }));
  const v = col.checkPrizeSeating(me, stranger, history, now);
  assert.equal(v.allowed, false);
  if (!v.allowed) assert.equal(v.reason, "repeat_opponent");
});

test("casual matches and old history never block", () => {
  const now = Date.now();
  const casualHistory = Array.from({ length: 8 }, () => ({ opponentId: "opp-1", stakes: "casual" as const, at: now - 2 * 24 * 3600 * 1000 }));
  assert.equal(col.checkPrizeSeating(me, stranger, casualHistory, now).allowed, true);
  const oldHistory = Array.from({ length: 6 }, () => ({ opponentId: "opp-1", stakes: "prize" as const, at: now - 40 * 24 * 3600 * 1000 }));
  assert.equal(col.checkPrizeSeating(me, stranger, oldHistory, now).allowed, true);
});

// ── SMS OTP demo flow ───────────────────────────────────────────────────────

test("UK mobile normalisation accepts 07… and +44 7…, rejects others", () => {
  assert.equal(col.normaliseUKMobile("07123 456789"), "+447123456789");
  assert.equal(col.normaliseUKMobile("+44 7123 456789"), "+447123456789");
  assert.equal(col.normaliseUKMobile("+1 202 555 0100"), null);
  assert.equal(col.normaliseUKMobile("12345"), null);
});

test("one phone locks to one account forever", () => {
  store.clear();
  const phone = "+447700900123";
  assert.equal(col.requestDemoCode(phone, "alice").ok, true);
  assert.equal(col.verifyDemoCode(phone, "0123", "alice").ok, true);
  // second account tries the same number
  assert.equal(col.requestDemoCode(phone, "bob").ok, false);
  assert.match(col.requestDemoCode(phone, "bob").reason!, /another account/);
});

test("wrong code is rejected; right code verifies", () => {
  store.clear();
  const phone = "+447700900777";
  assert.equal(col.verifyDemoCode(phone, "0000", "alice").ok, false);
  assert.equal(col.verifyDemoCode(phone, "0777", "alice").ok, true);
});

// ── Payout name matching ────────────────────────────────────────────────────

test("payout names match after normalisation and token reorder", () => {
  assert.equal(col.payoutNameMatches("John Smith", "john smith"), true);
  assert.equal(col.payoutNameMatches("Mary-Jane Watson", "mary jane watson"), false); // hyphen preserved
  assert.equal(col.payoutNameMatches("Mary Jane Watson", "Watson Mary Jane"), true);
  assert.equal(col.payoutNameMatches("John Smith", "John Smyth"), false);
  assert.equal(col.payoutNameMatches("", "John Smith"), false);
});

// ── UI wiring ───────────────────────────────────────────────────────────────

test("verification centre hosts the proximity scenarios and SMS demo", () => {
  const src = readFileSync(new URL("../src/components/VerificationCenter.tsx", import.meta.url), "utf8");
  assert.match(src, /data-testid="proximity-demo"/);
  assert.match(src, /data-scenario=\{s\.id\}/);
  assert.match(src, /data-testid="sms-demo"/);
  assert.match(src, /data-testid="sms-send"/);
  assert.match(src, /data-testid="sms-verify"/);
  assert.match(src, /one-phone-one-account/);
});

test("prize tables advertise the proximity gate", () => {
  const league = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.match(league, /Proximity gate active/);
  assert.match(league, /repeated prize-match history/);
});

test("schema withdrawal thresholds remain enforced alongside the new gates", () => {
  const sql = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");
  assert.match(sql, /amount_pence >= 2000/);            // £20 minimum
  assert.match(sql, /v_daily_withdrawal_totals/);       // £500 daily cap view
  assert.match(sql, /constraint withdrawals_requires_kyc/);
  assert.match(sql, /holder_name\s+text not null/);     // payout name match column
  assert.match(sql, /name_match\s+boolean/);
});
