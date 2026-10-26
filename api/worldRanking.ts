// World ranking. The server is the only place XP is awarded: each result is tied to a
// signed-in account (never a client-chosen ID), rate-limited, and capped per game per day.
// Results still come from the game client, so this stops casual edits and bulk submissions;
// it is not a full guarantee until the games themselves run on the server.
import type { Store } from "./accounts";

export const WORLD_GAMES = ["blackjack", "brag", "chess", "connect4", "draughts"] as const;
export type WorldGame = (typeof WORLD_GAMES)[number];
export type WorldOutcome = "win" | "draw" | "loss";

export const WORLD_XP: Record<WorldOutcome, number> = { win: 10, draw: 4, loss: 2 };
export const WORLD_DAILY_XP_CAP = 150;
export const WORLD_RESULTS_PER_HOUR = 60;

type Row = { name: string; xp: number; games: number; wins: number; day: string; dayXP: number };
type Board = Record<string, Row>;

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const hourKey = (d: Date) => d.toISOString().slice(0, 13);

/** Monday (UTC) of the week containing d, as YYYY-MM-DD. Weekly XP resets on this key. */
export function weekStart(d: Date): string {
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
  return dayKey(monday);
}

const boardKey = (week: string, game: WorldGame) => `world:board:${week}:${game}`;

async function readBoard(s: Store, week: string, game: WorldGame): Promise<Board> {
  const raw = await s.get(boardKey(week, game));
  return raw ? (JSON.parse(raw) as Board) : {};
}

export type RecordResult =
  | { ok: true; awarded: number; weekXP: number; games: number; wins: number }
  | { ok: false; error: "bad_game" | "bad_outcome" | "bad_name" | "rate_limited" };

/** Records one finished game for a signed-in account and returns the XP actually awarded. */
export async function recordWorldResult(
  s: Store, accountId: string, name: string, game: string, outcome: string, now = new Date(),
): Promise<RecordResult> {
  if (!(WORLD_GAMES as readonly string[]).includes(game)) return { ok: false, error: "bad_game" };
  if (outcome !== "win" && outcome !== "draw" && outcome !== "loss") return { ok: false, error: "bad_outcome" };
  const displayName = name.trim().slice(0, 24);
  if (!displayName) return { ok: false, error: "bad_name" };

  const hits = await s.incr(`world:rl:${accountId}:${hourKey(now)}`, 3700);
  if (hits > WORLD_RESULTS_PER_HOUR) return { ok: false, error: "rate_limited" };

  const week = weekStart(now);
  const board = await readBoard(s, week, game as WorldGame);
  const today = dayKey(now);
  const row: Row = board[accountId] ?? { name: displayName, xp: 0, games: 0, wins: 0, day: today, dayXP: 0 };
  if (row.day !== today) { row.day = today; row.dayXP = 0; }

  const awarded = Math.max(0, Math.min(WORLD_XP[outcome], WORLD_DAILY_XP_CAP - row.dayXP));
  row.name = displayName;
  row.xp += awarded;
  row.dayXP += awarded;
  row.games += 1;
  row.wins += outcome === "win" ? 1 : 0;
  board[accountId] = row;
  await s.set(boardKey(week, game as WorldGame), JSON.stringify(board), 14 * 24 * 3600);
  return { ok: true, awarded, weekXP: row.xp, games: row.games, wins: row.wins };
}

export type RankingEntry = { rank: number; name: string; xp: number; games: number; wins: number };

/** Top players this week, for one game or across all games. Only real recorded results appear. */
export async function worldRanking(s: Store, game: WorldGame | "all", limit = 50, now = new Date()): Promise<RankingEntry[]> {
  const week = weekStart(now);
  const games = game === "all" ? [...WORLD_GAMES] : [game];
  const totals = new Map<string, { name: string; xp: number; games: number; wins: number }>();
  for (const g of games) {
    const board = await readBoard(s, week, g);
    for (const [accountId, row] of Object.entries(board)) {
      const t = totals.get(accountId) ?? { name: row.name, xp: 0, games: 0, wins: 0 };
      t.name = row.name;
      t.xp += row.xp; t.games += row.games; t.wins += row.wins;
      totals.set(accountId, t);
    }
  }
  return [...totals.values()]
    .filter((t) => t.xp > 0)
    .sort((a, b) => b.xp - a.xp || b.wins - a.wins || a.name.localeCompare(b.name))
    .slice(0, Math.max(1, Math.min(200, limit)))
    .map((t, i) => ({ rank: i + 1, ...t }));
}

/** One account's own totals this week, for the signed-in player. */
export async function worldStanding(s: Store, accountId: string, now = new Date()) {
  const week = weekStart(now);
  const perGame: Record<WorldGame, { xp: number; games: number; wins: number }> = {
    blackjack: { xp: 0, games: 0, wins: 0 }, brag: { xp: 0, games: 0, wins: 0 }, chess: { xp: 0, games: 0, wins: 0 },
    connect4: { xp: 0, games: 0, wins: 0 }, draughts: { xp: 0, games: 0, wins: 0 },
  };
  for (const g of WORLD_GAMES) {
    const row = (await readBoard(s, week, g))[accountId];
    if (row) perGame[g] = { xp: row.xp, games: row.games, wins: row.wins };
  }
  const total = WORLD_GAMES.reduce((sum, g) => sum + perGame[g].xp, 0);
  return { week, total, perGame };
}
