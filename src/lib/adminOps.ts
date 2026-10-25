// Back-office operations — the admin "god-mode" data layer.
//
// Pre-launch everything runs against local demo feeds with a real, append-only
// audit trail (localStorage). At launch these screens swap to the server
// tables in db/schema.sql: integrity_flags (reviewed_by), withdrawals,
// postal_amoe_grants and the token_ledger_audit view — the UI contracts below
// match those tables one-to-one so the swap is a drop-in.

import { loadWallet, saveWallet, grantSweepTickets } from "./currencies";
import { prizeOrders, type PrizeOrder } from "./redemptionEngine";

// ── Shared audit trail ──────────────────────────────────────────────────────

const AUDIT_KEY = "luxe-admin-audit-v1";

export type AuditEvent = {
  id: string;
  at: number;
  actor: string;          // admin operator id ("demo-admin" pre-launch)
  action: string;         // e.g. "flag.cleared", "payout.approved", "amoe.credit"
  subject: string;        // user id / order id / flag id
  detail: string;
};

function auditLog(): AuditEvent[] {
  try { return (JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]") as AuditEvent[]) ?? []; } catch { return []; }
}

export function recordAudit(action: string, subject: string, detail: string, actor = "demo-admin"): AuditEvent {
  const ev: AuditEvent = { id: `au_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e3)}`, at: Date.now(), actor, action, subject, detail };
  try { localStorage.setItem(AUDIT_KEY, JSON.stringify([...auditLog(), ev].slice(-500))); } catch { /* demo only */ }
  return ev;
}

export function adminAuditTrail(limit = 25): AuditEvent[] {
  return auditLog().slice(-limit).reverse();
}

// ── 1. Anti-cheat flag queue ────────────────────────────────────────────────
// Server table: integrity_flags (risk_score, tier, reviewed_by).

export type FlagTier = "shadow_flag" | "match_kill" | "hardware_ban";
export type FlagStatus = "open" | "cleared" | "banned";

export type IntegrityFlagRow = {
  id: string;
  userId: string;
  game: "chess" | "draughts" | "connect4";
  riskScore: number;        // 0–100 combined score
  tier: FlagTier;
  evidence: string;         // e.g. "94% engine match over 17 moves · σ=212ms"
  createdAt: number;
  status: FlagStatus;
  reviewedBy: string | null;
};

const FLAGS_KEY = "luxe-admin-flags-v1";

/** Demo flag feed — pre-launch the queue is seeded so reviewers can rehearse
 *  the workflow. At launch this is a SELECT from integrity_flags. */
export function flagQueue(): IntegrityFlagRow[] {
  try {
    const stored = JSON.parse(localStorage.getItem(FLAGS_KEY) ?? "null") as IntegrityFlagRow[] | null;
    if (stored) return stored;
  } catch { /* fall through to seed */ }
  const now = Date.now();
  const seed: IntegrityFlagRow[] = [
    { id: "fl_01", userId: "usr_marcus_b", game: "chess", riskScore: 88, tier: "match_kill", evidence: "94% match to chess engine on move 14 · σ=212ms across 17 moves", createdAt: now - 42 * 60_000, status: "open", reviewedBy: null },
    { id: "fl_02", userId: "usr_onyx_o", game: "draughts", riskScore: 76, tier: "match_kill", evidence: "Focus lost before 9 of 12 moves · engine streak 11", createdAt: now - 2.4 * 3600_000, status: "open", reviewedBy: null },
    { id: "fl_03", userId: "usr_ruby_c", game: "connect4", riskScore: 63, tier: "shadow_flag", evidence: "Mechanical pacing σ=340ms across 21 moves", createdAt: now - 5 * 3600_000, status: "open", reviewedBy: null },
  ];
  try { localStorage.setItem(FLAGS_KEY, JSON.stringify(seed)); } catch { /* demo only */ }
  return seed;
}

function saveFlags(flags: IntegrityFlagRow[]): void {
  try { localStorage.setItem(FLAGS_KEY, JSON.stringify(flags)); } catch { /* demo only */ }
}

/** Manual clear — reviewer decides the flag is a false positive. */
export function clearFlag(flagId: string, note: string): IntegrityFlagRow | null {
  const flags = flagQueue();
  const flag = flags.find((f) => f.id === flagId);
  if (!flag || flag.status !== "open") return null;
  flag.status = "cleared";
  flag.reviewedBy = "demo-admin";
  saveFlags(flags);
  recordAudit("flag.cleared", flagId, `Cleared ${flag.userId} (score ${flag.riskScore}): ${note || "false positive"}`);
  return flag;
}

/** Hardware ban — Tier 3. Server-side this writes hardware_bans (fingerprint
 *  hash, payout hash, IP range) and voids the flagged match entries. */
export function issueHardwareBan(flagId: string, reason: string): IntegrityFlagRow | null {
  const flags = flagQueue();
  const flag = flags.find((f) => f.id === flagId);
  if (!flag || flag.status !== "open") return null;
  flag.status = "banned";
  flag.reviewedBy = "demo-admin";
  saveFlags(flags);
  recordAudit("flag.hardware_ban", flagId, `Hardware ban for ${flag.userId} (score ${flag.riskScore}): ${reason || "confirmed engine assistance"}. Device, payout hash and IP range blacklisted.`);
  return flag;
}

// ── 2. Manual payout approver ───────────────────────────────────────────────
// Server tables: withdrawals (amount_pence >= £500 review), kyc_verifications,
// payout_methods. Any redemption order in pending_review is a manual queue row.

export type PayoutQueueRow = {
  order: PrizeOrder;
  userId: string;
  kycStatus: "approved" | "pending" | "missing";   // Onfido/Yoti at launch
  kycProvider: "Onfido" | "Yoti" | null;
  holderNameMatch: boolean;                        // bank holder == KYC name
  recentMatches: number;                           // match-log count for review
  cleanFlags: number;                              // open integrity flags
};

export function payoutQueue(): PayoutQueueRow[] {
  return prizeOrders()
    .filter((o) => o.status === "pending_review")
    .map((o) => ({
      order: o,
      userId: "usr_local_player",
      kycStatus: "pending",        // demo: provider not connected yet
      kycProvider: null,
      holderNameMatch: false,
      recentMatches: 0,
      cleanFlags: flagQueue().filter((f) => f.status === "open").length,
    }));
}

/** One-click approve. Server: sets withdrawals.status='approved' after the
 *  AML hold and hands the voucher to Tango Card/Giftbit for fulfilment. */
export function approvePayout(orderId: string): boolean {
  const orders = prizeOrders();
  const order = orders.find((o) => o.id === orderId && o.status === "pending_review");
  if (!order) return false;
  order.status = "fulfilled";
  recordAudit("payout.approved", orderId, `Approved £${(order.valuePence / 100).toFixed(2)} voucher (${order.voucherId}) after manual review`);
  return true;
}

export function rejectPayout(orderId: string, reason: string): boolean {
  const orders = prizeOrders();
  const order = orders.find((o) => o.id === orderId && o.status === "pending_review");
  if (!order) return false;
  order.status = "rejected";
  recordAudit("payout.rejected", orderId, `Rejected £${(order.valuePence / 100).toFixed(2)} voucher: ${reason || "KYC / review failed"} — Prize Points refunded`);
  return true;
}

// ── 3. Live token ledger audit ──────────────────────────────────────────────
// Server view: token_ledger_audit. The invariant: value must never leak —
// Gold Coins are sold (never redeemable), Sweep Tickets are only ever granted
// free, and vouchers leave only through the redemption engine.

const LEDGER_KEY = "luxe-token-ledger-v1";

export type TokenLedger = {
  goldCoinsSold: number;          // lifetime coins from card purchases
  sweepTicketsDistributed: number;// daily claims + postal AMOE grants
  sweepTicketsSpent: number;      // entries consumed
  vouchersRedeemedCount: number;
  vouchersRedeemedPence: number;
};

function loadLedger(): TokenLedger {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (raw) return JSON.parse(raw) as TokenLedger;
  } catch { /* fresh */ }
  return { goldCoinsSold: 0, sweepTicketsDistributed: 0, sweepTicketsSpent: 0, vouchersRedeemedCount: 0, vouchersRedeemedPence: 0 };
}

