import React, { useState } from "react";
import { ChevronRight, CircleDollarSign, Crown, ShieldCheck, Trophy, Users } from "lucide-react";

const tournaments = [
  { name: "Midnight Gold Sit & Go", players: "6 / 9", start: "Starts in 12 min", buyIn: 250 },
  { name: "Weekend Luxe Knockout", players: "42 / 64", start: "Tonight, 20:00", buyIn: 500 },
  { name: "Sunday Crown Final", players: "18 / 36", start: "Sunday, 19:00", buyIn: 1000 },
];

export const LuxePokerLeague: React.FC = () => {
  const [chips, setChips] = useState(2500);
  const [joined, setJoined] = useState<string | null>(null);
  const [status, setStatus] = useState("Choose a free-play table to reserve your seat.");

  const joinTournament = (name: string, buyIn: number) => {
    if (joined === name) return;
    if (chips < buyIn) {
      setStatus("You need more virtual chips for this free-play table.");
      return;
    }
    setChips((value) => value - buyIn);
    setJoined(name);
    setStatus(`Seat reserved for ${name}. Your table opens at the scheduled start time.`);
  };

  return (
    <section id="poker-league" className="py-20 sm:py-28 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] overflow-hidden border border-[#D4AF37]/30 bg-gradient-to-br from-[#241504] via-[#100b04] to-black p-6 sm:p-10 shadow-[0_0_70px_rgba(212,175,55,0.12)]">
          <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#F8D778]"><img src="/games/poker-league.svg" alt="" className="h-5 w-5 rounded-md object-cover" /> Free-play only</div>
              <h2 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight">Luxe Poker League</h2>
              <img src="/games/poker-league.svg" alt="Premium poker-table artwork" className="mt-6 h-48 w-full max-w-xl rounded-3xl border border-[#D4AF37]/25 object-cover shadow-[0_16px_38px_rgba(0,0,0,0.35)]" />
              <p className="mt-4 max-w-xl text-white/60 leading-relaxed">An original, virtual-chip tournament lobby for the Luxe community. Join tables, climb the standings and earn in-app bragging rights—no cash wagering or purchasable chips.</p>
              <div className="mt-7 grid grid-cols-3 gap-3 max-w-lg">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><Users className="w-4 h-4 text-[#D4AF37]" /><p className="mt-3 text-lg font-black">1,248</p><p className="text-[10px] uppercase tracking-wider text-white/45">Players</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><Trophy className="w-4 h-4 text-[#D4AF37]" /><p className="mt-3 text-lg font-black">12</p><p className="text-[10px] uppercase tracking-wider text-white/45">Live tables</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><CircleDollarSign className="w-4 h-4 text-[#D4AF37]" /><p className="mt-3 text-lg font-black">{chips.toLocaleString()}</p><p className="text-[10px] uppercase tracking-wider text-white/45">Virtual chips</p></div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/50 p-5 sm:p-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Crown className="w-5 h-5 text-[#D4AF37]" /><h3 className="font-bold">Tournament lobby</h3></div><span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Live</span></div>
              <div className="mt-5 space-y-3">{tournaments.map((tournament) => <div key={tournament.name} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex justify-between gap-3"><div><h4 className="font-bold text-sm">{tournament.name}</h4><p className="mt-1 text-xs text-white/50">{tournament.players} players · {tournament.start}</p></div><span className="text-xs font-black text-[#F8D778] whitespace-nowrap">{tournament.buyIn} chips</span></div><button type="button" onClick={() => joinTournament(tournament.name, tournament.buyIn)} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-black hover:bg-[#f4cf5c] transition">{joined === tournament.name ? "Seat reserved" : "Reserve seat"}<ChevronRight className="w-3.5 h-3.5" /></button></div>)}</div>
              <p className="mt-4 text-xs leading-relaxed text-emerald-200"><ShieldCheck className="inline w-3.5 h-3.5 mr-1" />{status}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
