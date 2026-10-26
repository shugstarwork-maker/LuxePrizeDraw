import { useAudio } from "./audio/AudioProvider";
import { HomeBrandBanner } from "./components/HomeBrandBanner";
import "./components/launchShowcase.css";
import React, { Suspense, lazy, useEffect, useState } from "react";
import { CashLaunchReadiness } from "./components/CashLaunchReadiness";
import { TrustBadges } from "./components/TrustBadges";
import { CashPrizesCarousel } from "./components/CashPrizesCarousel";
import { AudioControls } from "./components/AudioControls";
import { InstallAppPrompt } from "./components/InstallAppPrompt";
import { CommunityLeaderboards } from "./components/CommunityLeaderboards";
import { CommunitySuggestionBoard } from "./components/CommunitySuggestionBoard";
import { CommunityTicker } from "./components/CommunityTicker";
import { CompetitiveHub } from "./components/CompetitiveHub";
import { ExperienceNav } from "./components/ExperienceNav";
import { FeaturedDraws } from "./components/FeaturedDraws";
import { GamesArena } from "./components/GamesArena";
import { LegalReadinessNotice } from "./components/LegalReadinessNotice";
import { LaunchCommitment } from "./components/LaunchCommitment";
import { IntellectualPropertyNotice } from "./components/IntellectualPropertyNotice";
import { LuxuryHolidaysSection } from "./components/LuxuryHolidaysSection";
import { LuxeHost } from "./components/LuxeHost";
import { MembershipPreview } from "./components/MembershipPreview";
import { MobileDock } from "./components/MobileDock";
import { PrestigeCarsDraws } from "./components/PrestigeCarsDraws";
import { PrizePlatform } from "./components/PrizePlatform";
import { PartnerShowcase } from "./components/PartnerShowcase";
import { OwnershipNotice } from "./components/OwnershipNotice";
import { PrizeStandings } from "./components/PrizeStandings";
import { ScottishHost } from "./components/ScottishHost";
import { StormBackdrop } from "./components/StormBackdrop";

