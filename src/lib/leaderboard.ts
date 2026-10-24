// Arena leaderboard & match history — pre-launch demo ladder.
//
// The live service will compute standings from server-authoritative matches.
// Until launch, the ladder shows the player's genuine local ELO (luxe-skill-
// ratings-v1) ranked against a fixed field of demo rivals, and the results
// feed records the player's own local match outcomes. No cash, no prizes —
// ratings and history carry zero real-world value.

import { skillRating, type SkillGameId } from "./skillGames";

// ── Demo rival field ────────────────────────────────────────────────────────

export type LadderEntry = {
  name: string;
  rating: number;
  you?: boolean;
};

export const DEMO_RIVALS: Record<SkillGameId, { name: string; rating: number }[]> = {
  chess: [
    { name: "Marcus B.", rating: 940 },
    { name: "Onyx O.", rating: 861 },
    { name: "Ruby C.", rating: 815 },
    { name: "Priya K.", rating: 742 },
    { name: "Tom H.", rating: 688 },
  ],
  draughts: [
    { name: "Ruby C.", rating: 902 },
    { name: "Marcus B.", rating: 847 },
    { name: "Ada L.", rating: 790 },
    { name: "Tom H.", rating: 733 },
  ],
  connect4: [
    { name: "Priya K.", rating: 915 },
    { name: "Ruby C.", rating: 868 },
    { name: "Ada L.", rating: 822 },
    { name: "Onyx O.", rating: 771 },
    { name: "Marcus B.", rating: 705 },
  ],
};

/** Sorted ladder (high → low) with the player's live local rating merged in. */
export function leaderboard(game: SkillGameId): LadderEntry[] {
  const mine = skillRating(game);
  const field: LadderEntry[] = [...DEMO_RIVALS[game], { name: "You", rating: mine, you: true }];
  return field.sort((a, b) => b.rating - a.rating);
}

/** Player's rank on the demo ladder, 1-based. */
export function ladderRank(game: SkillGameId): number {
  return leaderboard(game).findIndex((e) => e.you) + 1;
}

/** Tier label for a rating — purely cosmetic ladder flavour. */
export function ladderTier(rating: number): string {
  if (rating >= 900) return "Diamond";
  if (rating >= 830) return "Platinum";
  if (rating >= 780) return "Gold";
  if (rating >= 730) return "Silver";
  return "Bronze";
}

// ── Match history ledger ────────────────────────────────────────────────────

const HISTORY_KEY = "luxe-arena-history-v1";
const HISTORY_LIMIT = 50;

export type ArenaResult = {
  id: string;
  game: SkillGameId;
  outcome: "win" | "draw" | "loss";
  opponent: string;
  ratingDelta: number;
  format: "casual" | "prize";
  at: number; // epoch ms
};

function history(): ArenaResult[] {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as ArenaResult[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

/** Append a finished match to the local results feed (capped at HISTORY_LIMIT). */
export function recordResult(entry: Omit<ArenaResult, "id" | "at">): ArenaResult {
  const full: ArenaResult = { ...entry, id: `m-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`, at: Date.now() };
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([full, ...history()].slice(0, HISTORY_LIMIT)));
  } catch { /* demo only */ }
  return full;
}

export function matchHistory(game?: SkillGameId, limit = 10): ArenaResult[] {
  const all = history();
  return (game ? all.filter((r) => r.game === game) : all).slice(0, limit);
}

/** Win/draw/loss tally for the record strip. */
export function recordSummary(game?: SkillGameId): { wins: number; draws: number; losses: number } {
  const all = game ? history().filter((r) => r.game === game) : history();
  return {
    wins: all.filter((r) => r.outcome === "win").length,
    draws: all.filter((r) => r.outcome === "draw").length,
    losses: all.filter((r) => r.outcome === "loss").length,
  };
}

export const LEADERBOARD_NOTE =
  "Pre-launch demo ladder — your rating is real (earned on local boards); rival positions are illustrative. Live rankings settle from server-verified matches after launch. Ratings have no cash value." as const;
