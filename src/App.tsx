import React, { useEffect, useState } from "react";
import { CommunityLeaderboards } from "./components/CommunityLeaderboards";
import { CommunityTicker } from "./components/CommunityTicker";
import { CompetitiveHub } from "./components/CompetitiveHub";
import { DuelRoom } from "./components/DuelRoom";
import { ExperienceNav } from "./components/ExperienceNav";
import { GamesArena } from "./components/GamesArena";
import { LegalReadinessNotice } from "./components/LegalReadinessNotice";
import { LaunchCommitment } from "./components/LaunchCommitment";
import { LuxePokerLeague } from "./components/LuxePokerLeague";
import { LuxeHost } from "./components/LuxeHost";
import { MembershipPreview } from "./components/MembershipPreview";
import { NeonGameLobby } from "./components/NeonGameLobby";
import { PrizeExperience } from "./components/PrizeExperience";
import { PrizePlatform } from "./components/PrizePlatform";
import { WelcomePage } from "./components/WelcomePage";

const go = (path: string) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); };

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => { const sync = () => setPath(window.location.pathname); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  if (path === "/welcome") return <WelcomePage onEnter={() => go("/")} />;
  if (path === "/duel") return <DuelRoom />;
  if (path === "/lobby") return <NeonGameLobby />;
  const content = path === "/draws" ? <><PrizePlatform /><PrizeExperience /><LaunchCommitment /><MembershipPreview /></> : path === "/community" ? <><LaunchCommitment /><CommunityLeaderboards /></> : path === "/play" ? <><CompetitiveHub /><LuxePokerLeague /><GamesArena /></> : <><PrizePlatform /><PrizeExperience /><LaunchCommitment /><MembershipPreview /><CommunityLeaderboards /><CompetitiveHub /><LuxePokerLeague /><GamesArena /><LuxeHost /></>;
  return <><LegalReadinessNotice /><ExperienceNav /><CommunityTicker /><main className="animate-page-enter">{content}</main></>;
}
