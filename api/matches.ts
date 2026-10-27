// Online two-player board games. The server pairs two signed-in players, holds the
// position, checks every move with the game engine, enforces turns and a move timeout,
// and records the result for both players in the world ranking.
import { newChess, playChess, type ChessMatch } from "../src/games/chess";
import { newConnectFour, playConnectFour, type ConnectFourState } from "../src/games/connectFour";
import { newDraughts, playDraughts, type DraughtsMove, type DraughtsState } from "../src/games/draughts";
import { recordWorldResult, type WorldGame } from "./worldRanking";
import { withLock } from "./lock";
import type { Store } from "./accounts";

export type MatchGame = "chess" | "connect4" | "draughts";
type Side = "a" | "b";
type Player = { id: string; name: string };
type EngineState = ChessMatch | ConnectFourState | DraughtsState;
export type Match = {
  id: string; game: MatchGame; players: { a: Player; b: Player };
  state: EngineState; status: "playing" | "finished"; winner?: Side | "draw"; lastMoveAt: number;
};

/** A side that takes longer than this on its move forfeits the game. */
export const MOVE_TIMEOUT_MS = 3 * 60 * 1000;
const MATCH_TTL_S = 6 * 3600;
const queueKey = (game: MatchGame) => `match:queue:${game}`;
const matchKey = (id: string) => `match:m:${id}`;
const pointerKey = (playerId: string) => `match:p:${playerId}`;

const newState = (game: MatchGame): EngineState => game === "chess" ? newChess() : game === "connect4" ? newConnectFour() : newDraughts();

/** Which side is to move, read from the engine's own turn. */
export function sideToMove(game: MatchGame, state: EngineState): Side {
  if (game === "chess") return (state as ChessMatch).fen.split(" ")[1] === "w" ? "a" : "b";
  if (game === "connect4") return (state as ConnectFourState).turn === "red" ? "a" : "b";
  return (state as DraughtsState).turn === "white" ? "a" : "b";
}

/** Maps the engine's finished status to a winning side, or a draw. */
function outcomeOf(game: MatchGame, state: EngineState): Side | "draw" | null {
  const status = game === "chess" ? (state as ChessMatch).status : game === "connect4" ? (state as ConnectFourState).status : (state as DraughtsState).status;
  if (status === "playing") return null;
  if (status === "draw") return "draw";
  return status === "white_won" || status === "red_won" ? "a" : "b";
}

async function loadMatch(s: Store, id: string): Promise<Match | null> {
  const raw = await s.get(matchKey(id));
  return raw ? (JSON.parse(raw) as Match) : null;
}
async function saveMatch(s: Store, m: Match): Promise<void> {
  await s.set(matchKey(m.id), JSON.stringify(m), MATCH_TTL_S);
}

/** Ends a game on time: the side that ran out of time loses. */
function enforceTimeout(m: Match, now: number): void {
  if (m.status !== "playing" || now - m.lastMoveAt <= MOVE_TIMEOUT_MS) return;
  m.status = "finished";
  m.winner = sideToMove(m.game, m.state) === "a" ? "b" : "a";
}

async function finish(s: Store, m: Match, now: number): Promise<void> {
  const names = { a: m.players.a, b: m.players.b };
  for (const side of ["a", "b"] as const) {
    const outcome = m.winner === "draw" ? "draw" : m.winner === side ? "win" : "loss";
    await recordWorldResult(s, names[side].id, names[side].name, m.game as WorldGame, outcome, new Date(now));
  }
}

export type MatchView = {
  matchId: string; game: MatchGame; you: Side; turn: Side; status: "playing" | "finished"; winner?: Side | "draw";
  opponent: string; state: EngineState; lastMoveAt: number;
};

function viewFor(m: Match, side: Side): MatchView {
  return { matchId: m.id, game: m.game, you: side, turn: sideToMove(m.game, m.state), status: m.status, winner: m.winner, opponent: m.players[side === "a" ? "b" : "a"].name, state: m.state, lastMoveAt: m.lastMoveAt };
}

export type MatchReply = { ok: true; waiting?: boolean; view?: MatchView } | { ok: false; error: string };

/** Puts a signed-in player in the queue for a game, or pairs them with the player already waiting. */
export async function joinQueue(s: Store, player: Player, game: MatchGame, now = Date.now()): Promise<MatchReply> {
  if (!["chess", "connect4", "draughts"].includes(game)) return { ok: false, error: "bad_game" };
  // One queue per game: read, pair and write under the lock so simultaneous joins pair correctly.
  return withLock(s, `queue:${game}`, () => joinQueueLocked(s, player, game, now));
}

