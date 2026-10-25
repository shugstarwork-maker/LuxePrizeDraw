// TS mirror of db/schema_v2_ledger.sql — keeps the enum sets, wallet
// defaults, ledger write rules and the two transaction rules honest between
// the SQL and the app. Tests assert both sides stay in sync.

export const KYC_STATUSES = ["PENDING_SUBMISSION", "UNDER_REVIEW", "VERIFIED", "REJECTED"] as const;
export const RISK_TIERS = ["LOW", "SHADOW_FLAG", "MATCH_KILL", "HARDWARE_BANNED"] as const;
export const PAYOUT_STATUSES = ["PENDING_REVIEW", "PROCESSING", "DISPATCHED", "FAILED"] as const;
export const CURRENCY_TYPES = ["GOLD_COINS", "SWEEP_TICKETS", "PRIZE_POINTS"] as const;
export const LEDGER_REASONS = [
  "STORE_PURCHASE", "DAILY_BONUS", "POSTAL_AMOE", "PURCHASE_BONUS_TICKETS",
  "MATCH_ENTRY_FEE", "MATCH_ENTRY_REFUND", "MATCH_WIN_PRIZE",
  "REDEMPTION_SPEND", "REDEMPTION_REFUND",
] as const;

export type KycStatus = (typeof KYC_STATUSES)[number];
export type RiskTier = (typeof RISK_TIERS)[number];
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];
export type CurrencyType = (typeof CURRENCY_TYPES)[number];
export type LedgerReason = (typeof LEDGER_REASONS)[number];

// Wallet starting balances (user_wallets column defaults).
export const WALLET_DEFAULTS = { goldCoins: 1000, sweepTickets: 1, prizePoints: 0 } as const;

// Rule: positive Sweep Ticket deltas may only come from free sources.
export const FREE_TICKET_SOURCES: LedgerReason[] = ["DAILY_BONUS", "POSTAL_AMOE", "PURCHASE_BONUS_TICKETS", "MATCH_ENTRY_REFUND"];

// Rule: Gold Coins are one-way — a store purchase never credits other currencies.
export function ledgerEntryValid(currency: CurrencyType, delta: number, reason: LedgerReason): { ok: boolean; error?: string } {
  if (currency === "SWEEP_TICKETS" && delta > 0 && !FREE_TICKET_SOURCES.includes(reason)) {
    return { ok: false, error: `Sweep Tickets may only be granted free of charge (reason ${reason})` };
  }
  if (currency !== "GOLD_COINS" && reason === "STORE_PURCHASE") {
    return { ok: false, error: "Store purchases credit Gold Coins only" };
  }
  return { ok: true };
}

// Anti-cheat thresholds mirrored from src/lib/antiCheat.ts for the telemetry table.
export const RISK_KILL_THRESHOLD = 75; // calculated_risk_score >= 75 → idx_telemetry_high_risk

// Payout lifecycle: the AML manual-review ceiling.
export const AML_REVIEW_GBP = 500;
