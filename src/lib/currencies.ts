// Dual-currency wallet — Gold Coins & Sweep Tickets.
// Pre-launch simulation only: no payments are taken and no prizes are awarded.
//
// LEGAL MODEL (mirrors the sweepstakes structure, UK legal review pending):
//   • Gold Coins  — standard currency. Fun, practice, social climbing and
//                   cosmetics. ZERO real-world value, never redeemable.
//                   Sold in packs (checkout locked until legal sign-off).
//   • Sweep Tickets — prize currency. Entry to high-stakes prize tables.
//                   NEVER sold. Only given free: daily bonus, coin-pack
//                   bonus, or postal alternative entry (AMOE).
//
// Hard rules enforced here:
//   1. There is no code path that sells a Sweep Ticket.
//   2. There is no code path that converts Gold Coins into prizes or cash.

const WALLET_KEY = "luxe-currencies-v1";

export type Wallet = {
  goldCoins: number;
  sweepTickets: number;
  lastTicketClaimDay: string; // ISO date string of the last free daily claim
};

const STARTING_WALLET: Wallet = { goldCoins: 1000, sweepTickets: 3, lastTicketClaimDay: "" };

export function loadWallet(): Wallet {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Wallet>;
      if (typeof parsed.goldCoins === "number" && typeof parsed.sweepTickets === "number") {
        return { ...STARTING_WALLET, ...parsed };
      }
    }
  } catch { /* fall through to starter wallet */ }
  return { ...STARTING_WALLET };
}

export function saveWallet(w: Wallet): Wallet {
  try { localStorage.setItem(WALLET_KEY, JSON.stringify(w)); } catch { /* demo only */ }
  return w;
}

// ── Gold Coins ──────────────────────────────────────────────────────────────

export function grantGoldCoins(w: Wallet, amount: number): Wallet {
  return { ...w, goldCoins: w.goldCoins + Math.max(0, Math.floor(amount)) };
}

export function spendGoldCoins(w: Wallet, amount: number): Wallet | null {
  const cost = Math.max(0, Math.floor(amount));
  if (w.goldCoins < cost) return null;
  return { ...w, goldCoins: w.goldCoins - cost };
}

// ── Sweep Tickets (free only — no purchase path exists) ─────────────────────

export const DAILY_FREE_TICKETS = 2;

export function grantSweepTickets(w: Wallet, amount: number): Wallet {
  return { ...w, sweepTickets: w.sweepTickets + Math.max(0, Math.floor(amount)) };
}

export function spendSweepTickets(w: Wallet, amount: number): Wallet | null {
  const cost = Math.max(0, Math.floor(amount));
  if (w.sweepTickets < cost) return null;
  return { ...w, sweepTickets: w.sweepTickets - cost };
}

/** Free daily ticket drop — the no-purchase-necessary entry route. */
export function claimDailyTickets(w: Wallet): { wallet: Wallet; granted: number } {
  const today = new Date().toDateString();
  if (w.lastTicketClaimDay === today) return { wallet: w, granted: 0 };
  return {
    wallet: saveWallet({ ...grantSweepTickets(w, DAILY_FREE_TICKETS), lastTicketClaimDay: today }),
    granted: DAILY_FREE_TICKETS,
  };
}

export function dailyTicketsAvailable(w: Wallet): boolean {
  return w.lastTicketClaimDay !== new Date().toDateString();
}

// ── Gold Coin packs (checkout stays locked pre-launch) ─────────────────────
// Every pack ships with FREE bonus Sweep Tickets — the bonus is free with a
// Gold Coin purchase, the tickets themselves are never sold.

export type CoinPack = {
  id: string;
  coins: number;
  bonusTickets: number; // free bonus — never sold separately
  priceGBP: string;
  tag?: string;
};

