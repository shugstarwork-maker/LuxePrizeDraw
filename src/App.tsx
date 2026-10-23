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
import { PrizeExperience } from "./components/PrizeExperience";
import { PrestigeCarsDraws } from "./components/PrestigeCarsDraws";
import { PrizePlatform } from "./components/PrizePlatform";
import { PartnerShowcase } from "./components/PartnerShowcase";
import { OwnershipNotice } from "./components/OwnershipNotice";
import { PrizeStandings } from "./components/PrizeStandings";
import { ScottishHost } from "./components/ScottishHost";
import { StormBackdrop } from "./components/StormBackdrop";
import { confirmedXP, currentLeague, tierByIndex, weeklyBoard } from "./lib/pokerLeague";

// Route-level code splitting: heavy lounges, games and info pages load on first visit,
// keeping the initial bundle lean for the home/draws flow.
const LuxePokerLeague = lazy(() => import("./components/LuxePokerLeague").then((m) => ({ default: m.LuxePokerLeague })));
const ChallengeLounge = lazy(() => import("./components/ChallengeLounge").then((m) => ({ default: m.ChallengeLounge })));
const PlayerPortal = lazy(() => import("./components/PlayerPortal").then((m) => ({ default: m.PlayerPortal })));
const LuxeChessPage = lazy(() => import("./components/LuxeChessPage").then((m) => ({ default: m.LuxeChessPage })));
const CardLounge = lazy(() => import("./components/CardLounge").then((m) => ({ default: m.CardLounge })));
const ArcadeHome = lazy(() => import("./components/ArcadeHome").then((m) => ({ default: m.ArcadeHome })));
const NeonGameLobby = lazy(() => import("./components/NeonGameLobby").then((m) => ({ default: m.NeonGameLobby })));
const DuelRoom = lazy(() => import("./components/DuelRoom").then((m) => ({ default: m.DuelRoom })));
const AdminPanel = lazy(() => import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel })));
const CategoryDrawCarousel = lazy(() => import("./components/CategoryDrawCarousel").then((m) => ({ default: m.CategoryDrawCarousel })));
const PartnershipCampaignPage = lazy(() => import("./components/PartnershipCampaignPage").then((m) => ({ default: m.PartnershipCampaignPage })));
const WelcomePage = lazy(() => import("./components/WelcomePage").then((m) => ({ default: m.WelcomePage })));
const SerenityCharityPage = lazy(() => import("./components/SerenityCharityPage").then((m) => ({ default: m.SerenityCharityPage })));
const CashGiveawaysPage = lazy(() => import("./components/CashGiveawaysPage").then((m) => ({ default: m.CashGiveawaysPage })));
const TermsPage = lazy(() => import("./components/TermsPage").then((m) => ({ default: m.TermsPage })));
const CredentialsPartnershipsPage = lazy(() => import("./components/CredentialsPartnershipsPage").then((m) => ({ default: m.CredentialsPartnershipsPage })));
const EconomicsPage = lazy(() => import("./components/EconomicsPage").then((m) => ({ default: m.EconomicsPage })));
const PostalIntakePage = lazy(() => import("./components/PostalIntakePage").then((m) => ({ default: m.PostalIntakePage })));
const ParticipationStandardsPage = lazy(() => import("./components/ParticipationStandardsPage").then((m) => ({ default: m.ParticipationStandardsPage })));
const LaunchBuildPage = lazy(() => import("./components/LaunchBuildPage").then((m) => ({ default: m.LaunchBuildPage })));

const RouteFallback = () => <div className="grid min-h-[60vh] place-items-center bg-[#0a0805]"><p className="animate-pulse text-xs font-black uppercase tracking-[.3em] text-amber-200">Loading the lounge…</p></div>;


const go = (path: string) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); };

