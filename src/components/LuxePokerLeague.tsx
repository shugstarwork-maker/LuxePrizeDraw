import { pokerActionSound } from "../audio/pokerActionSound";
import { PlayerTurnRing } from "./PlayerTurnRing";
import { LuxePlayingCard } from "./LuxePlayingCard";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LuxeDealer } from "./LuxeDealer";
import { Bot, ChevronLeft, Crown, Gift, MessageCircle, Scale, ShieldCheck, Sparkles, Timer, Users, Volume2 } from "lucide-react";
import { PokerTableArtwork } from "./PokerTableArtwork";
import { useAudio } from "../audio/AudioProvider";
import { applyAction, botAction, createTable, dealHand, seatPlayer, type HoldemState } from "../games/holdem";
import { LoungeGamesCarousel } from "./LoungeGamesCarousel";
import { COHORT_SIZE, LEAGUE_TIERS, LEAGUE_XP, PLACEMENT_WEEKS, PROMOTE_COUNT, RELEGATE_COUNT, competitiveRating, confirmedXP, consumeLeagueMove, ensureWeek, integrityFlags, leagueXPForHand, loadReviewQueue, playerId, provisionalXP, recordCompetitiveResult, recordDailyParticipation, recordGamePlayed, recordWeeklyXP, settleLedger, submitForReview, submitHandForScoring, tierByIndex, tournamentXPForFinish, trustState, weekEndsIn, weeklyBoard, weeklyCutoffs } from "../lib/pokerLeague";
import { prizeEligibility, verifyShuffleFairness, type FairnessProof } from "../lib/fairPlay";
import { useMultiplayerPoker, type MpTableInfo } from "../lib/useMultiplayerPoker";
import { AccountCard } from "./AccountCard";
import { SeasonHub } from "./SeasonHub";
import { PokerFullscreen } from "./PokerFullscreen";
import { recordEventResult, weekFixtures } from "../lib/pokerSeason";
import { useAccount } from "../lib/useAccount";
import { LeagueCelebration, type Celebration } from "./LeagueCelebration";
import { LeagueRacePop, type RacePop } from "./LeagueRacePop";
import { LeagueGlideOverlay, type GlideEvent } from "./LeagueGlideOverlay";
import { LoungeTabBar } from "./LoungeTabBar";
import { LoungeWelcome } from "./LoungeWelcome";

const CardView = LuxePlayingCard;
const key = (card: { rank: string; suit: string }) => `${card.rank}${card.suit}`;

type TableDef = { name: string; image: string; blinds: string; smallBlind: number; bigBlind: number; buyIn: number; bots: number; tone: string };
// Duolingo-style: no lounge picking — your weekly league auto-assigns your table.
const LEAGUE_TABLES: TableDef[] = [
  { name: "Bronze League Table", image: "/games/luxe-poker-table.png", blinds: "10 / 20", smallBlind: 10, bigBlind: 20, buyIn: 200, bots: 5, tone: "from-amber-200 to-amber-500" },
  { name: "Silver League Table", image: "/games/luxe-poker-table.png", blinds: "25 / 50", smallBlind: 25, bigBlind: 50, buyIn: 500, bots: 5, tone: "from-amber-200 to-amber-500" },
  { name: "Gold League Table", image: "/games/luxe-poker-table.png", blinds: "50 / 100", smallBlind: 50, bigBlind: 100, buyIn: 1000, bots: 5, tone: "from-yellow-200 to-amber-600" },
  { name: "Platinum League Table", image: "/games/luxe-poker-table.png", blinds: "75 / 150", smallBlind: 75, bigBlind: 150, buyIn: 1500, bots: 5, tone: "from-teal-200 to-emerald-400" },
  { name: "Sapphire League Table", image: "/games/luxe-poker-table.png", blinds: "100 / 200", smallBlind: 100, bigBlind: 200, buyIn: 2000, bots: 5, tone: "from-yellow-200 to-amber-600" },
  { name: "Ruby League Table", image: "/games/luxe-poker-table.png", blinds: "150 / 300", smallBlind: 150, bigBlind: 300, buyIn: 3000, bots: 5, tone: "from-amber-300 to-orange-500" },
  { name: "Emerald League Table", image: "/games/luxe-poker-table.png", blinds: "200 / 400", smallBlind: 200, bigBlind: 400, buyIn: 4000, bots: 5, tone: "from-emerald-300 to-green-600" },
  { name: "Amethyst League Table", image: "/games/luxe-poker-table.png", blinds: "300 / 600", smallBlind: 300, bigBlind: 600, buyIn: 6000, bots: 5, tone: "from-purple-300 to-fuchsia-500" },
  { name: "Diamond League Table", image: "/games/luxe-poker-table.png", blinds: "400 / 800", smallBlind: 400, bigBlind: 800, buyIn: 8000, bots: 5, tone: "from-amber-300 to-orange-500" },
  { name: "Luxe Elite Table", image: "/games/luxe-poker-table.png", blinds: "800 / 1,600", smallBlind: 800, bigBlind: 1600, buyIn: 16000, bots: 5, tone: "from-amber-100 to-yellow-500" },
];
const emotes = ["Nice hand", "Good luck", "Well played", "Thinking..."];
const gifts = [{ name: "Lucky chip", cost: 25, icon: "🪙" }, { name: "Gold crown", cost: 75, icon: "👑" }, { name: "Luxe sparkle", cost: 150, icon: "✨" }];

// Seat slots around the oval artwork (percent coordinates). Slot 5 = bottom centre = you.
const SEAT_SLOTS = [180, 55, 125, 235, 305, 270].map((deg) => {
  const th = (deg * Math.PI) / 180;
  return { px: 50 + 42 * Math.cos(th), py: 44 - 27 * Math.sin(th), sc: 1.06 - 0.34 * ((Math.sin(th) + 1) / 2) };
});

