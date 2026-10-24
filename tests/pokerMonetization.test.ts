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

const monet = await import("../src/lib/pokerMonetization.ts");

test("ad ledger starts at zero with the daily cap available", () => {
  store.clear();
  assert.equal(monet.adsWatchedToday(), 0);
  assert.equal(monet.adsRemainingToday(), monet.ADS_PER_DAY);
});

test("watching ads counts up and caps at the daily limit", () => {
  store.clear();
  for (let i = 0; i < 8; i++) monet.recordAdWatched();
  assert.equal(monet.adsWatchedToday(), monet.ADS_PER_DAY);
  assert.equal(monet.adsRemainingToday(), 0);
});

test("social tables are casual-only with buy-ins and blinds", () => {
  assert.equal(monet.SOCIAL_TABLES.length, 3);
  for (const t of monet.SOCIAL_TABLES) {
    assert.ok(t.buyIn > 0 && t.bigBlind > t.smallBlind);
    assert.ok(/no league|never|just for fun|bragging rights/i.test(t.note));
  }
});

const source = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");

test("ad break credits chips only after the demo break completes", () => {
  assert.match(source, /AdBreakOverlay onDone=\{finishAd\}/);
  assert.match(source, /AD_REWARD_CHIPS/);
  assert.match(source, /recordAdWatched\(\)/);
});

test("every store item routes through the disabled checkout stub with a price", () => {
  assert.match(source, /setCheckoutItem\(\{ id: item\.id, label: item\.label, badge: item\.badge, priceGBP: item\.price \}\)/);
  // No direct chip/cosmetic grant inside buyItem — purchases are gated.
  const buy = source.split("const buyItem =")[1].split("};")[0];
  assert.ok(!buy.includes("setChips"), "buyItem must not grant chips directly");
  const store = source.split("const STORE")[1].split("];")[0];
  const priceCount = (store.match(/price: "£/g) ?? []).length;
  assert.equal(priceCount, 8, "every store item carries a price tag");
});

test("social rooms are walled off from league XP, sessions and highlights", () => {
  assert.match(source, /sessionRef\.current = null; \/\/ social rooms never touch the league session record/);
  assert.match(source, /socialRoom = !sessionRef\.current/);
  assert.match(source, /youPlayed && !socialRoom/);
  assert.match(source, /youPlayed && !socialRoom \? classifyHand/);
  assert.match(source, /lobbyTab === "social"/);
});

test("social tab exists in the lounge dock", () => {
  const tabbar = readFileSync(new URL("../src/components/LoungeTabBar.tsx", import.meta.url), "utf8");
  assert.match(tabbar, /"social"/);
  assert.match(tabbar, /label: "Social"/);
});
