import React, { useEffect, useState } from "react";
import { CommunityLeaderboards } from "./components/CommunityLeaderboards";
import { CommunitySuggestionBoard } from "./components/CommunitySuggestionBoard";
import { CommunityTicker } from "./components/CommunityTicker";
import { CompetitiveHub } from "./components/CompetitiveHub";
import { CustomDrawGallery } from "./components/CustomDrawGallery";
import { DuelRoom } from "./components/DuelRoom";
import { ExperienceNav } from "./components/ExperienceNav";
import { GamesArena } from "./components/GamesArena";
import { LegalReadinessNotice } from "./components/LegalReadinessNotice";
import { LaunchCommitment } from "./components/LaunchCommitment";
import { LuxePokerLeague } from "./components/LuxePokerLeague";
import { LuxeHost } from "./components/LuxeHost";
import { MembershipPreview } from "./components/MembershipPreview";
import { MobileDock } from "./components/MobileDock";
import { NeonGameLobby } from "./components/NeonGameLobby";
import { PrizeExperience } from "./components/PrizeExperience";
import { PrizePlatform } from "./components/PrizePlatform";
import { PrizePicker } from "./components/PrizePicker";
import { PrizeStandings } from "./components/PrizeStandings";
import { ScottishHost } from "./components/ScottishHost";
import { WelcomePage } from "./components/WelcomePage";

const go = (path: string) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); };

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => { const sync = () => setPath(window.location.pathname); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  if (path === "/welcome") return <WelcomePage onEnter={() => go("/")} />;
  if (path === "/duel") return <><DuelRoom /><ScottishHost /><MobileDock /></>;
  if (path === "/lobby") return <><NeonGameLobby /><ScottishHost /><MobileDock /></>;
  if (path === "/custom-draw") return <><CustomDrawGallery /><ScottishHost /><MobileDock /></>;
  const content = path === "/draws" ? <><PrizePicker /><PrizeExperience /><PrizeStandings /><MembershipPreview /></> : path === "/community" ? <><LaunchCommitment /><CommunitySuggestionBoard /><CommunityLeaderboards /></> : path === "/play" ? <><CompetitiveHub /><LuxePokerLeague /><GamesArena /></> : <><PrizePlatform /><LaunchCommitment /></>;
  return <><LegalReadinessNotice /><ExperienceNav /><CommunityTicker /><main className="animate-page-enter pb-24 sm:pb-0">{content}</main><ScottishHost /><MobileDock /></>;
}