// Route-level code splitting: heavy lounges, games and info pages load on first visit,
// keeping the initial bundle lean for the home/draws flow.
const LuxePokerLeague = lazy(() => import("./components/LuxePokerLeague").then((m) => ({ default: m.LuxePokerLeague })));
const PokerLeagueLanding = lazy(() => import("./components/PokerLeagueLanding").then((m) => ({ default: m.PokerLeagueLanding })));
const ChallengeLounge = lazy(() => import("./components/ChallengeLounge").then((m) => ({ default: m.ChallengeLounge })));
const PlayerPortal = lazy(() => import("./components/PlayerPortal").then((m) => ({ default: m.PlayerPortal })));
const LuxeChessPage = lazy(() => import("./components/LuxeChessPage").then((m) => ({ default: m.LuxeChessPage })));
const CardLounge = lazy(() => import("./components/CardLounge").then((m) => ({ default: m.CardLounge })));
const ArcadeHome = lazy(() => import("./components/ArcadeHome").then((m) => ({ default: m.ArcadeHome })));
const NeonGameLobby = lazy(() => import("./components/NeonGameLobby").then((m) => ({ default: m.NeonGameLobby })));
const DuelRoom = lazy(() => import("./components/DuelRoom").then((m) => ({ default: m.DuelRoom })));
const AdminPanel = lazy(() => import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel })));
const StudioPanel = lazy(() => import("./components/StudioPanel").then((m) => ({ default: m.StudioPanel })));
const VerificationCenter = lazy(() => import("./components/VerificationCenter").then((m) => ({ default: m.VerificationCenter })));
const RedemptionStore = lazy(() => import("./components/RedemptionStore").then((m) => ({ default: m.RedemptionStore })));
const SkillGamesArena = lazy(() => import("./components/SkillGamesArena").then((m) => ({ default: m.SkillGamesArena })));
const CategoryDrawCarousel = lazy(() => import("./components/CategoryDrawCarousel").then((m) => ({ default: m.CategoryDrawCarousel })));
const PartnershipCampaignPage = lazy(() => import("./components/PartnershipCampaignPage").then((m) => ({ default: m.PartnershipCampaignPage })));
const WelcomePage = lazy(() => import("./components/WelcomePage").then((m) => ({ default: m.WelcomePage })));
const SerenityCharityPage = lazy(() => import("./components/SerenityCharityPage").then((m) => ({ default: m.SerenityCharityPage })));
const CashGiveawaysPage = lazy(() => import("./components/CashGiveawaysPage").then((m) => ({ default: m.CashGiveawaysPage })));
const ResetPasswordPage = lazy(() => import("./components/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));
const CasinoPage = lazy(() => import("./components/CasinoPage").then((m) => ({ default: m.CasinoPage })));
const PrivacyPage = lazy(() => import("./components/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./components/TermsPage").then((m) => ({ default: m.TermsPage })));
const CredentialsPartnershipsPage = lazy(() => import("./components/CredentialsPartnershipsPage").then((m) => ({ default: m.CredentialsPartnershipsPage })));
const EconomicsPage = lazy(() => import("./components/EconomicsPage").then((m) => ({ default: m.EconomicsPage })));
const PostalIntakePage = lazy(() => import("./components/PostalIntakePage").then((m) => ({ default: m.PostalIntakePage })));
const ParticipationStandardsPage = lazy(() => import("./components/ParticipationStandardsPage").then((m) => ({ default: m.ParticipationStandardsPage })));
const ResponsiblePlayPage = lazy(() => import("./components/ResponsiblePlayPage").then((m) => ({ default: m.ResponsiblePlayPage })));
import { RealityCheck } from "./components/RealityCheck";
import { markTried } from "./lib/achievements";
import { AchievementToaster } from "./components/Achievements";

const GAME_ROUTES: Record<string, string> = { "/poker": "holdem", "/blackjack": "blackjack", "/brag": "brag", "/chess": "chess", "/duel": "duel", "/arena": "arena" };
const LaunchBuildPage = lazy(() => import("./components/LaunchBuildPage").then((m) => ({ default: m.LaunchBuildPage })));
const HomePage = lazy(() => import("./components/HomePage").then((m) => ({ default: m.HomePage })));

const RouteFallback = () => <div className="grid min-h-[60vh] place-items-center bg-[#0a0805]"><p className="animate-pulse text-xs font-black uppercase tracking-[.3em] text-amber-200">Loading the lounge…</p></div>;


const go = (path: string) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); };

