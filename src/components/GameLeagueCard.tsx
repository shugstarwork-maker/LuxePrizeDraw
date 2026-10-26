// One game's own weekly league: tier, XP, games and wins. Shows only real results.
import type { GameLeagueState } from "../lib/gameLeagues";

export function GameLeagueCard({ title, state }: { title: string; state: GameLeagueState }) {
  return <div className="rounded-2xl border p-4" style={{ borderColor: `${state.tier.colour}55`, background: state.tier.glow }}>
    <div className="flex items-center justify-between gap-3">
      <b className="text-base">{title}</b>
      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: state.tier.colour }}>{state.tier.name} League</span>
    </div>
    <p className="mt-2 font-mono text-sm text-amber-100">{state.weekXP} XP this week · {state.games} games · {state.wins} wins</p>
    <p className="mt-1 text-[11px] text-white/50">{state.nextAt > state.weekXP ? `Next league at ${state.nextAt} XP` : "Top league"}</p>
  </div>;
}
