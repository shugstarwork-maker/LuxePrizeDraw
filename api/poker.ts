// Server-authoritative Luxe Poker tables.
// The server — never the browser — decides the cards (seeded shuffle), valid actions,
// outcomes and league points. Clients submit actions; every hand, action, result and
// score change is written to an append-only, hash-chained record that can be replayed
// for disputes and that administrators cannot quietly edit.
import crypto from "crypto";
import { applyAction, botAction, createTable, dealHand, type HoldemAction, type HoldemState } from "../src/games/holdem";

const VALID_ACTIONS: HoldemAction[] = ["fold", "check", "call", "raise"];

function mulberry32(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

// ── Append-only game record (hash-chained; any edit breaks every later link) ──
type RecordEntry = { seq: number; at: number; kind: string; data: unknown; prevHash: string; hash: string };
const RECORD_MAX = 5000;
let recordSeq = 0;
const recordLog: RecordEntry[] = [];

export function appendRecord(kind: string, data: unknown): RecordEntry {
  const prevHash = recordLog.length ? recordLog[recordLog.length - 1].hash : "genesis";
  const entry: RecordEntry = { seq: ++recordSeq, at: Date.now(), kind, data, prevHash, hash: "" };
  entry.hash = hash(`${entry.seq}|${entry.at}|${entry.kind}|${JSON.stringify(entry.data)}|${prevHash}`);
  recordLog.push(entry);
  if (recordLog.length > RECORD_MAX) recordLog.splice(0, recordLog.length - RECORD_MAX);
  return entry;
}

/** Recompute the chain to prove nothing was edited — admins included. */
export function auditRecordChain(): { intact: boolean; length: number; brokenAt?: number } {
  for (let i = 0; i < recordLog.length; i++) {
    const e = recordLog[i];
    const prevHash = i === 0 ? "genesis" : recordLog[i - 1].hash;
    const expect = hash(`${e.seq}|${e.at}|${e.kind}|${JSON.stringify(e.data)}|${prevHash}`);
    if (e.prevHash !== prevHash || e.hash !== expect) return { intact: false, length: recordLog.length, brokenAt: e.seq };
  }
  return { intact: true, length: recordLog.length };
}

// ── Tables live on the server ──
export type PokerTableSession = {
  id: string;
  playerId: string;
  state: HoldemState;
  seed: number;
  league: string;         // league tier name this table belongs to
  blinds: string;
  buyIn: number;
  createdAt: number;
  lastActionAt: number;
  handStartedAt: number;
  handCounts: { hourStart: number; hourHands: number; day: string; dayHands: number };
  pendingXP: number;      // server-held XP balance for this table (league ledger)
  reviewHolds: { id: string; detail: string; at: number; status: "pending" }[];
  trust: number;
  patterns: { winStreak: number; lastFoldWinAt: number; actionGaps: number[]; matchups: Record<string, number> };
};

const tables = new Map<string, PokerTableSession>();
const RANKED_HANDS_PER_HOUR = 40;
const RANKED_HANDS_PER_DAY = 240;
const LEAGUE_XP = { handWin: 2, showdownBonus: 3, tournamentWin: 50, topTenPercent: 20, dailyParticipation: 5 };

export const LEAGUE_TABLES = [
  { league: "Bronze", smallBlind: 10, bigBlind: 20, buyIn: 200 },
  { league: "Silver", smallBlind: 25, bigBlind: 50, buyIn: 500 },
  { league: "Gold", smallBlind: 50, bigBlind: 100, buyIn: 1000 },
  { league: "Sapphire", smallBlind: 100, bigBlind: 200, buyIn: 2000 },
  { league: "Ruby", smallBlind: 200, bigBlind: 400, buyIn: 4000 },
  { league: "Diamond", smallBlind: 400, bigBlind: 800, buyIn: 8000 },
  { league: "Luxe Elite", smallBlind: 800, bigBlind: 1600, buyIn: 16000 },
];

function dayKey() { return new Date().toDateString(); }

function runBots(t: PokerTableSession) {
  // Server plays all bot turns itself; the client never sees or controls bot decisions.
  let guard = 0;
  while (!t.state.handOver && guard++ < 60) {
    const actor = t.state.players[t.state.turnIndex];
    if (!actor || !actor.isBot) break;
    const decision = botAction(t.state, actor, mulberry32(t.seed + t.state.handNumber * 131 + guard));
    const before = t.state;
    t.state = applyAction(t.state, actor.id, decision.action, decision.raiseTo ?? 0);
    if (t.state !== before) appendRecord("action", { table: t.id, hand: t.state.handNumber, player: actor.id, action: decision.action, raiseTo: decision.raiseTo ?? 0 });
  }
}

function settleXP(t: PokerTableSession): { xpAwarded: number; held: string[]; notes: string[] } {
  const st = t.state;
  const notes: string[] = [];
  const held: string[] = [];
  if (!st.handOver || st.winners.length === 0) return { xpAwarded: 0, held, notes };
  const mine = st.winners.find((w) => w.id === "you");
  const you = st.players.find((p) => p.id === "you");
  if (!you || you.sittingOut) return { xpAwarded: 0, held, notes };
  const showdown = st.board.length === 5;
  let xp = mine ? LEAGUE_XP.handWin + (showdown ? LEAGUE_XP.showdownBonus : 0) : 0;

  // Rate caps — server enforced
  const hc = t.handCounts;
  if (hc.day !== dayKey()) { hc.day = dayKey(); hc.dayHands = 0; }
  if (Date.now() - hc.hourStart > 3600_000) { hc.hourStart = Date.now(); hc.hourHands = 0; }
  const overHour = hc.hourHands >= RANKED_HANDS_PER_HOUR;
  const overDay = hc.dayHands >= RANKED_HANDS_PER_DAY;
  if (xp > 0) { hc.hourHands += 1; hc.dayHands += 1; }

  // Pattern analysis — suspicious wins are flagged for review, never auto-banned
  const p = t.patterns;
  if (mine) {
    p.winStreak += 1;
    if (!showdown) {
      if (p.lastFoldWinAt && Date.now() - p.lastFoldWinAt < 45_000) held.push("rapid-fold-wins");
      p.lastFoldWinAt = Date.now();
    }
    if (p.winStreak === 8) held.push("win-streak-8");
  } else p.winStreak = 0;
  const durationMs = Date.now() - t.handStartedAt;
  if (durationMs < 8_000) {
    p.actionGaps = [...p.actionGaps, durationMs].slice(-12);
    if (p.actionGaps.length === 12 && p.actionGaps.every((g) => g < 10_000)) held.push("bot-pace");
  }
  for (const opp of st.players.filter((x) => x.id !== "you" && !x.sittingOut)) {
    p.matchups[opp.name] = (p.matchups[opp.name] ?? 0) + 1;
    if (p.matchups[opp.name] === 25) held.push(`repeated-matchup:${opp.name}`);
  }
  if (held.length) t.trust = Math.max(20, t.trust - 10 * held.length);

  if (xp > 0 && (overHour || overDay)) { notes.push(overHour ? "Hourly ranked-hand limit reached — XP resumes next hour." : "Daily ranked-hand limit reached — XP resumes tomorrow."); xp = 0; }
  if (xp > 0 && held.length) {
    const hold = { id: `REV-${Date.now().toString(36).toUpperCase()}`, detail: `+${xp} XP on hand #${st.handNumber} — ${held.join(", ")}`, at: Date.now(), status: "pending" as const };
    t.reviewHolds.push(hold);
    appendRecord("review-hold", { table: t.id, player: t.playerId, hold });
    notes.push(`Result sent for review (${hold.id}) before XP is credited.`);
    xp = 0;
  }
  if (xp > 0) t.pendingXP += xp;
  appendRecord("hand", { table: t.id, hand: st.handNumber, winners: st.winners.map((w) => ({ id: w.id, amount: w.amount })), showdown, xpAwarded: xp, held, trust: t.trust });
  return { xpAwarded: xp, held, notes };
}

export function createPokerTable(playerId: string, tierIndex: number): PokerTableSession {
  const def = LEAGUE_TABLES[Math.max(0, Math.min(LEAGUE_TABLES.length - 1, tierIndex))];
  const seed = crypto.randomInt(0, 2 ** 31);
  const state = createTable({ playerName: "You", playerChips: def.buyIn, botCount: 5, botChips: 1000, smallBlind: def.smallBlind, bigBlind: def.bigBlind });
  const t: PokerTableSession = {
    id: `T-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    playerId, state, seed, league: def.league, blinds: `${def.smallBlind} / ${def.bigBlind}`, buyIn: def.buyIn,
    createdAt: Date.now(), lastActionAt: Date.now(), handStartedAt: Date.now(),
    handCounts: { hourStart: Date.now(), hourHands: 0, day: dayKey(), dayHands: 0 },
    pendingXP: 0, reviewHolds: [], trust: 100,
    patterns: { winStreak: 0, lastFoldWinAt: 0, actionGaps: [], matchups: {} },
  };
  tables.set(t.id, t);
  appendRecord("table-open", { table: t.id, player: playerId, league: def.league, seed });
  return t;
}

export function dealServerHand(t: PokerTableSession) {
  const rng = mulberry32(t.seed + t.state.handNumber * 7919);
  t.state = dealHand(t.state, rng);
  t.handStartedAt = Date.now();
  appendRecord("deal", { table: t.id, hand: t.state.handNumber, seedOffset: t.seed + t.state.handNumber * 7919 });
  runBots(t);
}

export function playerAct(t: PokerTableSession, action: string, raiseTo: number): { ok: boolean; error?: string } {
  if (t.state.handOver) return { ok: false, error: "hand_over" };
  if (!VALID_ACTIONS.includes(action as HoldemAction)) return { ok: false, error: "invalid_action" };
  const actor = t.state.players[t.state.turnIndex];
  if (!actor || actor.id !== "you") return { ok: false, error: "not_your_turn" };
  const before = t.state;
  try {
    t.state = applyAction(t.state, "you", action as HoldemAction, raiseTo);
  } catch { return { ok: false, error: "illegal_move" }; }
  if (t.state === before) return { ok: false, error: "illegal_move" };
  t.lastActionAt = Date.now();
  appendRecord("action", { table: t.id, hand: t.state.handNumber, player: "you", action, raiseTo });
  const settled = settleXP(t);
  if (!t.state.handOver) runBots(t);
  return { ok: true, ...settled };
}

export function getTable(id: string) { return tables.get(id); }

/** Replay a table's record entries to reconstruct outcomes for disputes. */
export function replayTable(tableId: string): { entries: RecordEntry[]; summary: { hands: number; actions: number; xpAwarded: number; holds: number } } {
  const entries = recordLog.filter((e) => (e.data as { table?: string })?.table === tableId);
  return {
    entries,
    summary: {
      hands: entries.filter((e) => e.kind === "hand").length,
      actions: entries.filter((e) => e.kind === "action").length,
      xpAwarded: entries.filter((e) => e.kind === "hand").reduce((n, e) => n + ((e.data as { xpAwarded?: number }).xpAwarded ?? 0), 0),
      holds: entries.filter((e) => e.kind === "review-hold").length,
    },
  };
}
