// Client for the server world ranking. Results are sent with the signed-in account's token;
// the server decides the XP. Signed-out players keep their local league only.
import { accountToken } from "./useAccount";

export type WorldGame = "blackjack" | "brag" | "chess" | "connect4" | "draughts";
export type WorldOutcome = "win" | "draw" | "loss";
export type WorldRow = { rank: number; name: string; xp: number; games: number; wins: number };

/** Sends one finished game to the server. Returns null when signed out or unreachable. */
export async function submitWorldResult(game: WorldGame, outcome: WorldOutcome): Promise<{ xp: number; weekXP: number } | null> {
  const token = accountToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/world/result", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify({ game, outcome }),
    });
    if (!res.ok) return null;
    return (await res.json()) as { xp: number; weekXP: number };
  } catch {
    return null;
  }
}

export async function fetchWorldRanking(game: WorldGame | "all"): Promise<WorldRow[]> {
  try {
    const res = await fetch(`/api/world/ranking?game=${game}`);
    if (!res.ok) return [];
    return ((await res.json()) as { rows: WorldRow[] }).rows;
  } catch {
    return [];
  }
}
