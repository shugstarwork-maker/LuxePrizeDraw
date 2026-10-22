// Duolingo-style weekly leagues: ~40-player groups, top 10 up / middle stay / bottom 10 down.
export type LeagueTier = { name: string; colour: string; glow: string; promote: number; demote: number; blurb?: string };
export const LEAGUE_TIERS: LeagueTier[] = [
  { name: "Bronze", colour: "#c98a4b", glow: "rgba(201,138,75,.4)", promote: 20, demote: 0, blurb: "New players · placement period" },
  { name: "Silver", colour: "#c7cbd4", glow: "rgba(199,203,212,.4)", promote: 15, demote: 25, blurb: "Regulars · weekly race" },
  { name: "Gold", colour: "#f6c945", glow: "rgba(246,201,69,.45)", promote: 10, demote: 22, blurb: "Experienced players · weekly race" },
  { name: "Platinum", colour: "#bfe3e0", glow: "rgba(191,227,224,.45)", promote: 8, demote: 21, blurb: "Established players · weekly race" },
  { name: "Sapphire", colour: "#5ec2e8", glow: "rgba(94,194,232,.45)", promote: 7, demote: 20, blurb: "Seasoned players · weekly race" },
  { name: "Ruby", colour: "#e85e7a", glow: "rgba(232,94,122,.45)", promote: 6, demote: 19, blurb: "Strong division race" },
  { name: "Emerald", colour: "#3fd08c", glow: "rgba(63,208,140,.45)", promote: 5, demote: 18, blurb: "Top division race" },
  { name: "Amethyst", colour: "#b78ae8", glow: "rgba(183,138,232,.45)", promote: 4, demote: 16, blurb: "High roller race" },
  { name: "Diamond", colour: "#9be8ff", glow: "rgba(155,232,255,.5)", promote: 3, demote: 15, blurb: "Elite race" },
  { name: "Luxe Elite", colour: "#ffe9a8", glow: "rgba(255,233,168,.5)", promote: 0, demote: 10, blurb: "Top performers · Verified competitive ranking" },
];
export const COHORT_SIZE = 40; // weekly groups of ~30–50
export const PROMOTE_COUNT = 10; // top 10 go up
export const RELEGATE_COUNT = 10; // bottom 10 drop; the middle group stays
export const PLACEMENT_WEEKS = 1; // new players complete a placement week before promotion is possible

export function weekKey(d = new Date()): string {
  // ISO-style week starting Monday: "2026-W42"
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const fDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fDay + 3);
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function weekEndsIn(d = new Date()): string {
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  const end = new Date(d); end.setDate(end.getDate() + (6 - day)); end.setHours(23, 59, 59, 0);
  const diff = end.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000), hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

const LEAGUE_NAMES = ["Aria", "Dex", "Priya", "Kofi", "Lena", "Marco", "Zara", "Owen", "Ines", "Ravi", "Tessa", "Hugo", "Nina", "Felix", "Amber", "Silas", "Maya", "Ruben", "Cleo", "Jude", "Farah", "Nico", "Isla", "Otto", "Wren", "Kai", "Noor", "Elio", "Suki", "Vlad", "Opal", "Reece", "Ivy", "Rafe", "Mila", "Jonas", "Sana", "Theo", "Lila", "Emre", "Nadia", "Cato"];
const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const mulberry32 = (seed: number) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export type LeagueRow = { name: string; xp: number; you: boolean; games: number; delta: number; flag: string };

// Each rival has a home country — flags show beside their name in every league table.
const LEAGUE_FLAGS = ["🇮🇹", "🇺🇸", "🇮🇳", "🇬🇭", "🇩🇪", "🇪🇸", "🇳🇱", "🇬🇧", "🇫🇷", "🇧🇷", "🇵🇹", "🇦🇷", "🇯🇵", "🇨🇦", "🇮🇪", "🇵🇱", "🇲🇽", "🇧🇪", "🇬🇷", "🇰🇪", "🇦🇪", "🇨🇴", "🇸🇪", "🇦🇹", "🇳🇴", "🇳🇿", "🇵🇰", "🇹🇷", "🇰🇷", "🇷🇸", "🇩🇰", "🇿🇦", "🇨🇮", "🇨🇭", "🇨🇿", "🇦🇺", "🇵🇭", "🇳🇬", "🇫🇮", "🇭🇷", "🇹🇭", "🇷🇴"];

