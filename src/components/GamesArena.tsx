import { LuxeChessFrame } from "./LuxeChessFrame";
import { initialBoardGame } from "./GoldGamesCarousel";
import { Chess } from "chess.js";
import { Crown, Gamepad2, RotateCcw, ShieldCheck, Trophy, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAudio } from "../audio/AudioProvider";
import { chessLegalMoves, newChess, playChess, type ChessMatch } from "../games/chess";
import { newConnectFour, playConnectFour, type ConnectFourState } from "../games/connectFour";
import { OnlineConnectFour } from "./OnlineConnectFour";
import { draughtsMoves, newDraughts, playDraughts, type DraughtsState } from "../games/draughts";

type GameId = "chess" | "connect4" | "draughts";
const games: { id: GameId; title: string; detail: string; image: string }[] = [
  { id: "chess", title: "Chess", detail: "Full legal chess rules · 10-minute clock", image: "/games/chess.svg" },
  { id: "connect4", title: "Connect Four", detail: "Drop discs and connect four", image: "/games/connect-four.svg" },
  { id: "draughts", title: "Draughts", detail: "Mandatory captures and crowned kings", image: "/games/draughts.svg" },
];
const notation = (r: number, c: number) => `${String.fromCharCode(97 + c)}${8 - r}`;
const statusText = (status: string) => status === "playing" ? "Match in progress" : status === "draw" ? "Draw" : status === "white_won" || status === "red_won" ? "Player one wins" : "Player two wins";

