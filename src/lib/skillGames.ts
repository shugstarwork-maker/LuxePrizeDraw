// Skill Games Arena — pure-skill PvP catalogue with the dual-currency model.
// Chess, Draughts and Connect Four are 100% games of skill: outcomes depend
// entirely on player decisions, which is what keeps prize tournaments outside
// the gambling definition (UK skill-based competition framing — legal review
// still required before prizes go live).
//
// Pre-launch simulation: local two-player boards only. Server-authoritative
// matchmaking, anti-cheat telemetry and prize settlement switch on at launch.

import { loadWallet, saveWallet, spendSweepTickets, type Wallet } from "./currencies";

// ── Game catalogue ──────────────────────────────────────────────────────────

export type SkillGameId = "chess" | "draughts" | "connect4";

export type SkillGame = {
  id: SkillGameId;
  title: string;
  piece: string;          // emoji marker
  blurb: string;
  clockSeconds: number;   // per-player match clock
  skillNote: string;
};

export const SKILL_GAMES: SkillGame[] = [
  { id: "chess", title: "Luxe Chess", piece: "♞", blurb: "Full legal chess with a 10-minute clock. The deepest skill game in the arena.", clockSeconds: 600, skillNote: "Openings, tactics and endgame technique decide every match." },
  { id: "draughts", title: "Draughts", piece: "⚫", blurb: "Mandatory captures and crowned kings — punish every loose move.", clockSeconds: 300, skillNote: "Forced-capture arithmetic rewards exact calculation." },
  { id: "connect4", title: "Connect Four", piece: "🔴", blurb: "Solved but still savage — fastest matches in the arena.", clockSeconds: 120, skillNote: "Control the odd rows and never gift the winning column." },
];

export function skillGame(id: SkillGameId): SkillGame {
  return SKILL_GAMES.find((g) => g.id === id)!;
}

// ── Entry formats ───────────────────────────────────────────────────────────
// Rule 1 from the economy architecture: Gold Coins and Sweep Tickets live in
// separate ledgers and never convert into each other.

export type EntryFormat = "casual" | "prize";

export type ArenaFormat = {
  id: EntryFormat;
  label: string;
  currency: "gold" | "tickets";
  entryLabel: string;
  stakesLabel: string;
  locked: boolean;              // prize format stays locked pre-launch
  honesty: string;
};

export const ARENA_FORMATS: ArenaFormat[] = [
  {
    id: "casual",
    label: "Casual · Gold Coins",
    currency: "gold",
    entryLabel: "Free to play",
    stakesLabel: "Bragging rights + arena rating",
    locked: false,
    honesty: "Gold Coins have zero real-world value — practice and pride only.",
  },
  {
    id: "prize",
    label: "Prize · Sweep Tickets",
    currency: "tickets",
    entryLabel: "Sweep Ticket entry",
    stakesLabel: "Winner takes the Prize Point pot",
    locked: true,
    honesty: "Opens after launch with 18+ ID checks. Tickets are always free, never sold.",
  },
];

export const PRIZE_ENTRY_TICKETS = 3;        // tickets per prize match
export const PRIZE_WIN_POINTS = 250;         // Prize Points to the winner

// ── Skill rating (SBMM) ─────────────────────────────────────────────────────
// Per-game ELO-style rating used to pair similar players at launch.

const RATING_KEY = "luxe-skill-ratings-v1";
const K_FACTOR = 32;
export const START_RATING = 800;

type RatingTable = Partial<Record<SkillGameId, number>>;

function ratings(): RatingTable {
  try {
    return (JSON.parse(localStorage.getItem(RATING_KEY) ?? "{}") as RatingTable) ?? {};
  } catch {
    return {};
  }
}

export function skillRating(game: SkillGameId): number {
  return ratings()[game] ?? START_RATING;
}

/** ELO update; returns both players' new ratings. */
export function applyResult(game: SkillGameId, youWon: boolean, opponentRating = START_RATING): { rating: number; delta: number } {
  const mine = skillRating(game);
  const expected = 1 / (1 + Math.pow(10, (opponentRating - mine) / 400));
  const delta = Math.round(K_FACTOR * ((youWon ? 1 : 0) - expected));
  const rating = Math.max(100, mine + delta);
  try { localStorage.setItem(RATING_KEY, JSON.stringify({ ...ratings(), [game]: rating })); } catch { /* demo only */ }
  return { rating, delta };
}

/** Matchmaking band — queue only pairs players inside this window. */
export function matchmakingBand(game: SkillGameId): { min: number; max: number } {
  const r = skillRating(game);
  return { min: r - 150, max: r + 150 };
}

// ── Forfeit & anti-cheat rules (enforced server-side at launch) ─────────────

export const FORFEIT_GRACE_SECONDS = 60;

export const ARENA_RULES = [
  "Skill only — no random elements. Every outcome is decided by the moves you make.",
  `Disconnects get a ${FORFEIT_GRACE_SECONDS}-second grace window, then the match is forfeited and the entry passes to your opponent.`,
  "Engine assistance is cheating. Move-timing and accuracy telemetry flags perfect machine play for review.",
  "Sweep Ticket prize matches unlock after launch, legal sign-off and an approved 18+ ID check.",
] as const;

// ── Matchmaking queue ───────────────────────────────────────────────────────
// UK regional servers (eu-west-2) at launch so clocks stay fair. If no human
// opponent is found inside the window, the entry is ALWAYS refunded.

export const MATCHMAKING_TIMEOUT_SECONDS = 30;

export type QueueResult =
  | { status: "matched"; opponent: string }
  | { status: "timeout"; refunded: true };

/**
 * Demo matchmaking queue. Pre-launch there is no server pool, so every queue
 * safely times out and refunds the ticket entry — exactly the behaviour the
 * live service must guarantee before money or prizes are involved.
 */
export function queueForMatch(wallet: Wallet, game: SkillGameId): Promise<{ result: QueueResult; wallet: Wallet }> {
  void game;
  return new Promise((resolve) => {
    setTimeout(() => {
      // No paid entry is ever debited pre-launch, so the "refund" is a no-op
      // on the ledger — but the contract is exercised end to end.
      resolve({ result: { status: "timeout", refunded: true }, wallet });
    }, MATCHMAKING_TIMEOUT_SECONDS * 1000);
  });
}

// ── Prize entry gate ────────────────────────────────────────────────────────

export type PrizeEntryResult =
  | { ok: true; wallet: Wallet }
  | { ok: false; reason: "locked" | "insufficient"; needed?: number };

/** Attempt to enter a prize match. Locked pre-launch; when unlocked it will
 *  debit tickets — never Gold Coins — and only via this function. */
export function enterPrizeMatch(wallet: Wallet): PrizeEntryResult {
  const format = ARENA_FORMATS.find((f) => f.id === "prize")!;
  if (format.locked) return { ok: false, reason: "locked" };
  const next = spendSweepTickets(wallet, PRIZE_ENTRY_TICKETS);
  if (!next) return { ok: false, reason: "insufficient", needed: PRIZE_ENTRY_TICKETS };
  return { ok: true, wallet: saveWallet(next) };
}

/** Convenience for UI: current wallet from the shared ledger. */
export function arenaWallet(): Wallet {
  return loadWallet();
}