export default function App() {
  const audio = useAudio();
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => { const sync = () => setPath(window.location.pathname); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync); }, []);
  const inner = path === "/welcome" ? <WelcomePage onEnter={() => go("/")} />
    : path === "/serenity" ? <SerenityCharityPage />
    : path === "/cash-giveaways" ? <CashGiveawaysPage />
    : path === "/terms" ? <TermsPage />
    : path === "/credentials" ? <CredentialsPartnershipsPage />
    : path === "/economics" ? <EconomicsPage />
    : path === "/launch-build" ? <LaunchBuildPage />
    : path === "/postal-intake" ? <PostalIntakePage />
    : path === "/admin" ? <AdminPanel />
    : path === "/standards" ? <ParticipationStandardsPage />
    : path === "/duel" ? <><DuelRoom /><ScottishHost /><MobileDock /></>
    : path === "/lobby" ? <NeonGameLobby soundEnabled={audio.enabled} onToggleSound={() => audio.setEnabled(!audio.enabled)} />
    : path === "/poker" ? <><LuxePokerLeague /><ScottishHost /></>
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
  return <div className="storm-page luxe-brand-theme"><div className="storm-page__content"><OwnershipNotice />{page}<footer className="border-t border-white/10 bg-black/60 px-4 py-6 pb-28 text-center text-xs text-white/65 sm:pb-6"><a href="/terms" onClick={(e) => { e.preventDefault(); go("/terms"); }} className="font-bold text-amber-200 underline underline-offset-4">General terms for all draws</a><p className="mt-2">Pre-launch · Draft rules require legal approval before entries open.</p></footer><IntellectualPropertyNotice /></div><StormBackdrop theme={backdropTheme} />{path !== "/lobby" && <AudioControls />}<InstallAppPrompt /></div>;
}

function HomeComingSoon() {
  const league = currentLeague();
  const tier = tierByIndex(league.tierIndex);
  const rank = weeklyBoard(league).findIndex((r) => r.you) + 1;
  return <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
    <p className="text-[10px] font-black uppercase tracking-[.3em] text-amber-200">LuxePrizeDraw</p>
    <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">A new home experience is on its way</h1>
    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">We're designing something special for this space. In the meantime, everything lives exactly where you expect it:</p>
    <button type="button" onClick={() => go("/portal")} className="mt-8 flex items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[.98]" style={{ borderColor: `${tier.colour}55`, background: `linear-gradient(135deg,${tier.colour}18,#0d0904)`, boxShadow: `0 0 30px ${tier.colour}33` }}>
      <span className="grid h-12 w-12 place-items-center rounded-xl text-xl font-black" style={{ background: `${tier.colour}22`, color: tier.colour, border: `1px solid ${tier.colour}55` }}>{rank > 0 ? `#${rank}` : "—"}</span>
      <span>
        <span className="block text-[10px] font-black uppercase tracking-[.2em]" style={{ color: tier.colour }}>Your weekly league</span>
        <span className="mt-0.5 block text-sm font-black text-white">{tier.name} League{rank > 0 ? ` · ranked #${rank}` : ""} · {confirmedXP()} XP</span>
      </span>
      <span className="ml-2 text-amber-200">→</span>
    </button>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button type="button" onClick={() => go("/draws")} className="rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-6 py-3 text-sm font-black text-black shadow-lg transition active:scale-95">Browse the draws</button>
      <button type="button" onClick={() => go("/challenge")} className="rounded-full border border-amber-200/40 bg-black/40 px-6 py-3 text-sm font-black text-amber-100 transition hover:border-amber-200/80 active:scale-95">Challenge Lounge</button>
      <button type="button" onClick={() => go("/poker")} className="rounded-full border border-amber-200/40 bg-black/40 px-6 py-3 text-sm font-black text-amber-100 transition hover:border-amber-200/80 active:scale-95">Poker Lounge</button>
    </div>
    <p className="mt-10 text-[10px] text-white/35">Free-play only · No deposits, cash wagering or cash-out</p>
  </main>;
}

function SiteContent({ path }: { path: string }) {
  const content = path === "/" ? <HomeComingSoon /> : path === "/community" ? <><LaunchCommitment /><CommunitySuggestionBoard /><CommunityLeaderboards /></> : path === "/play" ? <><CompetitiveHub /><GamesArena /></> : <><HomeBrandBanner /><FeaturedDraws /><CashPrizesCarousel /><LuxuryHolidaysSection /><PrestigeCarsDraws /><PrizePlatform /><TrustBadges /><PartnerShowcase /><PrizeExperience /><PrizeStandings /><MembershipPreview /><CashLaunchReadiness /><div className="px-4 py-5 text-center"><button type="button" onClick={() => go("/launch-build")} className="text-sm text-amber-200 underline">Review the proposed launch catalogue</button></div><LaunchCommitment /></>;
  return <><LegalReadinessNotice /><ExperienceNav /><CommunityTicker /><main className="animate-page-enter pb-24 sm:pb-0">{content}</main><ScottishHost /><MobileDock /></>;
}
