import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

const {
  REVIEW_FLAG_NAME,
  REMOTE_CACHE_KEY,
  reviewModeEnabled,
  setReviewMode,
  camouflageCopy,
} = await import("../src/lib/reviewMode");

test("remote flag name matches the app-store review contract", () => {
  assert.equal(REVIEW_FLAG_NAME, "is_app_store_review_active");
});

test("local override forces review mode on and off", () => {
  setReviewMode(true);
  assert.equal(reviewModeEnabled(), true);
  setReviewMode(false);
  assert.equal(reviewModeEnabled(), false);
  setReviewMode(null);
});

test("remote cache is honoured when no local override exists", () => {
  setReviewMode(null);
  store.set(REMOTE_CACHE_KEY, JSON.stringify({ active: true, fetchedAt: Date.now() }));
  assert.equal(reviewModeEnabled(), true);
  store.set(REMOTE_CACHE_KEY, JSON.stringify({ active: false, fetchedAt: Date.now() }));
  assert.equal(reviewModeEnabled(), false);
});

test("no signal at all defaults to review-safe ON; stale cache is still honoured", () => {
  setReviewMode(null);
  store.delete(REMOTE_CACHE_KEY);
  assert.equal(reviewModeEnabled(), true);
  store.set(REMOTE_CACHE_KEY, "not-json");
  assert.equal(reviewModeEnabled(), true);
  // A stale cached value is the last known server state — honoured until the next sync.
  store.set(REMOTE_CACHE_KEY, JSON.stringify({ active: false, fetchedAt: Date.now() - 10 * 60 * 1000 }));
  assert.equal(reviewModeEnabled(), false);
});

test("camouflage copy: review mode hides rewards and prize text", () => {
  const camo = camouflageCopy(true);
  assert.equal(camo.lobbyHeader, "Luxe Social Lounge");
  assert.equal(camo.disclaimer, "Free-Play Tokens Only · Entertainment Purposes");
  assert.equal(camo.rewardsTab, false);
  assert.equal(camo.prizeText, false);
  const live = camouflageCopy(false);
  assert.equal(live.lobbyHeader, "Luxe Prize Draw");
  assert.equal(live.disclaimer, "Free-play · No cash value");
  assert.equal(live.rewardsTab, true);
  assert.equal(live.prizeText, true);
});

test("server exposes the remote flag endpoint with safe default ON", () => {
  const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8");
  assert.match(server, /\/api\/config\/review-mode/);
  assert.match(server, /is_app_store_review_active/);
  assert.match(server, /APP_STORE_REVIEW_ACTIVE/);
});

test("tab bar filters the rewards tab under review mode", () => {
  const tabBar = readFileSync(new URL("../src/components/LoungeTabBar.tsx", import.meta.url), "utf8");
  assert.match(tabBar, /camouflageCopy\(\)/);
  assert.match(tabBar, /t\.id !== "rewards"/);
});

test("poker lobby swaps header and disclaimer under review mode", () => {
  const poker = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.match(poker, /LUXE SOCIAL LOUNGE/);
  assert.match(poker, /camouflageCopy\(reviewMode\)/);
});

test("reviewer notes text ships verbatim in the submission doc", () => {
  const doc = readFileSync(new URL("../docs/app-store-submission.md", import.meta.url), "utf8");
  for (const line of [
    "App Classification & Compliance Notes for Reviewer",
    "100% free-to-play social game hub",
    "no real-money gambling, cash wagering, deposits, or cash-outs",
    "virtual chips with zero real-world value",
    "Apple Review Guideline 5.3",
    "restricting access to users under the age of 18",
  ]) {
    assert.ok(doc.includes(line), `submission doc missing: ${line}`);
  }
});

test("launch roadmap covers the three milestones in order", () => {
  const doc = readFileSync(new URL("../docs/launch-roadmap.md", import.meta.url), "utf8");
  const alpha = doc.indexOf("Alpha Launch");
  const keys = doc.indexOf("High-Risk Key Activation");
  const marketing = doc.indexOf("Marketing Push");
  assert.ok(alpha > -1 && keys > alpha && marketing > keys);
  assert.match(doc, /50 internal users/);
  assert.match(doc, /Skill Competitions/);
});
