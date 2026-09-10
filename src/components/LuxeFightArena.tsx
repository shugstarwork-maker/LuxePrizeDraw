import React, { useState } from "react";
import { RotateCcw, ShieldCheck, Swords, Zap } from "lucide-react";

type Fighter = { name: string; health: number; guard: number };
const initialPlayer: Fighter = { name: "You", health: 100, guard: 2 };
const initialOpponent: Fighter = { name: "Luxe Rival", health: 100, guard: 2 };

export const LuxeFightArena: React.FC = () => {
  const [player, setPlayer] = useState(initialPlayer);
  const [opponent, setOpponent] = useState(initialOpponent);
  const [status, setStatus] = useState("Choose an action. First fighter to reduce their opponent to zero wins.");
  const [active, setActive] = useState(true);
  const [opponentThinking, setOpponentThinking] = useState(false);
  const [round, setRound] = useState(1);

  const reset = () => { setPlayer(initialPlayer); setOpponent(initialOpponent); setActive(true); setOpponentThinking(false); setRound(1); setStatus("New round. Choose an action."); };
  const act = (action: "jab" | "power" | "guard") => {
    if (!active || opponentThinking) return;
    setOpponentThinking(true);
    if (action === "guard") {
      const guarded = { ...player, guard: Math.min(3, player.guard + 1) };
      setPlayer(guarded); setStatus("You raise your guard. Luxe Rival is sizing you up.");
      window.setTimeout(() => rivalTurn(guarded), 260); return;
    }
    const damage = action === "jab" ? 8 + Math.floor(Math.random() * 8) : 16 + Math.floor(Math.random() * 12);
    const nextHealth = Math.max(0, opponent.health - damage);
    const nextOpponent = { ...opponent, health: nextHealth };
    setOpponent(nextOpponent);
    if (nextHealth === 0) { setActive(false); setOpponentThinking(false); setStatus(`Knockout. You win round ${round} and earn 50 virtual points.`); return; }
    setStatus(`You land a ${action === "jab" ? "quick strike" : "power move"} for ${damage}.`);
    window.setTimeout(() => rivalTurn(player), 280);
  };
  const rivalTurn = (currentPlayer: Fighter) => {
    setOpponentThinking(false);
    const damage = 7 + Math.floor(Math.random() * 13);
    const blocked = currentPlayer.guard > 0 ? Math.floor(damage / 2) : 0;
    const taken = damage - blocked;
    const nextPlayer = { ...currentPlayer, health: Math.max(0, currentPlayer.health - taken), guard: Math.max(0, currentPlayer.guard - 1) };
    setPlayer(nextPlayer); setRound((value) => value + 1);
    if (nextPlayer.health === 0) { setActive(false); setStatus(`Luxe Rival wins the free-play round. Reset for a rematch.`); }
    else setStatus(`Luxe Rival attacks for ${taken}${blocked ? ` (${blocked} blocked)` : ""}. Your move.`);
  };
  const meter = (health: number, color: string) => <div className="h-3 overflow-hidden rounded-full bg-black/40"><div className={`h-full rounded-full ${color}`} style={{ width: `${health}%` }} /></div>;

  return <section id="fight-arena" className="py-20 sm:py-28 border-y border-white/10 bg-gradient-to-b from-[#16060b] via-[#0c0a14] to-slate-950"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="rounded-[2rem] border border-rose-400/30 bg-gradient-to-br from-rose-950/50 via-black to-violet-950/30 p-6 shadow-[0_0_70px_rgba(244,63,94,0.14)] sm:p-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-rose-100"><Swords className="h-3.5 w-3.5" /> Free-play fighter</div><h2 className="mt-4 text-3xl font-bold sm:text-5xl">Luxe Fight Arena</h2></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/75 hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Rematch</button></div><p className="mt-3 max-w-3xl text-white/60">An original 1v1 virtual-points fighting game. No money, deposits, cash prizes, or wagering.</p><div className="mt-8 grid gap-5 md:grid-cols-2"><article className="rounded-3xl border border-violet-300/25 bg-violet-500/10 p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-violet-200">{player.name}</p><p className="mt-2 text-4xl font-black">{player.health}</p></div><div className="rounded-2xl border border-violet-300/30 bg-violet-300/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-violet-100">Challenger</div></div><div className="mt-4">{meter(player.health, "bg-gradient-to-r from-violet-500 to-fuchsia-400")}</div><p className="mt-3 text-xs text-white/50">Guard charges: {player.guard}</p></article><article className="rounded-3xl border border-rose-300/25 bg-rose-500/10 p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-rose-200">{opponent.name}</p><p className="mt-2 text-4xl font-black">{opponent.health}</p></div><div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-100">Rival</div></div><div className="mt-4">{meter(opponent.health, "bg-gradient-to-r from-rose-600 to-amber-400")}</div><p className="mt-3 text-xs text-white/50">Round {round} · virtual points only</p></article></div><p aria-live="polite" className="mt-6 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100"><ShieldCheck className="mr-2 inline h-4 w-4" />{status}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><button type="button" disabled={!active || opponentThinking} onClick={() => act("jab")} className="rounded-xl bg-white/10 px-5 py-4 text-sm font-black transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40">Quick strike</button><button type="button" disabled={!active || opponentThinking} onClick={() => act("power")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-400 px-5 py-4 text-sm font-black text-black transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-40"><Zap className="h-4 w-4" /> Power move</button><button type="button" disabled={!active || opponentThinking} onClick={() => act("guard")} className="rounded-xl border border-violet-300/35 bg-violet-400/10 px-5 py-4 text-sm font-black text-violet-100 transition hover:bg-violet-400/20 disabled:cursor-not-allowed disabled:opacity-40">Raise guard</button></div></div></div></section>;
};
