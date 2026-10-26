// World ranking: real results from the server, this week, for every game or one game.
import { useEffect, useState } from "react";
import { fetchWorldRanking, type WorldGame, type WorldRow } from "../lib/worldRanking";

const TABS: { id: WorldGame | "all"; label: string }[] = [
  { id: "all", label: "All games" }, { id: "blackjack", label: "Blackjack" }, { id: "brag", label: "Brag" },
  { id: "chess", label: "Chess" }, { id: "connect4", label: "Connect Four" }, { id: "draughts", label: "Draughts" },
];

export function WorldRankingPanel() {
  const [game, setGame] = useState<WorldGame | "all">("all");
  const [rows, setRows] = useState<WorldRow[] | null>(null);

  useEffect(() => {
    let live = true;
    setRows(null);
    void fetchWorldRanking(game).then((r) => { if (live) setRows(r); });
    return () => { live = false; };
  }, [game]);

  return <div className="rounded-2xl border border-amber-200/30 bg-black/40 p-4">
    <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">World ranking · this week</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {TABS.map((t) => <button key={t.id} type="button" onClick={() => setGame(t.id)} aria-pressed={game === t.id}
        className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${game === t.id ? "border-amber-200 bg-amber-300/20 text-amber-100" : "border-white/15 text-white/60"}`}>{t.label}</button>)}
    </div>
    {rows === null && <p className="mt-4 text-sm text-white/50">Loading…</p>}
    {rows?.length === 0 && <p className="mt-4 text-sm text-white/60">No recorded results yet this week. Sign in and finish a game to appear here.</p>}
    {rows && rows.length > 0 && <div className="mt-4 space-y-1">
      {rows.map((r) => <div key={r.rank} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
        <span className="w-7 text-center font-mono text-xs font-black text-white/50">{r.rank}</span>
        <span className="flex-1 truncate text-sm font-bold">{r.name}</span>
        <span className="font-mono text-[10px] text-white/45">{r.games}g</span>
        <span className="font-mono text-xs font-black text-amber-100">{r.xp} XP</span>
      </div>)}
    </div>}
    <p className="mt-3 text-[10px] leading-relaxed text-white/40">Only signed-in players appear. The server awards XP, with a daily cap per game and a limit on results per hour.</p>
  </div>;
}