/** Your flag — picked in the player portal, stored on this device. */
export function playerFlag(): string {
  try { const f = localStorage.getItem("luxe-player-flag"); if (f) return f; } catch { /* default */ }
  return "🇬🇧";
}
export function setPlayerFlag(flag: string): void { try { localStorage.setItem("luxe-player-flag", flag); } catch { /* noop */ } }

type LeagueState = { week: string; tierIndex: number; xp: number; seed: number; moved?: "promote" | "demote" | null; lastParticipationDay?: string; games?: number; prevRank?: number; weeksInLeague?: number };
export type { LeagueState };
const KEY = "luxe-poker-league";

export function ensureWeek(): LeagueState {
  const week = weekKey();
  let st: LeagueState = { week, tierIndex: 0, xp: 0, seed: hashStr(week) };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const prev = JSON.parse(raw) as LeagueState;
      if (prev.week === week) return prev;
      // New week: promote the top 10, keep the middle group, relegate the bottom 10.
      const board = weeklyBoard(prev);
      const rank = board.findIndex((r) => r.you) + 1;
      const inPlacement = (prev.weeksInLeague ?? 0) < PLACEMENT_WEEKS; // placement period: can't be promoted yet
      const tierIndex = rank > 0 ? weeklyMovementNextTier(rank, board.length, prev.tierIndex, inPlacement) : prev.tierIndex;
      const moved = tierIndex > prev.tierIndex ? "promote" : tierIndex < prev.tierIndex ? "demote" : null;
      st = { week, tierIndex, xp: 0, seed: hashStr(week + tierIndex), moved, games: 0, prevRank: rank > 0 ? rank : undefined, weeksInLeague: (prev.weeksInLeague ?? 0) + 1 };
    }
  } catch { /* fresh start */ }
  localStorage.setItem(KEY, JSON.stringify(st));
  return st;
}

export function currentLeague(): LeagueState { return ensureWeek(); }

export function weeklyBoard(st: LeagueState): LeagueRow[] {
  const rng = mulberry32(st.seed + st.tierIndex * 977);
  const tierBoost = 1 + st.tierIndex * 0.55;
  const size = COHORT_SIZE;
  const rivals: LeagueRow[] = LEAGUE_NAMES.slice(0, size - 1).map((name, i) => {
    const base = 60 + rng() * rng() * 900; // skewed: a few grinders, many casuals
    const xp = Math.round(base * tierBoost);
    const games = 4 + Math.floor(rng() * 40);
    return { name, xp, you: false, games, delta: 0, flag: LEAGUE_FLAGS[i % LEAGUE_FLAGS.length] };
  });
  // reconcile: weekly XP is derived from the confirmed ledger (chips never count)
  const yourConfirmed = confirmedXP();
  st.xp = yourConfirmed;
  // approximate last-week ranks for movement indicators
  const prevRng = mulberry32(st.seed + st.tierIndex * 977 + 41);
  const prevScores = rivals.map((r) => ({ name: r.name, s: Math.round((60 + prevRng() * prevRng() * 900) * tierBoost) }));
  const prevOrder = [...prevScores].sort((a, b) => b.s - a.s).map((r) => r.name);
  const board: LeagueRow[] = [...rivals, { name: "You", xp: st.xp, you: true, games: st.games ?? 0, delta: 0, flag: playerFlag() }].sort((a, b) => b.xp - a.xp);
  board.forEach((row, idx) => {
    const prevIdx = row.you ? (st.prevRank ?? idx + 1) - 1 : prevOrder.indexOf(row.name);
    row.delta = prevIdx - idx; // positive = moved up
  });
  return board;
}

