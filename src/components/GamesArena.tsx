import React, { useMemo, useState } from "react";
import { BadgeCheck, Crown, Gamepad2, ShieldCheck, Swords, Trophy, Users } from "lucide-react";

type GameId = "chess" | "draughts" | "connect-4";

const GAMES: Array<{ id: GameId; name: string; description: string; badge: string; color: string }> = [
  { id: "chess", name: "Chess", description: "Classic timed 1v1 matches with ranked divisions.", badge: "Strategist", color: "from-amber-400 to-orange-600" },
  { id: "draughts", name: "Draughts", description: "Quick tactical 1v1 challenges for every skill level.", badge: "Board Master", color: "from-rose-400 to-red-600" },
  { id: "connect-4", name: "Connect 4", description: "Fast head-to-head rounds with instant rematches.", badge: "Four in a Row", color: "from-indigo-400 to-blue-600" },
];

const STAKES = [25, 100, 250] as const;

export const GamesArena: React.FC = () => {
  const [tokens, setTokens] = useState(1000);
  const [selectedGame, setSelectedGame] = useState<GameId>("chess");
  const [selectedStake, setSelectedStake] = useState<(typeof STAKES)[number]>(100);
  const [notice, setNotice] = useState("Choose a game and challenge another player.");

  const game = useMemo(() => GAMES.find((item) => item.id === selectedGame)!, [selectedGame]);

  const createChallenge = () => {
    if (tokens < selectedStake) {
      setNotice("You need more demo tokens to enter this challenge.");
      return;
    }
    setTokens((value) => value - selectedStake);
    setNotice(`${game.name} challenge created for ${selectedStake} demo tokens. Waiting for an opponent.`);
  };

  return (
    <section id="games" className="py-20 sm:py-28 border-y border-white/10 bg-gradient-to-b from-slate-950 via-[#0b1020] to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-200 text-[10px] uppercase tracking-[0.2em] font-bold">
              <Gamepad2 className="w-3.5 h-3.5" />
              Games & Challenges
            </div>
            <h2 className="mt-4 text-3xl sm:text-5xl font-light text-white tracking-tight">Head-to-head <span className="font-bold text-[#D4AF37]">skill games</span></h2>
            <p className="mt-3 text-white/60">Play 1v1 Chess, Draughts, and Connect 4 in the demo arena. Tokens are non-redeemable, have no cash value, and cannot be bought or withdrawn.</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-[#D4AF37]/30 px-5 py-4 min-w-56">
            <div className="text-[10px] uppercase tracking-widest text-white/45">Demo token balance</div>
            <div className="mt-1 flex items-center gap-2 text-2xl font-bold text-[#D4AF37]"><Crown className="w-5 h-5" /> {tokens.toLocaleString()} tokens</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {GAMES.map((item) => (
            <button
              key={item.id}
              onClick={() => { setSelectedGame(item.id); setNotice(`Selected ${item.name}. Choose a demo-token stake.`); }}
              className={`text-left rounded-3xl p-6 border transition-all ${selectedGame === item.id ? "border-[#D4AF37] bg-white/10 shadow-xl shadow-amber-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/30"}`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}><Swords className="w-6 h-6 text-white" /></div>
              <div className="mt-5 flex items-start justify-between gap-3"><h3 className="text-xl font-bold text-white">{item.name}</h3><span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/70">1v1</span></div>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">{item.description}</p>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-emerald-300"><Users className="w-3.5 h-3.5" /> 1v1 match queue</span><span className="flex items-center gap-1.5 text-[#D4AF37]"><BadgeCheck className="w-3.5 h-3.5" /> {item.badge}</span></div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-8">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs uppercase tracking-widest font-bold"><Trophy className="w-4 h-4" /> Weekly demo tournament</div>
            <h3 className="mt-3 text-2xl font-bold text-white">{game.name} 1v1 challenge</h3>
            <p className="mt-2 text-sm text-white/55">Select a demo-token entry amount. The flow is a non-monetary preview only; no payment, prize, cash-out, or account balance is created.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {STAKES.map((stake) => <button key={stake} onClick={() => setSelectedStake(stake)} className={`px-5 py-3 rounded-xl text-sm font-bold border ${selectedStake === stake ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}>{stake} tokens</button>)}
            </div>
            <button onClick={createChallenge} className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-sm uppercase tracking-wider transition-colors"><Swords className="w-4 h-4" /> Create demo challenge</button>
            <p aria-live="polite" className="mt-4 text-sm text-emerald-300">{notice}</p>
          </div>
          <aside className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-5">
            <div className="flex items-center gap-2 text-white font-bold"><ShieldCheck className="w-5 h-5 text-emerald-400" /> Demo safeguards</div>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>Non-redeemable demo tokens only</li>
              <li>No deposits, payments, cash-out, or prizes</li>
              <li>Demo matchmaking and tournament status</li>
              <li>Game badge previews</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
};
