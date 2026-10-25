// Lounge dock — looks exactly like the main MobileDock and takes its place while
// you're inside a lounge: Play / League / Social / Profile / Rewards instead of Home / Draws / Games / Portal.
// During app-store review the Rewards tab is hidden entirely (remote camouflage switch).
import React from "react";
import { ChevronLeft, CirclePlay, Coffee, Gift, Trophy, UserRound } from "lucide-react";
import { camouflageCopy } from "../lib/reviewMode";

export type LoungeTab = "play" | "league" | "social" | "profile" | "rewards";

const TABS: { id: LoungeTab; label: string; icon: typeof Trophy }[] = [
  { id: "play", label: "Play", icon: CirclePlay },
  { id: "league", label: "League", icon: Trophy },
  { id: "social", label: "Social", icon: Coffee },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "rewards", label: "Rewards", icon: Gift },
];

const navHome = () => { window.history.pushState({}, "", "/"); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

export const LoungeTabBar: React.FC<{ tab: LoungeTab; onTab: (tab: LoungeTab) => void; inline?: boolean }> = ({ tab, onTab, inline }) => {
  const visibleTabs = camouflageCopy().rewardsTab ? TABS : TABS.filter((t) => t.id !== "rewards");
  return (
  <nav aria-label="Lounge sections" className={inline ? "rounded-2xl border border-white/15 bg-[#090b16]/95 p-1.5 shadow-2xl backdrop-blur-xl" : "fixed inset-x-3 bottom-3 z-[65] rounded-2xl border border-white/15 bg-[#090b16]/95 p-1.5 shadow-2xl backdrop-blur-xl"}>
    <div className="mx-auto flex items-center justify-center gap-1">
      {visibleTabs.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" onClick={() => onTab(id)} aria-current={tab === id ? "page" : undefined}
          className={`grid min-h-11 min-w-[3.9rem] place-items-center gap-0.5 rounded-xl px-2 text-[9px] font-black uppercase tracking-tight transition ${tab === id ? "bg-amber-300 text-black" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>
          <Icon className="h-4 w-4" /><span>{label}</span>
        </button>
      ))}
      <button type="button" onClick={navHome} aria-label="Leave lounge"
        className="grid min-h-11 min-w-[3.9rem] place-items-center gap-0.5 rounded-xl px-2 text-[9px] font-black uppercase tracking-tight text-white/65 transition hover:bg-white/10 hover:text-white">
        <ChevronLeft className="h-4 w-4" /><span>Home</span>
      </button>
    </div>
  </nav>
  );
};
