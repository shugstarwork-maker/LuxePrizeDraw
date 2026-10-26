// Challenge-games lounge — chess, connect four and draughts. Each game has its own
// weekly league and XP (see gameLeagues.ts). XP only comes from finished games.
import React, { useRef, useState } from "react";
import { Bot, ChevronLeft, Crown, Gift, ShieldCheck, Swords, Users, Volume2 } from "lucide-react";
import { LoungeTabBar } from "./LoungeTabBar";
import { LoungeWelcome } from "./LoungeWelcome";
import { useAudio } from "../audio/AudioProvider";
import { ChallengeGamesCarousel, type ChallengeGameId } from "./ChallengeGamesCarousel";
import { ChessBoard, ConnectFourBoard, DraughtsBoard } from "./GamesArena";
import { GAME_DAILY_XP_CAP, GAME_XP, gameLeagueState, recordGameResult, type GameLeagueState, type GameOutcome } from "../lib/gameLeagues";
import { bumpStat, markTried } from "../lib/achievements";
import { GameLeagueCard } from "./GameLeagueCard";
import { WorldRankingPanel } from "./WorldRankingPanel";

const nav = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

const GAME_META: Record<ChallengeGameId, { title: string; image: string; detail: string }> = {
  chess: { title: "Chess", image: "/games/chess.svg", detail: "Full legal rules · 10-minute clock" },
  connect4: { title: "Connect Four", image: "/games/connect-four.svg", detail: "Cinematic disc drops · win-line glow" },
  draughts: { title: "Draughts", image: "/games/draughts.svg", detail: "Mandatory captures · crowned kings" },
};
const GAME_IDS = Object.keys(GAME_META) as ChallengeGameId[];

