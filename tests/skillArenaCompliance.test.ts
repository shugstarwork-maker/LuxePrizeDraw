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

const sg = await import("../src/lib/skillGames.ts");
const cur = await import("../src/lib/currencies.ts");
const re = await import("../src/lib/redemptionEngine.ts");
const rm = await import("../src/lib/reviewMode.ts");

// ── Arena catalogue ─────────────────────────────────────────────────────────

test("arena lists chess, draughts and connect four with clocks", () => {
  assert.deepEqual(sg.SKILL_GAMES.map((g) => g.id), ["chess", "draughts", "connect4"]);
  for (const g of sg.SKILL_GAMES) assert.ok(g.clockSeconds >= 60);
});

test("two entry formats: casual gold (unlocked) and prize tickets (locked)", () => {
  const casual = sg.ARENA_FORMATS.find((f) => f.id === "casual")!;
  const prize = sg.ARENA_FORMATS.find((f) => f.id === "prize")!;
  assert.equal(casual.locked, false);
  assert.equal(prize.locked, true);
  assert.equal(prize.currency, "tickets");
  assert.match(prize.honesty, /never sold/i);
});

test("prize entry is refused while locked and never touches gold coins", () => {
  const w = { goldCoins: 999999, sweepTickets: 50, lastTicketClaimDay: "" };
  const res = sg.enterPrizeMatch(w);
  assert.deepEqual(res, { ok: false, reason: "locked" });
});

test("SBMM rating starts at 800, moves on results, bands at ±150", () => {
  store.clear();
  assert.equal(sg.skillRating("chess"), 800);
  const win = sg.applyResult("chess", true, 800);
  assert.equal(win.delta, 16); // K=32, expected 0.5
  assert.equal(sg.skillRating("chess"), 816);
  const band = sg.matchmakingBand("chess");
  assert.deepEqual(band, { min: 666, max: 966 });
});

test("matchmaking contract: 30s timeout with guaranteed refund", () => {
  assert.equal(sg.MATCHMAKING_TIMEOUT_SECONDS, 30);
  assert.equal(sg.FORFEIT_GRACE_SECONDS, 60);
  assert.match(sg.ARENA_RULES.join(" "), /forfeited/);
});

// ── Credit card monthly cap ─────────────────────────────────────────────────

test("card cap: £250/month, purchases tracked and blocked at the cap", () => {
  store.clear();
  assert.equal(cur.CARD_MONTHLY_CAP_PENCE, 25000);
  assert.equal(cur.cardCapRemainingPence(), 25000);
  assert.equal(cur.purchaseWithinCap("pack-elite").allowed, true);
  cur.recordCardPurchase("pack-elite"); // £49.99
  cur.recordCardPurchase("pack-elite");
  cur.recordCardPurchase("pack-elite");
  cur.recordCardPurchase("pack-elite");
  cur.recordCardPurchase("pack-elite"); // £249.95 spent
  assert.ok(cur.cardSpendThisMonthPence() >= 24900);
  const blocked = cur.purchaseWithinCap("pack-starter"); // £4.99 would exceed
  assert.equal(blocked.allowed, false);
  assert.match(blocked.reason!, /£250 per month/);
});

// ── Prize Points & AML hold ─────────────────────────────────────────────────

test("prize points are a separate ledger; vouchers debit points only", () => {
  store.clear();
  assert.equal(re.prizePoints(), 0);
  re.grantPrizePoints(25000);
  const res = re.redeemVoucher("amazon-10"); // 10,000 pts
  assert.equal(res.ok, true);
  assert.equal(re.prizePoints(), 15000);
  const poor = re.redeemVoucher("tesco-100"); // needs 100,000
  assert.equal(poor.ok, false);
});

test("AML ceiling: over-£500 orders hold 24h in pending_review", () => {
  assert.equal(re.AML_REVIEW_THRESHOLD_PENCE, 50000);
  assert.equal(re.AML_REVIEW_HOURS, 24);
  const lib = readFileSync(new URL("../src/lib/redemptionEngine.ts", import.meta.url), "utf8");
  assert.match(lib, /status: amlHold \? "pending_review" : "processing"/);
  assert.match(lib, /reviewReleaseAt: amlHold/);
});

test("hard rule: no conversion path from coins or tickets into prize points", () => {
  const lib = readFileSync(new URL("../src/lib/redemptionEngine.ts", import.meta.url), "utf8");
  assert.ok(!/goldCoins|sweepTickets/.test(lib), "redemption engine must not reference other currencies");
});

// ── Review mode ─────────────────────────────────────────────────────────────

test("review mode toggles and gates prize UI", () => {
  store.clear();
  // Fail-safe: no signal at all defaults to review mode ON.
  assert.equal(rm.reviewModeEnabled(), true);
  rm.setReviewMode(false);
  assert.equal(rm.reviewModeEnabled(), false);
  rm.setReviewMode(true);
  assert.equal(rm.reviewModeEnabled(), true);
  const league = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.match(league, /reviewModeEnabled\(\)/);
  assert.match(league, /data-testid="review-mode-toggle"/);
  assert.match(league, /\{!reviewMode && <span className="rounded-full border border-sky-300\/35/);
  assert.match(league, /\{!reviewMode && <><div className="mt-8[^"]*" data-testid="prize-tables">/);
});

// ── Arena component wiring ──────────────────────────────────────────────────

test("arena component renders games, formats, queue and rules; route registered", () => {
  const arena = readFileSync(new URL("../src/components/SkillGamesArena.tsx", import.meta.url), "utf8");
  assert.match(arena, /data-testid="skill-arena"/);
  assert.match(arena, /data-testid="arena-games"/);
  assert.match(arena, /data-testid="arena-formats"/);
  assert.match(arena, /data-testid="arena-queueing"/);
  assert.match(arena, /data-testid="arena-rules"/);
  assert.match(arena, /applyResult\(game/);
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  assert.match(app, /path === "\/arena" \? <><SkillGamesArena/);
});

test("equal prominence: free ticket claim sits in the pack grid with identical styling", () => {
  const league = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  const packSection = league.split('data-testid="coin-packs"')[1];
  assert.ok(packSection.indexOf('data-testid="pack-free-claim"') < packSection.indexOf('data-testid={`pack-'), "free claim must precede paid packs");
  assert.match(packSection, /data-testid="pack-free-claim"/);
  // free claim and the paid-pack template share the identical class string
  const FREE = /rounded-xl border border-amber-200\/25 bg-black\/40 px-4 py-3 text-left transition hover:border-amber-200\/60 active:scale-95/g;
  assert.ok((packSection.match(FREE) ?? []).length >= 2, "free claim and pack template share identical styling");
  assert.match(packSection, /£250 per month/);
});

test("pack purchases check the card cap before opening checkout", () => {
  const league = readFileSync(new URL("../src/components/LuxePokerLeague.tsx", import.meta.url), "utf8");
  assert.match(league, /purchaseWithinCap\(p\.id\)/);
});

test("redemption store shows the voucher rail with AML hold notice", () => {
  const storeSrc = readFileSync(new URL("../src/components/RedemptionStore.tsx", import.meta.url), "utf8");
  assert.match(storeSrc, /data-testid="voucher-rail"/);
  assert.match(storeSrc, /Tango Card \/ Giftbit/);
  assert.match(storeSrc, /AML_REVIEW_HOURS/);
});
