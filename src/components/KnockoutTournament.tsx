import React, { useMemo, useState } from "react";
import { Crown, ShieldCheck, Swords, Trophy, Users } from "lucide-react";

type Match = { id: string; playerOne: string; playerTwo: string; winner?: string };
const openingMatches: Match[] = [
  { id: "q1", playerOne: "You", playerTwo: "Avery K." },
  { id: "q2", playerOne: "Mia C.", playerTwo: "Leo F." },
  { id: "q3", playerOne: "Ruby C.", playerTwo: "Theo M." },
  { id: "q4", playerOne: "Amelia K.", playerTwo: "Marcus B." },
];

export const KnockoutTournament: React.FC = () => {
  const [matches, setMatches] = useState(openingMatches);
  const [joined, setJoined] = useState(false);
  const winners = matches.map((match) => match.winner).filter(Boolean) as string[];
  const semiFinals = winners.length >= 4 ? [{ id: "s1", playerOne: winners[0], playerTwo: winners[1] }, { id: "s2", playerOne: winners[2], playerTwo: winners[3] }] : [];
  const [semiWinners, setSemiWinners] = useState<string[]>([]);
  const final = semiWinners.length === 2 ? { playerOne: semiWinners[0], playerTwo: semiWinners[1] } : null;
  const [champion, setChampion] = useState<string | null>(null);
  const nextMatch = useMemo(() => matches.find((match) => !match.winner), [matches]);

  const advanceQuarterFinal = (matchId: string, player: string) => setMatches((current) => current.map((match) => match.id === matchId ? { ...match, winner: player } : match));
  const advanceSemiFinal = (player: string) => setSemiWinners((current) => current.includes(player) || current.length === 2 ? current : [...current, player]);
  const reset = () => { setMatches(openingMatches); setSemiWinners([]); setChampion(null); setJoined(false); };

  return <section id="tournaments" className="border-y border-white/10 bg-[#090d16] py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><div className="interactive-badge inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200"><Swords className="h-3.5 w-3.5" /> Knockout tournament</div><h2 className="mt-4 text-3xl font-light text-white sm:text-5xl">One player. <span className="font-bold text-[#D4AF37]">One champion.</span></h2><p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">Join a free-play eight-player bracket. Each round is 1v1; win to advance until only one player remains. Tokens are non-transferable, cannot be bought, and have no cash value.</p></div><div className="rounded-2xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-5 py-4"><div className="text-[10px] font-bold uppercase tracking-widest text-[#f6d46b]">Current format</div><div className="mt-1 flex items-center gap-2 text-xl font-black text-white"><Users className="h-5 w-5 text-[#D4AF37]" /> 8 player bracket</div></div></div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_2fr]"><aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><h3 className="text-lg font-bold text-white">Weekly skill knockout</h3><p className="mt-2 text-sm text-white/60">Chess, Draughts, and Connect 4 rotate as the featured game.</p><button type="button" onClick={() => setJoined(true)} disabled={joined} className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-black uppercase tracking-wider ${joined ? "bg-emerald-400/20 text-emerald-200" : "bg-[#D4AF37] text-black hover:bg-[#f6d46b]"}`}>{joined ? "Bracket joined" : "Join free tournament"}</button><div className="mt-6 border-t border-white/10 pt-5 text-xs text-white/55"><p className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />No entry purchase, cash prize, withdrawal, or transferable value.</p>{nextMatch && joined && <p className="mt-4 rounded-xl bg-white/5 p-3 text-white/80">Next 1v1: <strong>{nextMatch.playerOne}</strong> vs <strong>{nextMatch.playerTwo}</strong></p>}</div><button type="button" onClick={reset} className="mt-5 text-xs font-bold uppercase tracking-wider text-[#f6d46b] hover:text-white">Reset demo bracket</button></aside>
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-7"><div className="grid min-w-[720px] grid-cols-3 gap-6"><BracketColumn title="Quarter-finals" matches={matches} onAdvance={(player, matchId) => advanceQuarterFinal(matchId!, player)} enabled={joined} /><BracketColumn title="Semi-finals" matches={semiFinals} onAdvance={(player) => advanceSemiFinal(player)} enabled={joined && semiFinals.length > 0} /><div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">Final</p>{final ? <MatchCard match={{ id: "final", ...final }} enabled={joined} onAdvance={(player) => setChampion(player)} /> : <EmptyCard label="Win your semi-final" />}{champion && <div className="mt-5 rounded-2xl border border-[#D4AF37]/45 bg-[#D4AF37]/10 p-5 text-center"><Crown className="mx-auto h-7 w-7 text-[#D4AF37]" /><p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#f6d46b]">Tournament champion</p><p className="mt-1 text-xl font-black text-white">{champion}</p><p className="mt-2 text-xs text-white/60">Champion badge earned</p></div>}</div></div></div></div>
    </div>
  </section>;
};

const BracketColumn: React.FC<{ title: string; matches: Match[]; enabled: boolean; onAdvance: (player: string, matchId?: string) => void }> = ({ title, matches, enabled, onAdvance }) => <div><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{title}</p><div className="space-y-5">{matches.length ? matches.map((match) => <MatchCard key={match.id} match={match} enabled={enabled} onAdvance={(player) => onAdvance(player, match.id)} />) : <EmptyCard label="Complete prior round" />}</div></div>;
const MatchCard: React.FC<{ match: Match; enabled: boolean; onAdvance: (player: string) => void }> = ({ match, enabled, onAdvance }) => <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-white/40">1v1 match</p>{[match.playerOne, match.playerTwo].map((player) => <button key={player} type="button" disabled={!enabled || Boolean(match.winner)} onClick={() => onAdvance(player)} className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${match.winner === player ? "bg-emerald-400/20 text-emerald-100" : "bg-black/30 text-white hover:bg-[#D4AF37]/20 disabled:hover:bg-black/30"}`}><span>{player}</span>{match.winner === player && <Trophy className="h-3.5 w-3.5 text-[#D4AF37]" />}</button>)}</div>;
const EmptyCard: React.FC<{ label: string }> = ({ label }) => <div className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-xs text-white/40">{label}</div>;