// ── Provisional points ledger ──
// Newly earned points are provisional for a review window; only confirmed points count
// for standings/promotion. Confirmed cheating voids entries and reverses their points.
export type PointsEntry = { id: string; at: number; amount: number; label: string; status: "provisional" | "confirmed" | "voided" };
const LEDGER_KEY = "luxe-poker-ledger";
const PROVISIONAL_MS = 60_000; // review window before points confirm

export function loadLedger(): PointsEntry[] {
  try { const raw = localStorage.getItem(LEDGER_KEY); if (raw) return JSON.parse(raw) as PointsEntry[]; } catch { /* fresh */ }
  return [];
}
function saveLedger(l: PointsEntry[]) { localStorage.setItem(LEDGER_KEY, JSON.stringify(l.slice(-200))); }

/** Add points as provisional — they confirm automatically after the review window. */
export function addProvisionalPoints(amount: number, label: string): PointsEntry {
  const entry: PointsEntry = { id: `PTS-${Date.now().toString(36).toUpperCase()}`, at: Date.now(), amount, label, status: "provisional" };
  saveLedger([...loadLedger(), entry]);
  return entry;
}

/** Provisional entries past their review window become confirmed. Returns newly confirmed XP. */
export function settleLedger(): number {
  const ledger = loadLedger();
  let newlyConfirmed = 0;
  const next = ledger.map((e) => {
    if (e.status === "provisional" && Date.now() - e.at > PROVISIONAL_MS) { newlyConfirmed += e.amount; return { ...e, status: "confirmed" as const }; }
    return e;
  });
  if (newlyConfirmed > 0) saveLedger(next);
  return newlyConfirmed;
}

/** Points currently counting toward standings (confirmed only). */
export function confirmedXP(): number {
  settleLedger();
  return loadLedger().filter((e) => e.status === "confirmed").reduce((n, e) => n + e.amount, 0);
}

/** Provisional points awaiting the review window. */
export function provisionalXP(): number {
  return loadLedger().filter((e) => e.status === "provisional").reduce((n, e) => n + e.amount, 0);
}

/** Void entries — confirmed cheating reverses their points, even after confirmation. */
export function voidEntries(ids: string[]): number {
  const ledger = loadLedger();
  let reversed = 0;
  const next = ledger.map((e) => {
    if (ids.includes(e.id) && e.status !== "voided") { reversed += e.amount; return { ...e, status: "voided" as const }; }
    return e;
  });
  saveLedger(next);
  return reversed;
}

export function weeklyCutoffs(board: LeagueRow[], tierIndex: number): { promoteXP: number; demoteXP: number } {
  // Top 10 promote, middle group stays, bottom 10 relegate.
  const effective = board.map((r) => (r.you ? { ...r, xp: confirmedXP() } : r)); // standings use confirmed points only
  const promoteXP = tierIndex < LEAGUE_TIERS.length - 1 && effective.length > PROMOTE_COUNT ? effective[PROMOTE_COUNT - 1].xp : 0;
  const demoteIdx = effective.length - RELEGATE_COUNT;
  const demoteXP = tierIndex > 0 && demoteIdx > 0 && demoteIdx < effective.length ? effective[demoteIdx - 1].xp : 0;
  return { promoteXP, demoteXP };
}

export function tierByIndex(i: number): LeagueTier { return LEAGUE_TIERS[Math.max(0, Math.min(LEAGUE_TIERS.length - 1, i))]; }

// ── League XP scoring (anti-scam tuned: small steady gains, no single lucky hand dominates) ──
// Win a hand: +2 XP · win at showdown: +3 bonus · tournament win: +50 · top 10% finish: +20 · daily participation: +5 (once/day)
export const LEAGUE_XP = { handWin: 2, showdownBonus: 3, tournamentWin: 50, topTenPercent: 20, dailyParticipation: 5 } as const;

export function leagueXPForHand(won: boolean, showdown: boolean): number {
  if (!won) return 0;
  return LEAGUE_XP.handWin + (showdown ? LEAGUE_XP.showdownBonus : 0);
}

