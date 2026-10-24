import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { REDEMPTION_ITEMS, REDEMPTION_CATEGORIES, STORE_RULES, formatPence } = await import("../src/lib/redemption.ts");

test("store catalogue has breadth across all five categories", () => {
  assert.ok(REDEMPTION_ITEMS.length >= 10);
  const cats = new Set(REDEMPTION_ITEMS.map((i) => i.category));
  for (const c of ["cash_credit", "gift_card", "tech", "experience", "merch"]) assert.ok(cats.has(c as never), `missing category ${c}`);
});

test("every item is preview-only, priced in pence, never in chips", () => {
  for (const item of REDEMPTION_ITEMS) {
    assert.equal(item.preview, true);
    assert.ok(Number.isInteger(item.costPence) && item.costPence > 0);
    assert.ok(!/chips?/i.test(item.blurb) || /never/i.test(item.blurb), `${item.id} blurb must not price in chips`);
  }
});

test("cash credit starts at the £20 withdrawal floor", () => {
  const cash = REDEMPTION_ITEMS.filter((i) => i.category === "cash_credit");
  assert.ok(Math.min(...cash.map((i) => i.costPence)) >= 2000);
});

test("formatPence renders GBP cleanly", () => {
  assert.equal(formatPence(2000), "£20");
  assert.equal(formatPence(99900), "£999");
});

test("store rules state the three compliance lines", () => {
  assert.equal(STORE_RULES.length, 3);
  assert.match(STORE_RULES[0], /no cash value and can never be redeemed/i);
  assert.match(STORE_RULES[1], /18\+/i);
  assert.match(STORE_RULES[2], /£20 minimum/i);
  assert.match(STORE_RULES[2], /£500 daily/i);
});

test("category filter list covers all plus every category", () => {
  assert.equal(REDEMPTION_CATEGORIES[0].id, "all");
  assert.equal(REDEMPTION_CATEGORIES.length, 6);
});

const component = readFileSync(new URL("../src/components/RedemptionStore.tsx", import.meta.url), "utf8");

test("store UI is visibly locked with honesty framing", () => {
  assert.match(component, /data-testid="redemption-store"/);
  assert.match(component, /data-testid="store-locked-badge"/);
  assert.match(component, /Preview — opens after launch/);
  assert.match(component, /disabled/);                       // every redeem button disabled
  assert.match(component, /data-testid="store-rules"/);
  assert.match(component, /data-testid="store-how-it-works"/);
});

test("profile tab links to verification centre and store", () => {
  const league = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.match(league, /data-testid="profile-verify-link"/);
  assert.match(league, /data-testid="profile-redeem-link"/);
  assert.match(league, /go\("\/verify"\)/);
  assert.match(league, /go\("\/redeem"\)/);
});

test("routes are registered for /verify and /redeem", () => {
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /path === "\/verify" \? <><VerificationCenter/);
  assert.match(app, /path === "\/redeem" \? <><RedemptionStore/);
});
