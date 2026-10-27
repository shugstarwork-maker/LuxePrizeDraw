// Online ranked match: joins the server queue, then plays from the position the server returns.
// The server checks every move; the highlights here are only a convenience.
import { useEffect, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { draughtsMoves, type DraughtsState } from "../games/draughts";
import type { ConnectFourState } from "../games/connectFour";
import type { ChessMatch } from "../games/chess";
import { accountToken } from "../lib/useAccount";
import { LuxeChessFrame } from "./LuxeChessFrame";
import { PIECE_ART } from "./GamesArena";

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

  const resign = () => {
    if (!view || view.status !== "playing") return;
    void api("/api/match/resign", { matchId: view.matchId }).then((r) => {
      if (!alive.current) return;
      if (!r.ok) return setError("Could not resign. Try again.");
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
    {view.status === "playing" && <div className="flex justify-center"><button type="button" onClick={resign} className="rounded-xl border border-rose-300/40 bg-rose-300/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-rose-100">Resign</button></div>}
    <p className="text-center text-[10px] text-white/40">Ranked. Each move is checked by the server. A side that takes over three minutes on its move loses.</p>
  </div>;
}

const GLYPH: Record<string, string> = { wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔", bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚" };

function ChessOnline({ view, myTurn, selected, setSelected, send }: { view: MatchView; myTurn: boolean; selected: string | null; setSelected: (s: string | null) => void; send: (m: Record<string, unknown>) => void }) {
  const match = view.state as ChessMatch;
  const chess = new Chess(match.fen);
  const board = chess.board();
  const flip = view.you === "b";
  const legal = selected ? chess.moves({ square: selected as Square, verbose: true }).map((m) => m.to) : [];
  const squareName = (r: number, c: number) => `${String.fromCharCode(97 + c)}${8 - r}`;
  const rows = [...Array(8).keys()].map((i) => (flip ? 7 - i : i));
  const cols = [...Array(8).keys()].map((i) => (flip ? 7 - i : i));
  return <LuxeChessFrame><div className="luxe-chess-grid grid grid-cols-8 overflow-hidden">
    {rows.flatMap((r) => cols.map((c) => {
      const sq = squareName(r, c);
      const piece = board[r][c];
      const isLegal = legal.includes(sq as never);
      const last = match.lastMove && (match.lastMove.from === sq || match.lastMove.to === sq);
      return <button key={sq} type="button" aria-label={sq} aria-pressed={selected === sq}
        onClick={() => {
          if (!myTurn) return;
          if (selected && isLegal) return send({ from: selected, to: sq, promotion: "q" });
          if (piece && piece.color === (view.you === "a" ? "w" : "b")) setSelected(sq); else setSelected(null);
        }}
        className={`aspect-square text-3xl sm:text-5xl ${(r + c) % 2 ? "luxe-chess-square--dark" : "luxe-chess-square--light"}${last ? " luxe-chess-square--last" : ""} ${selected === sq ? "ring-4 ring-cyan-300" : ""}`}>
        {piece && <span className={piece.color === "w" ? "luxe-chess-piece luxe-chess-piece--ivory" : "luxe-chess-piece luxe-chess-piece--onyx"}>{GLYPH[piece.color + piece.type]}</span>}
        {isLegal && <i className={piece ? "luxe-chess-hint luxe-chess-hint--capture" : "luxe-chess-hint"} aria-hidden="true" />}
      </button>;
    }))}
  </div></LuxeChessFrame>;
}

function ConnectOnline({ view, myTurn, send }: { view: MatchView; myTurn: boolean; send: (m: Record<string, unknown>) => void }) {
  const state = view.state as ConnectFourState;
  return <div className="board3d-scene c4-scene mx-auto max-w-xl">
    <div className="board3d-tilt board3d-frame c4-frame rounded-3xl p-3 sm:p-4">
      <div className="c4-grid grid grid-cols-7 gap-1.5 sm:gap-2">
        {[...Array(7).keys()].map((col) => <button key={col} type="button" disabled={!myTurn || state.board[0][col] !== null} onClick={() => send({ column: col })} className="c4-column group" aria-label={`Drop in column ${col + 1}`}>
          {state.board.map((row, r) => {
            const piece = row[col];
            return <span key={r} className={`slot3d c4-slot block aspect-square rounded-full${piece ? " disc3d c4-disc" : " c4-empty"}`} style={piece ? { background: PIECE_ART[piece] } : undefined} />;
          })}
        </button>)}
      </div>
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
  return <div className="board3d-scene draughts-scene mx-auto max-w-[38rem]">
    <div className="board3d-tilt board3d-frame draughts-frame grid grid-cols-8 overflow-hidden rounded-2xl">
      {rows.flatMap((r) => cols.map((c) => {
        const piece = state.board[r][c];
        const dark = (r + c) % 2 === 1;
        const isSelected = selected !== null && selected[0] === r && selected[1] === c;
        const isTarget = targets.some((t) => t[0] === r && t[1] === c);
        return <button key={`${r}-${c}`} type="button" disabled={!myTurn && !isTarget} aria-label={`Square ${r + 1},${c + 1}`}
          onClick={() => {
            if (!myTurn) return;
            if (selected && isTarget) return send({ from: selected, to: [r, c] });
            if (piece && piece.color === mine) setSelected([r, c]); else setSelected(null);
          }}
          className={`draughts-square aspect-square ${dark ? "draughts-square--dark" : "draughts-square--light"}${isSelected ? " draughts-square--selected" : ""}${isTarget ? " draughts-square--move" : ""}`}>
          {piece && <span className={`draughts-piece ${piece.color === "white" ? "draughts-piece--white" : "draughts-piece--black"}${piece.king ? " draughts-piece--king" : ""}`}>{piece.king ? "♛" : ""}</span>}
        </button>;
      }))}
    </div>
  </div>;
}