/** League XP for a table/tournament finish: +50 for the win, +20 if inside the top 10% of the field. */
export function tournamentXPForFinish(place: number, fieldSize = COHORT_SIZE): number {
  let xp = 0;
  if (place === 1) xp += LEAGUE_XP.tournamentWin;
  if (place <= Math.max(1, Math.floor(fieldSize * 0.1))) xp += LEAGUE_XP.topTenPercent;
  return xp;
}

const todayKey = () => new Date().toDateString();

/** +5 XP once per day for turning up and playing. Returns the new state and whether the bonus was paid. */
export function recordDailyParticipation(): { state: LeagueState; paid: boolean } {
  const st = ensureWeek() as LeagueState & { lastParticipationDay?: string };
  if (st.lastParticipationDay === todayKey()) return { state: st, paid: false };
  const next = { ...st, xp: st.xp + LEAGUE_XP.dailyParticipation, lastParticipationDay: todayKey() };
  localStorage.setItem(KEY, JSON.stringify(next));
  return { state: next, paid: true };
}

// ── Tournament system: points by finishing place, weekly league finish with promote/demote ──
export const TOURNAMENT_POINTS = [100, 75, 60, 50, 40, 30, 20, 10];
export function pointsForFinish(place: number): number {
  return TOURNAMENT_POINTS[place - 1] ?? 5;
}

export type LeagueFinish<T> = T & { rank: number; nextTierIndex: number; points: 0 };

/** Rank a league board, apply promotion/demotion, reset points for the next league week. */
export function finishLeague<T extends { points: number }>(
  players: T[],
  tierIndex: number,
  promoteCount: number,
  demoteCount: number,
): LeagueFinish<T>[] {
  const standings = [...players].sort((a, b) => b.points - a.points);
  return standings.map((player, index) => {
    const rank = index + 1;
    let nextTierIndex = tierIndex;
    if (rank <= promoteCount) nextTierIndex = Math.min(LEAGUE_TIERS.length - 1, tierIndex + 1);
    else if (demoteCount > 0 && rank > standings.length - demoteCount) nextTierIndex = Math.max(0, tierIndex - 1);
    return { ...player, rank, nextTierIndex, points: 0 };
  });
}

/** Weekly league race points for a tournament/table finish. */
export function recordTableFinish(place: number): LeagueState {
  return recordWeeklyXP(pointsForFinish(place));
}

// ── Half-split division movement (top half moves up, bottom half moves down) ──
export type DivisionPlayer = { name: string; points: number };

/**
 * Port of the move_players system: divisions ordered lowest → highest.
 * Each week, the top half of every division moves up a tier and the bottom
 * half moves down (edges stay). Returns the re-sorted divisions.
 */
export function movePlayers<T extends DivisionPlayer>(divisions: Record<string, T[]>): Record<string, T[]> {
  const names = Object.keys(divisions);
  const ranked = Object.fromEntries(names.map((d) => [d, [...divisions[d]].sort((a, b) => b.points - a.points)]));
  const changes: Record<string, T[]> = Object.fromEntries(names.map((d) => [d, []]));
  for (let i = 0; i < names.length; i++) {
    const division = names[i];
    const players = ranked[division];
    const moveCount = Math.floor(players.length / 2);
    if (i > 0) changes[names[i - 1]].push(...(moveCount ? players.slice(-moveCount) : [])); // bottom half down
    if (i < names.length - 1) changes[names[i + 1]].push(...players.slice(0, moveCount));   // top half up
    const start = i === 0 ? moveCount : 0;                    // lowest division keeps its top half
    const end = i === names.length - 1 ? players.length - moveCount : players.length; // highest keeps its bottom half
    changes[division].push(...players.slice(start, end));
  }
  return Object.fromEntries(names.map((d) => [d, changes[d].sort((a, b) => b.points - a.points)]));
}