export const LuxePokerLeague: React.FC = () => {
  const { enabled, setEnabled, play, musicEnabled, setMusicEnabled } = useAudio();
  const [screen, setScreen] = useState<"welcome" | "lobby" | "table" | "mp">("welcome");
  const mp = useMultiplayerPoker(playerId(), "You");
  const acct = useAccount();
  const [mpTables, setMpTables] = useState<MpTableInfo[]>([]);
  const [mpLoading, setMpLoading] = useState(false);
  const refreshMpTables = async () => {
    setMpLoading(true);
    try { const r = await fetch("/api/poker/mp/tables"); if (r.ok) setMpTables(((await r.json()) as { tables: MpTableInfo[] }).tables); } catch { /* offline */ }
    setMpLoading(false);
  };
  const createMpTable = async () => {
    setMpLoading(true);
    try { await fetch("/api/poker/mp/tables", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "Luxe open table" }) }); await refreshMpTables(); } catch { /* offline */ }
    setMpLoading(false);
  };
  const joinMp = (tableId: string) => { mp.spectate(tableId); setScreen("mp"); };
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [gateDismissed, setGateDismissed] = useState(false);

  const [selectedSeat, setSelectedSeat] = useState("Amelia K.");
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [avatar, setAvatar] = useState(() => localStorage.getItem("luxe-poker-avatar") || "");
  const [chips, setChips] = useState(() => Number(localStorage.getItem("luxe-demo-poker-chips")) || 1000);
  useEffect(() => { if (acct.profile) acct.syncChips(chips); }, [chips, acct.profile]); // keep server copy of chips in step with this device
  const [xp, setXp] = useState(() => competitiveRating()); // competitive rating — separate from league XP and trust
  const level = Math.floor(competitiveRating() / 200);

  type StoreItem = { id: string; type: "chips" | "ticket" | "theme" | "frame"; label: string; badge: string; chips?: number; count?: number };
  const STORE: StoreItem[] = [
    { id: "chips-5k", type: "chips", label: "5,000 chips", badge: "Bronze stack", chips: 5_000 },
    { id: "chips-25k", type: "chips", label: "25,000 chips", badge: "Silver stack", chips: 25_000 },
    { id: "chips-100k", type: "chips", label: "100,000 chips", badge: "Gold stack", chips: 100_000 },
    { id: "ticket-3", type: "ticket", label: "Tournament ticket x3", badge: "2x XP hands", count: 3 },
    { id: "theme-onyx", type: "theme", label: "Onyx Noir felt", badge: "Table theme" },
    { id: "theme-noir", type: "theme", label: "Noir Rose felt", badge: "Table theme" },
    { id: "frame-gold", type: "frame", label: "Gold Halo frame", badge: "Avatar cosmetic" },
    { id: "frame-platinum", type: "frame", label: "Platinum Ring frame", badge: "Avatar cosmetic" },
  ];
  const [owned, setOwned] = useState<string[]>([]);
  const [tableTheme, setTableTheme] = useState<"classic" | "onyx" | "noir">("classic");
  const [avatarFrame, setAvatarFrame] = useState<"none" | "gold" | "platinum">("none");
  const [tickets, setTickets] = useState(0);
  const [winFlash, setWinFlash] = useState(false);
  const [levelFlash, setLevelFlash] = useState(false);
  const [stats, setStats] = useState(() => { try { return JSON.parse(localStorage.getItem("luxe-poker-stats") || "") ?? { handsWon: 0, biggestPot: 0, streak: 0, bestStreak: 0 }; } catch { return { handsWon: 0, biggestPot: 0, streak: 0, bestStreak: 0 }; } });
  const cr = competitiveRating();
  const vipTier = cr >= 1600 ? { name: "Diamond member", benefit: "Priority tables" } : cr >= 1400 ? { name: "Gold member", benefit: "Strong tables" } : cr >= 1200 ? { name: "Silver member", benefit: "Rated player" } : { name: "Bronze member", benefit: "Welcome tier" };

  const [seatError, setSeatError] = useState("");
  const [activeTable, setActiveTable] = useState<TableDef | null>(null);
  const [game, setGame] = useState<HoldemState | null>(null);
  const [raiseTo, setRaiseTo] = useState(0);
  const [seconds, setSeconds] = useState(20);
  const [fairness, setFairness] = useState<FairnessProof | null>(null);
  const [fairnessBusy, setFairnessBusy] = useState(false);
  const verifyShuffle = async () => { setFairnessBusy(true); const proof = await verifyShuffleFairness(); setFairness(proof); setFairnessBusy(false); };
  const eligibility = prizeEligibility();
  const [status, setStatus] = useState("Choose a table to sit down.");
  const [feed, setFeed] = useState<string[]>(["Welcome to Luxe Poker League"]);
  const [rewardReady, setRewardReady] = useState(() => localStorage.getItem("luxe-poker-reward") !== new Date().toDateString());
  const [league, setLeague] = useState(() => ensureWeek());
  const [leagueOpen, setLeagueOpen] = useState(false);
  const leagueTier = tierByIndex(league.tierIndex);
  // Provisional points confirm after their review window; refresh standings when they do.
  useEffect(() => {
    const timer = window.setInterval(() => { if (settleLedger() > 0) setLeague((l) => ({ ...l, xp: confirmedXP() + provisionalXP() })); }, 5000);
    return () => window.clearInterval(timer);
  }, []);
  const leagueBoard = useMemo(() => weeklyBoard(league), [league]);
  const yourRank = leagueBoard.findIndex((r) => r.you) + 1;
  const cutoffs = weeklyCutoffs(leagueBoard, league.tierIndex);

  // ── Duolingo-style league race FX ──
  const [xpFloats, setXpFloats] = useState<{ id: number; amount: number }[]>([]);
  const [celebration, setCelebration] = useState<Celebration>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const prevRowTops = useRef<Map<string, number>>(new Map());
  const xpFloatId = useRef(0);
  const pushXpFloat = (amount: number) => {
    const id = ++xpFloatId.current;
    setXpFloats((f) => [...f, { id, amount }]);
    window.setTimeout(() => setXpFloats((f) => f.filter((x) => x.id !== id)), 1600);
  };
  const [racePop, setRacePop] = useState<RacePop>(null);
  const racePopId = useRef(0);
  const [leagueGlide, setLeagueGlide] = useState<GlideEvent>(null);
  const [lobbyTab, setLobbyTab] = useState<"play" | "league" | "profile" | "rewards">("play");
  const glideId = useRef(0);
  const gainLeagueXp = (amount: number) => {
    pushXpFloat(amount);
    const before = weeklyBoard(league);
    const next = recordWeeklyXP(amount);
    setLeague(next);
    const after = weeklyBoard(next);
    const oldRank = before.findIndex((r) => r.you) + 1 || before.length;
    const newRank = after.findIndex((r) => r.you) + 1 || after.length;
    if (newRank < oldRank) {
      // Duolingo-style: climbing the table takes over the full screen, then glides you to your new spot.
      setLeagueGlide({ id: ++glideId.current, amount, before, after, tierName: leagueTier.name, tierColour: leagueTier.colour });
      play("levelUp");
      return;
    }
    const id = ++racePopId.current;
    setRacePop({ id, amount, before, after, tierColour: leagueTier.colour });
    window.setTimeout(() => setRacePop((p) => (p && p.id === id ? null : p)), 3000);
    play("levelUp");
  };
  // Weekly promotion / relegation celebration (fires once when the new week starts)
  useEffect(() => {
    const mv = consumeLeagueMove();
    if (!mv) return;
    const toTier = tierByIndex(mv.tierIndex);
    const fromTier = tierByIndex(mv.tierIndex + (mv.moved === "promote" ? -1 : 1));
    setCelebration({ type: mv.moved, fromTier: fromTier.name, toTier: toTier.name, fromColour: fromTier.colour, toColour: toTier.colour });
    play(mv.moved === "promote" ? "levelUp" : "tableKnock");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Board rows slide to their new position when XP changes the order (Duolingo-style FLIP race)
  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const rows = board.querySelectorAll<HTMLElement>(".league-board__row");
    const next = new Map<string, number>();
    const moved: { el: HTMLElement; dy: number }[] = [];
    rows.forEach((el) => {
      const name = el.dataset.name || "";
      const top = el.offsetTop;
      next.set(name, top);
      const prev = prevRowTops.current.get(name);
      if (prev !== undefined && prev !== top) moved.push({ el, dy: prev - top });
    });
    prevRowTops.current = next;
    if (!moved.length) return;
    moved.forEach(({ el, dy }) => { el.style.transition = "none"; el.style.transform = `translateY(${dy}px)`; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      moved.forEach(({ el }) => { el.style.transition = "transform .55s cubic-bezier(.22,.9,.28,1)"; el.style.transform = "translateY(0)"; });
    }));
  }, [leagueBoard, leagueOpen]);
  // ── Exit glide: leaving a table after climbing ranks — the board auto-appears
  // edge-to-edge and your row glides up to its new position.
  const rankAtJoin = useRef<number | null>(null);
  const [glide, setGlide] = useState<{ from: number; to: number } | null>(null);
  const boardCardRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!glide) return;
    setLeagueOpen(true); // show the full board so the climb is visible
    const frame = requestAnimationFrame(() => {
      boardCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      const row = boardRef.current?.querySelector<HTMLElement>('[data-name="You"]');
      if (row) {
        const rowH = row.offsetHeight + 4; // row + space-y-1 gap
        const dy = (glide.from - glide.to) * rowH; // start rendered at the OLD rank
        row.style.transition = "none";
        row.style.transform = `translateY(${dy}px)`;
        row.style.zIndex = "30";
        row.style.position = "relative";
        requestAnimationFrame(() => requestAnimationFrame(() => {
          row.style.transition = "transform 1.8s cubic-bezier(.16,.84,.24,1)";
          row.style.transform = "translateY(0)";
        }));
      }
    });
    play("levelUp");
    const done = window.setTimeout(() => setGlide(null), 2400);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glide]);
  const settledHand = useRef(0);
  const handStartAt = useRef(0);
  const aliveRef = useRef<string[]>([]); // tournament: players still holding chips this table session
  const finishedRef = useRef(false);

  const you = game?.players.find((p) => p.id === "you");
  const youSeated = Boolean(you && !you.sittingOut);
  const yourTurn = Boolean(game && !game.handOver && youSeated && game.players[game.turnIndex]?.id === "you");
  const toCall = game && you ? game.currentBet - you.bet : 0;
  const minRaiseTo = game && you ? Math.min(game.currentBet + game.minRaise, you.bet + you.chips) : 0;
  const maxRaiseTo = you ? you.bet + you.chips : 0;

  useEffect(() => { localStorage.setItem("luxe-demo-poker-chips", String(chips)); }, [chips]);

  // Landscape-only play: auto-cover the whole screen when rotated; portrait shows the rotate gate.
  useEffect(() => {
    if (!game) return;
    const page = document.getElementById("poker-league");
    if (!page) return;
    const mq = window.matchMedia("(orientation: landscape)");
    // Cover the full screen regardless of iframe/viewport quirks: use the largest height the device reports.
    const apply = () => {
      page.classList.toggle("poker-fullscreen-sim", mq.matches);
      if (mq.matches) {
        // Break out of any preview wrapper: pin to the real screen size and clear any insets.
        const dpr = window.devicePixelRatio || 1;
        const h = Math.max(window.innerHeight, document.documentElement.clientHeight, window.screen.height, window.screen.availHeight, Math.round(window.screen.height * dpr / dpr), window.visualViewport?.height ?? 0);
        const w = Math.max(window.innerWidth, document.documentElement.clientWidth, window.screen.width, window.screen.availWidth, window.visualViewport?.width ?? 0);
        page.style.height = `${h}px`;
        page.style.width = `${w}px`;
        page.style.top = "0";
        page.style.left = "0";
        page.style.transform = "none";
        // If the page sits inside a clipped/offset preview container, neutralise it.
        let host = page.parentElement;
        while (host && host !== document.body) {
          const cs = window.getComputedStyle(host);
          if (cs.transform !== "none" || cs.overflow === "hidden" || cs.position === "relative" || cs.contain !== "none") {
            host.style.transform = "none";
            host.style.overflow = "visible";
            host.style.position = "static";
            host.style.contain = "none";
            host.style.padding = "0";
            host.style.margin = "0";
          }
          host = host.parentElement;
        }
      } else {
        page.style.height = "";
        page.style.width = "";
      }
    };
    apply();
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    return () => { mq.removeEventListener("change", apply); window.removeEventListener("resize", apply); window.visualViewport?.removeEventListener("resize", apply); page.classList.remove("poker-fullscreen-sim"); page.style.height = ""; page.style.width = ""; };
  }, [game]);

  const note = (message: string) => { setStatus(message); setFeed((items) => [message, ...items].slice(0, 4)); };
  const awardXp = (amount: number) => {
    // Competitive rating moves on results, not purchases — cosmetic/store XP no longer touches it.
    void amount;
  };

  // ── Engine: bot turn loop ──
  useEffect(() => {
    if (!game || game.handOver) return;
    const actor = game.players[game.turnIndex];
    if (!actor || !actor.isBot) return;
    const timer = window.setTimeout(() => {
      setGame((g) => {
        if (!g || g.handOver) return g;
        const bot = g.players[g.turnIndex];
        if (!bot?.isBot) return g;
        const decision = botAction(g, bot);
        const next = applyAction(g, bot.id, decision.action, decision.raiseTo);
        if (next.lastAction !== g.lastAction) play(decision.action === "fold" ? "tableKnock" : "chipDrop");
        return next;
      });
    }, 650 + Math.random() * 750);
    return () => window.clearTimeout(timer);
  }, [game, play]);

  // ── Engine: surface the latest action ──
  useEffect(() => {
    if (!game) return;
    setStatus(game.lastAction);
    setFeed((items) => (items[0] === game.lastAction ? items : [game.lastAction, ...items].slice(0, 4)));
  }, [game]);

  // ── Engine: settle XP / stats / win flash once per hand ──
  useEffect(() => {
    if (!game || !game.handOver || game.winners.length === 0) return;
    if (settledHand.current === game.handNumber) return;
    settledHand.current = game.handNumber;
    const mine = game.winners.find((w) => w.id === "you");
    const youPlayed = Boolean(game.players.find((p) => p.id === "you" && !p.sittingOut));
    if (youPlayed) {
      const showdown = game.board.length === 5; // went to the river = verified showdown result
      // Competitive rating updates on the result itself — separate from league XP and trust
      recordCompetitiveResult(Boolean(mine));
      const signal = {
        won: Boolean(mine),
        showdown,
        opponents: game.players.filter((p) => p.id !== "you" && !p.sittingOut).map((p) => p.name),
        pot: mine?.amount ?? game.pot,
        durationMs: Date.now() - (handStartAt.current || Date.now()),
        handNumber: game.handNumber,
      };
      setLeague(recordGamePlayed()); // games-played counter for the leaderboard
      const dp = recordDailyParticipation(); // +5 once per day, capped
      if (dp.paid) { setLeague(dp.state); pushXpFloat(LEAGUE_XP.dailyParticipation); note(`Daily participation bonus: +${LEAGUE_XP.dailyParticipation} league XP.`); }
      // Server-authoritative scoring: the server verifies the hand and decides the XP.
      // If the server can't be reached or rejects it, no XP is credited locally.
      void submitHandForScoring(signal).then((verdict) => {
        if (!verdict) {
          // Server scoring unreachable (offline / static preview) — credit locally instead of blocking the league race.
          const xp = leagueXPForHand(signal.won, signal.showdown);
          if (xp > 0) gainLeagueXp(xp);
          note("Preview mode — scoring server unreachable, XP credited locally on this device.");
          return;
        }
        if (!verdict.confirmed) { note("Hand could not be verified by the server — no league XP credited."); return; }
        if (verdict.held) { note(`Result sent for review before XP is credited (${verdict.held}).`); return; }
        if (verdict.xp > 0) gainLeagueXp(verdict.xp);
      });
    }
    play("winnerReveal");
    if (mine) {
      play("coinWin");
      setWinFlash(true);
      window.setTimeout(() => setWinFlash(false), 1800);
      awardXp(20 * (tickets > 0 ? 2 : 1));
      setStats((prev) => {
        const streak = prev.streak + 1;
        const next = { handsWon: prev.handsWon + 1, biggestPot: Math.max(prev.biggestPot, mine.amount), streak, bestStreak: Math.max(prev.bestStreak, streak) };
        localStorage.setItem("luxe-poker-stats", JSON.stringify(next));
        return next;
      });
    } else {
      setStats((prev) => { const next = { ...prev, streak: 0 }; localStorage.setItem("luxe-poker-stats", JSON.stringify(next)); return next; });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.handOver, game?.handNumber]);

  // ── Tournament: award league points by finishing place when players bust out ──
  useEffect(() => {
    if (!game || !game.handOver) return;
    const aliveNow = game.players.filter((p) => p.chips > 0).map((p) => p.id);
    if (aliveRef.current.length === 0) { aliveRef.current = aliveNow; return; }
    const busted = aliveRef.current.filter((id) => !aliveNow.includes(id));
    aliveRef.current = aliveNow;
    if (finishedRef.current) return;
    // Your finishing place: busted now → remaining players + 1; last one standing → 1st.
    let place: number | null = null;
    if (busted.includes("you")) place = aliveNow.length + 1;
    else if (aliveNow.length === 1 && aliveNow[0] === "you") place = 1;
    if (place === null) return;
    finishedRef.current = true;
    const pts = tournamentXPForFinish(place, game.players.length);
    if (pts > 0) {
      if (trustState().score < 95 || trustState().flags.length > 0) {
        const hold = submitForReview("table-finish", `+${pts} XP for finishing #${place}`);
        note(hold ? `Table finish (${pts} XP) held for review — ${hold.id}.` : "Table finish under review.");
      } else gainLeagueXp(pts);
    }
    // Season: a registered, unplayed club event consumes this run as its tournament result
    const openEvent = weekFixtures().find((e) => e.registered && e.place == null && !e.finished);
    if (openEvent) {
      const done = recordEventResult(openEvent.id, place);
      if (done) note(`${openEvent.name}: official result #${place} — +${done.points} season points recorded.`);
    }
    play(place === 1 ? "levelUp" : "winnerReveal");
    note(place === 1 ? `You take the table! 1st place — +${pts} league points.` : `Table run over — finished #${place}, +${pts} league points.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.handOver, game?.handNumber]);

  // ── Player turn timer: auto check/fold ──
  useEffect(() => {
    if (!yourTurn) return;
    setSeconds(20);
    const timer = window.setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [yourTurn, game?.handNumber, game?.stage, game?.turnIndex]);
  useEffect(() => {
    if (!yourTurn || seconds > 0 || !game || !you) return;
    const auto = toCall > 0 ? "fold" : "check";
    play(pokerActionSound(auto));
    setGame((g) => (g ? applyAction(g, "you", auto) : g));
    note(`Time expired — auto ${auto}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, yourTurn]);

  // Keep the raise slider inside legal bounds as the hand evolves.
  useEffect(() => { if (game && you) setRaiseTo((v) => Math.min(Math.max(v || minRaiseTo, minRaiseTo), maxRaiseTo)); }, [game?.currentBet, game?.stage, yourTurn]); // eslint-disable-line react-hooks/exhaustive-deps

  const chooseAvatar = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => { const value = String(reader.result); localStorage.setItem("luxe-poker-avatar", value); setAvatar(value); note("Demo avatar updated on this device."); }; reader.readAsDataURL(file); };
  const buyItem = (item: StoreItem) => {
    if (item.type === "chips") { setChips((v) => v + (item.chips ?? 0)); }
    else if (item.type === "ticket") setTickets((v) => v + (item.count ?? 0));
    else if (item.type === "theme") { setOwned((o) => [...new Set([...o, item.id])]); setTableTheme(item.id === "theme-onyx" ? "onyx" : "noir"); }
    else { setOwned((o) => [...new Set([...o, item.id])]); setAvatarFrame(item.id === "frame-gold" ? "gold" : "platinum"); }
    play(item.type === "chips" ? "chipStack" : "ticketPurchase");
    note(`${item.label} — acquired. Demo store, no cash value.`);
  };
  const join = (table: TableDef) => {
    if (chips < table.buyIn) { const message = `${table.name} needs ${table.buyIn.toLocaleString()} free-play chips. You have ${chips.toLocaleString()} — collect free daily chips below.`; setSeatError(message); note(message); return; }
    setSeatError("");
    rankAtJoin.current = weeklyBoard(league).findIndex((r) => r.you) + 1; // for the exit glide
    setScreen("table");
    setActiveTable(table);
    setChips((v) => v - table.buyIn);
    const table0 = createTable({ playerName: "You", playerChips: table.buyIn, botCount: table.bots, botChips: 1000, smallBlind: table.smallBlind, bigBlind: table.bigBlind });
    settledHand.current = 0;
    aliveRef.current = [];
    finishedRef.current = false;
    handStartAt.current = Date.now();
    setGame(table0);
    note(`Welcome to the ${table.name} — you're seated and the dealer is shuffling.`);
  };
  // ── The dealer runs the table: hands deal themselves ──
  useEffect(() => {
    if (!game?.handOver) return;
    const delay = game.handNumber === 0 ? 1800 : 5000;
    const timer = window.setTimeout(() => {
      play("cardDeal");
      handStartAt.current = Date.now();
      setGame((g) => (g?.handOver ? dealHand(g) : g));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [game?.handOver, game?.handNumber]); // eslint-disable-line react-hooks/exhaustive-deps
  const takeSeat = () => { play("chipStack"); setGame((g) => (g ? seatPlayer(g, "you") : g)); note("Seat taken. You're in from the next hand."); };
  const leaveTable = () => {
    if (game) { const stack = game.players.find((p) => p.id === "you")?.chips ?? 0; setChips((v) => v + stack); }
    // Exit glide: if the session moved you up the weekly board, glide the row up on return.
    const before = rankAtJoin.current;
    rankAtJoin.current = null;
    const after = weeklyBoard(ensureWeek()).findIndex((r) => r.you) + 1;
    setGame(null); setActiveTable(null); setLeaveOpen(false); setScreen("lobby");
    if (before && after && after < before) setGlide({ from: before, to: after });
    note("You left the table. Your remaining stack returned to your wallet.");
  };
  const rebuy = () => {
    if (!activeTable || !game) return;
    if (chips < activeTable.buyIn) return note(`Rebuy needs ${activeTable.buyIn.toLocaleString()} chips — collect daily chips or visit the store.`);
    setChips((v) => v - activeTable.buyIn);
    finishedRef.current = false; // rebuy re-enters the table race
    aliveRef.current = [];
    setGame((g) => g ? { ...g, players: g.players.map((p) => p.id === "you" ? { ...p, chips: p.chips + activeTable.buyIn, sittingOut: false } : p) } : g);
    note(`Rebought ${activeTable.buyIn.toLocaleString()} chips. Back in the table race.`);
  };
  const act = (action: "fold" | "check" | "call" | "raise") => {
    if (!game || !yourTurn) return;
    play(pokerActionSound(action));
    setGame((g) => (g ? applyAction(g, "you", action, action === "raise" ? raiseTo : 0) : g));
  };
  const sendGift = (gift: typeof gifts[number]) => { if (chips < gift.cost) return note(`You need ${gift.cost} virtual chips to send ${gift.name}.`); setChips((v) => v - gift.cost); play("success"); setGiftsOpen(false); note(`You sent ${gift.icon} ${gift.name} to ${selectedSeat}. Virtual gift only.`); };
  const dailyReward = () => { if (!rewardReady) return; setChips((v) => v + 200); play("chipStack"); setRewardReady(false); localStorage.setItem("luxe-poker-reward", new Date().toDateString()); note("Daily sign-in collected: 200 free-play chips."); };
  const leagueTable = LEAGUE_TABLES[Math.min(league.tierIndex, LEAGUE_TABLES.length - 1)];

  const dealerStage = game?.stage === "preflop" ? "pre-flop" : game?.stage ?? "idle";
  const potWinner: "player" | "host" | "split" | null = !game?.handOver || !game.winners.length ? null : game.winners.length > 1 ? "split" : game.winners[0].id === "you" ? "player" : "host";
  const dealerMood: "idle" | "win" | "lose" = potWinner === "player" || potWinner === "split" ? "win" : potWinner === "host" ? "lose" : "idle";
  const busted = Boolean(game?.handOver && you && you.chips <= 0);

  if (screen === "welcome") return <LoungeWelcome
    brand="Luxe Poker League"
    tagline="Members' free-play casino — pick a card game, sit at your league table and climb the weekly divisions. Virtual chips only, no cash value."
    art="/games/luxe-poker-table.png"
    icon="♠"
    chipsLabel={`${chips.toLocaleString()} chips`}
    tab={lobbyTab}
    onTab={(t) => { play("button"); setLobbyTab(t); setScreen("lobby"); }}
    onEnter={() => { play("ticketSelect"); setLobbyTab("play"); setScreen("lobby"); }}
  />;

  if (screen === "lobby") return <section id="poker-league" className="salon-selection min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] pb-28 text-white"><div className="mx-auto max-w-5xl px-4 pt-6"><header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-4 py-3"><span className="inline-flex items-center gap-2 font-black text-amber-100"><Crown className="h-5 w-5" />LUXE POKER LOUNGE</span><span className="rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-1.5 font-mono text-sm font-black text-amber-100">{chips.toLocaleString()} chips</span><button onClick={() => setEnabled(!enabled)} className="rounded-lg bg-white/10 p-2"><Volume2 className="h-4 w-4" /></button></header><nav className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[.18em]"><span className="rounded-full border border-amber-200/50 bg-amber-300/15 px-3.5 py-1.5 text-amber-100">♠ Card Lounge</span><button type="button" onClick={() => { window.history.pushState({}, "", "/challenge"); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-white/55 transition hover:border-amber-200/50 hover:text-amber-100">⚔ Challenge</button><button type="button" onClick={() => { window.history.pushState({}, "", "/portal"); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-white/55 transition hover:border-amber-200/50 hover:text-amber-100">Portal</button></nav>
        {lobbyTab === "play" && <><div className="mx-auto max-w-5xl px-4"><div className="mt-8 text-center"><p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Members’ casino · no cash value</p><h2 className="mt-3 text-4xl font-black">Your Weekly League</h2><p className="mt-3 text-sm text-white/60">Pick a card game and you're seated straight at your {leagueTier.name} League table — no lobbies, no waiting. Win hands to climb the divisions. Free-play chips only, pure experience.</p></div><LoungeGamesCarousel /><button onClick={() => join(leagueTable)} className="group mt-7 block w-full overflow-hidden rounded-2xl border text-left transition active:scale-[.98] border-amber-200/40 hover:border-amber-200/80 bg-black/40"><div className={`relative h-32 bg-gradient-to-br ${leagueTable.tone}`}><img src={leagueTable.image} alt="" className="h-full w-full object-cover opacity-80 mix-blend-luminosity" /><span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[9px] font-black uppercase tracking-wider" style={{ color: leagueTier.colour }}>{leagueTier.name} League · your table</span></div><div className="flex items-center justify-between gap-3 p-4"><div><p className="font-black text-amber-100">{leagueTable.name}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-white/55"><Users className="h-3 w-3" /> 6 seats · blinds {leagueTable.blinds} · buy-in {leagueTable.buyIn.toLocaleString()}</p></div><span className="rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-2.5 text-sm font-black text-black shadow-lg">Play now</span></div></button>{seatError && <p role="alert" className="poker-seat-error">{seatError}</p>}
        <div className="mt-8 rounded-[1.75rem] border border-emerald-200/25 bg-[linear-gradient(145deg,#06240f,#0a1206_70%)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-emerald-200">Multiplayer tables · live</p>
              <p className="mt-1 text-xs text-white/55">Real opponents, free-play chips. The server deals from a committed deck and validates every action.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void refreshMpTables()} disabled={mpLoading} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white/70 disabled:opacity-40">Refresh</button>
              <button onClick={() => void createMpTable()} disabled={mpLoading} className="rounded-xl border border-emerald-300/40 bg-emerald-300/15 px-3 py-2 text-[11px] font-black text-emerald-100 disabled:opacity-40">+ New table</button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {mpTables.length === 0 && <button onClick={() => void refreshMpTables()} className="w-full rounded-xl border border-dashed border-white/15 bg-black/30 p-4 text-xs text-white/50">No live tables yet — tap to load, or create the first one and share the table name with a friend.</button>}
            {mpTables.map((t) => <button key={t.id} onClick={() => joinMp(t.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-3.5 text-left transition hover:border-emerald-300/40 active:scale-[.99]">
              <div>
                <p className="text-sm font-black text-white/85">{t.name} <span className="font-mono text-[10px] text-emerald-200/70">{t.id}</span></p>
                <p className="mt-0.5 text-[11px] text-white/50">Blinds {t.blinds} · buy-in {t.buyIn.toLocaleString()} · {t.seats}/{t.maxSeats} seated{t.playing ? " · hand in play" : ""}</p>
              </div>
              <span className="rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500 px-4 py-2 text-xs font-black text-black">Join</span>
            </button>)}
          </div>
          {mp.error && <p role="alert" className="mt-2 text-[11px] text-rose-200">{mp.error}</p>}
          <p className="mt-3 text-[10px] text-white/35">Same integrity stack as solo tables: provably fair committed shuffle, append-only records, review before any league credit.</p>
        </div>
        </div></>}
        {lobbyTab === "league" && <><div className="min-h-[calc(100vh-9rem)] w-full bg-[linear-gradient(180deg,#171106,#0b0704_40%)] px-3 py-5 sm:px-6"><div className="mx-auto max-w-3xl"><div ref={boardCardRef} className={`mt-4 border p-5 transition-all duration-700 ${glide ? "-mx-4 rounded-none border-x-0" : "rounded-[1.75rem]"}`} style={{ borderColor: `${leagueTier.colour}55`, background: `linear-gradient(145deg,#1c150b, #0d0904 70%)`, boxShadow: glide ? `0 0 70px ${leagueTier.glow}` : `0 0 34px ${leagueTier.glow}` }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em]" style={{ color: leagueTier.colour }}>Weekly league · ends in {weekEndsIn()}</p>
              <p className="mt-1 flex items-center gap-2 text-lg font-black" style={{ color: leagueTier.colour }}><Crown className="h-5 w-5" />{leagueTier.name} League</p>
              <p className="text-xs text-white/55">{leagueTier.blurb ?? ""} · {league.tierIndex < LEAGUE_TIERS.length - 1 ? `Top ${PROMOTE_COUNT} go up` : "Top division — hold your spot"} · middle group stays{league.tierIndex > 0 ? ` · bottom ${RELEGATE_COUNT} drop` : ""} · #{yourRank || "—"} of {leagueBoard.length}{(league.weeksInLeague ?? 1) <= PLACEMENT_WEEKS ? " · Placement week — promotion unlocks next week" : ""}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-2xl font-black" style={{ color: leagueTier.colour }}>{confirmedXP()} XP</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/45">Confirmed{provisionalXP() > 0 ? ` · ${provisionalXP()} provisional` : ""}</p>
            </div>
          </div>
          <div ref={boardRef} className="league-board mt-3 space-y-1 pr-1">
            {leagueBoard.slice(0, leagueOpen ? COHORT_SIZE : 10).map((row, i) => {
              const rank = i + 1;
              const zone = league.tierIndex < LEAGUE_TIERS.length - 1 && rank <= PROMOTE_COUNT ? "promote" : league.tierIndex > 0 && rank > leagueBoard.length - RELEGATE_COUNT ? "demote" : "";
              return <div key={row.name} data-name={row.name} className={`league-board__row flex items-center gap-2 rounded-xl border px-3 py-2 ${row.you ? `league-board__row--you border-amber-300/70 bg-amber-300/15 ${glide ? "shadow-[0_0_24px_rgba(246,201,69,.55)]" : ""}` : zone === "promote" ? "border-emerald-300/25 bg-emerald-300/5" : zone === "demote" ? "border-rose-300/25 bg-rose-300/5" : "border-white/8 bg-black/25"}`}>
                <span className={`w-6 text-center font-mono text-xs font-black ${zone === "promote" ? "text-emerald-300" : zone === "demote" ? "text-rose-300" : "text-white/40"}`}>{rank}</span>
                <span className={`w-5 text-center text-[10px] font-black ${row.delta > 0 ? "text-emerald-300" : row.delta < 0 ? "text-rose-300" : "text-white/25"}`} title={row.delta > 0 ? `Up ${row.delta}` : row.delta < 0 ? `Down ${-row.delta}` : "No change"}>{row.delta > 0 ? `▲${row.delta}` : row.delta < 0 ? `▼${-row.delta}` : "–"}</span>
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black" style={{ borderColor: `${leagueTier.colour}66`, background: "#0008", color: leagueTier.colour }}>{row.you ? "YOU" : row.name.slice(0, 2).toUpperCase()}<span className="absolute -bottom-1 -right-1 text-[10px] leading-none drop-shadow">{row.flag}</span></span>
                <b className={`flex-1 truncate text-sm ${row.you ? "text-amber-100" : "text-white/80"}`}>{row.name}{row.you ? " — you" : ""} <span className="ml-0.5">{row.flag}</span></b>
                <span className="font-mono text-[10px] text-white/40">{row.games}g</span>
                <span className="relative font-mono text-xs font-black text-white/70">{row.xp} XP{row.you && xpFloats.map((f) => <span key={f.id} className="xp-float">+{f.amount} XP</span>)}</span>
              </div>;
            })}
          </div>
          <button onClick={() => setLeagueOpen((v) => !v)} className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-black uppercase tracking-wider text-white/70">{leagueOpen ? "Show less" : `Show all ${COHORT_SIZE} players`}</button>
          <p className="mt-3 text-[10px] text-white/35">Verified scoring: +{LEAGUE_XP.handWin} XP per hand won · +{LEAGUE_XP.showdownBonus} showdown bonus · +{LEAGUE_XP.tournamentWin} table win · +{LEAGUE_XP.topTenPercent} top-10% finish · +{LEAGUE_XP.dailyParticipation} daily bonus (capped). Top half ({cutoffs.promoteXP}+ XP) promotes, bottom half relegates. Weekly leagues are free-play pride only — no prizes, no cash value.</p>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.18em] text-emerald-200"><ShieldCheck className="h-3.5 w-3.5" />Fair play &amp; anti-scam controls</p>
            <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-white/55">
              <li>· <b className="text-white/75">One account per player</b> — your league identity is verified and bound to this device: <span className="font-mono text-emerald-100/90">{playerId()}</span>. Linked accounts are detected; sharing a household or network is never auto-banned.</li>
              <li>· <b className="text-white/75">Suspicious win patterns</b> — long streaks, repeated instant fold-wins and bot-fast play are detected automatically.</li>
              <li>· <b className="text-white/75">Connected accounts &amp; collusion</b> — repeated games between linked players and deliberate chip transfers are flagged and excluded from rankings.</li>
              <li>· <b className="text-white/75">Review before prizes</b> — suspicious results are held for review ({loadReviewQueue().filter((r) => r.status === "pending").length} pending) before any XP or prize is awarded.</li>
              <li>· <b className="text-white/75">Rate-capped scoring</b> — only 40 ranked hands/hour (240/day) earn XP, so farming can't dominate.{integrityFlags().length > 0 ? <span className="text-amber-200"> Active review flags: {integrityFlags().join(", ")}.</span> : ""}</li>
              <li>· <b className="text-white/75">Independently verifiable</b> — every settled result is hashed into a tamper-evident chain, so leaderboard totals can be replayed and checked.</li>
              <li>· <b className="text-white/75">Server-controlled scoring</b> — cards, valid actions, outcomes and points are decided by the server; the app can never submit its own score.</li>
              <li>· <b className="text-white/75">Permanent records</b> — every hand, action and score change is written to an append-only, hash-chained log that admins can't quietly edit and that can be replayed for disputes.</li>
              <li>· <b className="text-white/75">Bot &amp; automation signals</b> — timing and consistency patterns are analysed together; suspicious play goes to review — fast play or frequent wins alone never ban anyone.</li>
              <li>· <b className="text-white/75">Points ≠ winnings</b> — league points come from verified results only, never chip counts. Buying chips, tickets or cosmetics confers zero competitive advantage.</li>
              <li>· <b className="text-white/75">Provisional points</b> — new points pend during a review window and only count once confirmed; confirmed cheating reverses them afterwards.</li>
              <li>· <b className="text-white/75">Three separate ratings</b> — league XP (progression), competitive rating ({competitiveRating()}) and trust ({trustState().score}/100) never mix: you can't buy a better ranking or erase a flagged pattern by playing more.</li>
              <li>· <b className="text-white/75">Verified game ledger</b> — hand histories and signed score events are stored in a hash-chained, append-only record that can be replayed for disputes.</li>
              <li>· <b className="text-white/75">Provably fair shuffle</b> — the deck is cryptographically committed (SHA-256) before each deal and revealed after the hand, so you can verify it was never changed. A verifiable shuffle proves deck integrity — collusion and bots are still caught by pattern analysis and review, not by the shuffle alone.</li>
              <li>· <b className="text-white/75">League &amp; prize eligibility</b> — only validated rankings release rewards: confirmed points, clean trust and no pending reviews. Fraud indicators stay private.</li>
            </ul>
            <div className={`mt-3 rounded-lg border p-2.5 text-[10px] ${eligibility.eligible ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-amber-300/30 bg-amber-300/10 text-amber-100"}`}>
              <b className="font-black uppercase tracking-wider">Prize eligibility: {eligibility.eligible ? "Eligible" : "On hold"}</b>
              {!eligibility.eligible && <span className="mt-1 block text-white/60">{eligibility.reasons[0]}</span>}
            </div>
            <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2.5 text-[10px] text-white/55">
              <div className="flex items-center justify-between gap-2">
                <b className="font-black uppercase tracking-wider text-white/70">Shuffle verification</b>
                <button onClick={() => void verifyShuffle()} disabled={fairnessBusy} className="rounded-lg border border-emerald-300/40 bg-emerald-300/10 px-2.5 py-1 font-black text-emerald-100 disabled:opacity-40">{fairnessBusy ? "Checking…" : "Verify a shuffle"}</button>
              </div>
              {fairness && <p className="mt-1.5 font-mono leading-relaxed">
                {fairness.localVerified ? "✓ Deck verified locally" : fairness.revealed ? "⚠ Verification failed" : "Commitment published"} — hand #{fairness.hand} · commit <span className="text-emerald-100/90">{fairness.commitment.slice(0, 12)}…</span>{fairness.secret ? <> · revealed <span className="text-emerald-100/90">{fairness.secret.slice(0, 12)}…</span> · re-shuffled deck matches exactly</> : ""}
              </p>}
              {!fairness && <p className="mt-1.5">Tap to deal a real hand on the server and independently re-run its shuffle here on your device.</p>}
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-sky-300/20 bg-sky-300/5 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.18em] text-sky-200"><Scale className="h-3.5 w-3.5" />Product positioning &amp; legal review</p>
            <ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-white/55">
              <li>· <b className="text-white/75">Free-to-play entertainment</b> — this build: virtual chips, leagues and non-cash progression only. No stakes, no cash value, nothing to withdraw.</li>
              <li>· <b className="text-white/75">A skill competition with prizes</b> — any future move here needs careful legal review of eligibility and game design before launch.</li>
              <li>· <b className="text-white/75">A real-money poker product</b> — potentially subject to gambling licensing and other regulatory obligations.</li>
            </ul>
            <p className="mt-2.5 rounded-lg border border-amber-300/25 bg-amber-300/10 p-2 text-[10px] leading-relaxed text-amber-100">Calling something a skill competition doesn't automatically make it lawful. UK specialist legal advice is required before linking paid entries, poker performance and valuable prizes — the precise mechanics matter.</p>
          </div>
        </div>
        <SeasonHub onPlayEvent={(label) => { note(`${label}: you're registered — your table run counts as your tournament result.`); join(leagueTable); }} />
        <LeagueCelebration celebration={celebration} onDone={() => setCelebration(null)} />
        </div></div></>}
        {lobbyTab === "profile" && <><div className="mx-auto max-w-5xl px-4"><AccountCard chips={chips} />
        <div className="mt-4 rounded-[1.75rem] border border-amber-200/25 bg-[linear-gradient(145deg,#241a08,#120d06_70%)] p-5">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Luxe Lounge leaderboard</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[{ l: "Hands won", v: stats.handsWon }, { l: "Biggest pot", v: stats.biggestPot.toLocaleString() }, { l: "Current streak", v: stats.streak }, { l: "Best streak", v: stats.bestStreak }].map((row) => (
              <div key={row.l} className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                <p className="text-lg font-black text-amber-100">{row.v}</p>
                <p className="text-[9px] font-black uppercase tracking-wider text-white/40">{row.l}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-white/35">Your private Luxe Lounge record — stored on this device. Realtime multiplayer tables are on the roadmap.</p>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setMusicEnabled(!musicEnabled)} className="inline-flex items-center gap-2 rounded-xl border border-amber-200/25 bg-black/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-100 transition hover:border-amber-200/60"><Volume2 className="h-4 w-4" />{musicEnabled ? "Lounge music on" : "Lounge music off"}</button>
          <span className="text-[10px] text-white/35">Ambient Luxe Lounge loop — synthesized in-house, no licensing needed.</span>
        </div>
        </div></>}
        {lobbyTab === "rewards" && <><div className="mx-auto max-w-5xl px-4"><div className="mt-7 grid gap-3 sm:grid-cols-3"><button onClick={dailyReward} disabled={!rewardReady} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-left disabled:opacity-40"><Gift className="h-5 w-5 text-emerald-200" /><b className="mt-3 block">{rewardReady ? "Daily sign-in: 200 chips" : "Daily chips claimed"}</b><small className="text-white/55">200 free-play chips every day</small></button><button onClick={() => note("Demo leaderboard becomes available after completing a hand.")} className="rounded-2xl border border-violet-300/30 bg-violet-300/10 p-4 text-left"><Crown className="h-5 w-5 text-violet-200" /><b className="mt-3 block">League table</b><small className="text-white/55">Practice ranking</small></button><button onClick={() => note("Demo tournaments use virtual chips and cannot issue tickets.")} className="rounded-2xl border border-amber-200/30 bg-amber-300/10 p-4 text-left"><Sparkles className="h-5 w-5 text-amber-200" /><b className="mt-3 block">Tournament night</b><small className="text-white/55">Table race points: 1st 100 · 2nd 75 · 3rd 60 · 4th 50 · 5th 40 · 6th 30 — outlast the table to score for your weekly league</small></button></div><div className="mt-8 rounded-[1.75rem] border border-amber-200/25 bg-[linear-gradient(145deg,#241a08,#120d06_70%)] p-5">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">VIP ladder &amp; chip store</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-black text-white ${levelFlash ? "poker-level-flash" : ""}`}>{vipTier.name} · Level {level}{avatarFrame === "gold" ? " 🟡" : avatarFrame === "platinum" ? " ⚪" : ""}</p>
              <p className="mt-0.5 text-xs text-white/55">Rating {competitiveRating()} · {chips.toLocaleString()} chips{tickets > 0 ? ` · ${tickets} tournament ticket${tickets > 1 ? "s" : ""}` : ""}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500" style={{ width: `${Math.min(100, (xp % 200) / 2)}%` }} />
              </div>
            </div>
            <span className="rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">{vipTier.benefit}</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {STORE.map((item) => (
              <button key={item.id} onClick={() => buyItem(item)} className={`rounded-xl border px-4 py-3 text-left transition active:scale-95 ${item.type === "theme" || item.type === "frame" ? (owned.includes(item.id) ? "border-emerald-400/50 bg-emerald-400/10" : "border-amber-200/25 bg-black/40 hover:border-amber-200/60") : "border-amber-200/25 bg-black/40 hover:border-amber-200/60"}`}>
                <p className="font-mono text-lg font-black text-amber-100">{item.label}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-white/50">{(item.type === "theme" || item.type === "frame") && owned.includes(item.id) ? "Owned — equipped" : item.badge}</p>
              </button>
            ))}
          </div>
        </div>
        </div></>}
        {status !== "Choose a table to sit down." && <p className="mt-5 rounded-xl border border-amber-200/20 bg-amber-300/10 p-3 text-sm text-amber-100">{status}</p>}<LeagueRacePop pop={racePop} />{leagueGlide && <LeagueGlideOverlay event={leagueGlide} onDone={() => setLeagueGlide(null)} />}<LoungeTabBar tab={lobbyTab} onTab={(t) => { play("button"); setLobbyTab(t); window.scrollTo({ top: 0, behavior: "smooth" }); }} accent="amber" /></div></section>;

  // ── Multiplayer table screen ──
  if (screen === "mp") {
    const v = mp.view;
    const myId = playerId();
    const g = v?.state ?? null;
    const me = g?.players.find((p) => p.id === myId);
    const mpToCall = g && me ? g.currentBet - me.bet : 0;
    const mpMinRaise = g && me ? Math.min(g.currentBet + g.minRaise, me.bet + me.chips) : 0;
    const mpMaxRaise = me ? me.bet + me.chips : 0;
    const mpStage = g?.stage === "preflop" ? "pre-flop" : g?.stage ?? "idle";
    const mpWinner: "player" | "host" | "split" | null = !g?.handOver || !g.winners.length ? null : g.winners.length > 1 ? "split" : g.winners[0].id === myId ? "player" : "host";
    const mpMood: "idle" | "win" | "lose" = mpWinner === "player" || mpWinner === "split" ? "win" : mpWinner === "host" ? "lose" : "idle";
    const mpSeated = Boolean(me && !me.sittingOut);
    return <section id="poker-league" className={`poker-playing-page${gateDismissed ? " poker-gate-dismissed" : ""} min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-3 py-4 pb-28 text-white`}>
      {!gateDismissed && <div className="poker-landscape-gate" role="status"><span aria-hidden="true">↻</span><h2>Turn your phone sideways for a bigger poker table</h2><p>You can still play in portrait — rotate whenever you're ready for the full table view.</p><button type="button" onClick={() => setGateDismissed(true)}>Continue in portrait</button><button type="button" onClick={() => { mp.leave(); setScreen("lobby"); }}>Back to Luxe Lounges</button></div>}
      <div className="poker-playing-wrap mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-3 py-2">
          <button onClick={() => { mp.leave(); setScreen("lobby"); }} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-black"><ChevronLeft className="h-4 w-4" />Lobby</button>
          <span className="font-mono text-sm font-black text-amber-100">{v ? `${v.name} · Hand #${v.handNumber}` : "Connecting…"}</span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${mp.connected ? "bg-emerald-300/20 text-emerald-100" : "bg-rose-300/20 text-rose-100"}`}>{mp.connected ? "LIVE" : "OFFLINE"}</span>
        </header>
        {mp.error && <p role="alert" className="mt-3 rounded-xl border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{mp.error}</p>}
        {!v && <p className="mt-10 text-center text-sm text-white/50">Joining table…</p>}
        {v && g && <>
          <article className="poker-game-article relative mt-4 overflow-hidden rounded-[2rem] border border-amber-200/50 bg-[radial-gradient(ellipse_at_center,#2a2318,#151009_55%,#090604)] p-4 shadow-[0_0_70px_rgba(212,175,55,.22),inset_0_0_140px_rgba(0,0,0,0.5)] sm:p-6">
            <div className="poker-surface-frame relative rounded-[2rem]">
              <PokerTableArtwork pot={g.pot} stage={mpStage} winner={mpWinner}>
                <div className="poker-live-seats pointer-events-none absolute inset-0">{g.players.map((p, i) => {
                  const slot = SEAT_SLOTS[Math.min(i, SEAT_SLOTS.length - 1)];
                  const isMe = p.id === myId;
                  const isTurn = !g.handOver && g.players[g.turnIndex]?.id === p.id;
                  const isWinner = g.handOver && !p.sittingOut && g.winners.some((w) => w.id === p.id);
                  const seat = v.seats.find((x) => x.id === p.id);
                  const showCards = Boolean(p.cards[0]) && (isMe || (g.stage === "showdown" && !p.folded && !p.sittingOut));
                  return <div key={p.id} className={`pointer-events-auto absolute w-[4.9rem] rounded-2xl border px-1.5 py-1 text-center shadow-2xl backdrop-blur-md transition ${p.sittingOut ? "opacity-30" : p.folded ? "opacity-45" : ""} ${isWinner ? "border-emerald-300 bg-emerald-300/20" : isTurn ? "border-amber-200 bg-amber-300/20 poker-turn-ring" : isMe ? "poker-seat-you border-amber-200/70 bg-amber-300/10" : "border-white/15 bg-black/55"}`} style={{ left: `${slot.px}%`, top: `${isMe ? slot.py + 8 : slot.py}%`, zIndex: 10 + Math.round(slot.py), transform: `translate(-50%,-50%) scale(${slot.sc})` }}>
                    <PlayerTurnRing active={isTurn} seconds={isTurn ? 20 : 20} name={p.name}>{isMe && avatar ? <img src={avatar} alt="Your avatar" className="h-full w-full object-cover" /> : p.initials}</PlayerTurnRing>
                    <b className="mt-1 block truncate text-[9px] text-amber-100">{p.name}{isMe ? " — you" : ""}{g.players[g.dealerIndex]?.id === p.id ? " 🔘" : ""}{!seat?.connected && <span className="text-rose-300"> · offline</span>}</b>
                    <small className="block text-[8px] text-white/55">{p.sittingOut ? "Watching" : p.chips.toLocaleString()}{p.allIn ? " · ALL-IN" : ""}{p.folded ? " · folded" : ""}</small>
                    {p.bet > 0 && <span className="mt-0.5 inline-block rounded-full bg-amber-300/90 px-1.5 py-px font-mono text-[8px] font-black text-black">bet {p.bet.toLocaleString()}</span>}
                    {p.cards.length === 2 && !p.sittingOut && !isMe && <span className="mt-1 flex justify-center gap-0.5">{p.cards.map((c, ci) => showCards && c ? <span key={`${p.id}-${ci}`} className={`flex h-6 w-[1.1rem] items-center justify-center rounded-sm border border-black/20 bg-white font-mono text-[9px] font-black ${c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-zinc-900"}`}>{c.rank}{c.suit}</span> : <span key={`${p.id}-${ci}`} className="flex h-6 w-[1.1rem] items-center justify-center rounded-sm border border-amber-200/40 bg-gradient-to-br from-amber-900 to-black text-[7px] text-amber-200/70">♛</span>)}</span>}
                  </div>;
                })}</div>
                <div className="poker-live-board flex justify-center gap-1">{[0, 1, 2, 3, 4].map((i) => g.board[i] ? <CardView key={key(g.board[i])} card={g.board[i]} /> : <div key={i} className="h-16 w-11 rounded-lg border border-dashed border-amber-100/30 bg-black/40 sm:h-20 sm:w-14" />)}</div>
                <div className="poker-live-hand flex justify-center gap-2">{me?.cards.some(Boolean) ? me.cards.map((c, i) => c ? <CardView key={`me-${i}`} card={c} /> : <CardView key={`me-${i}`} hidden />) : <><CardView hidden /><CardView hidden /></>}</div>
              </PokerTableArtwork>
              <LuxeDealer stage={mpStage} active={Boolean(v.yourTurn)} mood={mpMood} />
            </div>
            <div className="poker-below-table relative">
              <div className="mb-3 flex justify-center"><PokerFullscreen /></div>
              <div className="poker-round-meta flex justify-between text-[10px] font-black uppercase tracking-wider text-white/60"><span>{v.name} · Hand #{g.handNumber} · Blinds {v.blinds}</span><span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" />{v.yourTurn ? "Your turn" : g.handOver ? "Hand over" : "Playing"}</span></div>
              <div className="poker-round-status mt-5 rounded-xl bg-black/35 p-3 text-center text-sm text-emerald-100" role="status">{g.lastAction}</div>
              {g.handOver && <>
                {g.winners.length > 0 && <p className={`poker-winner-banner mt-4 rounded-xl border p-3 text-center text-sm font-black ${mpWinner === "player" ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100" : "border-white/15 bg-white/5 text-white/75"}`}>{mpWinner === "player" ? "🏆 " : ""}{g.winners.map((w) => `${g.players.find((p) => p.id === w.id)?.name ?? w.id} wins ${w.amount.toLocaleString()}`).join(" · ")}</p>}
                {v.reveal && <p className="mt-2 rounded-xl border border-white/10 bg-black/30 p-2.5 font-mono text-[9px] leading-relaxed text-white/45">Provably fair — hand #{v.reveal.hand} · commit {v.commitment?.slice(0, 14)}… · revealed {v.reveal.secret.slice(0, 14)}… · full deck on record</p>}
                {mpSeated && g.handNumber > 0 && <button onClick={mp.nextHand} className="poker-deal-dock mt-4 w-full rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-sm font-black text-black shadow-lg active:scale-95">Deal the next hand</button>}
                {!mpSeated && <button onClick={() => mp.takeSeat()} className="poker-deal-dock mt-4 w-full rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-sm font-black text-black shadow-lg active:scale-95">Take your seat — in from the next hand</button>}
              </>}
              {!g.handOver && v.yourTurn && <div className="poker-action-dock mt-5" role="group" aria-label="Poker actions">
                <div className="flex items-center gap-3"><input aria-label="Raise amount" type="range" min={mpMinRaise} max={mpMaxRaise} step={g.bigBlind} value={Math.min(Math.max(raiseTo, mpMinRaise), mpMaxRaise)} onChange={(e) => setRaiseTo(Number(e.target.value))} className="w-full accent-amber-300" disabled={mpMaxRaise <= mpToCall} /><span className="w-24 text-right font-mono text-xs font-black text-amber-100">{Math.min(Math.max(raiseTo, mpMinRaise), mpMaxRaise).toLocaleString()}</span></div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button onClick={() => mp.act("fold")} className="rounded-xl bg-zinc-800/90 py-4 text-xs font-black text-zinc-100 shadow-lg shadow-black/60 transition hover:bg-zinc-700 active:scale-95">Fold</button>
                  {mpToCall > 0 ? <button onClick={() => mp.act("call")} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-xs font-black text-black shadow-lg shadow-black/50 transition hover:brightness-110 active:scale-95">Call {Math.min(mpToCall, me?.chips ?? 0).toLocaleString()}</button> : <button onClick={() => mp.act("check")} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-xs font-black text-black shadow-lg shadow-black/50 transition hover:brightness-110 active:scale-95">Check</button>}
                  <button onClick={() => mp.act("raise", Math.min(Math.max(raiseTo, mpMinRaise), mpMaxRaise))} disabled={mpMaxRaise <= mpToCall} className="rounded-xl bg-gradient-to-b from-rose-400 to-rose-600 py-4 text-xs font-black text-white shadow-lg shadow-black/50 transition hover:brightness-110 active:scale-95 disabled:opacity-40">{Math.min(Math.max(raiseTo, mpMinRaise), mpMaxRaise) >= mpMaxRaise ? "All-in" : "Raise to"} {Math.min(Math.max(raiseTo, mpMinRaise), mpMaxRaise).toLocaleString()}</button>
                </div>
              </div>}
              {!g.handOver && !v.yourTurn && mpSeated && <p className="poker-thinking-note mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 py-3 text-xs text-white/55"><Bot className="h-4 w-4 text-amber-200" />{g.players[g.turnIndex]?.name ?? "Table"} is thinking…</p>}
              {!g.handOver && !mpSeated && <button onClick={() => mp.takeSeat()} className="poker-deal-dock mt-4 w-full rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-sm font-black text-black shadow-lg active:scale-95">Take your seat — in from the next hand</button>}
            </div>
          </article>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/35"><ShieldCheck className="h-3 w-3" /> Free-play multiplayer — virtual chips only, no cash value. Server deals and validates; every action is on the permanent record.</p>
        </>}
      </div>
    </section>;
  }

  // ── Table screen ──
  const botSlots = game ? game.players.filter((p) => p.isBot) : [];
  return <section id="poker-league" className={`poker-playing-page${gateDismissed ? " poker-gate-dismissed" : ""} min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-3 py-4 pb-28 text-white`}>{!gateDismissed && <div className="poker-landscape-gate" role="status"><span aria-hidden="true">↻</span><h2>Turn your phone sideways for a bigger poker table</h2><p>You can still play in portrait — rotate whenever you're ready for the full table view.</p><button type="button" onClick={() => setGateDismissed(true)}>Continue in portrait</button><button type="button" onClick={leaveTable}>Back to Luxe Lounges</button></div>}<div className="poker-playing-wrap mx-auto max-w-5xl"><header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-3 py-2"><button onClick={() => setLeaveOpen(true)} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-black"><ChevronLeft className="h-4 w-4" />Lobby</button><span className="font-mono text-sm font-black text-amber-100">{chips.toLocaleString()} wallet · {you?.chips.toLocaleString() ?? 0} at table · <span style={{ color: leagueTier.colour }}>{leagueTier.name} {league.xp}XP</span></span><button onClick={() => setEnabled(!enabled)} className="rounded-lg bg-white/10 p-2"><Volume2 className="h-4 w-4" /></button></header><article className="poker-game-article relative mt-4 overflow-hidden rounded-[2rem] border border-amber-200/50 bg-[radial-gradient(ellipse_at_center,#2a2318,#151009_55%,#090604)] p-4 shadow-[0_0_70px_rgba(212,175,55,.22),inset_0_0_140px_rgba(0,0,0,0.5)] sm:p-6"><div className={`poker-surface-frame relative rounded-[2rem] ${winFlash ? "poker-win-flash" : ""} ${tableTheme === "onyx" ? "ring-4 ring-amber-400/50" : tableTheme === "noir" ? "ring-4 ring-zinc-400/50" : ""}`}>
              {winFlash && <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center gap-2 pt-14">{[...Array(6)].map((_, i) => <span key={i} className="poker-chip-fly h-4 w-4 rounded-full border border-amber-200/70 bg-gradient-to-br from-amber-300 to-amber-600" style={{ animationDelay: `${i * 90}ms` }} />)}</div>}
              <PokerTableArtwork pot={game?.pot ?? 0} stage={dealerStage} winner={potWinner}><div className="poker-live-seats pointer-events-none absolute inset-0">{game && game.players.map((p) => {
                const slotIndex = p.isBot ? botSlots.indexOf(p) : 5;
                const slot = SEAT_SLOTS[slotIndex];
                const isYou = !p.isBot;
                const isTurn = !game.handOver && game.players[game.turnIndex]?.id === p.id;
                const isWinner = game.handOver && !p.sittingOut && game.winners.some((w) => w.id === p.id);
                const showCards = !p.isBot || (game.stage === "showdown" && !p.folded && !p.sittingOut);
                return <div key={p.id} onClick={() => p.isBot && setSelectedSeat(p.name)} className={`${isYou ? "poker-seat-you " : ""}pointer-events-auto absolute w-[4.9rem] rounded-2xl border px-1.5 py-1 text-center shadow-2xl backdrop-blur-md transition ${p.sittingOut ? "opacity-30" : p.folded ? "opacity-45" : ""} ${isWinner ? "border-emerald-300 bg-emerald-300/20" : isTurn ? "border-amber-200 bg-amber-300/20 poker-turn-ring" : !p.isBot ? "border-amber-200/70 bg-amber-300/10" : selectedSeat === p.name ? "border-fuchsia-300 bg-fuchsia-300/15" : "border-white/15 bg-black/55"}`} style={{ left: `${slot.px}%`, top: `${isYou ? slot.py + 8 : slot.py}%`, zIndex: 10 + Math.round(slot.py), transform: `translate(-50%,-50%) scale(${(isYou ? Math.min(slot.sc, 0.78) : slot.sc).toFixed(2)})` }}>
                  {!p.isBot ? <label className="block cursor-pointer"><PlayerTurnRing active={isTurn} seconds={seconds} name={p.name}>{avatar ? <img src={avatar} alt="Your avatar" className="h-full w-full object-cover" /> : p.initials}</PlayerTurnRing><input aria-label="Upload demo avatar" type="file" accept="image/*" className="hidden" onChange={(e) => chooseAvatar(e.target.files?.[0])} /></label> : <PlayerTurnRing active={isTurn} seconds={20} name={p.name}>{p.initials}</PlayerTurnRing>}
                  <b className="mt-1 block truncate text-[9px] text-amber-100">{p.name}{!p.sittingOut && game.players[game.dealerIndex]?.id === p.id ? " 🔘" : ""}</b>
                  <small className="text-[8px] text-white/55">{p.sittingOut ? (p.isBot ? "Away" : "Watching") : p.chips.toLocaleString()}{p.allIn ? " · ALL-IN" : ""}</small>
                  {p.bet > 0 && <span className="mt-0.5 inline-block rounded-full bg-amber-300/90 px-1.5 py-px font-mono text-[8px] font-black text-black">bet {p.bet.toLocaleString()}</span>}
                  {p.cards.length === 2 && !p.sittingOut && !isYou && <span className="mt-1 flex justify-center gap-0.5">{p.cards.map((c) => showCards ? <span key={key(c)} className={`flex h-6 w-[1.1rem] items-center justify-center rounded-sm border border-black/20 bg-white font-mono text-[9px] font-black ${c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-zinc-900"}`}>{c.rank}{c.suit}</span> : <span key={key(c)} className="flex h-6 w-[1.1rem] items-center justify-center rounded-sm border border-amber-200/40 bg-gradient-to-br from-amber-900 to-black text-[7px] text-amber-200/70">♛</span>)}</span>}
                </div>;
              })}</div><div className="poker-live-board flex justify-center gap-1">{[0, 1, 2, 3, 4].map((i) => game?.board[i] ? <CardView key={key(game.board[i])} card={game.board[i]} /> : <div key={i} className="h-16 w-11 rounded-lg border border-dashed border-amber-100/30 bg-black/40 sm:h-20 sm:w-14" />)}</div><div className="poker-live-hand flex justify-center gap-2">{you?.cards.length ? you.cards.map((card) => <CardView key={key(card)} card={card} />) : <><CardView hidden /><CardView hidden /></>}</div></PokerTableArtwork>
              <LuxeDealer stage={dealerStage} active={yourTurn} mood={dealerMood} />
            </div><div className="poker-below-table relative"><div className="mb-3 flex justify-center"><PokerFullscreen /></div><div className="poker-round-meta flex justify-between text-[10px] font-black uppercase tracking-wider text-white/60"><span>{activeTable?.name} · Hand #{game?.handNumber ?? 0} · Blinds {activeTable?.blinds}</span><span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" />{yourTurn ? `00:${String(seconds).padStart(2, "0")}` : game?.handOver ? "Hand over" : "Playing"}</span></div><div className="poker-round-status mt-5 rounded-xl bg-black/35 p-3 text-center text-sm text-emerald-100" role="status">{status}</div>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">{feed.slice(0, 3).map((line, i) => <span key={`${line}-${i}`} className={`rounded-full px-2.5 py-1 text-[10px] ${i === 0 ? "bg-amber-300/15 text-amber-100" : "bg-white/5 text-white/40"}`}>{line}</span>)}</div>
            <div className="poker-social-controls mt-3 flex flex-wrap justify-center gap-2">{emotes.map((emote) => <button key={emote} onClick={() => { play("tableKnock"); note(`You to ${selectedSeat}: ${emote}`); }} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold">{emote}</button>)}<button onClick={() => setGiftsOpen((v) => !v)} className="rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">Send gift</button></div>{giftsOpen && <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-amber-200/20 bg-black/40 p-2">{gifts.map((gift) => <button key={gift.name} onClick={() => sendGift(gift)} className="rounded-lg bg-white/10 p-2 text-center text-xs"><span className="block text-lg">{gift.icon}</span><b className="block">{gift.name}</b><small className="text-amber-100">{gift.cost} chips</small></button>)}</div>}
            {game && !game.handOver && yourTurn && <div className="poker-action-dock mt-5" role="group" aria-label="Poker actions">
              <div className="flex items-center gap-3"><input aria-label="Raise amount" type="range" min={minRaiseTo} max={maxRaiseTo} step={activeTable?.bigBlind ?? 50} value={Math.min(Math.max(raiseTo, minRaiseTo), maxRaiseTo)} onChange={(e) => setRaiseTo(Number(e.target.value))} className="w-full accent-amber-300" disabled={maxRaiseTo <= toCall} /><span className="w-24 text-right font-mono text-xs font-black text-amber-100">{Math.min(Math.max(raiseTo, minRaiseTo), maxRaiseTo).toLocaleString()}</span></div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={() => act("fold")} className="rounded-xl bg-zinc-800/90 py-4 text-xs font-black text-zinc-100 shadow-lg shadow-black/60 transition hover:bg-zinc-700 active:scale-95">Fold</button>
                {toCall > 0 ? <button onClick={() => act("call")} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-xs font-black text-black shadow-lg shadow-black/50 transition hover:brightness-110 active:scale-95">Call {Math.min(toCall, you?.chips ?? 0).toLocaleString()}</button> : <button onClick={() => act("check")} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-xs font-black text-black shadow-lg shadow-black/50 transition hover:brightness-110 active:scale-95">Check</button>}
                <button onClick={() => act("raise")} disabled={maxRaiseTo <= toCall} className="rounded-xl bg-gradient-to-b from-rose-400 to-rose-600 py-4 text-xs font-black text-white shadow-lg shadow-black/50 transition hover:brightness-110 active:scale-95 disabled:opacity-40">{raiseTo >= maxRaiseTo ? "All-in" : "Raise to"} {Math.min(Math.max(raiseTo, minRaiseTo), maxRaiseTo).toLocaleString()}</button>
              </div>
            </div>}
            {game && !game.handOver && !yourTurn && <p className="poker-thinking-note mt-5 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 py-3 text-xs text-white/55"><Bot className="h-4 w-4 text-amber-200" />{game.players[game.turnIndex]?.name ?? "Table"} is thinking…</p>}
            {game && !game.handOver && !youSeated && <button onClick={takeSeat} className="poker-deal-dock mt-4 w-full rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-sm font-black text-black shadow-lg active:scale-95">Take your seat — in from the next hand</button>}
            {game?.handOver && <div className="mt-5 grid gap-2">
              {game.winners.length > 0 && <p className={`poker-winner-banner rounded-xl border p-3 text-center text-sm font-black ${potWinner === "player" ? "border-emerald-300/40 bg-emerald-300/15 text-emerald-100" : "border-white/15 bg-white/5 text-white/75"}`}>{potWinner === "player" ? "🏆 " : ""}{game.lastAction}</p>}
              {!youSeated && <button onClick={takeSeat} disabled={Boolean(you && you.chips <= 0)} className="poker-deal-dock rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-sm font-black text-black shadow-lg active:scale-95 disabled:opacity-40">Take your seat</button>}
              {youSeated && <p className="poker-thinking-note flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 py-3 text-xs text-white/55"><Timer className="h-4 w-4 text-amber-200" />Dealer is shuffling — next hand deals automatically.</p>}
              {busted && <button onClick={rebuy} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-4 text-xs font-black text-black shadow-lg active:scale-95">Rebuy {activeTable?.buyIn.toLocaleString()} to stay seated</button>}
              <button onClick={leaveTable} className="poker-leave-btn rounded-xl bg-zinc-800/90 py-3 text-xs font-black text-zinc-100 shadow-lg active:scale-95">Leave table</button>
            </div>}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/35"><ShieldCheck className="h-3 w-3" /> Free-play table — virtual chips have no cash value and cannot be exchanged.</p>
            </div></article>
      <LeagueRacePop pop={racePop} />
      {leagueGlide && <LeagueGlideOverlay event={leagueGlide} onDone={() => setLeagueGlide(null)} />}
      {leaveOpen && <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/70 p-6" role="dialog" aria-modal="true"><div className="w-full max-w-sm rounded-2xl border border-amber-200/30 bg-zinc-950 p-5 text-center"><MessageCircle className="mx-auto h-6 w-6 text-amber-200" /><h3 className="mt-3 font-black text-amber-100">Leave {activeTable?.name}?</h3><p className="mt-2 text-xs text-white/60">Your remaining stack of {you?.chips.toLocaleString() ?? 0} chips returns to your wallet.</p><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setLeaveOpen(false)} className="rounded-xl bg-white/10 py-3 text-xs font-black">Stay</button><button onClick={leaveTable} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-3 text-xs font-black text-black">Leave</button></div></div></div>}
    </div></section>;
};
