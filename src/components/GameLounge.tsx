// Shared lounge shell for every casino game. The welcome gate, bottom tab bar,
// league ladder, profile and achievements are the same as the Texas Hold'em lounge;
// the Play tab shows the game itself.
import { useState, type ReactNode } from "react";
import { LoungeWelcome } from "./LoungeWelcome";
import { LoungeTabBar, type LoungeTab } from "./LoungeTabBar";
import { AccountCard } from "./AccountCard";
import { AchievementCabinet } from "./Achievements";
import { gameLeagueState, type LeagueGame } from "../lib/gameLeagues";
import { GameLeagueCard } from "./GameLeagueCard";
import { WorldRankingPanel } from "./WorldRankingPanel";
import { useAudio } from "../audio/AudioProvider";

export type GameLoungeProps = {
  brand: string;
  tagline: string;
  art: string;
  icon: string;
  /** The game's own league, if it has one. Games without a league show a note instead. */
  leagueGame?: LeagueGame;
  leagueTitle?: string;
  children: ReactNode;
};

// Same chip balance the Texas Hold'em lounge uses, so every lounge shows one wallet.
const readChips = (): number => {
  try { return Number(localStorage.getItem("luxe-poker-chips") ?? localStorage.getItem("luxe-demo-poker-chips")) || 1000; } catch { return 1000; }
};

export function GameLounge({ brand, tagline, art, icon, leagueGame, leagueTitle, children }: GameLoungeProps) {
  const { play } = useAudio();
  const [chips] = useState(readChips);
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState<LoungeTab>("play");

  if (!entered) return <LoungeWelcome
    brand={brand}
    tagline={tagline}
    art={art}
    icon={icon}
    chipsLabel={`${chips.toLocaleString("en-GB")} chips`}
    tab={tab}
    onTab={(t) => { play("button"); setTab(t); setEntered(true); }}
    onEnter={() => { play("ticketSelect"); setTab("play"); setEntered(true); }}
  />;

  return <section className="salon-selection min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-4 py-6 pb-28 text-white">
    <div className="mx-auto max-w-5xl">
      <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-4 py-3">
        <span className="font-black text-amber-100">{icon} {brand}</span>
        <span className="rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-1 font-mono text-xs font-black text-amber-100">{chips.toLocaleString("en-GB")} chips</span>
      </header>

      {tab === "play" && <div className="mt-6">{children}</div>}

      {tab === "league" && <div className="mt-6 space-y-4">
        {leagueGame
          ? <GameLeagueCard title={leagueTitle ?? brand} state={gameLeagueState(leagueGame)} />
          : <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center text-sm text-white/60">{brand} does not have its own league yet.</p>}
        <WorldRankingPanel />
        <p className="text-[10px] leading-relaxed text-white/40">Each game has its own league. Only finished games earn XP.</p>
      </div>}

      {tab === "profile" && <div className="mt-6 space-y-4">
        <AccountCard chips={chips} />
        <AchievementCabinet />
      </div>}

      {tab === "rewards" && <div className="mt-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Rewards</p>
        <h2 className="mt-2 text-3xl font-black">Free-play rewards</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60">Rewards are free-play only and carry no cash value. Daily and weekly rewards will appear here.</p>
      </div>}

      {tab === "social" && <div className="mt-6 text-center">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Social</p>
        <h2 className="mt-2 text-3xl font-black">Lounge chat</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/60">Lounge chat and friends are not available yet.</p>
      </div>}

      <LoungeTabBar tab={tab} onTab={(t) => { play("button"); setTab(t); }} />
    </div>
  </section>;
}