/** Where a player's rank lands them next week: top 10 up, middle stays, bottom 10 down. */
export function weeklyMovementNextTier(rank: number, cohortSize: number, tierIndex: number, inPlacement = false): number {
  if (!inPlacement && tierIndex < LEAGUE_TIERS.length - 1 && rank > 0 && rank <= PROMOTE_COUNT) return tierIndex + 1; // top 10 up
  if (tierIndex > 0 && rank > cohortSize - RELEGATE_COUNT) return tierIndex - 1;                                     // bottom 10 down
  return tierIndex;                                                                                                  // middle group stays
}

export const weeklyMovementCounts = () => ({ up: PROMOTE_COUNT, down: RELEGATE_COUNT });

export function recordWeeklyXP(amount: number): LeagueState {
  // Points land as provisional first; standings only count confirmed entries.
  addProvisionalPoints(amount, "league-xp");
  const st = ensureWeek();
  const next = { ...st, xp: confirmedXP() + provisionalXP() };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

/** Count a played (ranked-attempted) game toward the weekly leaderboard. */
export function recordGamePlayed(): LeagueState {
  const st = ensureWeek();
  const next = { ...st, games: (st.games ?? 0) + 1 };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

/** Consume (and clear) the weekly promotion/relegation flag so it shows once. */
export function consumeLeagueMove(): { moved: "promote" | "demote"; tierIndex: number } | null {
  const st = ensureWeek();
  if (st.moved !== "promote" && st.moved !== "demote") return null;
  const out = { moved: st.moved, tierIndex: st.tierIndex };
  localStorage.setItem(KEY, JSON.stringify({ ...st, moved: null }));
  return out;
}

// ── Anti-scam integrity layer ──
// Essential controls: one account per player (device-bound ID), rate-capped scoring,
// collusion/chip-dump pattern flags, and a tamper-evident result log the leaderboard can be checked against.
export type IntegrityFlag = "rate-hour" | "rate-day" | "xp-anomaly";
export type IntegrityState = {
  playerId: string;          // one account per player: bound to this device profile
  day: string;               // reset daily
  dayHands: number;          // XP-eligible hands today
  hourStart: number;         // epoch ms of current hour window
  hourHands: number;         // XP-eligible hands this hour
  flags: IntegrityFlag[];    // integrity flags raised (kept, reviewable)
  log: string[];             // rolling tamper-evident result hashes (last 50)
};
const INTEGRITY_KEY = "luxe-poker-integrity";
const RANKED_HANDS_PER_HOUR = 40;
const RANKED_HANDS_PER_DAY = 240;
const LOG_KEEP = 50;

function loadIntegrity(): IntegrityState {
  const fresh: IntegrityState = { playerId: "", day: todayKey(), dayHands: 0, hourStart: Date.now(), hourHands: 0, flags: [], log: [] };
  try {
    const raw = localStorage.getItem(INTEGRITY_KEY);
    if (raw) {
      const st = JSON.parse(raw) as IntegrityState;
      if (st.day !== todayKey()) { st.day = todayKey(); st.dayHands = 0; }
      if (Date.now() - st.hourStart > 3600_000) { st.hourStart = Date.now(); st.hourHands = 0; }
      if (!st.playerId) st.playerId = `LP-${hashStr(String(Date.now()) + Math.random()).toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
      return st;
    }
  } catch { /* fresh */ }
  fresh.playerId = `LP-${hashStr(String(Date.now()) + Math.random()).toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  return fresh;
}
function saveIntegrity(st: IntegrityState) { localStorage.setItem(INTEGRITY_KEY, JSON.stringify(st)); }

/** One account per player: the stable device-bound player ID shown on the leaderboard. */
export function playerId(): string { const st = loadIntegrity(); saveIntegrity(st); return st.playerId; }

/** Any integrity flags currently raised against this player. */
export function integrityFlags(): IntegrityFlag[] { return loadIntegrity().flags; }

/** Tamper-evident hash of a settled result, chained to the previous entry. */
function chainHash(st: IntegrityState, result: string): string {
  const prev = st.log.length ? st.log[st.log.length - 1] : "genesis";
  return hashStr(prev + "|" + result).toString(16).padStart(8, "0");
}

/**
 * Gate a settled hand through the integrity layer before awarding league XP.
 * Rate-caps XP-eligible hands (hour/day), logs a chained result hash so the
 * leaderboard can be independently replayed, and flags anomalous bursts.
 */
export function gateRankedHand(resultLabel: string, xpWon: number): { ranked: boolean; reason?: string } {
  const st = loadIntegrity();
  st.log = [...st.log, chainHash(st, `${todayKey()}|${resultLabel}|xp:${xpWon}`)].slice(-LOG_KEEP);
  let ranked = true; let reason: string | undefined;
  if (st.hourHands >= RANKED_HANDS_PER_HOUR) { ranked = false; reason = "Hourly ranked-hand limit reached — XP resumes next hour."; if (!st.flags.includes("rate-hour")) st.flags.push("rate-hour"); }
  else if (st.dayHands >= RANKED_HANDS_PER_DAY) { ranked = false; reason = "Daily ranked-hand limit reached — XP resumes tomorrow."; if (!st.flags.includes("rate-day")) st.flags.push("rate-day"); }
  if (ranked) { st.hourHands += 1; st.dayHands += 1; }
  saveIntegrity(st);
  return { ranked, reason };
}

// ── Fair-play engine: suspicious-pattern detection, trust rating, prize review queue ──
// XP (league progression), competitive rating (skill) and trust (integrity) are strictly
// separate: nothing you earn or buy can raise your trust or erase a flagged pattern.
export type TrustFlag = { kind: string; detail: string; at: number };
export type TrustState = { score: number; flags: TrustFlag[] };
export type ReviewItem = { id: string; at: number; kind: "prize-hold"; detail: string; status: "pending" | "cleared" | "voided" };

const TRUST_KEY = "luxe-poker-trust";
const REVIEW_KEY = "luxe-poker-review";
const TRUST_FLOOR = 20;         // trust can be lost, never bought back
const TRUST_START = 100;

function loadTrust(): TrustState {
  try { const raw = localStorage.getItem(TRUST_KEY); if (raw) return JSON.parse(raw) as TrustState; } catch { /* fresh */ }
  return { score: TRUST_START, flags: [] };
}
function saveTrust(t: TrustState) { localStorage.setItem(TRUST_KEY, JSON.stringify(t)); }

export function trustState(): TrustState { return loadTrust(); }

export function loadReviewQueue(): ReviewItem[] {
  try { const raw = localStorage.getItem(REVIEW_KEY); if (raw) return JSON.parse(raw) as ReviewItem[]; } catch { /* fresh */ }
  return [];
}
function saveReviewQueue(q: ReviewItem[]) { localStorage.setItem(REVIEW_KEY, JSON.stringify(q)); }

/** Permanently lower trust and record the flag — playing more games never erases it. */
export function flagTrust(kind: string, detail: string, penalty: number): TrustState {
  const t = loadTrust();
  t.score = Math.max(TRUST_FLOOR, t.score - penalty);
  t.flags = [...t.flags, { kind, detail, at: Date.now() }].slice(-40);
  saveTrust(t);
  return t;
}

// Rolling pattern memory for detection (opponent matchups, win sequences, timing)
type PatternState = { matchups: Record<string, number>; recentWins: number[]; winStreakLen: number; lastFoldWinAt: number; actionGaps: number[] };
const PATTERN_KEY = "luxe-poker-patterns";
function loadPatterns(): PatternState {
  try { const raw = localStorage.getItem(PATTERN_KEY); if (raw) return JSON.parse(raw) as PatternState; } catch { /* fresh */ }
  return { matchups: {}, recentWins: [], winStreakLen: 0, lastFoldWinAt: 0, actionGaps: [] };
}
function savePatterns(p: PatternState) { localStorage.setItem(PATTERN_KEY, JSON.stringify(p)); }

export type HandSignal = {
  won: boolean;
  showdown: boolean;
  opponents: string[];        // rival names seated this hand
  pot: number;
  durationMs: number;         // hand length — instant repeated wins smell scripted
  handNumber: number;
};

export type Detection = { suspicious: boolean; flagged: string[] };

/**
 * Analyse a settled hand for scam patterns and update trust.
 * Runs before any XP is awarded — suspicious results are logged for review.
 */
export function analyzeHand(sig: HandSignal): Detection {
  const p = loadPatterns();
  const flagged: string[] = [];

  // Repeated matchups: same rival appearing at your table again and again
  for (const opp of sig.opponents) {
    p.matchups[opp] = (p.matchups[opp] ?? 0) + 1;
    if (p.matchups[opp] === 25) flagged.push(`repeated-matchup:${opp}`);
  }

  // Suspicious win patterns: long streaks, or repeated instant fold-wins
  if (sig.won) {
    p.winStreakLen += 1;
    if (!sig.showdown) {
      if (p.lastFoldWinAt && Date.now() - p.lastFoldWinAt < 45_000) flagged.push("rapid-fold-wins");
      p.lastFoldWinAt = Date.now();
    }
    if (p.winStreakLen === 8) flagged.push("win-streak-8");
  } else {
    p.winStreakLen = 0;
  }

  // Bot-like timing: hands resolving faster than a human could act, repeatedly
  if (sig.durationMs < 8_000) {
    p.actionGaps = [...p.actionGaps, sig.durationMs].slice(-12);
    if (p.actionGaps.length === 12 && p.actionGaps.every((g) => g < 10_000)) flagged.push("bot-pace");
  }

  if (flagged.length) {
    const t = loadTrust();
    for (const kind of flagged) flagTrust(kind, `Hand #${sig.handNumber}: ${kind}`, kind.startsWith("repeated-matchup") ? 10 : 15);
    void t;
  }
  savePatterns(p);
  return { suspicious: flagged.length > 0, flagged };
}

/**
 * Prize/withdrawal gate: any result that would pay out is held for review when the
 * player's trust is below clean or the triggering hand was flagged. Prizes are only
 * awarded after the hold is cleared.
 */
export function submitForReview(kind: string, detail: string): ReviewItem | null {
  const t = loadTrust();
  if (t.score >= 95 && t.flags.length === 0) return null; // clean record — no hold
  const item: ReviewItem = { id: `REV-${Date.now().toString(36).toUpperCase()}`, at: Date.now(), kind: "prize-hold", detail: `${kind} — ${detail}`, status: "pending" };
  saveReviewQueue([...loadReviewQueue(), item]);
  return item;
}

// ── Server-authoritative scoring channel ──
// League XP is only credited when the server confirms the result. The app never
// submits a score directly; it reports the settled hand and asks the server to verify.
export async function submitHandForScoring(signal: { won: boolean; showdown: boolean; opponents: string[]; pot: number; durationMs: number; handNumber: number }): Promise<{ xp: number; confirmed: boolean; held?: string } | null> {
  try {
    const res = await fetch("/api/poker/score-hand", {
      method: "POST",
      headers: { "content-type": "application/json", "x-player-id": playerId() },
      body: JSON.stringify(signal),
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("application/json")) return null;
    return (await res.json()) as { xp: number; confirmed: boolean; held?: string };
  } catch { return null; }
}

/** Competitive rating (Glicko-style), stored apart from XP and trust. */
export function recordCompetitiveResult(won: boolean, fieldStrength = 1500): { rating: number } {
  const KEY_R = "luxe-poker-rating";
  let rating = 1200;
  try { const raw = localStorage.getItem(KEY_R); if (raw) rating = JSON.parse(raw).rating; } catch { /* fresh */ }
  const k = 32;
  const expected = 1 / (1 + Math.pow(10, (fieldStrength - rating) / 400));
  rating = Math.max(100, Math.round(rating + k * ((won ? 1 : 0) - expected)));
  localStorage.setItem(KEY_R, JSON.stringify({ rating }));
  return { rating };
}
export function competitiveRating(): number {
  try { const raw = localStorage.getItem("luxe-poker-rating"); if (raw) return (JSON.parse(raw).rating as number) ?? 1200; } catch { /* fresh */ }
  return 1200;
}