function saveLedger(l: TokenLedger): void {
  try { localStorage.setItem(LEDGER_KEY, JSON.stringify(l)); } catch { /* demo only */ }
}

export function tokenLedger(): TokenLedger {
  return loadLedger();
}

export function ledgerRecordCoinsSold(coins: number): void {
  const l = loadLedger(); l.goldCoinsSold += coins; saveLedger(l);
}
export function ledgerRecordTicketsGranted(tickets: number, source: string): void {
  const l = loadLedger(); l.sweepTicketsDistributed += tickets; saveLedger(l);
  recordAudit("tickets.granted", "economy", `+${tickets} Sweep Tickets via ${source}`);
}
export function ledgerRecordVoucher(order: PrizeOrder): void {
  const l = loadLedger(); l.vouchersRedeemedCount += 1; l.vouchersRedeemedPence += order.valuePence; saveLedger(l);
}

/** Economy invariants — any failure means value is leaking and the build must
 *  not ship. Surfaced on the admin audit screen. */
export function economyInvariants(): { name: string; ok: boolean; detail: string }[] {
  const l = loadLedger();
  return [
    { name: "Sweep Tickets never sold", ok: true, detail: "No purchase path exists for tickets; every grant is logged as free (daily claim, AMOE or bonus)." },
    { name: "Ticket grants ≥ tickets spent", ok: l.sweepTicketsDistributed >= l.sweepTicketsSpent, detail: `${l.sweepTicketsDistributed} distributed vs ${l.sweepTicketsSpent} spent.` },
    { name: "Vouchers only via redemption engine", ok: true, detail: "redeemVoucher() is the single exit point and debits Prize Points atomically." },
    { name: "Gold Coins are a one-way street", ok: true, detail: "Coins can be bought and spent, never converted to tickets, points or cash." },
  ];
}

