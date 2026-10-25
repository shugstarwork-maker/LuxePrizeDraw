import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

const ops = await import("../src/lib/adminOps.ts");
const cur = await import("../src/lib/currencies.ts");
const panel = readFileSync(new URL("../src/components/AdminOpsCenter.tsx", import.meta.url), "utf8");
const adminPanel = readFileSync(new URL("../src/components/AdminPanel.tsx", import.meta.url), "utf8");
const rpPage = readFileSync(new URL("../src/components/ResponsiblePlayPage.tsx", import.meta.url), "utf8");

test("flag queue: clear and hardware-ban both resolve the flag and audit it", () => {
  store.clear();
  const flags = ops.flagQueue();
  assert.ok(flags.length >= 3, "demo seed queue");
  const open = flags.filter((f) => f.status === "open");
  const cleared = ops.clearFlag(open[0].id, "false positive");
  assert.equal(cleared?.status, "cleared");
  const banned = ops.issueHardwareBan(open[1].id, "confirmed engine");
  assert.equal(banned?.status, "banned");
  // cannot act twice on the same flag
  assert.equal(ops.clearFlag(open[0].id, ""), null);
  const trail = ops.adminAuditTrail();
  assert.ok(trail.some((e) => e.action === "flag.cleared"));
  assert.ok(trail.some((e) => e.action === "flag.hardware_ban"));
});

test("postal AMOE: credits tickets, enforces weekly cap, rejects bad input", () => {
  store.clear();
  const before = cur.loadWallet().sweepTickets;
  const ok = ops.creditPostalEntry("usr_local_player", "BAG-2026-04-17");
  assert.ok(ok.ok);
  assert.equal(cur.loadWallet().sweepTickets, before + ops.AMOE_TICKETS_PER_LETTER);
  // second letter same week blocked
  const dupe = ops.creditPostalEntry("usr_local_player", "BAG-2026-04-18");
  assert.equal(dupe.ok, false);
  // invalid account id rejected
  assert.equal(ops.creditPostalEntry("notanid", "X").ok, false);
  // missing letter ref rejected (paper trail mandatory)
  assert.equal(ops.creditPostalEntry("usr_someone_else", "").ok, false);
  // ledger records the free distribution
  assert.ok(ops.tokenLedger().sweepTicketsDistributed >= ops.AMOE_TICKETS_PER_LETTER);
  assert.ok(ops.adminAuditTrail().some((e) => e.action === "amoe.credit"));
});

test("token ledger invariants report the no-leak guarantees", () => {
  const inv = ops.economyInvariants();
  assert.equal(inv.length, 4);
  assert.ok(inv.every((i) => i.ok));
  assert.ok(inv.some((i) => i.name.includes("never sold")));
});

test("admin UI exposes all four god-mode panels plus the audit trail", () => {
  for (const id of ["ops-flag-queue", "ops-payout-queue", "ops-token-ledger", "ops-postal-amoe", "ops-audit-trail"]) {
    assert.match(panel, new RegExp(`data-testid="${id}"`));
  }
  assert.match(panel, /flag-clear-/);
  assert.match(panel, /flag-ban-/);
  assert.match(panel, /payout-approve-/);
  assert.match(panel, /data-testid="amoe-submit"/);
  assert.match(adminPanel, /<AdminOpsCenter \/>/);
});

test("player custom spend limit clamps to £250 and strictly overrides", () => {
  store.clear();
  assert.equal(cur.customMonthlyCapPence(), null);
  assert.equal(cur.effectiveMonthlyCapPence(), 25000);
  cur.setCustomMonthlyCapPence(10000); // £100
  assert.equal(cur.customMonthlyCapPence(), 10000);
  assert.equal(cur.effectiveMonthlyCapPence(), 10000);
  // above the legal ceiling → clamped down, never up
  cur.setCustomMonthlyCapPence(999999);
  assert.equal(cur.effectiveMonthlyCapPence(), 25000);
  // cap gates purchases: £19.99 pack fine under £100, blocked when spent
  cur.setCustomMonthlyCapPence(500); // £5
  const res = cur.purchaseWithinCap("pack-elite"); // £49.99 pack
  assert.equal(res.allowed, false);
  assert.match(res.reason ?? "", /custom limit/);
  cur.setCustomMonthlyCapPence(null);
  assert.equal(cur.purchaseWithinCap("pack-elite").allowed, true);
});

test("responsible play page offers custom caps and permanent exclusion", () => {
  assert.match(rpPage, /data-testid="custom-cap"/);
  assert.match(rpPage, /data-testid=\{`custom-cap-\$\{gbp\}`\}/);
  assert.match(rpPage, /data-testid="custom-cap-clear"/);
  assert.match(rpPage, /setCustomMonthlyCapPence\(gbp \* 100\)/);
  const rp = readFileSync(new URL("../src/lib/responsiblePlay.ts", import.meta.url), "utf8");
  assert.match(rp, /permanent: \{ label: "Permanent exclusion"/);
});
