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

const c = await import("../src/lib/currencies.ts");

test("wallet starts with coins, a few free tickets, and persists", () => {
  store.clear();
  const w = c.loadWallet();
  assert.ok(w.goldCoins > 0);
  assert.ok(w.sweepTickets > 0);
  c.saveWallet({ ...w, goldCoins: 4200 });
  assert.equal(c.loadWallet().goldCoins, 4200);
});

test("gold coins grant and spend with no overdraft", () => {
  const w = { goldCoins: 100, sweepTickets: 1, lastTicketClaimDay: "" };
  assert.equal(c.grantGoldCoins(w, 50).goldCoins, 150);
  assert.equal(c.spendGoldCoins(w, 60)?.goldCoins, 40);
  assert.equal(c.spendGoldCoins(w, 999), null);
});

test("sweep tickets: daily claim grants once per day only", () => {
  store.clear();
  let w = c.loadWallet();
  const before = w.sweepTickets;
  const first = c.claimDailyTickets(w);
  assert.equal(first.granted, c.DAILY_FREE_TICKETS);
  assert.equal(first.wallet.sweepTickets, before + c.DAILY_FREE_TICKETS);
  const second = c.claimDailyTickets(first.wallet);
  assert.equal(second.granted, 0, "second claim same day must grant nothing");
  assert.equal(c.dailyTicketsAvailable(first.wallet), false);
});

test("sweep tickets spend down but never below zero", () => {
  const w = { goldCoins: 0, sweepTickets: 10, lastTicketClaimDay: "" };
  assert.equal(c.spendSweepTickets(w, 4)?.sweepTickets, 6);
  assert.equal(c.spendSweepTickets(w, 11), null);
});

test("HARD RULE: there is no purchase path for sweep tickets", () => {
  const lib = readFileSync(new URL("../src/lib/currencies.ts", import.meta.url), "utf8");
  assert.ok(!/buySweepTicket|purchaseTicket|ticketPrice|tickets?GBP/i.test(lib), "no ticket purchase function may exist");
  // Every coin pack frames tickets strictly as a free bonus
  for (const p of c.COIN_PACKS) {
    assert.ok(p.bonusTickets > 0);
    assert.ok(p.coins > 0 && p.priceGBP.startsWith("£"));
  }
});

test("prize tables cost tickets, promise real prizes, and name the 18+ gate", () => {
  assert.ok(c.PRIZE_TABLES.length >= 3);
  for (const t of c.PRIZE_TABLES) {
    assert.ok(t.ticketCost > 0);
    assert.match(t.prize, /£\d+/);
  }
  assert.ok(c.PRIZE_TABLES.some((t) => /18\+/.test(t.note)));
});

test("currency rules state coins never redeemable and tickets never sold", () => {
  assert.equal(c.CURRENCY_RULES.length, 3);
  assert.match(c.CURRENCY_RULES[0], /zero real-world value/i);
  assert.match(c.CURRENCY_RULES[1], /never sold/i);
});

const league = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");

test("lobby shows the sweep ticket balance and rewards tab has the dual-currency sections", () => {
  assert.match(league, /data-testid="sweep-ticket-balance"/);
  assert.match(league, /data-testid="daily-tickets-btn"/);
  assert.match(league, /data-testid="coin-packs"/);
  assert.match(league, /data-testid="prize-tables"/);
});

test("coin packs route through the locked checkout stub — no direct grants", () => {
  assert.match(league, /setCheckoutItem\(\{ id: p\.id, label: `\$\{p\.coins\.toLocaleString\(\)\} Gold Coins`/);
  assert.ok(!/setWallet\(grantGoldCoins/.test(league), "pack purchase must never grant coins directly");
});

test("prize table entry buttons are all disabled pre-launch", () => {
  assert.match(league, /data-testid=\{`enter-\$\{t\.id\}`\}/);   // one locked button per prize table
  assert.match(league, /button type="button" disabled title="Opens after launch, legal sign-off and 18\+ ID verification"/);
  assert.match(league, /Locked pre-launch/);
});