export default function App() {
  const audio = useAudio();
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => { const sync = () => setPath(window.location.pathname); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  // Opening a casino game counts toward the explorer badges (board games via ?game= are counted on sit-down).
  useEffect(() => { const game = GAME_ROUTES[path]; if (game) markTried(game); }, [path]);
  const inner = path === "/welcome" ? <WelcomePage onEnter={() => go("/")} />
    : path === "/serenity" ? <SerenityCharityPage />
    : path === "/cash-giveaways" ? <CashGiveawaysPage />
    : path === "/terms" ? <TermsPage />
    : path === "/privacy" ? <PrivacyPage />
    : path === "/reset-password" ? <ResetPasswordPage />
    : path === "/credentials" ? <CredentialsPartnershipsPage />
    : path === "/economics" ? <EconomicsPage />
    : path === "/launch-build" ? <LaunchBuildPage />
    : path === "/postal-intake" ? <PostalIntakePage />
    : path === "/admin" ? <AdminPanel />
    : path === "/studio" ? <StudioPanel />
    : path === "/verify" ? <><VerificationCenter /><MobileDock /></>
    : path === "/redeem" ? <><RedemptionStore /><MobileDock /></>
    : path === "/casino" ? <><CasinoPage /><MobileDock /></>
    : path === "/arena" ? <><SkillGamesArena /><MobileDock /></>
    : path === "/standards" ? <ParticipationStandardsPage />
    : path === "/responsible-play" ? <ResponsiblePlayPage />
    : path === "/duel" ? <><DuelRoom /><ScottishHost /><MobileDock /></>
    : path === "/lobby" ? <NeonGameLobby soundEnabled={audio.enabled} onToggleSound={() => audio.setEnabled(!audio.enabled)} />
    : path === "/poker" ? <><LuxePokerLeague /><ScottishHost /></>
    : path === "/league" ? <><PokerLeagueLanding /><ScottishHost /><MobileDock /></>
    : path === "/chess" ? <LuxeChessPage />
    : path === "/blackjack" ? <><CardLounge game="blackjack" /><div className="poker-external-chrome"><ScottishHost /><MobileDock /></div></>
    : path === "/brag" ? <><CardLounge game="brag" /><div className="poker-external-chrome"><ScottishHost /><MobileDock /></div></>
    : path === "/arcade" ? <><ArcadeHome /><ScottishHost /><MobileDock /></>
    : path === "/portal" ? <><PlayerPortal /><ScottishHost /><MobileDock /></>
    : path === "/challenge" ? <><ChallengeLounge /><ScottishHost /></>
    : path === "/sports-cars" ? <><CategoryDrawCarousel category="Cars" /><ScottishHost /><MobileDock /></>
    : path === "/prizes/luxury-supercar-experience" ? <><ExperienceNav /><PartnershipCampaignPage /><MobileDock /></>
    : path === "/category" ? <><CategoryDrawCarousel category={new URLSearchParams(window.location.search).get("name") || "Cash"} entryBand={new URLSearchParams(window.location.search).get("band") || undefined} /><ScottishHost /><MobileDock /></>
    : <SiteContent path={path} />;
  const page = <Suspense fallback={<RouteFallback />}>{inner}</Suspense>;

  const category = path === "/category" ? new URLSearchParams(window.location.search).get("name") : path === "/sports-cars" ? "Cars" : "";
  const backdropTheme = path === "/" ? "money" : category === "Cars" ? "cars" : category === "Cash" || category === "Bitcoin" ? "money" : undefined;
  return <div className="storm-page luxe-brand-theme"><div className="storm-page__content"><OwnershipNotice />{page}<footer className="border-t border-white/10 bg-black/60 px-4 py-6 pb-28 text-center text-xs text-white/65 sm:pb-6"><a href="/terms" onClick={(e) => { e.preventDefault(); go("/terms"); }} className="font-bold text-amber-200 underline underline-offset-4">General terms for all draws</a><span className="mx-2 text-white/30">·</span><a href="/privacy" onClick={(e) => { e.preventDefault(); go("/privacy"); }} className="font-bold text-amber-200 underline underline-offset-4">Privacy &amp; cookies</a><p className="mt-2">Pre-launch · Draft rules require legal approval before entries open.</p></footer><IntellectualPropertyNotice /></div><StormBackdrop theme={backdropTheme} />{path !== "/lobby" && <AudioControls />}<InstallAppPrompt /><RealityCheck /><AchievementToaster /></div>;
}

function SiteContent({ path }: { path: string }) {
  const content = path === "/" ? <HomePage /> : path === "/community" ? <><LaunchCommitment /><CommunitySuggestionBoard /><CommunityLeaderboards /></> : path === "/play" ? <><CompetitiveHub /><GamesArena /></> : <><HomeBrandBanner /><FeaturedDraws /><CashPrizesCarousel /><LuxuryHolidaysSection /><PrestigeCarsDraws /><PrizePlatform /><TrustBadges /><PartnerShowcase /><PrizeStandings /><MembershipPreview /><CashLaunchReadiness /><div className="px-4 py-5 text-center"><button type="button" onClick={() => go("/launch-build")} className="text-sm text-amber-200 underline">Review the proposed launch catalogue</button></div><LaunchCommitment /></>;
  return <><LegalReadinessNotice /><ExperienceNav /><CommunityTicker /><div className="cine-page"><main className="animate-page-enter pb-24 sm:pb-0">{content}</main></div><ScottishHost /><MobileDock /></>;
}
