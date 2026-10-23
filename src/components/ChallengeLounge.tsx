// Challenge-games lounge — chess, connect four and draughts with the same
// Duolingo-style weekly league experience as the poker lounge.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bot, ChevronLeft, Crown, Gift, ShieldCheck, Swords, Users, Volume2 } from "lucide-react";
import { LoungeTabBar } from "./LoungeTabBar";
import { LoungeWelcome } from "./LoungeWelcome";
import { useAudio } from "../audio/AudioProvider";
import { ChallengeGamesCarousel, type ChallengeGameId } from "./ChallengeGamesCarousel";
import { ChessBoard, ConnectFourBoard, DraughtsBoard } from "./GamesArena";
import { CHALLENGE_XP, COHORT_SIZE, LEAGUE_TIERS, LEAGUE_XP, PROMOTE_COUNT, RELEGATE_COUNT, confirmedXP, currentLeague, provisionalXP, recordDailyParticipation, recordGamePlayed, recordWeeklyXP, submitChallengeGameForScoring, tierByIndex, weekEndsIn, weeklyBoard, weeklyCutoffs } from "../lib/pokerLeague";
import { divisionProgress, getSeason } from "../lib/pokerSeason";
import { LeagueGlideOverlay, type GlideEvent } from "./LeagueGlideOverlay";

const nav = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

const GAME_META: Record<ChallengeGameId, { title: string; image: string; detail: string }> = {
  chess: { title: "Chess", image: "/games/chess.svg", detail: "Full legal rules · 10-minute clock" },
  connect4: { title: "Connect Four", image: "/games/connect-four.svg", detail: "Cinematic disc drops · win-line glow" },
  draughts: { title: "Draughts", image: "/games/draughts.svg", detail: "Mandatory captures · crowned kings" },
};

