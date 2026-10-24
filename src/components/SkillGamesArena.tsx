import { useEffect, useRef, useState } from "react";
import { Clock3, Crown, FlaskConical, Gamepad2, Lock, ShieldCheck, Swords, Ticket, Users } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";
import { ChessBoard, ConnectFourBoard, DraughtsBoard, type BoardState } from "./GamesArena";
import { GameHudShell, type HudPlayer } from "./GameHudShell";
import { DisconnectWarning, HardwareLockNotice, IntegrityPause, MatchKillNotice, StallWarning, type IntegrityWarning } from "./IntegrityWarnings";
import { MatchTelemetry, MOVE_TIME_LIMIT_SECONDS, STALL_WARNING_SECONDS, assessMatch, type MoveSample } from "../lib/antiCheat";
import { loadWallet, type Wallet } from "../lib/currencies";
import { prizePoints } from "../lib/redemptionEngine";
import { reviewModeEnabled } from "../lib/reviewMode";
import {
  ARENA_FORMATS, ARENA_RULES, FORFEIT_GRACE_SECONDS, MATCHMAKING_TIMEOUT_SECONDS, PRIZE_ENTRY_TICKETS, PRIZE_WIN_POINTS,
  SKILL_GAMES, applyResult, matchmakingBand, skillRating, type EntryFormat, type SkillGameId,
} from "../lib/skillGames";

// Demo shows a shortened grace countdown so the overlay is reviewable.
const FORFEIT_DEMO_SECONDS = Math.min(10, FORFEIT_GRACE_SECONDS);

const SIDES: Record<SkillGameId, { a: HudPlayer; b: HudPlayer }> = {
  chess: {
    a: { name: "You", badge: "Ivory", piece: "♔", active: false },
    b: { name: "Onyx O.", badge: "Onyx", piece: "♚", active: false },
  },
  draughts: {
    a: { name: "You", badge: "Ivory", piece: "⚪", active: false },
    b: { name: "Marcus B.", badge: "Onyx", piece: "⚫", active: false },
  },
  connect4: {
    a: { name: "You", badge: "Ruby", piece: "🔴", active: false },
    b: { name: "Ruby C.", badge: "Gold", piece: "🟡", active: false },
  },
};

function hudPlayers(game: SkillGameId, s: BoardState | null): [HudPlayer, HudPlayer] {
  const base = SIDES[game];
  const clockA = s?.clockA != null ? `${Math.floor(s.clockA / 60)}:${String(s.clockA % 60).padStart(2, "0")}` : undefined;
  const clockB = s?.clockB != null ? `${Math.floor(s.clockB / 60)}:${String(s.clockB % 60).padStart(2, "0")}` : undefined;
  return [
    { ...base.a, active: s?.turn === "a", stat: clockA },
    { ...base.b, active: s?.turn === "b", stat: clockB },
  ];
}

function stateLabelFor(game: SkillGameId, s: BoardState): string {
  if (s.status !== "playing") return s.status === "draw" ? `Draw after move ${s.moveNumber - 1}` : `Decided on move ${s.moveNumber - 1}`;
  const mover = s.turn === "a" ? SIDES[game].a.badge : SIDES[game].b.badge;
  return `Move ${s.moveNumber} · ${mover} to move`;
}

type Phase = "pick" | "queue" | "playing";

