// Online ranked match: joins the server queue, then plays from the position the server returns.
// The server checks every move; the highlights here are only a convenience.
import { useEffect, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { draughtsMoves, type DraughtsState } from "../games/draughts";
import type { ConnectFourState } from "../games/connectFour";
import type { ChessMatch } from "../games/chess";
import { accountToken } from "../lib/useAccount";

export type OnlineGame = "chess" | "connect4" | "draughts";
type Side = "a" | "b";
type MatchView = { matchId: string; game: OnlineGame; you: Side; turn: Side; status: "playing" | "finished"; winner?: Side | "draw"; opponent: string; state: ChessMatch | ConnectFourState | DraughtsState; lastMoveAt: number };
type Reply = { ok: boolean; error?: string; waiting?: boolean; view?: MatchView | null };

const TITLES: Record<OnlineGame, string> = { chess: "Chess", connect4: "Connect Four", draughts: "Draughts" };
const POLL_MS = 1500;

async function api(path: string, body?: Record<string, unknown>): Promise<Reply> {
  const token = accountToken();
  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { ...(body ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) return { ok: false, error: String(data.error ?? "server_error") };
  return data as unknown as Reply;
}

function youWon(view: MatchView): string {
  if (view.winner === "draw") return "Draw";
  return view.winner === view.you ? "You won" : `${view.opponent} won`;
}

export function OnlineMatch({ game, onClose }: { game: OnlineGame; onClose: () => void }) {
  const [view, setView] = useState<MatchView | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<unknown>(null);
  const alive = useRef(true);

  const signedIn = Boolean(accountToken());

  // Join the queue once; then poll the server for the position and the opponent's moves.
  useEffect(() => {
    alive.current = true;
    if (!signedIn) return;
    void api("/api/match/queue", { game }).then((r) => {
      if (!alive.current) return;
      if (!r.ok) return setError(r.error === "not_signed_in" ? "Sign in to play ranked online games." : "Could not join the queue. Try again.");
      if (r.view) { setView(r.view); setWaiting(false); } else setWaiting(true);
    });
    return () => { alive.current = false; void api("/api/match/leave", {}); };
  }, [game, signedIn]);

  useEffect(() => {
    if (!signedIn || (!waiting && (!view || view.status === "finished"))) return;
    const id = window.setInterval(() => {
      void api("/api/match/current").then((r) => {
        if (!alive.current || !r.view) return;
        if (r.view.game !== game) return;
        setView(r.view);
        setWaiting(false);
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [waiting, view?.status, signedIn, game]);

  const sendMove = (move: Record<string, unknown>) => {
    if (!view) return;
    setSelected(null);
    void api("/api/match/move", { matchId: view.matchId, move }).then((r) => {
      if (!alive.current) return;
      if (!r.ok) return setError(r.error === "not_your_turn" ? "Wait for your turn." : r.error === "illegal_move" ? "That move is not allowed." : r.error === "timed_out" ? "Time ran out — the game is over." : "The move could not be sent.");
      if (r.view) { setError(""); setView(r.view); }
    });
  };

  const header = <div className="flex items-center justify-between gap-3">
    <button type="button" onClick={onClose} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black">Back</button>
    <span className="font-black text-amber-100">{TITLES[game]} · ranked online</span>
    <span className="text-xs text-white/50">{view ? `vs ${view.opponent}` : ""}</span>
  </div>;

  if (!signedIn) return <div className="space-y-4">{header}<p className="rounded-xl border border-white/15 bg-black/40 p-4 text-sm text-white/70">Sign in to play ranked online games. Results count in the world ranking.</p></div>;
  if (error && !view) return <div className="space-y-4">{header}<p className="rounded-xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</p></div>;
  if (!view) return <div className="space-y-4">{header}<p className="rounded-xl border border-white/15 bg-black/40 p-4 text-sm text-white/70">Waiting for an opponent…</p></div>;

  const myTurn = view.status === "playing" && view.turn === view.you;
  const status = view.status === "finished" ? youWon(view) : myTurn ? "Your move" : `${view.opponent} is thinking…`;

  return <div className="space-y-4">
    {header}
    <p className="text-center text-sm font-black text-amber-100">{status}</p>
    {error && <p className="rounded-xl border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</p>}
    {game === "chess" && <ChessOnline view={view} myTurn={myTurn} selected={selected as string | null} setSelected={setSelected} send={sendMove} />}
    {game === "connect4" && <ConnectOnline view={view} myTurn={myTurn} send={sendMove} />}
    {game === "draughts" && <DraughtsOnline view={view} myTurn={myTurn} selected={selected as [number, number] | null} setSelected={setSelected} send={sendMove} />}
    <p className="text-center text-[10px] text-white/40">Ranked. Each move is checked by the server. A side that takes over three minutes on its move loses.</p>
  </div>;
}

function ChessOnline({ view, myTurn, selected, setSelected, send }: { view: MatchView; myTurn: boolean; selected: string | null; setSelected: (s: string | null) => void; send: (m: Record<string, unknown>) => void }) {
  const match = view.state as ChessMatch;
  const chess = new Chess(match.fen);
  const board = chess.board();
  const flip = view.you === "b";
  const legal = selected ? chess.moves({ square: selected as Square, verbose: true }).map((m) => m.to) : [];
  const squareName = (r: number, c: number) => `${String.fromCharCode(97 + c)}${8 - r}`;
  const rows = [...Array(8).keys()].map((i) => (flip ? 7 - i : i));
  const cols = [...Array(8).keys()].map((i) => (flip ? 7 - i : i));
  return <div className="mx-auto grid w-full max-w-sm grid-cols-8 overflow-hidden rounded-xl border border-amber-200/40">
    {rows.flatMap((r) => cols.map((c) => {
      const sq = squareName(r, c);
      const piece = board[r][c];
      const dark = (r + c) % 2 === 1;
      const isLegal = legal.includes(sq as never);
      return <button key={sq} type="button" disabled={!myTurn && !isLegal} aria-label={sq}
        onClick={() => {
          if (!myTurn) return;
          if (selected && isLegal) return send({ from: selected, to: sq, promotion: "q" });
          if (piece && piece.color === (view.you === "a" ? "w" : "b")) setSelected(sq); else setSelected(null);
        }}
        className={`relative aspect-square text-xl leading-none ${dark ? "bg-[#6b4b1d]" : "bg-[#e9d7a8]"} ${selected === sq ? "ring-2 ring-inset ring-amber-300" : ""}`}>
        {piece && <span className={piece.color === "w" ? "text-white drop-shadow" : "text-black"}>{glyph(piece.type, piece.color)}</span>}
        {isLegal && <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-emerald-400/80" />}
      </button>;
    }))}
  </div>;
}

const glyph = (type: string, color: string) => {
  const map: Record<string, string> = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
  return color === "w" ? map[type].toUpperCase() : map[type];
};

function ConnectOnline({ view, myTurn, send }: { view: MatchView; myTurn: boolean; send: (m: Record<string, unknown>) => void }) {
  const state = view.state as ConnectFourState;
  return <div className="mx-auto w-full max-w-sm space-y-2">
    <div className="grid grid-cols-7 gap-1">
      {[...Array(7).keys()].map((col) => <button key={col} type="button" disabled={!myTurn || state.board[0][col] !== null} onClick={() => send({ column: col })}
        className="rounded-lg bg-white/10 py-1 text-[10px] font-black text-white/70 disabled:opacity-30">{col + 1}</button>)}
    </div>
    <div className="grid grid-cols-7 gap-1 rounded-xl bg-blue-950/70 p-2">
      {state.board.flat().map((cell, i) => <span key={i} className={`aspect-square rounded-full ${cell === "red" ? "bg-rose-500" : cell === "yellow" ? "bg-amber-300" : "bg-black/50"}`} />)}
    </div>
  </div>;
}

function DraughtsOnline({ view, myTurn, selected, setSelected, send }: { view: MatchView; myTurn: boolean; selected: [number, number] | null; setSelected: (s: [number, number] | null) => void; send: (m: Record<string, unknown>) => void }) {
  const state = view.state as DraughtsState;
  const mine = view.you === "a" ? "white" : "black";
  const targets = selected ? draughtsMoves(state, selected).map((m) => m.to) : [];
  const flip = view.you === "b";
  const rows = [...Array(8).keys()].map((i) => (flip ? 7 - i : i));
  const cols = [...Array(8).keys()].map((i) => (flip ? 7 - i : i));
  return <div className="mx-auto grid w-full max-w-sm grid-cols-8 overflow-hidden rounded-xl border border-amber-200/40">
    {rows.flatMap((r) => cols.map((c) => {
      const piece = state.board[r][c];
      const dark = (r + c) % 2 === 1;
      const isTarget = targets.some((t) => t[0] === r && t[1] === c);
      return <button key={`${r}-${c}`} type="button" disabled={!myTurn && !isTarget} aria-label={`${r},${c}`}
        onClick={() => {
          if (!myTurn) return;
          if (selected && isTarget) return send({ from: selected, to: [r, c] });
          if (piece && piece.color === mine) setSelected([r, c]); else setSelected(null);
        }}
        className={`relative aspect-square ${dark ? "bg-[#6b4b1d]" : "bg-[#e9d7a8]"} ${selected && selected[0] === r && selected[1] === c ? "ring-2 ring-inset ring-amber-300" : ""}`}>
        {piece && <span className={`absolute inset-1 rounded-full border-2 ${piece.color === "white" ? "border-amber-100 bg-stone-100" : "border-black bg-stone-900"} ${piece.king ? "ring-2 ring-amber-300" : ""}`} />}
        {isTarget && <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-emerald-400/80" />}
      </button>;
    }))}
  </div>;
}
