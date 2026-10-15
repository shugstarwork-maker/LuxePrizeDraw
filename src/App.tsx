import React, { useEffect, useState } from "react";
import { CashLaunchReadiness } from "./components/CashLaunchReadiness";
import { TermsPage } from "./components/TermsPage";
import { TrustBadges } from "./components/TrustBadges";
import { ParticipationStandardsPage } from "./components/ParticipationStandardsPage";
import { CashGiveawaysPage } from "./components/CashGiveawaysPage";
import { CashPrizesCarousel } from "./components/CashPrizesCarousel";
import { ArcadeHome } from "./components/ArcadeHome";
import { AudioControls } from "./components/AudioControls";
import { CategoryDrawCarousel } from "./components/CategoryDrawCarousel";
import { CommunityLeaderboards } from "./components/CommunityLeaderboards";
import { CommunitySuggestionBoard } from "./components/CommunitySuggestionBoard";
import { CommunityTicker } from "./components/CommunityTicker";
import { CompetitiveHub } from "./components/CompetitiveHub";
import { DuelRoom } from "./components/DuelRoom";
import { ExperienceNav } from "./components/ExperienceNav";
import { FeaturedDraws } from "./components/FeaturedDraws";
import { GamesArena } from "./components/GamesArena";
import { LegalReadinessNotice } from "./components/LegalReadinessNotice";
import { LaunchCommitment } from "./components/LaunchCommitment";
import { IntellectualPropertyNotice } from "./components/IntellectualPropertyNotice";
import { LuxePokerLeague } from "./components/LuxePokerLeague";
import { LuxuryHolidaysSection } from "./components/LuxuryHolidaysSection";
import { LuxeHost } from "./components/LuxeHost";
import { MembershipPreview } from "./components/MembershipPreview";
import { MobileDock } from "./components/MobileDock";
import { NeonGameLobby } from "./components/NeonGameLobby";
import { PrizeExperience } from "./components/PrizeExperience";
import { PrestigeCarsDraws } from "./components/PrestigeCarsDraws";
import { PrizePlatform } from "./components/PrizePlatform";
import { PlayerPortal } from "./components/PlayerPortal";
import { PartnerShowcase } from "./components/PartnerShowcase";
import { OwnershipNotice } from "./components/OwnershipNotice";
import { PartnershipCampaignPage } from "./components/PartnershipCampaignPage";
import { PrizeStandings } from "./components/PrizeStandings";
import { ScottishHost } from "./components/ScottishHost";
import { SerenityCharityPage } from "./components/SerenityCharityPage";
import { WelcomePage } from "./components/WelcomePage";
import { StormBackdrop } from "./components/StormBackdrop";


const go = (path: string) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); };

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => { const sync = () => setPath(window.location.pathname); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  const page = path === "/welcome" ? <WelcomePage onEnter={() => go("/")} />
    : path === "/serenity" ? <SerenityCharityPage />
    : path === "/cash-giveaways" ? <CashGiveawaysPage />
    : path === "/terms" ? <TermsPage />
    : path === "/standards" ? <ParticipationStandardsPage />
    : path === "/duel" ? <><DuelRoom /><ScottishHost /><MobileDock /></>
    : path === "/lobby" ? <><NeonGameLobby /><ScottishHost /><MobileDock /></>
    : path === "/poker" ? <><LuxePokerLeague /><ScottishHost /><MobileDock /></>
    : path === "/arcade" ? <><ArcadeHome /><ScottishHost /><MobileDock /></>
    : path === "/portal" ? <><PlayerPortal /><ScottishHost /><MobileDock /></>
    : path === "/sports-cars" ? <><CategoryDrawCarousel category="Cars" /><ScottishHost /><MobileDock /></>
    : path === "/prizes/luxury-supercar-experience" ? <><ExperienceNav /><PartnershipCampaignPage /><MobileDock /></>
    : path === "/category" ? <><CategoryDrawCarousel category={new URLSearchParams(window.location.search).get("name") || "Cash"} entryBand={new URLSearchParams(window.location.search).get("band") || undefined} /><ScottishHost /><MobileDock /></>
    : <SiteContent path={path} />;

  const category = path === "/category" ? new URLSearchParams(window.location.search).get("name") : path === "/sports-cars" ? "Cars" : "";
  const backdropTheme = path === "/" ? "money" : category === "Cars" ? "cars" : category === "Cash" ? "money" : category === "Women's prizes" ? "heels" : category === "Men's prizes" ? "ties" : undefined;
  return <div className="storm-page"><div className="storm-page__content"><OwnershipNotice />{page}<footer className="border-t border-white/10 bg-black/60 px-4 py-6 pb-28 text-center text-xs text-white/65 sm:pb-6"><a href="/terms" className="font-bold text-amber-200 underline underline-offset-4">General terms for all draws</a><p className="mt-2">Pre-launch · Draft rules require legal approval before entries open.</p></footer><IntellectualPropertyNotice /></div><StormBackdrop theme={backdropTheme} /><AudioControls /></div>;
}

function SiteContent({ path }: { path: string }) {
  const content = path === "/draws" ? <><LuxuryHolidaysSection /><PrestigeCarsDraws /><PartnerShowcase /><PrizeExperience /><PrizeStandings /><MembershipPreview /></> : path === "/community" ? <><LaunchCommitment /><CommunitySuggestionBoard /><CommunityLeaderboards /></> : path === "/play" ? <><CompetitiveHub /><GamesArena /></> : <><FeaturedDraws /><CashPrizesCarousel /><LuxuryHolidaysSection /><PrizePlatform /><TrustBadges /><PartnerShowcase /><CashLaunchReadiness /><LaunchCommitment /></>;
  return <><LegalReadinessNotice /><ExperienceNav /><CommunityTicker /><main className="animate-page-enter pb-24 sm:pb-0">{content}</main><ScottishHost /><MobileDock /></>;
}