export const ChallengeLounge: React.FC = () => {
  const { enabled, setEnabled, play } = useAudio();
  const [screen, setScreen] = useState<"welcome" | "lobby" | ChallengeGameId>("welcome");
  const [league, setLeague] = useState(() => currentLeague());
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [rewardReady, setRewardReady] = useState(() => localStorage.getItem("luxe-challenge-reward") !== new Date().toDateString());
  const [glide, setGlide] = useState<GlideEvent>(null);
  const [tab, setTab] = useState<"play"|"league"|"profile"|"rewards">("play");
  const glideId = useRef(0);
  const leagueTier = tierByIndex(league.tierIndex);
  const leagueBoard = useMemo(() => weeklyBoard(league), [league]);
  const cutoffs = weeklyCutoffs(leagueBoard, league.tierIndex);
  const yourRank = leagueBoard.findIndex((r) => r.you) + 1;
  const season = getSeason();
  const division = divisionProgress();

  useEffect(() => { const onFocus = () => setLeague(currentLeague()); window.addEventListener("focus", onFocus); return () => window.removeEventListener("focus", onFocus); }, []);

  const sound = (s: "button" | "ticketSelect" | "success" | "error") => play(s);

  // Award league XP with the Duolingo-style full-screen glide when you climb.
  const gainLeagueXp = (amount: number) => {
    const before = weeklyBoard(league);
    const next = recordWeeklyXP(amount);
    setLeague(next);
    const after = weeklyBoard(next);
    const oldRank = before.findIndex((r) => r.you) + 1 || before.length;
    const newRank = after.findIndex((r) => r.you) + 1 || after.length;
    if (newRank < oldRank) setGlide({ id: ++glideId.current, amount, before, after, tierName: leagueTier.name, tierColour: leagueTier.colour });
    else setNotice(`+${amount} league XP banked.`);
    play("levelUp");
  };

  // A finished board game scores XP — server-verified when reachable, local credit otherwise.
  const reportResult = (game: ChallengeGameId) => (result: "win" | "draw") => {
    void submitChallengeGameForScoring(game, result).then((verdict) => {
      const xp = verdict ? verdict.xp : CHALLENGE_XP[result];
      if (xp > 0) gainLeagueXp(xp);
      else if (verdict) setNotice("Daily challenge XP cap reached — results still count as games played.");
    });
  };

  const sitDown = (id: ChallengeGameId) => {
    play("ticketSelect");
    setLeague(recordGamePlayed());
    const dp = recordDailyParticipation();
    if (dp.paid) setNotice(`Daily participation: +${LEAGUE_XP.dailyParticipation} XP banked for your weekly league.`);
    setScreen(id);
    window.scrollTo(0, 0);
  };

  const dailyReward = () => {
    if (!rewardReady) return;
    play("success");
    setRewardReady(false);
    localStorage.setItem("luxe-challenge-reward", new Date().toDateString());
    const dp = recordDailyParticipation();
    setLeague(currentLeague());
    setNotice(dp.paid ? `Daily sign-in collected: +${LEAGUE_XP.dailyParticipation} league XP.` : "Daily sign-in collected — participation XP already banked today.");
  };

  if (screen === "welcome") return <LoungeWelcome
    brand="Luxe Challenge League"
    tagline="Cinematic board games — chess, connect four and draughts. Finish games to bank league XP and climb the same weekly divisions as the card lounge."
    art="/games/arena-panorama.svg"
    icon="⚔"
    chipsLabel={`${confirmedXP()} XP`}
    tab={tab}
    onTab={(t) => { play("button"); setTab(t); setScreen("lobby"); }}
    onEnter={() => { play("ticketSelect"); setTab("play"); setScreen("lobby"); }}
  />;

  if (screen !== "lobby") {
    const meta = GAME_META[screen];
    return <section className="salon-selection min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-4 py-6 pb-28 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-4 py-3">
          <button onClick={() => { play("button"); setScreen("lobby"); }} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-black"><ChevronLeft className="h-4 w-4" />Lounge</button>
          <span className="inline-flex items-center gap-2 font-black text-amber-100"><Swords className="h-4 w-4" />{meta.title}</span>
          <span className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider" style={{ borderColor: `${leagueTier.colour}55`, color: leagueTier.colour }}>{leagueTier.name} League</span>
        </header>
        <div className="mt-6 rounded-[2rem] border border-amber-200/30 bg-black/30 p-4 shadow-[0_0_60px_rgba(212,175,55,.14)] sm:p-7">
          {screen === "chess" ? <ChessBoard sound={sound} onResult={reportResult("chess")} /> : screen === "connect4" ? <ConnectFourBoard sound={sound} onResult={reportResult("connect4")} /> : <DraughtsBoard sound={sound} onResult={reportResult("draughts")} />}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-white/45"><ShieldCheck className="h-4 w-4 text-emerald-300" />Free-play only — no deposits, no cash wagering, no cash-out. Finish a game: +{CHALLENGE_XP.win} XP for a win, +{CHALLENGE_XP.draw} for a draw, into your shared weekly league.</p>
        {glide && <LeagueGlideOverlay event={glide} onDone={() => setGlide(null)} />}
      </div>
    </section>;
  }

  return <section id="challenge-lounge" className="salon-selection min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] pb-28 text-white">
    <div className="mx-auto max-w-5xl px-4 pt-6">
      <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-4 py-3">
        <span className="inline-flex items-center gap-2 font-black text-amber-100"><Crown className="h-5 w-5" />LUXE CHALLENGE LOUNGE</span>
        <span className="rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-1.5 font-mono text-sm font-black text-amber-100">{confirmedXP()} XP</span>
        <button onClick={() => setEnabled(!enabled)} className="rounded-lg bg-white/10 p-2" aria-label="Toggle sound"><Volume2 className="h-4 w-4" /></button>
      </header>

      <nav className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[.18em]">
        <span className="rounded-full border border-amber-200/50 bg-amber-300/15 px-3.5 py-1.5 text-amber-100">⚔ Challenge</span>
        <button type="button" onClick={() => nav("/poker")} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-white/55 transition hover:border-amber-200/50 hover:text-amber-100">♠ Card Lounge</button>
        <button type="button" onClick={() => nav("/portal")} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-white/55 transition hover:border-amber-200/50 hover:text-amber-100">Portal</button>
      </nav>
    </div>

      
      {tab === "play" && <><div className="mx-auto max-w-5xl px-4"><div className="mt-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Members’ games room · no cash value</p>
        <h2 className="mt-3 text-4xl font-black">Your Weekly League</h2>
        <p className="mt-3 text-sm text-white/60">Pick a board game and you're matched straight into your {leagueTier.name} League — no lobbies, no waiting. Win games to climb the divisions. Free-play only, pure competition.</p>
      </div><ChallengeGamesCarousel onPlay={sitDown} />

      <button onClick={() => sitDown("chess")} className="group mt-7 block w-full overflow-hidden rounded-2xl border border-amber-200/40 bg-black/40 text-left transition hover:border-amber-200/80 active:scale-[.98]">
        <div className="relative h-32 bg-gradient-to-br from-amber-200 to-amber-600">
          <img src="/games/chess.svg" alt="" className="h-full w-full object-cover opacity-80 mix-blend-luminosity" />
          <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[9px] font-black uppercase tracking-wider" style={{ color: leagueTier.colour }}>{leagueTier.name} League · your board</span>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="font-black text-amber-100">{leagueTier.name} League Board</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-white/55"><Users className="h-3 w-3" /> Head-to-head · {GAME_META.chess.detail}</p>
          </div>
          <span className="rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-2.5 text-sm font-black text-black shadow-lg">Play now</span>
        </div>
      </button>

      </div></>}
      {tab === "league" && <><div className="min-h-[calc(100vh-9rem)] w-full bg-[linear-gradient(180deg,#171106,#0b0704_40%)] px-3 py-5 sm:px-6"><div className="mx-auto max-w-3xl"><div className="mt-8 rounded-[1.75rem] border p-5" style={{ borderColor: `${leagueTier.colour}55`, background: "linear-gradient(145deg,#1c150b,#0d0904 70%)", boxShadow: `0 0 34px ${leagueTier.glow}` }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em]" style={{ color: leagueTier.colour }}>{leagueTier.name} League · week table</p>
            <p className="mt-1 text-xs text-white/55">Season {season.info.season} · week {season.info.weekInSeason} · ends in {weekEndsIn()}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-black text-amber-100">{confirmedXP()} XP</p>
            <p className="text-[10px] font-black uppercase tracking-wider text-white/45">Confirmed{provisionalXP() > 0 ? ` · ${provisionalXP()} provisional` : ""}</p>
          </div>
        </div>
        <div className="league-board mt-3 space-y-1 pr-1">
          {leagueBoard.slice(0, leagueOpen ? COHORT_SIZE : 10).map((row, i) => {
            const rank = i + 1;
            const zone = league.tierIndex < LEAGUE_TIERS.length - 1 && rank <= PROMOTE_COUNT ? "promote" : league.tierIndex > 0 && rank > leagueBoard.length - RELEGATE_COUNT ? "demote" : "";
            return <div key={row.name} className={`league-board__row flex items-center gap-2 rounded-xl border px-3 py-2 ${row.you ? "league-board__row--you border-amber-300/70 bg-amber-300/15" : zone === "promote" ? "border-emerald-300/25 bg-emerald-300/5" : zone === "demote" ? "border-rose-300/25 bg-rose-300/5" : "border-white/8 bg-black/25"}`}>
              <span className={`w-6 text-center font-mono text-xs font-black ${zone === "promote" ? "text-emerald-300" : zone === "demote" ? "text-rose-300" : "text-white/40"}`}>{rank}</span>
              <span className={`w-5 text-center text-[10px] font-black ${row.delta > 0 ? "text-emerald-300" : row.delta < 0 ? "text-rose-300" : "text-white/25"}`}>{row.delta > 0 ? `▲${row.delta}` : row.delta < 0 ? `▼${-row.delta}` : "–"}</span>
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black" style={{ borderColor: `${leagueTier.colour}66`, background: "#0008", color: leagueTier.colour }}>{row.you ? "YOU" : row.name.slice(0, 2).toUpperCase()}<span className="absolute -bottom-1 -right-1 text-[10px] leading-none drop-shadow">{row.flag}</span></span>
              <b className={`flex-1 truncate text-sm ${row.you ? "text-amber-100" : "text-white/80"}`}>{row.name}{row.you ? " — you" : ""} <span className="ml-0.5">{row.flag}</span></b>
              <span className="font-mono text-[10px] text-white/40">{row.games}g</span>
              <span className="font-mono text-xs font-black text-white/70">{row.xp} XP</span>
            </div>;
          })}
        </div>
        <button onClick={() => setLeagueOpen((v) => !v)} className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-black uppercase tracking-wider text-white/70">{leagueOpen ? "Show less" : `Show all ${COHORT_SIZE} players`}</button>
        <p className="mt-3 text-[10px] text-white/35">Verified scoring: +{CHALLENGE_XP.win} XP per game won · +{CHALLENGE_XP.draw} per draw · +{LEAGUE_XP.dailyParticipation} daily participation bonus (capped). Top {PROMOTE_COUNT} ({cutoffs.promoteXP}+ XP) promote, bottom {RELEGATE_COUNT} relegate. Weekly leagues are free-play pride only — no prizes, no cash value.</p>
      </div>

      </div></div></>}
      {tab === "profile" && <><div className="mx-auto max-w-5xl px-4"><div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-200/30 bg-black/40 p-4 text-left">
          <Crown className="h-5 w-5 text-amber-200" /><b className="mt-3 block">{leagueTier.name} League</b><small className="text-white/55">Season {season.info.season} · week {season.info.weekInSeason}</small>
        </div>
        <div className="rounded-2xl border border-amber-200/30 bg-black/40 p-4 text-left">
          <Swords className="h-5 w-5 text-amber-200" /><b className="mt-3 block">{confirmedXP()} XP confirmed</b><small className="text-white/55">{provisionalXP()} provisional · {league.games ?? 0} games this week</small>
        </div>
        <div className="rounded-2xl border border-amber-200/30 bg-black/40 p-4 text-left">
          <Bot className="h-5 w-5 text-amber-200" /><b className="mt-3 block">{division.onTrack ? "Promotion pace" : "Chasing the cut"}</b><small className="text-white/55">{division.onTrack ? "You're on track to promote" : "Outside the promotion zone — keep playing"}</small>
        </div>
      </div>
      <button type="button" onClick={() => nav("/portal")} className="mt-4 w-full rounded-2xl border border-amber-200/40 bg-gradient-to-b from-amber-300/15 to-amber-500/10 p-4 text-left transition hover:border-amber-200/70 active:scale-[.98]">
        <b className="block text-amber-100">Open full player portal →</b><small className="text-white/55">Quests, achievements, trophies and season history</small>
      </button></div></>}
      {tab === "rewards" && <><div className="mx-auto max-w-5xl px-4"><div className="mt-8 grid gap-3">
        <button onClick={dailyReward} disabled={!rewardReady} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-5 text-left disabled:opacity-40">
          <Gift className="h-5 w-5 text-emerald-200" /><b className="mt-3 block text-base">{rewardReady ? `Daily sign-in: +${LEAGUE_XP.dailyParticipation} XP` : "Daily XP claimed"}</b><small className="text-white/55">Free participation XP every day — come back tomorrow</small>
        </button>
        <div className="rounded-2xl border border-amber-200/30 bg-amber-300/10 p-5">
          <Swords className="h-5 w-5 text-amber-200" /><b className="mt-3 block text-base">Game XP</b><small className="text-white/55">Finish a game: +{CHALLENGE_XP.win} XP per win · +{CHALLENGE_XP.draw} per draw · server-verified with a daily cap</small>
        </div>
      </div></div></>}
      <div className="mx-auto max-w-5xl px-4">{notice && <p className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">{notice}</p>}

      
      <p className="mt-6 rounded-xl border border-white/10 bg-black/30 p-3 text-[10px] leading-relaxed text-white/50"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-300" />Free-to-play entertainment only. Challenge games share the same weekly league as the Luxe Poker Lounge — one division, one ladder, no stakes and nothing to withdraw.</p>
      
      {glide && <LeagueGlideOverlay event={glide} onDone={() => setGlide(null)} />}
      <LoungeTabBar tab={tab} onTab={(t) => { play("button"); setTab(t); window.scrollTo({ top: 0, behavior: "smooth" }); }} accent="amber" />
    </div>
  </section>;
};
