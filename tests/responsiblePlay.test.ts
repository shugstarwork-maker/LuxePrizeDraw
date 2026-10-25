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

const rp = await import("../src/lib/responsiblePlay.ts");
const page = readFileSync(new URL("../src/components/ResponsiblePlayPage.tsx", import.meta.url), "utf8");
const checkout = readFileSync(new URL("../src/components/CheckoutStubDialog.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/components/HomePage.tsx", import.meta.url), "utf8");

test("exclusion blocks play until expiry and cannot be lifted early", () => {
  store.clear();
  assert.deepEqual(rp.playBlocked(), { blocked: false });
  const ex = rp.setExclusion("cooling_off_24h");
  assert.equal(ex.endsAt - ex.startedAt, 24 * 3600_000);
  const gate = rp.playBlocked();
  assert.ok(gate.blocked);
  if (gate.blocked) assert.equal(gate.exclusion.kind, "cooling_off_24h");
  // no early-lift API exists on the module
  assert.equal(typeof (rp as Record<string, unknown>).clearExclusion, "undefined");
  assert.equal(typeof (rp as Record<string, unknown>).liftExclusion, "undefined");
});

test("expired exclusions clear themselves", () => {
  store.clear();
  const past = { kind: "cooling_off_24h", startedAt: Date.now() - 48 * 3600_000, endsAt: Date.now() - 1000 };
  store.set("luxe-self-exclusion-v1", JSON.stringify(past));
  assert.equal(rp.activeExclusion(), null);
  assert.deepEqual(rp.playBlocked(), { blocked: false });
});

test("reminder minutes only accept the published options", () => {
  store.clear();
  assert.equal(rp.reminderMinutes(), 60);
  rp.setReminderMinutes(30);
  assert.equal(rp.reminderMinutes(), 30);
  rp.setReminderMinutes(45); // invalid — ignored
  assert.equal(rp.reminderMinutes(), 30);
  rp.setReminderMinutes(120);
  assert.equal(rp.reminderMinutes(), 120);
});

test("session clock persists and resets after 6 idle hours", () => {
  store.clear();
  const t0 = Date.now();
  assert.equal(rp.sessionStartedAt(t0), t0);
  assert.equal(rp.sessionMinutes(t0 + 90 * 60_000), 90);
  // 7 hours later the clock restarts
  const t1 = t0 + 7 * 3600_000;
  assert.equal(rp.sessionStartedAt(t1), t1);
});

test("exclusion time-left formats hours and days", () => {
  const soon = { kind: "cooling_off_24h", startedAt: Date.now(), endsAt: Date.now() + 5 * 3600_000 } as const;
  const long = { kind: "self_exclusion_30d", startedAt: Date.now(), endsAt: Date.now() + 72 * 3600_000 } as const;
  assert.equal(rp.exclusionTimeLeft(soon), "5 hours");
  assert.equal(rp.exclusionTimeLeft(long), "3 days");
});

test("page renders the four control panels, support links and honesty note", () => {
  for (const id of ["responsible-play", "session-clock", "reality-check", "spend-cap-panel", "exclusion-panel", "support-links", "exclusion-banner"]) {
    assert.match(page, new RegExp(`data-testid="${id}"`));
  }
  assert.match(page, /\{RESPONSIBLE_PLAY_NOTE\}/);
  assert.match(page, /SUPPORT_LINKS\.map/);
  const lib = readFileSync(new URL("../src/lib/responsiblePlay.ts", import.meta.url), "utf8");
  assert.match(lib, /GamCare/);
  assert.match(lib, /BeGambleAware/);
  assert.match(lib, /GAMSTOP/);
  // the £250 monthly cap figure is shown from the live ledger
  assert.match(page, /cardSpendThisMonthPence\(\)/);
  assert.match(page, /CARD_MONTHLY_CAP_PENCE/);
});

test("checkout hard-locks behind an active exclusion and the page is routed", () => {
  assert.match(checkout, /const gate = playBlocked\(\)/);
  assert.match(checkout, /data-testid="checkout-excluded"/);
  assert.match(app, /path === "\/responsible-play"/);
  assert.match(home, /go\("\/responsible-play"\)/);
});

const reality = readFileSync(new URL("../src/components/RealityCheck.tsx", import.meta.url), "utf8");

test("reality-check pop-up is mounted globally and respects exclusions", () => {
  assert.match(app, /<RealityCheck \/>/);
  assert.match(reality, /data-testid="reality-check-popup"/);
  assert.match(reality, /data-testid="reality-minutes"/);
  assert.match(reality, /data-testid="reality-continue"/);
  assert.match(reality, /data-testid="reality-break"/);
  // never fires while a cooling-off or self-exclusion is active
  assert.match(reality, /if \(playBlocked\(\)\.blocked\) \{ setDue\(null\); return; \}/);
  // interval comes from the player-configured setting
  assert.match(reality, /reminderMinutes\(\)/);
  // break CTA routes to the Responsible Play Centre
  assert.match(reality, /navigate\("\/responsible-play"\)/);
});
