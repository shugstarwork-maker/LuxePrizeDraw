// In-app bottom tab bar for the lounges — makes each lounge feel like its own app.
import React from "react";
import { CirclePlay, Gift, Trophy, UserRound } from "lucide-react";

export type LoungeTab = "play" | "league" | "profile" | "rewards";

const TABS: { id: LoungeTab; label: string; icon: typeof Trophy }[] = [
  { id: "play", label: "Play", icon: CirclePlay },
  { id: "league", label: "League", icon: Trophy },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "rewards", label: "Rewards", icon: Gift },
];

export const LoungeTabBar: React.FC<{ tab: LoungeTab; onTab: (tab: LoungeTab) => void; accent?: string }> = ({ tab, onTab }) => (
  <nav aria-label="Lounge sections" className="fixed inset-x-3 bottom-[4.6rem] z-[55] rounded-2xl border border-amber-200/25 bg-[#0d0a06]/95 p-1.5 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:left-1/2 sm:w-[26rem] sm:-translate-x-1/2">
    <div className="grid grid-cols-4 gap-1">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = tab === id;
        return <button key={id} type="button" onClick={() => onTab(id)} aria-current={active ? "page" : undefined}
          className={`grid min-h-11 place-items-center gap-0.5 rounded-xl px-2 text-[9px] font-black uppercase tracking-tight transition ${active ? "bg-gradient-to-b from-amber-300 to-amber-500 text-black shadow-lg" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
          <Icon className="h-4 w-4" /><span>{label}</span>
        </button>;
      })}
    </div>
  </nav>
);