export const ChallengeLounge: React.FC = () => {
  const { enabled, setEnabled, play } = useAudio();
  const [screen, setScreen] = useState<"welcome" | "lobby" | ChallengeGameId>("welcome");
  const [leagues, setLeagues] = useState<Record<ChallengeGameId, GameLeagueState>>(() => ({ chess: gameLeagueState("chess"), connect4: gameLeagueState("connect4"), draughts: gameLeagueState("draughts") }));
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"play" | "league" | "profile" | "rewards" | "social">("play");
  const deepLinked = useRef(false);

  const totalXP = GAME_IDS.reduce((sum, g) => sum + leagues[g].weekXP, 0);
  const totalGames = GAME_IDS.reduce((sum, g) => sum + leagues[g].games, 0);

  const sound = (s: "button" | "ticketSelect" | "success" | "error") => play(s);

  // Records one finished game in that game's own league, capped per game per day.
  const recordOutcome = (game: ChallengeGameId, outcome: GameOutcome) => {
    const before = leagues[game].weekXP;
    const next = recordGameResult(game, outcome);
    setLeagues((v) => ({ ...v, [game]: next }));
    const gained = next.weekXP - before;
    setNotice(gained > 0 ? `+${gained} ${GAME_META[game].title} league XP banked.` : `Daily ${GAME_META[game].title} XP cap of ${GAME_DAILY_XP_CAP} reached. The game still counts as played.`);
    play("levelUp");
  };

  // A finished game is recorded locally in its own league, and sent to the server scoring endpoint when reachable.
  const reportResult = (game: ChallengeGameId) => (result: "win" | "draw") => {
    if (result === "win") bumpStat(`${game}Finished`);
    // Not ranked: these boards are two players on one device, so one person could play both sides.
    recordOutcome(game, result);
  };

  const sitDown = (id: ChallengeGameId) => {
    play("ticketSelect");
    markTried(id);
    setScreen(id);
    window.scrollTo(0, 0);
  };

  // ?game=chess|connect4|draughts (from the casino carousel) sits you straight down.
  if (!deepLinked.current) {
    deepLinked.current = true;
    const requested = new URLSearchParams(window.location.search).get("game");
    if (requested && requested in GAME_META) {
      window.history.replaceState({}, "", "/challenge"); // a reload shouldn't count the game twice
      queueMicrotask(() => sitDown(requested as ChallengeGameId));
    }
  }

  if (screen === "welcome") return <LoungeWelcome
    brand="Luxe Challenge"
    tagline="Cinematic board games — chess, connect four and draughts. Each game has its own weekly league. Free play only."
    art="/games/arena-panorama.svg"
    icon="⚔"
    chipsLabel={`${totalXP} XP`}
    tab={tab}
    onTab={(t) => { play("button"); setTab(t); setScreen("lobby"); }}
    onEnter={() => { play("ticketSelect"); setTab("play"); setScreen("lobby"); }}
  />;

  if (screen !== "lobby") {
    const meta = GAME_META[screen];
    const state = leagues[screen];
    return <section className="salon-selection min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-4 py-6 pb-28 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-4 py-3">
          <button onClick={() => { play("button"); setScreen("lobby"); }} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-black"><ChevronLeft className="h-4 w-4" />Lounge</button>
          <span className="inline-flex items-center gap-2 font-black text-amber-100"><Swords className="h-4 w-4" />{meta.title}</span>
          <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: `${state.tier.colour}55`, color: state.tier.colour }}>{state.tier.name} League</span>
        </header>
        <div className="mt-6 rounded-[2rem] border border-amber-200/30 bg-black/30 p-4 shadow-[0_0_60px_rgba(212,175,55,.14)] sm:p-7">
          {screen === "chess" ? <ChessBoard sound={sound} onResult={reportResult("chess")} /> : screen === "connect4" ? <ConnectFourBoard sound={sound} onResult={reportResult("connect4")} /> : <DraughtsBoard sound={sound} onResult={reportResult("draughts")} />}
        </div>
        {notice && <p className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">{notice}</p>}
        <p className="mt-4 flex items-center gap-2 text-xs text-white/45"><ShieldCheck className="h-4 w-4 text-emerald-300" />Free-play only — no deposits, no cash wagering, no cash-out. Win a game: +{GAME_XP.win} XP, draw: +{GAME_XP.draw} XP, in this game's league only.</p>
      </div>
    </section>;
  }

  return <section id="challenge-lounge" className="salon-selection min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-4 py-6 pb-28 text-white">
    <div className="mx-auto max-w-5xl">
      <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-4 py-3">
        <span className="inline-flex items-center gap-2 font-black text-amber-100"><Crown className="h-5 w-5" />LUXE CHALLENGE</span>
        <span className="rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-1.5 font-mono text-sm font-black text-amber-100">{totalXP} XP</span>
        <button onClick={() => setEnabled(!enabled)} className="rounded-lg bg-white/10 p-2" aria-label="Toggle sound"><Volume2 className="h-4 w-4" /></button>
      </header>

      <nav className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[.18em]">
        <span className="rounded-full border border-amber-200/50 bg-amber-300/15 px-3.5 py-1.5 text-amber-100">⚔ Challenge</span>
        <button type="button" onClick={() => nav("/poker")} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-white/55 transition hover:border-amber-200/50 hover:text-amber-100">♠ Card Lounge</button>
        <button type="button" onClick={() => nav("/portal")} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-white/55 transition hover:border-amber-200/50 hover:text-amber-100">Portal</button>
      </nav>

      {tab === "play" && <>
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Members’ games room · no cash value</p>
          <h2 className="mt-3 text-4xl font-black">Pick a game</h2>
          <p className="mt-3 text-sm text-white/60">Each game has its own weekly league. Win games to climb that league. Free-play only.</p>
        </div>
        <ChallengeGamesCarousel onPlay={sitDown} />
      </>}

      {tab === "league" && <div className="mt-8 space-y-3">
        {GAME_IDS.map((g) => <div key={g}><GameLeagueCard title={GAME_META[g].title} state={leagues[g]} /></div>)}
        <WorldRankingPanel />
        <p className="text-[10px] leading-relaxed text-white/40">Each game has its own league. XP comes only from finished games: +{GAME_XP.win} for a win, +{GAME_XP.draw} for a draw, up to {GAME_DAILY_XP_CAP} XP per game per day.</p>
      </div>}

      {tab === "profile" && <div className="mt-8 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200/30 bg-black/40 p-4 text-left">
            <Swords className="h-5 w-5 text-amber-200" /><b className="mt-3 block">{totalXP} XP this week</b><small className="text-white/55">Across all three games</small>
          </div>
          <div className="rounded-2xl border border-amber-200/30 bg-black/40 p-4 text-left">
            <Bot className="h-5 w-5 text-amber-200" /><b className="mt-3 block">{totalGames} games this week</b><small className="text-white/55">Finished games only</small>
          </div>
        </div>
        <button type="button" onClick={() => nav("/portal")} className="mt-4 w-full rounded-2xl border border-amber-200/40 bg-gradient-to-b from-amber-300/15 to-amber-500/10 p-4 text-left transition hover:border-amber-200/70 active:scale-[.98]">
          <b className="block text-amber-100">Open full player portal →</b><small className="text-white/55">Quests, achievements, trophies and season history</small>
        </button>
      </div>}

      {tab === "rewards" && <div className="mt-8 grid gap-3">
        <div className="rounded-2xl border border-amber-200/30 bg-amber-300/10 p-5">
          <Gift className="h-5 w-5 text-amber-200" /><b className="mt-3 block text-base">Game XP</b><small className="text-white/55">+{GAME_XP.win} per win, +{GAME_XP.draw} per draw, up to {GAME_DAILY_XP_CAP} XP per game per day</small>
        </div>
      </div>}

      {tab === "social" && <div className="mt-8 text-center"><p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Social</p><h2 className="mt-2 text-3xl font-black">Lounge chat</h2><p className="mx-auto mt-3 max-w-md text-sm text-white/60">Lounge chat and friends are not available yet.</p></div>}

      {tab !== "play" && notice && <p className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">{notice}</p>}

      <p className="mt-6 rounded-xl border border-white/10 bg-black/30 p-3 text-[10px] leading-relaxed text-white/50"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-300" />Free-to-play entertainment only. Challenge leagues are separate from the Luxe Poker Lounge league.</p>
      <LoungeTabBar tab={tab} onTab={(t) => { play("button"); setTab(t); window.scrollTo({ top: 0, behavior: "smooth" }); }} accent="amber" />
    </div>
  </section>;
};