export const COIN_PACKS: CoinPack[] = [
  { id: "pack-starter", coins: 5000, bonusTickets: 5, priceGBP: "£4.99" },
  { id: "pack-regular", coins: 12000, bonusTickets: 12, priceGBP: "£9.99", tag: "Popular" },
  { id: "pack-high", coins: 30000, bonusTickets: 35, priceGBP: "£19.99", tag: "Best value" },
  { id: "pack-elite", coins: 80000, bonusTickets: 100, priceGBP: "£49.99", tag: "Luxe Elite" },
];

export function coinPackById(id: string): CoinPack | undefined {
  return COIN_PACKS.find((p) => p.id === id);
}

// ── Credit card spending cap (UK Prize Draw Code of Good Practice) ─────────
// Hard-coded: no account may spend more than £250/month by card on Gold Coin
// bundles. Tracked here as a demo ledger; enforced server-side at launch.

export const CARD_MONTHLY_CAP_PENCE = 25000; // £250.00

const SPEND_KEY = "luxe-coin-spend-v1";
type SpendLedger = { month: string; spentPence: number };

function spendLedger(): SpendLedger {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  try {
    const parsed = JSON.parse(localStorage.getItem(SPEND_KEY) ?? "null") as SpendLedger | null;
    if (parsed && parsed.month === month) return parsed;
  } catch { /* fall through */ }
  return { month, spentPence: 0 };
}

export function cardSpendThisMonthPence(): number {
  return spendLedger().spentPence;
}

export function cardCapRemainingPence(): number {
  return Math.max(0, CARD_MONTHLY_CAP_PENCE - spendLedger().spentPence);
}

function priceToPence(priceGBP: string): number {
  return Math.round(parseFloat(priceGBP.replace("£", "")) * 100);
}

/** Would this pack purchase stay inside the £250 monthly card cap? */
export function purchaseWithinCap(packId: string): { allowed: boolean; reason?: string } {
  const pack = coinPackById(packId);
  if (!pack) return { allowed: false, reason: "Unknown pack." };
  const price = priceToPence(pack.priceGBP);
  if (price > cardCapRemainingPence()) {
    return { allowed: false, reason: `UK prize-draw code: card purchases are capped at £${CARD_MONTHLY_CAP_PENCE / 100} per month. You have £${(cardCapRemainingPence() / 100).toFixed(2)} left this month.` };
  }
  return { allowed: true };
}

/** Record a completed purchase (called by the payment webhook at launch). */
export function recordCardPurchase(packId: string): void {
  const pack = coinPackById(packId);
  if (!pack) return;
  const l = spendLedger();
  try { localStorage.setItem(SPEND_KEY, JSON.stringify({ month: l.month, spentPence: l.spentPence + priceToPence(pack.priceGBP) })); } catch { /* demo only */ }
}

// ── High-stakes prize tables (ticket-entry, locked pre-launch) ──────────────

export type PrizeTable = {
  id: string;
  name: string;
  ticketCost: number;
  prize: string;
  note: string;
};

export const PRIZE_TABLES: PrizeTable[] = [
  { id: "prize-gold", name: "Gold Rush Final", ticketCost: 5, prize: "£50 winnings credit", note: "Weekly final — verified 18+ ID required to claim." },
  { id: "prize-platinum", name: "Platinum Showdown", ticketCost: 15, prize: "£150 winnings credit", note: "Monthly showdown — winner takes the credit pot." },
  { id: "prize-elite", name: "Luxe Elite Invitational", ticketCost: 40, prize: "£500 winnings credit", note: "The headline table. Pays out across the daily cap." },
];

// Plain-English wallet rules — always visible wherever balances show.
export const CURRENCY_RULES = [
  "Gold Coins are for fun only — zero real-world value, never redeemable for prizes or cash.",
  "Sweep Tickets are always free — daily drops, pack bonuses or postal entry. They are never sold.",
  "Prize tables and redemptions stay locked until launch, legal sign-off and 18+ ID checks go live.",
] as const;