export function SkillGamesArena() {
  const { play, enabled, setEnabled } = useAudio();
  const [game, setGame] = useState<SkillGameId>("chess");
  const [format, setFormat] = useState<EntryFormat>("casual");
  const [phase, setPhase] = useState<Phase>("pick");
  const [wallet, setWallet] = useState<Wallet>(() => loadWallet());
  const [points, setPoints] = useState(() => prizePoints());
  const [queueLeft, setQueueLeft] = useState(MATCHMAKING_TIMEOUT_SECONDS);
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(() => skillRating("chess"));
  const [warning, setWarning] = useState<IntegrityWarning | null>(null);
  const [stallLeft, setStallLeft] = useState<number | null>(null);
  const [boardState, setBoardState] = useState<BoardState | null>(null);
  const review = reviewModeEnabled();
  const timer = useRef<number | null>(null);
  const telemetry = useRef<MatchTelemetry>(new MatchTelemetry());
  const turnStart = useRef<number>(0);
  const focusLost = useRef(false);

  useEffect(() => setRating(skillRating(game)), [game]);
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  // Disconnect countdown: runs the grace window down; expiry = forfeit (demo
  // returns to the picker — live servers award the win to the opponent).
  useEffect(() => {
    if (warning?.kind !== "disconnect") return;
    if (warning.secondsLeft <= 0) {
      setWarning(null);
      setPhase("pick");
      setNote("Grace window expired — match forfeited (demo). At launch the opponent would be awarded the win and entries.");
      play("error");
      return;
    }
    const id = window.setTimeout(() => {
      setWarning((w) => (w?.kind === "disconnect" ? { kind: "disconnect", secondsLeft: w.secondsLeft - 1 } : w));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [warning, play]);
  useEffect(() => {
    if (phase !== "playing") return;
    const onVis = () => {
      if (document.hidden) { focusLost.current = true; telemetry.current.focusLost(); }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [phase]);

  // Stall watch (per-move ceiling): warn after STALL_WARNING_SECONDS idle.
  useEffect(() => {
    if (phase !== "playing") { setStallLeft(null); return; }
    turnStart.current = Date.now();
    telemetry.current.turnStarted();
    const id = window.setInterval(() => {
      const idle = Math.floor((Date.now() - turnStart.current) / 1000);
      const left = MOVE_TIME_LIMIT_SECONDS - idle;
      setStallLeft(idle >= STALL_WARNING_SECONDS ? Math.max(0, left) : null);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, note, game]);

  const g = SKILL_GAMES.find((x) => x.id === game)!;
  const band = matchmakingBand(game);
  const prizeLocked = ARENA_FORMATS.find((f) => f.id === "prize")!.locked;

  const startQueue = () => {
    play("button");
    setPhase("queue");
    setQueueLeft(MATCHMAKING_TIMEOUT_SECONDS);
    timer.current = window.setInterval(() => {
      setQueueLeft((s) => {
        if (s <= 1) {
          if (timer.current) window.clearInterval(timer.current);
          setPhase("pick");
          setNote(`No opponent found in ${MATCHMAKING_TIMEOUT_SECONDS}s — your entry was safely returned to your wallet. Nothing was debited.`);
          play("notification");
          return MATCHMAKING_TIMEOUT_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
  };

  const startLocal = () => {
    play("button");
    telemetry.current = new MatchTelemetry();
    focusLost.current = false;
    setWarning(null);
    setPhase("playing");
    setNote("");
  };

  const onResult = (result: "win" | "draw") => {
    const { rating: next, delta } = applyResult(game, result === "win", 800);
    setRating(next);
    if (result === "win") play("success");
    setNote(result === "win"
      ? `Match won — arena rating ${delta >= 0 ? "+" : ""}${delta} → ${next.toLocaleString()}.`
      : `Honours even — arena rating ${delta >= 0 ? "+" : ""}${delta} → ${next.toLocaleString()}.`);
  };

  const Board = game === "chess" ? ChessBoard : game === "connect4" ? ConnectFourBoard : DraughtsBoard;

  return <div className="min-h-screen bg-[#070503] px-4 pb-28 pt-6 text-white sm:px-6" data-testid="skill-arena">
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200"><Swords className="h-3.5 w-3.5" /> Skill Games Arena</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Pure skill. Real stakes.</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/55">
            Chess, Draughts and Connect Four — 100% games of skill with no random elements. Casual matches run on Gold Coins glory;
            prize tournaments will run on free Sweep Tickets after launch.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-1.5 font-mono text-xs font-black text-amber-100">🪙 {wallet.goldCoins.toLocaleString()}</span>
          {!review && <span className="rounded-full border border-violet-300/35 bg-violet-400/10 px-3 py-1.5 font-mono text-xs font-black text-violet-100">🎟 {wallet.sweepTickets}</span>}
          {!review && <span className="rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-1.5 font-mono text-xs font-black text-emerald-100">★ {points.toLocaleString()} pts</span>}
        </div>
      </header>

      {/* Game picker */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3" data-testid="arena-games">
        {SKILL_GAMES.map((x) => (
          <button key={x.id} onClick={() => { setGame(x.id); setPhase("pick"); play("button"); }}
            className={`rounded-2xl border p-4 text-left transition ${game === x.id ? "border-amber-300/60 bg-amber-400/10" : "border-white/10 bg-white/[.04] hover:border-amber-200/40"}`}
            data-game={x.id}>
            <span className="text-2xl">{x.piece}</span>
            <b className="mt-2 block text-base">{x.title}</b>
            <small className="mt-1 block text-[11px] text-white/55">{x.blurb}</small>
            <small className="mt-2 block text-[10px] font-black uppercase tracking-widest text-white/40"><Clock3 className="mr-1 inline h-3 w-3" />{Math.floor(x.clockSeconds / 60)} min clock</small>
          </button>
        ))}
      </div>

      {/* Format picker */}
      {phase !== "playing" && <div className="mt-5 grid gap-3 sm:grid-cols-2" data-testid="arena-formats">
        {ARENA_FORMATS.filter((f) => !review || f.id === "casual").map((f) => (
          <button key={f.id} onClick={() => { setFormat(f.id); play("button"); }}
            className={`rounded-2xl border p-4 text-left transition ${format === f.id ? (f.currency === "gold" ? "border-amber-300/60 bg-amber-400/10" : "border-violet-300/60 bg-violet-400/10") : "border-white/10 bg-white/[.04]"}`}
            data-format={f.id}>
            <span className="flex items-center justify-between gap-2">
              <b className="text-sm">{f.label}</b>
              {f.locked && <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/45"><Lock className="h-3 w-3" /> Locked</span>}
            </span>
            <small className="mt-1 block text-[11px] text-white/55">{f.entryLabel} · {f.stakesLabel}</small>
            <small className="mt-1.5 block text-[10px] text-white/40">{f.honesty}</small>
          </button>
        ))}
      </div>}

      {/* Queue / start */}
      {phase === "pick" && <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.04] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black">{g.title} · {format === "casual" ? "Casual match" : "Prize match"}</p>
            <p className="mt-1 text-[11px] text-white/55">
              Arena rating <b className="text-amber-200">{rating.toLocaleString()}</b> · matchmaking pairs {band.min}–{band.max}
              {format === "prize" && <> · entry 🎟 {PRIZE_ENTRY_TICKETS} · winner earns ★ {PRIZE_WIN_POINTS} Prize Points</>}
            </p>
          </div>
          {format === "casual"
            ? <button onClick={startLocal} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-6 py-3 text-sm font-black text-black shadow-lg transition active:scale-95" data-testid="arena-play-local">Play local match</button>
            : prizeLocked
              ? <button disabled className="cursor-not-allowed rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-black text-white/40" data-testid="arena-prize-locked">Opens after launch</button>
              : <button onClick={startQueue} className="rounded-xl bg-gradient-to-b from-violet-300 to-violet-500 px-6 py-3 text-sm font-black text-black shadow-lg" data-testid="arena-queue">Find match</button>}
        </div>
        {format === "casual" && <p className="mt-3 text-[10px] text-white/40">Local two-player on this device now — UK regional servers (eu-west-2) bring online matchmaking at launch.</p>}
        {format === "prize" && !prizeLocked && <p className="mt-3 text-[10px] text-white/40">If no opponent is found within {MATCHMAKING_TIMEOUT_SECONDS} seconds your 🎟 {PRIZE_ENTRY_TICKETS} entry is automatically refunded.</p>}
        {note && <p className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-[11px] text-emerald-100" data-testid="arena-note">{note}</p>}
      </div>}

      {phase === "queue" && <div className="mt-5 rounded-2xl border border-violet-300/30 bg-violet-400/[.07] p-8 text-center" data-testid="arena-queueing">
        <Users className="mx-auto h-8 w-8 animate-pulse text-violet-200" />
        <p className="mt-3 text-lg font-black">Finding your opponent…</p>
        <p className="mt-1 text-sm text-white/55">Auto-refund in <b className="font-mono text-violet-200">{queueLeft}s</b> if nobody matches. Your ticket never leaves your wallet on a failed search.</p>
      </div>}

      {phase === "playing" && <div className="mt-5 rounded-[2rem] border border-white/15 bg-[#090b16] p-4 shadow-2xl sm:p-7" data-testid="arena-board">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-200"><Crown className="h-3.5 w-3.5" /> Casual · rating {rating.toLocaleString()}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => { setWarning({ kind: "disconnect", secondsLeft: FORFEIT_DEMO_SECONDS }); play("notification"); }} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white/60 transition hover:border-amber-200/40" data-testid="simulate-warning"><FlaskConical className="h-3.5 w-3.5" /> Demo warnings</button>
            <button onClick={() => { setWarning({ kind: "integrity_pause", reasons: ["Demo: mechanical move pacing detected (σ=212ms across 14 moves)", "Demo: 9-move engine streak under review"] }); play("notification"); }} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white/60 transition hover:border-sky-300/40" data-testid="simulate-integrity"><FlaskConical className="h-3.5 w-3.5" /> Demo integrity</button>
            <button onClick={() => setPhase("pick")} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white/70">Leave board</button>
          </div>
        </div>
        <GameHudShell
          title={g.title}
          balanceLabel={`${wallet.goldCoins.toLocaleString()} coins wallet · arena rating ${rating.toLocaleString()}`}
          stateLabel={boardState ? stateLabelFor(game, boardState) : `${g.title} · ready`}
          players={hudPlayers(game, boardState)}
          muted={!enabled}
          onToggleMute={() => setEnabled(!enabled)}
          onExit={() => setPhase("pick")}>
          <Board sound={(s) => { play(s); if (s !== "button") { telemetry.current.movePlayed(); turnStart.current = Date.now(); telemetry.current.turnStarted(); focusLost.current = false; } }} onResult={onResult} onState={setBoardState} />
        </GameHudShell>
        {note && <p className="mt-3 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-[11px] text-emerald-100" data-testid="arena-note">{note}</p>}
      </div>}

      {/* Integrity warning layer */}
      {stallLeft !== null && phase === "playing" && !warning && <StallWarning secondsLeft={stallLeft} />}
      {warning?.kind === "disconnect" && <DisconnectWarning secondsLeft={warning.secondsLeft} onReconnected={() => { setWarning(null); play("button"); }} />}
      {warning?.kind === "integrity_pause" && <IntegrityPause reasons={warning.reasons} onContinue={() => { setWarning(null); play("button"); }} />}
      {warning?.kind === "match_kill" && <MatchKillNotice reasons={warning.reasons} onExit={() => { setWarning(null); setPhase("pick"); play("button"); }} />}
      {warning?.kind === "hardware_lock" && <HardwareLockNotice />}

      {/* Rules */}
      <section className="mt-8 grid gap-3 sm:grid-cols-2" data-testid="arena-rules">
        {ARENA_RULES.map((rule, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p className="text-[11px] leading-relaxed text-white/60">{rule}</p>
          </div>
        ))}
      </section>

      <p className="mt-6 text-center text-[10px] text-white/40">
        Pre-launch simulation — local play only. Prize matches, Prize Points and payouts activate after legal approval and 18+ ID verification. <a href="/redeem" className="font-bold text-amber-200 underline underline-offset-4">Preview the Prize Store</a>
      </p>
    </div>
  </div>;
}
