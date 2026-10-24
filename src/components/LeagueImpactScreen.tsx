import { TrendingUp, Eye, Spade, Trophy } from "lucide-react";

export type LeagueImpact = {
  handsPlayed: number;
  handsWon: number;
  chipsDelta: number;
  xpEarned: number;
  tierName: string;
  tierColour: string;
  rankBefore: number | null;
  rankAfter: number;
  boardSize: number;
};

/**
 * Post-game "League Impact" screen — shown when a player leaves or busts out
 * instead of kicking them straight back to the menu. Points earned, updated
 * leaderboard position, and direct CTAs to spectate or rejoin the lounge.
 */
export function LeagueImpactScreen({
  impact,
  onSpectate,
  onRejoin,
}: {
  impact: LeagueImpact;
  onSpectate: () => void;
  onRejoin: () => void;
}) {
  const moved = impact.rankBefore !== null && impact.rankAfter < impact.rankBefore;
  return (
    <div className="league-impact" role="dialog" aria-modal="true" aria-label="League impact summary">
      <div className="league-impact__card">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.2em] text-amber-200"><Trophy className="h-3.5 w-3.5" /> Session complete</p>
        <h3 className="mt-2 text-2xl font-black text-amber-50">Your league impact</h3>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-xl font-black text-amber-100">+{impact.xpEarned}</p>
            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-white/50">League XP earned</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className="text-xl font-black text-amber-100">{impact.handsWon}<span className="text-sm text-white/45">/{impact.handsPlayed}</span></p>
            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-white/50">Hands won</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
            <p className={`text-xl font-black ${impact.chipsDelta >= 0 ? "text-emerald-200" : "text-red-300"}`}>{impact.chipsDelta >= 0 ? "+" : ""}{impact.chipsDelta.toLocaleString()}</p>
            <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-white/50">Chips this session</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border p-4 text-center" style={{ borderColor: `${impact.tierColour}55`, background: "linear-gradient(145deg,#1c150b,#0d0904 70%)" }}>
          <p className="text-[10px] font-black uppercase tracking-[.18em]" style={{ color: impact.tierColour }}>{impact.tierName} League · weekly board</p>
          <p className="mt-1.5 text-2xl font-black text-white">#{impact.rankAfter} <span className="text-sm font-bold text-white/45">of {impact.boardSize}</span></p>
          {impact.rankBefore !== null && (
            <p className={`mt-1 inline-flex items-center gap-1 text-xs font-black ${moved ? "text-emerald-200" : "text-white/50"}`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {moved ? `Climbed from #${impact.rankBefore} — keep it rolling` : `Holding position from #${impact.rankBefore}`}
            </p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onSpectate} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-black text-white/75 transition hover:border-amber-200/40 hover:text-amber-100">
            <Eye className="h-4 w-4" /> Spectate the table
          </button>
          <button type="button" onClick={onRejoin} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-3 text-xs font-black text-black shadow-lg transition active:scale-[.98]">
            <Spade className="h-4 w-4" /> Back to the lounge
          </button>
        </div>

        <p className="mt-3 text-center text-[9px] text-white/35">Free-play league — chips and XP have no cash value.</p>
      </div>
    </div>
  );
}