export function GamesArena() {
  const [game, setGame] = useState<GameId>(() => initialBoardGame(typeof window === "undefined" ? "" : window.location.search)); const [muted, setMuted] = useState(false); const { play } = useAudio();
  const sound = (effect: "button" | "ticketSelect" | "success" | "error") => { if (!muted) play(effect); };
  return <section id="games" className="game-arena-stage luxe-gold border-y border-amber-200/20 py-14 sm:py-20"><div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-indigo-200"><Gamepad2 className="h-4 w-4" /> Playable arcade</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Choose a board. Play to the end.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">Local two-player matches run against shared rules engines. Online ranking, matchmaking, tournaments, and ticket rewards stay locked until authenticated server-authoritative match services are configured.</p></div><button onClick={() => setMuted((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{muted ? "Sound off" : "Sound on"}</button></div><div className="mt-7 grid gap-3 sm:grid-cols-3">{games.map((item) => <button key={item.id} onClick={() => { setGame(item.id); sound("button"); }} className={`arcade-card-fx arcade-card-fx--${item.id} overflow-hidden rounded-2xl border text-left transition ${game === item.id ? "border-amber-200 bg-amber-300/10" : "border-white/10 bg-white/[.035]"}`}><img src={item.image} alt="" className="h-24 w-full object-cover opacity-75" /><span className="block p-4"><b>{item.title}</b><small className="mt-1 block text-white/55">{item.detail}</small></span></button>)}</div><div className="mt-7 rounded-[2rem] border border-white/15 bg-[#090b16] p-4 shadow-2xl sm:p-7">{game === "chess" ? <><button type="button" className="luxe-chess-open" onClick={() => { window.history.pushState({}, "", "/chess"); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); }}>Open full Luxe Chess table →</button><ChessBoard sound={sound} /></> : game === "connect4" ? <ConnectFourBoard sound={sound} /> : <DraughtsBoard sound={sound} />}</div></div></section>;
}
export function ChessBoard({ sound }: { sound: (s: "button" | "ticketSelect" | "success" | "error") => void }) {
  const [match, setMatch] = useState<ChessMatch>(newChess); const [selected, setSelected] = useState<string | null>(null); const [clock, setClock] = useState({ w: 600, b: 600 });
  const chess = useMemo(() => new Chess(match.fen), [match.fen]); const turn = chess.turn(); const legal = selected ? chessLegalMoves(match, selected as never).map((move) => move.to) : [];
  useEffect(() => { if (match.status !== "playing") return; const id = window.setInterval(() => setClock((value) => ({ ...value, [turn]: Math.max(0, value[turn] - 1) })), 1000); return () => clearInterval(id); }, [turn, match.status]);
  useEffect(() => { if (clock.w === 0 || clock.b === 0) setMatch((value) => ({ ...value, status: clock.w === 0 ? "black_won" : "white_won" })); }, [clock]);
  const tap = (square: string) => { if (match.status !== "playing") return; const piece = chess.get(square as never); if (!selected) { if (piece?.color === turn) { setSelected(square); sound("ticketSelect"); } return; } if (selected === square) return setSelected(null); try { const next = playChess(match, selected as never, square as never); setMatch(next); setSelected(null); sound(next.status === "playing" ? piece ? "ticketSelect" : "button" : "success"); } catch { if (piece?.color === turn) { setSelected(square); sound("button"); } else sound("error"); } };
  const reset = () => { setMatch(newChess()); setSelected(null); setClock({ w: 600, b: 600 }); sound("button"); };
  return <GameShell title="Chess" status={statusText(match.status)} reset={reset} detail={`${turn === "w" ? "White" : "Black"} to move · ${match.history.join(" ") || "Opening position"}`}><div className="mb-4 grid grid-cols-2 gap-3 text-center"><Clock label="White" value={clock.w} active={turn === "w"} /><Clock label="Black" value={clock.b} active={turn === "b"} /></div><LuxeChessFrame><div className="luxe-chess-grid grid grid-cols-8 overflow-hidden">{chess.board().map((row, r) => row.map((piece, c) => { const square = notation(r, c); return <button key={square} aria-label={`${square}${piece ? ` ${piece.color === "w" ? "White" : "Black"} ${piece.type}` : " empty"}`} aria-pressed={selected === square} onClick={() => tap(square)} className={`aspect-square text-3xl transition sm:text-5xl ${(r + c) % 2 ? "luxe-chess-square--dark" : "luxe-chess-square--light"} ${selected === square ? "ring-4 ring-cyan-300" : legal.includes(square as never) ? "ring-4 ring-emerald-300/80" : ""}`}>{piece ? <span className={piece.color === "w" ? "luxe-chess-piece luxe-chess-piece--ivory" : "luxe-chess-piece luxe-chess-piece--onyx"}>{({ p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚" } as Record<string,string>)[piece.type].replace("♟",piece.color === "w" ? "♙" : "♟").replace("♜",piece.color === "w" ? "♖" : "♜").replace("♞",piece.color === "w" ? "♘" : "♞").replace("♝",piece.color === "w" ? "♗" : "♝").replace("♛",piece.color === "w" ? "♕" : "♛").replace("♚",piece.color === "w" ? "♔" : "♚")}</span> : null}</button>; }))}</div></LuxeChessFrame></GameShell>;
}
type C4Cell = { row: number; col: number };
function winningLine(state: ConnectFourState): C4Cell[] {
  if (state.moves.length === 0 || state.status === "playing" || state.status === "draw") return [];
  const piece = state.status === "red_won" ? "red" : "yellow";
  const col = state.moves[state.moves.length - 1]; const row = state.board.findIndex((line) => line[col] === piece); if (row < 0) return [];
  for (const [dr, dc] of [[1, 0], [0, 1], [1, 1], [1, -1]] as const) {
    const cells: C4Cell[] = [{ row, col }];
    for (const sign of [-1, 1]) for (let r = row + dr * sign, c = col + dc * sign; r >= 0 && r < 6 && c >= 0 && c < 7 && state.board[r][c] === piece; r += dr * sign, c += dc * sign) cells.push({ row: r, col: c });
    if (cells.length >= 4) return cells;
  }
  return [];
}
const PIECE_ART: Record<string, string> = { red: "radial-gradient(circle at 34% 28%, #fda4af, #e11d48 52%, #7f1d1d)", yellow: "radial-gradient(circle at 34% 28%, #fef3c7, #f59e0b 52%, #78350f)" };
function ConnectFourBoard({ sound }: { sound: (s: "button" | "ticketSelect" | "success" | "error") => void }) {
  const [state, setState] = useState<ConnectFourState>(newConnectFour);
  const lastCol = state.moves[state.moves.length - 1];
  const win = winningLine(state);
  const winSet = new Set(win.map((c) => `${c.row}-${c.col}`));
  const lastRow = state.status !== "playing" && lastCol != null ? state.board.findIndex((line) => line[lastCol]) : state.board.findIndex((line) => line[lastCol ?? -1]);
  const drop = (c: number) => { try { const next = playConnectFour(state, c); setState(next); sound(next.status === "playing" ? "ticketSelect" : "success"); } catch { sound("error"); } };
  return <GameShell title="Connect Four" status={statusText(state.status)} reset={() => { setState(newConnectFour()); sound("button"); }} detail={state.status === "playing" ? `${state.turn === "red" ? "🔴 Ruby" : "🟡 Gold"} to move — drop a disc into a column` : state.status === "draw" ? "Board full — honours even" : `${state.status === "red_won" ? "🔴 Ruby" : "🟡 Gold"} connects four!`}>
    <div className="board3d-scene c4-scene mx-auto max-w-xl">
      <div className="board3d-tilt board3d-frame c4-frame rounded-3xl p-3 sm:p-4">
        <div className="c4-grid grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: 7 }, (_, c) => (
            <button key={c} onClick={() => drop(c)} className="c4-column group" aria-label={`Drop in column ${c + 1}`}>
              <span className="c4-drop-hint" aria-hidden="true">{state.status === "playing" ? (state.turn === "red" ? "🔴" : "🟡") : ""}</span>
              {state.board.map((row, r) => {
                const piece = row[c];
                const isLast = state.moves.length > 0 && lastCol === c && r === state.board.findIndex((line) => line[c]);
                return <span key={r} className={`slot3d c4-slot block aspect-square rounded-full${piece ? " disc3d c4-disc" : " c4-empty"}${piece && isLast ? " c4-disc--landed" : ""}${winSet.has(`${r}-${c}`) ? " c4-disc--win" : ""}`} style={piece ? { background: PIECE_ART[piece] } : undefined} />;
              })}
            </button>
          ))}
        </div>
      </div>
      {win.length > 0 && <p className="c4-victory mt-4 text-center text-sm font-black uppercase tracking-[.25em] text-amber-200">⚡ Connect four — magnificent ⚡</p>}
    </div>
    <OnlineConnectFour />
  </GameShell>;
}
function DraughtsBoard({ sound }: { sound: (s: "button" | "ticketSelect" | "success" | "error") => void }) {
  const [state, setState] = useState<DraughtsState>(newDraughts);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [lastMove, setLastMove] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  const legal = selected ? draughtsMoves(state, selected) : draughtsMoves(state);
  const mustCapture = draughtsMoves(state).some((m) => Math.abs(m.to[0] - m.from[0]) === 2);
  const captures = legal.filter((m) => Math.abs(m.to[0] - m.from[0]) === 2);
  const count = (color: "white" | "black") => state.board.flat().filter((p) => p?.color === color).length;
  const tap = (r: number, c: number) => {
    const p = state.board[r][c];
    if (!selected) { if (p?.color === state.turn) { setSelected([r, c]); sound("ticketSelect"); } return; }
    const move = { from: selected, to: [r, c] as [number, number] };
    try { const next = playDraughts(state, move); setState(next); setSelected(next.forcedFrom ?? null); setLastMove(move); sound(next.status === "playing" ? (Math.abs(move.to[0] - move.from[0]) === 2 ? "success" : "ticketSelect") : "success"); }
    catch { if (p?.color === state.turn) { setSelected([r, c]); sound("button"); } else sound("error"); }
  };
  return <GameShell title="Draughts" status={statusText(state.status)} reset={() => { setState(newDraughts()); setSelected(null); setLastMove(null); sound("button"); }} detail={state.status === "playing" ? `${state.turn === "white" ? "⚪ Ivory" : "⚫ Onyx"} to move${mustCapture ? " · ⚔ capture is mandatory" : ""}${state.forcedFrom ? " — keep jumping!" : ""}` : state.status === "white_won" ? "⚪ Ivory takes the board" : state.status === "black_won" ? "⚫ Onyx takes the board" : "Honours even"}>
    <div className="mb-4 flex items-center justify-between gap-3 text-xs font-black">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5"><span className="draughts-mini draughts-mini--white" /> Ivory × {count("white")}</span>
      <span className="text-white/35 uppercase tracking-[.2em]">vs</span>
      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5"><span className="draughts-mini draughts-mini--black" /> Onyx × {count("black")}</span>
    </div>
    <div className="board3d-scene draughts-scene mx-auto max-w-[38rem]">
      <div className="board3d-tilt board3d-frame draughts-frame grid grid-cols-8 overflow-hidden rounded-2xl">
        {state.board.map((row, r) => row.map((p, c) => {
          const dark = (r + c) % 2 === 1;
          const isSelected = selected?.[0] === r && selected?.[1] === c;
          const isForced = state.forcedFrom?.[0] === r && state.forcedFrom?.[1] === c;
          const highlighted = legal.some((m) => m.to[0] === r && m.to[1] === c);
          const isCapture = captures.some((m) => m.to[0] === r && m.to[1] === c);
          const isLast = lastMove && ((lastMove.from[0] === r && lastMove.from[1] === c) || (lastMove.to[0] === r && lastMove.to[1] === c));
          return <button key={`${r}-${c}`} onClick={() => tap(r, c)} aria-label={`Square ${r + 1},${c + 1}${p ? ` ${p.color}${p.king ? " king" : ""}` : ""}`} className={`draughts-square aspect-square ${dark ? "draughts-square--dark" : "draughts-square--light"}${isSelected ? " draughts-square--selected" : ""}${isForced ? " draughts-square--forced" : ""}${highlighted ? " draughts-square--move" : ""}${isCapture ? " draughts-square--capture" : ""}${isLast ? " draughts-square--last" : ""}`}>
            {p && <span className={`draughts-piece ${p.color === "white" ? "draughts-piece--white" : "draughts-piece--black"}${p.king ? " draughts-piece--king" : ""}`}>{p.king ? "♛" : ""}</span>}
            {highlighted && !p && <span className={`draughts-dot${isCapture ? " draughts-dot--capture" : ""}`} />}
          </button>;
        }))}
      </div>
    </div>
  </GameShell>;
}
function GameShell({title,status,detail,reset,children}:{title:string;status:string;detail:string;reset:()=>void;children:ReactNode}){return <><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">{title} match</p><h3 className="mt-1 text-2xl font-black">{status}</h3><p className="mt-1 text-sm text-white/60">{detail}</p></div><button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black"><RotateCcw className="h-4 w-4"/>Rematch</button></div>{children}<p className="mt-5 flex items-center gap-2 text-xs text-white/45"><ShieldCheck className="h-4 w-4 text-emerald-300"/>Rules are enforced locally now; online match results remain server-locked.</p></>}
function Clock({label,value,active}:{label:string;value:number;active:boolean}){return <div className={`rounded-xl border p-3 ${active?"border-amber-200 bg-amber-300/10":"border-white/10 bg-black/20"}`}><small className="text-white/55">{label}</small><b className="block font-mono text-xl">{Math.floor(value/60)}:{String(value%60).padStart(2,"0")}</b></div>}
