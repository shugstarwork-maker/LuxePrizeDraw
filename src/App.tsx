import React, { useEffect, useState } from "react";
import { CashLaunchReadiness } from "./components/CashLaunchReadiness";
import { CategoryDrawCarousel } from "./components/CategoryDrawCarousel";
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
import { PrestigeCarsDraws } from "./components/PrestigeCarsDraws";
import { PrizePlatform } from "./components/PrizePlatform";
import { PartnerShowcase } from "./components/PartnerShowcase";
import { PrizeCatalog } from "./components/PrizeCatalog";
import { PrizeStandings } from "./components/PrizeStandings";
import { ScottishHost } from "./components/ScottishHost";
import { SerenityCharityPage } from "./components/SerenityCharityPage";
import { WelcomePage } from "./components/WelcomePage";
import { StormBackdrop } from "./components/StormBackdrop";


const go = (path: string) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); };

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);
  const [showMoneyRain, setShowMoneyRain] = useState(() => window.location.pathname === "/");
  useEffect(() => { const sync = () => { const nextPath = window.location.pathname; setPath(nextPath); setShowMoneyRain(nextPath === "/"); }; window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  useEffect(() => { if (!showMoneyRain) return; const timeout = window.setTimeout(() => setShowMoneyRain(false), 15_000); return () => window.clearTimeout(timeout); }, [showMoneyRain]);
  const page = path === "/welcome" ? <WelcomePage onEnter={() => go("/")} />
    : path === "/serenity" ? <SerenityCharityPage />
    : path === "/duel" ? <><DuelRoom /><ScottishHost /><MobileDock /></>
    : path === "/lobby" ? <><NeonGameLobby /><ScottishHost /><MobileDock /></>
    : path === "/custom-draw" ? <><CustomDrawGallery /><ScottishHost /><MobileDock /></>
    : path === "/sports-cars" ? <><CategoryDrawCarousel category="Cars" /><ScottishHost /><MobileDock /></>
    : path === "/category" ? <><CategoryDrawCarousel category={new URLSearchParams(window.location.search).get("name") || "Cash"} /><ScottishHost /><MobileDock /></>
    : <SiteContent path={path} />;

  return <div className="storm-page"><div className="storm-page__content">{page}</div><StormBackdrop moneyRain={showMoneyRain} /></div>;
}

function SiteContent({ path }: { path: string }) {
  const content = path === "/draws" ? <><PrizeCatalog /><PrestigeCarsDraws /><PartnerShowcase /><PrizeExperience /><PrizeStandings /><MembershipPreview /></> : path === "/community" ? <><LaunchCommitment /><CommunitySuggestionBoard /><CommunityLeaderboards /></> : path === "/play" ? <><CompetitiveHub /><LuxePokerLeague /><GamesArena /></> : <><PrizePlatform /><PartnerShowcase /><CashLaunchReadiness /><LaunchCommitment /></>;
  return <><LegalReadinessNotice /><ExperienceNav /><CommunityTicker /><main className="animate-page-enter pb-24 sm:pb-0">{content}</main><ScottishHost /><MobileDock /></>;
}