async function joinQueueLocked(s: Store, player: Player, game: MatchGame, now: number): Promise<MatchReply> {
  const current = await currentMatch(s, player.id, now);
  if (current.ok && current.view && current.view.status === "playing") return { ok: true, view: current.view };

  const queue = JSON.parse((await s.get(queueKey(game))) ?? "[]") as Player[];
  const waiting = queue.find((p) => p.id !== player.id);
  if (!waiting) {
    await s.set(queueKey(game), JSON.stringify([...queue.filter((p) => p.id !== player.id), player]), 3600);
    return { ok: true, waiting: true };
  }
  await s.set(queueKey(game), JSON.stringify(queue.filter((p) => p.id !== waiting.id && p.id !== player.id)), 3600);
  const m: Match = { id: `${now.toString(36)}${Math.random().toString(36).slice(2, 8)}`, game, players: { a: waiting, b: player }, state: newState(game), status: "playing", lastMoveAt: now };
  await saveMatch(s, m);
  await s.set(pointerKey(waiting.id), m.id, MATCH_TTL_S);
  await s.set(pointerKey(player.id), m.id, MATCH_TTL_S);
  return { ok: true, view: viewFor(m, "a") };
}

export async function leaveQueue(s: Store, playerId: string): Promise<void> {
  for (const game of ["chess", "connect4", "draughts"] as const) {
    const queue = JSON.parse((await s.get(queueKey(game))) ?? "[]") as Player[];
    await s.set(queueKey(game), JSON.stringify(queue.filter((p) => p.id !== playerId)), 3600);
  }
}

/** The player's current match, if any. Applies the move timeout first. */
export async function currentMatch(s: Store, playerId: string, now = Date.now()): Promise<MatchReply & { view?: MatchView }> {
  const id = await s.get(pointerKey(playerId));
  if (!id) return { ok: true };
  const m = await loadMatch(s, id);
  if (!m) return { ok: true };
  const side: Side = m.players.a.id === playerId ? "a" : "b";
  const wasPlaying = m.status === "playing";
  enforceTimeout(m, now);
  if (wasPlaying && m.status === "finished") { await saveMatch(s, m); await finish(s, m, now); }
  return { ok: true, view: viewFor(m, side) };
}

export async function makeMove(s: Store, playerId: string, matchId: string, move: unknown, now = Date.now()): Promise<MatchReply> {
  const m = await loadMatch(s, matchId);
  if (!m) return { ok: false, error: "no_match" };
  const side: Side | null = m.players.a.id === playerId ? "a" : m.players.b.id === playerId ? "b" : null;
  if (!side) return { ok: false, error: "not_in_match" };
  const wasPlaying = m.status === "playing";
  enforceTimeout(m, now);
  if (wasPlaying && m.status === "finished") { await saveMatch(s, m); await finish(s, m, now); return { ok: false, error: "timed_out" }; }
  if (m.status !== "playing") return { ok: false, error: "match_finished" };
  if (sideToMove(m.game, m.state) !== side) return { ok: false, error: "not_your_turn" };

  let next: EngineState;
  try {
    next = applyMove(m.game, m.state, move);
  } catch {
    return { ok: false, error: "illegal_move" };
  }
  m.state = next;
  m.lastMoveAt = now;
  const outcome = outcomeOf(m.game, next);
  if (outcome) { m.status = "finished"; m.winner = outcome; }
  await saveMatch(s, m);
  if (m.status === "finished") await finish(s, m, now);
  return { ok: true, view: viewFor(m, side) };
}

/** The player gives up: the other side wins and both players are ranked. */
export async function resign(s: Store, playerId: string, matchId: string, now = Date.now()): Promise<MatchReply> {
  const m = await loadMatch(s, matchId);
  if (!m) return { ok: false, error: "no_match" };
  const side: Side | null = m.players.a.id === playerId ? "a" : m.players.b.id === playerId ? "b" : null;
  if (!side) return { ok: false, error: "not_in_match" };
  if (m.status !== "playing") return { ok: false, error: "match_finished" };
  m.status = "finished";
  m.winner = side === "a" ? "b" : "a";
  m.lastMoveAt = now;
  await saveMatch(s, m);
  await finish(s, m, now);
  return { ok: true, view: viewFor(m, side) };
}

function applyMove(game: MatchGame, state: EngineState, move: unknown): EngineState {
  const mv = (move ?? {}) as Record<string, unknown>;
  if (game === "chess") {
    const from = String(mv.from ?? ""); const to = String(mv.to ?? "");
    const promotion = (["q", "r", "b", "n"].includes(String(mv.promotion)) ? mv.promotion : "q") as "q" | "r" | "b" | "n";
    return playChess(state as ChessMatch, from as never, to as never, promotion);
  }
  if (game === "connect4") return playConnectFour(state as ConnectFourState, Number(mv.column));
  const from = mv.from as [number, number]; const to = mv.to as [number, number];
  if (!Array.isArray(from) || !Array.isArray(to)) throw new Error("bad move");
  return playDraughts(state as DraughtsState, { from, to } as DraughtsMove);
}