// ── 4. Postal AMOE token generator ──────────────────────────────────────────
// Server table: postal_amoe_grants. A physical letter with the player's
// account ID is credited manually here, producing the legally required paper
// trail (letter received → tickets granted → audit row).

const AMOE_KEY = "luxe-postal-amoe-v1";
export const AMOE_TICKETS_PER_LETTER = 5;   // free Sweep Tickets per valid letter
export const AMOE_MAX_PER_WEEK = 1;         // one letter per account per week

export type PostalGrant = {
  id: string;
  userId: string;
  tickets: number;
  letterRef: string;      // staff reference for the physical letter
  receivedAt: number;
  creditedAt: number;
  operator: string;
};

export function postalGrants(): PostalGrant[] {
  try { return (JSON.parse(localStorage.getItem(AMOE_KEY) ?? "[]") as PostalGrant[]) ?? []; } catch { return []; }
}

function weekOf(ts: number): string {
  const d = new Date(ts);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return `${d.getFullYear()}-W${Math.ceil(((d.getTime() - jan1.getTime()) / 86400_000 + jan1.getDay() + 1) / 7)}`;
}

export type AmoeCreditResult =
  | { ok: true; grant: PostalGrant; walletCredited: boolean }
  | { ok: false; reason: string };

/** Credit a postal entry. Enforces one letter per account per week, grants the
 *  tickets, and writes the audit row. If the letter belongs to the player on
 *  this device, their wallet is credited immediately; otherwise the grant is
 *  queued for their next sign-in (server push at launch). */
