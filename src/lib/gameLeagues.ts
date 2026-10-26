// Separate weekly league and XP for each casino game. Each game keeps its own ledger,
// so XP earned in one game never counts toward another game's league.
// Only real results are counted: there are no generated rivals or standings.
import { LEAGUE_TIERS, weekKey, type LeagueTier } from "./pokerLeague";

export type LeagueGame = "blackjack" | "brag" | "connect4" | "draughts" | "chess" | "duel" | "arena";
export type GameOutcome = "win" | "draw" | "loss";

/** XP for one finished game. */
export const GAME_XP: Record<GameOutcome, number> = { win: 10, draw: 4, loss: 2 };
/** Most XP one game can give in a single day, so grinding one game can't run away. */
export const GAME_DAILY_XP_CAP = 150;
/** Weekly XP needed for each league step up (Bronze is the first league). */
export const XP_PER_LEAGUE = 200;

type Ledger = { week: string; day: string; weekXP: number; dayXP: number; games: number; wins: number };
export type GameLeagueState = { tier: LeagueTier; tierIndex: number; weekXP: number; games: number; wins: number; nextAt: number };

const today = () => new Date().toISOString().slice(0, 10);
const keyFor = (game: LeagueGame) => `luxe-game-league:${game}`;

function load(game: LeagueGame): Ledger {
  const fresh: Ledger = { week: weekKey(), day: today(), weekXP: 0, dayXP: 0, games: 0, wins: 0 };
  try {
    const raw = localStorage.getItem(keyFor(game));
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Ledger;
    if (saved.week !== fresh.week) return fresh;
    if (saved.day !== fresh.day) return { ...saved, day: fresh.day, dayXP: 0 };
    return saved;
  } catch {
    return fresh;
  }
}

function save(game: LeagueGame, ledger: Ledger): void {
  try { localStorage.setItem(keyFor(game), JSON.stringify(ledger)); } catch { /* storage unavailable: keep in memory only */ }
}

function view(ledger: Ledger): GameLeagueState {
  const tierIndex = Math.min(LEAGUE_TIERS.length - 1, Math.floor(ledger.weekXP / XP_PER_LEAGUE));
  return {
    tier: LEAGUE_TIERS[tierIndex],
    tierIndex,
    weekXP: ledger.weekXP,
    games: ledger.games,
    wins: ledger.wins,
    nextAt: tierIndex >= LEAGUE_TIERS.length - 1 ? ledger.weekXP : (tierIndex + 1) * XP_PER_LEAGUE,
  };
}

export function gameLeagueState(game: LeagueGame): GameLeagueState {
  return view(load(game));
}

/** Records one finished game and returns the updated league state for that game only. */
export function recordGameResult(game: LeagueGame, outcome: GameOutcome): GameLeagueState {
  const ledger = load(game);
  const award = Math.max(0, Math.min(GAME_XP[outcome], GAME_DAILY_XP_CAP - ledger.dayXP));
  const next: Ledger = {
    ...ledger,
    weekXP: ledger.weekXP + award,
    dayXP: ledger.dayXP + award,
    games: ledger.games + 1,
    wins: ledger.wins + (outcome === "win" ? 1 : 0),
  };
  save(game, next);
  return view(next);
}