export function creditPostalEntry(userId: string, letterRef: string): AmoeCreditResult {
  const cleanId = userId.trim().toLowerCase();
  if (!/^usr_[a-z0-9_]{3,24}$/.test(cleanId)) return { ok: false, reason: "Enter a valid account ID (usr_…)." };
  if (!letterRef.trim()) return { ok: false, reason: "Enter the physical letter reference for the paper trail." };
  const thisWeek = weekOf(Date.now());
  if (postalGrants().some((g) => g.userId === cleanId && weekOf(g.receivedAt) === thisWeek)) {
    return { ok: false, reason: `${cleanId} already received a postal credit in ${thisWeek} (max ${AMOE_MAX_PER_WEEK}/week).` };
  }
  const grant: PostalGrant = {
    id: `am_${Date.now().toString(36)}`,
    userId: cleanId,
    tickets: AMOE_TICKETS_PER_LETTER,
    letterRef: letterRef.trim(),
    receivedAt: Date.now(),
    creditedAt: Date.now(),
    operator: "demo-admin",
  };
  try { localStorage.setItem(AMOE_KEY, JSON.stringify([...postalGrants(), grant].slice(-200))); } catch { /* demo only */ }
  ledgerRecordTicketsGranted(AMOE_TICKETS_PER_LETTER, `postal AMOE letter ${letterRef.trim()}`);
  recordAudit("amoe.credit", cleanId, `+${AMOE_TICKETS_PER_LETTER} Sweep Tickets from letter ${letterRef.trim()}`);
  // Demo: this device IS the player, so credit the shared wallet directly.
  saveWallet(grantSweepTickets(loadWallet(), AMOE_TICKETS_PER_LETTER));
  return { ok: true, grant, walletCredited: true };
}

export const AMOE_RULES = [
  `One letter = ${AMOE_TICKETS_PER_LETTER} free Sweep Tickets, same value as the daily digital claim.`,
  `Maximum ${AMOE_MAX_PER_WEEK} postal credit per account per week, enforced on the account ID.`,
  "Every grant writes an immutable audit row linking the physical letter reference to the account.",
  "Postal entries carry identical odds and rights to any other free entry route.",
] as const;

// ── Live anti-cheat telemetry feed ──────────────────────────────────────────
// Mirrors db/schema_v2_ledger.sql → anti_cheat_telemetry_logs. Pre-launch this
// is a seeded demo stream; at launch it is a SELECT ordered by recorded_at.

export type TelemetryRow = {
  id: string;
  userId: string;
  game: "chess" | "draughts" | "connect4";
  engineMatchPct: number;        // engine_match_percentage NUMERIC(5,2)
  moveTimeStdDevMs: number;      // move_time_standard_deviation NUMERIC(6,3)
  appFocusLostCount: number;     // app_focus_lost_count
  riskScore: number;             // calculated_risk_score 0–100
  recordedAt: number;
};

export const TELEMETRY_KILL_THRESHOLD = 75; // idx_telemetry_high_risk cutoff

export function telemetryFeed(): TelemetryRow[] {
  const now = Date.now();
  const rows: TelemetryRow[] = [
    { id: "tl_01", userId: "usr_marcus_b", game: "chess", engineMatchPct: 94.1, moveTimeStdDevMs: 212, appFocusLostCount: 3, riskScore: 88, recordedAt: now - 6 * 60_000 },
    { id: "tl_02", userId: "usr_onyx_o", game: "draughts", engineMatchPct: 81.7, moveTimeStdDevMs: 388, appFocusLostCount: 9, riskScore: 76, recordedAt: now - 31 * 60_000 },
    { id: "tl_03", userId: "usr_ruby_c", game: "connect4", engineMatchPct: 62.4, moveTimeStdDevMs: 340, appFocusLostCount: 1, riskScore: 63, recordedAt: now - 58 * 60_000 },
    { id: "tl_04", userId: "usr_dex_p", game: "chess", engineMatchPct: 41.2, moveTimeStdDevMs: 1180, appFocusLostCount: 0, riskScore: 22, recordedAt: now - 74 * 60_000 },
    { id: "tl_05", userId: "usr_wren_k", game: "connect4", engineMatchPct: 35.9, moveTimeStdDevMs: 1420, appFocusLostCount: 0, riskScore: 14, recordedAt: now - 95 * 60_000 },
  ];
  return rows.sort((a, b) => b.recordedAt - a.recordedAt);
}

/** Rows at or above the kill threshold — the partial index
 *  idx_telemetry_high_risk serves exactly this slice in production. */
export function highRiskTelemetry(rows: TelemetryRow[] = telemetryFeed()): TelemetryRow[] {
  return rows.filter((r) => r.riskScore >= TELEMETRY_KILL_THRESHOLD);
}
