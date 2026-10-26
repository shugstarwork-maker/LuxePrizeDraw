// Shared Luxe card lounge: lobby carousel + landscape table + weekly league + shared chip wallet.
// Used by Blackjack and 3 Card Brag — identical setup to the Luxe Poker Lounge.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Crown, Gift, Spade, Volume2, VolumeX } from "lucide-react";
import { weekEndsIn } from "../lib/pokerLeague";
import { gameLeagueState, recordGameResult } from "../lib/gameLeagues";
import { submitWorldResult } from "../lib/worldRanking";
import { LEAGUE_TIERS } from "../lib/pokerLeague";
import { createBjTable, placeBets, bjAct, bjBotAction, handValue, type BjState } from "../games/blackjack";
import { createBragTable, bragAnteUp, bragAct, bragValue, BRAG_LABELS, type BragState } from "../games/brag";
import { LuxePlayingCard } from "./LuxePlayingCard";
import { bumpStat } from "../lib/achievements";
import { useAudio } from "../audio/AudioProvider";
import { CasinoRulesSheet } from "./CasinoRulesSheet";

export type LoungeGame = "blackjack" | "brag";

/** Stake after tapping a chip: the first tap on a fresh minimum stake replaces it when
 *  the chip is at least the minimum; otherwise chips add. Always within [min, max]. */
export function nextStake(current: number, chip: number, min: number, max: number): number {
  const next = current === min && chip >= min && chip !== current ? chip : current + chip;
  return Math.min(max, Math.max(min, next));
}

const GAME_META: Record<LoungeGame, { title: string; tagline: string; minBetLabel: string; image: string }> = {
  blackjack: { title: "Luxe Blackjack", tagline: "Beat the dealer to 21 — blackjack pays 3:2.", minBetLabel: "Min bet", image: "/games/blackjack-card.png" },
  brag: { title: "3 Card Brag", tagline: "The British classic — prial, running flush, run.", minBetLabel: "Ante", image: "/games/brag-card.png" },
};

const LOUNGE_TABLES = [
  { name: "Velvet Table", minBet: 25, bots: 4, note: "Relaxed pace" },
  { name: "Onyx Table", minBet: 50, bots: 5, note: "Full six seats" },
  { name: "Gilded Table", minBet: 100, bots: 5, note: "High stakes" },
];

const CHIPS_KEY = "luxe-demo-poker-chips";
const DAILY_KEY = "luxe-demo-daily-chips";

function useWallet() {
  const [chips, setChips] = useState(() => Number(localStorage.getItem(CHIPS_KEY)) || 1000);
  useEffect(() => { localStorage.setItem(CHIPS_KEY, String(chips)); }, [chips]);
  return [chips, setChips] as const;
}

const CardFace: React.FC<{ c?: { rank: string; suit: string }; hidden?: boolean }> = ({ c, hidden }) => {
  if (hidden || !c) return <span className="lounge-card lounge-card--back" aria-label="Face-down card">♛</span>;
  const red = c.suit === "♥" || c.suit === "♦" || c.suit === "hearts" || c.suit === "diamonds";
  const suitGlyph: Record<string, string> = { "♠": "♠", "♥": "♥", "♦": "♦", "♣": "♣", spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" };
  return <span className={`lounge-card ${red ? "lounge-card--red" : ""}`}><b>{c.rank}</b><i>{suitGlyph[c.suit] ?? c.suit}</i></span>;
};

export function CardLounge({ game }: { game: LoungeGame }) {
  const meta = GAME_META[game];
  const audio = useAudio();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [chips, setChips] = useWallet();
  const [screen, setScreen] = useState<"lobby" | "table">("lobby");
  const [table, setTable] = useState<typeof LOUNGE_TABLES[number] | null>(null);
  const [slide, setSlide] = useState(0);
  const [status, setStatus] = useState("Choose a table to sit down.");
  const [muted, setMuted] = useState(false);
  const sfx = (e: Parameters<typeof audio.play>[0]) => { if (!muted) audio.play(e); };
  const [bet, setBet] = useState(50);
  const [league, setLeague] = useState(() => gameLeagueState(game));
  const [rewardReady, setRewardReady] = useState(() => localStorage.getItem(DAILY_KEY) !== new Date().toDateString());
  const [bj, setBj] = useState<BjState | null>(null);
  const [brag, setBrag] = useState<BragState | null>(null);
  const settledRef = useRef(0);
  const botTimer = useRef<number | null>(null);

  const leagueTier = league.tier;

  const note = (m: string) => setStatus(m);
  const dailyReward = () => {
    if (!rewardReady) return;
    localStorage.setItem(DAILY_KEY, new Date().toDateString());
    setRewardReady(false);
    setChips((v) => v + 200);
    note("Daily sign-in: 200 chips. Free-play only, no cash value.");
  };

  const join = (t: typeof LOUNGE_TABLES[number]) => {
    if (chips < t.minBet) { note(`${t.name} needs at least ${t.minBet} chips. Collect daily chips below.`); return; }
    setTable(t); setBet(t.minBet); setScreen("table"); settledRef.current = 0;
    if (game === "blackjack") setBj(createBjTable({ playerChips: 0, botCount: t.bots, botChips: 1000, minBet: t.minBet }));
    else setBrag(createBragTable({ playerChips: 0, botCount: t.bots, botChips: 1000, minAnte: t.minBet }));
    note(`Welcome to the ${t.name}. Place your ${meta.minBetLabel.toLowerCase()} to start.`);
  };
  const leave = () => {
    // any chips still committed at the table are already in the wallet flow; settled hands auto-return
    setBj(null); setBrag(null); setTable(null); setScreen("lobby");
    note("You left the table.");
  };

  // deal / settle flows
  const startHand = () => {
    if (!table) return;
    if (chips < bet) { note("Not enough chips for that bet — lower it or collect daily chips."); return; }
    if (bet > table.minBet * 10) { note(`The ${table.name} maximum is ${(table.minBet * 10).toLocaleString()} chips.`); return; }
    if (bet < table.minBet) { note(`The ${table.name} minimum is ${table.minBet.toLocaleString()} chips.`); return; }
    if (game === "brag" && chips < bet * 2) { note("Brag needs your ante plus a matching play bet — keep at least double the ante in your wallet."); return; }
    // Reserve the full stake the hand could need (blackjack double-down / brag play bet); unused chips return at settle.
    const reserve = bet * 2;
    if (chips < reserve) { note(`This stake needs ${reserve.toLocaleString()} chips in reserve.`); return; }
    setChips((v) => v - reserve);
    sfx("chipDrop"); window.setTimeout(() => sfx("cardDeal"), 260);
    if (game === "blackjack" && bj) {
      const s = placeBets({ ...bj, seats: bj.seats.map((p) => p.id === "you" ? { ...p, chips: reserve } : p) }, bet);
      setBj(s);
    } else if (game === "brag" && brag) {
      const s = bragAnteUp({ ...brag, seats: brag.seats.map((p) => p.id === "you" ? { ...p, chips: reserve } : p) }, bet);
      setBrag(s);
    }
  };

  // blackjack bot turns
  useEffect(() => {
    if (game !== "blackjack" || !bj || bj.phase !== "playing" || bj.turnSeat < 0) return;
    const seat = bj.seats[bj.turnSeat];
    if (!seat.isBot) return;
    botTimer.current = window.setTimeout(() => setBj((g) => (g ? bjAct(g, seat.id, bjBotAction(g, seat)) : g)), 700 + Math.random() * 700);
    return () => { if (botTimer.current) window.clearTimeout(botTimer.current); };
  }, [game, bj]);

  // settle: pay winnings to wallet, record league XP
  useEffect(() => {
    const s = game === "blackjack" ? bj : brag;
    if (!s || (game === "blackjack" ? bj?.phase : brag?.phase) !== "settled") return;
    if (settledRef.current === s.handNumber) return;
    settledRef.current = s.handNumber;
    const you = s.seats.find((p) => p.id === "you");
    if (!you) return;
    const committed = game === "blackjack" ? (you as { bet: number }).bet : (you as { ante: number }).ante + (you as { playBet: number }).playBet;
    const back = you.chips; // engine returns winnings to seat chips
    setChips((v) => v + back);
    // Use the engine's result: returned chips include the unused reserve, so comparing
    // them with the stake would count a push as a win.
    const result = (you as { result?: string }).result;
    const won = result === "win" || result === "blackjack";
    if (committed > 0) sfx(won ? "coinWin" : result === "push" ? "notification" : "error");
    if (committed > 0) {
      if (game === "blackjack") {
        if (won) bumpStat("bjHandsWon");
        if ((you as { blackjack?: boolean }).blackjack) bumpStat("bjNaturals"); // natural, even if it pushes
      } else {
        if (won) bumpStat("bragHandsWon");
        const cards = (you as { cards?: Parameters<typeof bragValue>[0] }).cards;
        if (cards?.length === 3 && bragValue(cards)[0] === 5) bumpStat("bragPrials"); // 5 = prial
      }
    }
    if (committed > 0) {
      setLeague(recordGameResult(game, won ? "win" : "loss"));
      void submitWorldResult(game, won ? "win" : "loss");
    }
    note(s.lastAction);
    // reset seat chips so next hand re-seeds from wallet
    if (game === "blackjack") setBj((g) => g ? { ...g, seats: g.seats.map((p) => p.id === "you" ? { ...p, chips: 0 } : p) } : g);
    else setBrag((g) => g ? { ...g, seats: g.seats.map((p) => p.id === "you" ? { ...p, chips: 0 } : p) } : g);
  }, [game, bj?.phase, brag?.phase, bj?.handNumber, brag?.handNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // landscape full-bleed, like the poker lounge
  useEffect(() => {
    if (screen !== "table") return;
    const page = document.getElementById(`lounge-${game}`);
    if (!page) return;
    const mq = window.matchMedia("(orientation: landscape)");
    const apply = () => {
      page.classList.toggle("poker-fullscreen-sim", mq.matches);
      if (mq.matches) {
        const h = Math.max(window.innerHeight, document.documentElement.clientHeight, window.screen.height, window.screen.availHeight, window.visualViewport?.height ?? 0);
        const w = Math.max(window.innerWidth, document.documentElement.clientWidth, window.screen.width, window.screen.availWidth, window.visualViewport?.width ?? 0);
        page.style.height = `${h}px`; page.style.width = `${w}px`; page.style.top = "0"; page.style.left = "0";
      } else { page.style.height = ""; page.style.width = ""; }
    };
    apply();
    mq.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    return () => { mq.removeEventListener("change", apply); window.removeEventListener("resize", apply); window.visualViewport?.removeEventListener("resize", apply); page.classList.remove("poker-fullscreen-sim"); page.style.height = ""; page.style.width = ""; };
  }, [screen, game]);

  const s = game === "blackjack" ? bj : brag;
  const youSeat = s?.seats.find((p) => p.id === "you");
  const phase = game === "blackjack" ? bj?.phase : brag?.phase;
  const yourTurn = game === "blackjack" && bj?.phase === "playing" && bj.turnSeat >= 0 && bj.seats[bj.turnSeat].id === "you";

  // ── Lobby ──
  if (screen === "lobby") {
    const t = LOUNGE_TABLES[slide];
    return <section className="min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-3 py-4 pb-28 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-3 py-2">
          <span className="inline-flex items-center gap-2 text-sm font-black text-amber-100"><Spade className="h-4 w-4 text-amber-300" />{meta.title}</span>
          <span className="font-mono text-sm font-black text-amber-100">{chips.toLocaleString()} chips · <span style={{ color: leagueTier.colour }}>{leagueTier.name}</span></span>
          <button onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={muted} className="rounded-lg bg-white/10 p-2">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
        </header>

        <div className="lounge-carousel-card mt-5">
          <div className="lounge-carousel-card__top"><span>Featured table</span><span>6 seats</span></div>
          <div className="lounge-carousel-card__art">
            <img src={meta.image} alt={`${meta.title} table artwork`} loading="lazy" />
            <span className="lounge-carousel-card__pill">Free-play chips</span>
          </div>
          <div className="lounge-carousel-card__copy">
            <h1>{meta.title}</h1>
            <p>{meta.tagline}</p>
            <button onClick={() => join(t)} className="lounge-carousel-card__play">▶ Play now</button>
          </div>
          <button aria-label="Previous table" className="lounge-carousel-card__arrow lounge-carousel-card__arrow--l" onClick={() => setSlide((v) => (v + LOUNGE_TABLES.length - 1) % LOUNGE_TABLES.length)}><ChevronLeft /></button>
          <button aria-label="Next table" className="lounge-carousel-card__arrow lounge-carousel-card__arrow--r" onClick={() => setSlide((v) => (v + 1) % LOUNGE_TABLES.length)}><ChevronRight /></button>
          <div className="lounge-carousel-card__dots">{LOUNGE_TABLES.map((x, i) => <button key={x.name} aria-label={x.name} onClick={() => setSlide(i)} className={i === slide ? "on" : ""} />)}</div>
        </div>
        <p className="mt-2 text-center text-xs font-black text-amber-100">{t.name} · {meta.minBetLabel} {t.minBet} · {t.note}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <button onClick={dailyReward} disabled={!rewardReady} className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-left disabled:opacity-40"><Gift className="h-5 w-5 text-emerald-200" /><b className="mt-3 block">{rewardReady ? "Daily sign-in: 200 chips" : "Daily chips claimed"}</b><small className="text-white/55">200 free-play chips every day</small></button>
          <div className="rounded-2xl border p-4" style={{ borderColor: `${leagueTier.colour}55`, background: `${leagueTier.glow}` }}>
            <Crown className="h-5 w-5" style={{ color: leagueTier.colour }} /><b className="mt-3 block">{leagueTier.name} League</b><small className="text-white/55">Ends in {weekEndsIn()} · {league.weekXP} XP this week</small>
          </div>
          <div className="rounded-2xl border border-amber-200/30 bg-amber-300/10 p-4"><Spade className="h-5 w-5 text-amber-200" /><b className="mt-3 block">Same wallet as poker</b><small className="text-white/55">Chips and league XP are shared across all Luxe lounges</small></div>
        </div>

        <p className="mt-6 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/60">{leagueTier.name} League · {league.weekXP} XP this week · {league.games} games · {league.wins} wins{league.tierIndex < LEAGUE_TIERS.length - 1 ? ` · next league at ${league.nextAt} XP` : ""}. Only your own games count here.</p>
        {status !== "Choose a table to sit down." && <p className="mt-5 rounded-xl border border-amber-200/20 bg-amber-300/10 p-3 text-sm text-amber-100">{status}</p>}
        <p className="mt-6 text-center text-[10px] text-white/35">Free-play only · No deposits, cash wagering or cash-out · 18+ social play</p>
      </div>
    </section>;
  }

  // ── Table ──
  // Seats sit on the lower arc of the table; you take the centre slot, bots fill outward.
  const seatOrder = [3, 2, 4, 1, 5, 0, 6];
  const seatPos = (slot: number) => { const a = (170 - slot * (160 / 6)) * Math.PI / 180; return { left: `${50 + 44 * Math.cos(a)}%`, top: `${20 + 52 * Math.sin(a)}%` }; };
  const maxBet = (table?.minBet ?? 25) * 10;
  const chipValues = [25, 50, 100, 250].filter((v) => v <= maxBet);
  const dealerTotal = game === "blackjack" ? (bj && bj.dealer.length ? (bj.dealerHoleHidden ? null : handValue(bj.dealer).total) : null) : null;
  const dealerLabel = game === "brag" && brag?.dealerRevealed && brag.dealer.length === 3 ? BRAG_LABELS[bragValue(brag.dealer)[0]] : null;
  const resultLabel: Record<string, string> = { win: "Win", lose: "Lose", push: "Push", blackjack: "Blackjack!" };
  return <section id={`lounge-${game}`} className={`casino-scene casino-scene--${game} poker-playing-page min-h-screen text-white`}>
    <div className="poker-landscape-gate" role="status"><span aria-hidden="true">↻</span><h2>Turn your phone sideways</h2><p>{meta.title} is played in landscape. Rotate your phone to see the table and controls.</p><button type="button" onClick={leave}>Back to lobby</button><button type="button" className="poker-gate-play" onClick={(e) => { e.currentTarget.closest(".poker-playing-page")?.classList.add("poker-gate-dismissed"); }}>Play in portrait anyway</button></div>
    <header className="casino-hud">
      <button onClick={leave} className="casino-hud__btn"><ChevronLeft className="h-4 w-4" />Lobby</button>
      <span className="casino-hud__title">{meta.title} · {table?.name}</span>
      <span className="casino-hud__wallet">{chips.toLocaleString()} <small>chips</small> · <span style={{ color: leagueTier.colour }}>{leagueTier.name}</span></span>
      <button onClick={() => setRulesOpen(true)} className="casino-hud__btn"><BookOpen className="h-4 w-4" />Rules</button>
      <button onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={muted} className="casino-hud__btn">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
    </header>

    <div className="casino-table">
      <div className="casino-felt">
        <svg className="casino-felt__print" viewBox="0 0 1000 420" aria-hidden="true">
          <defs><path id={`arc-${game}`} d="M 170 150 Q 500 330 830 150" /></defs>
          <text><textPath href={`#arc-${game}`} startOffset="50%" textAnchor="middle">{game === "blackjack" ? "BLACKJACK PAYS 3 TO 2" : "PRIAL · RUNNING FLUSH · RUN · FLUSH · PAIR"}</textPath></text>
          <text x="500" y="282" textAnchor="middle" className="casino-felt__sub">{game === "blackjack" ? "Dealer stands on all 17s · Double on any two cards" : "Dealer qualifies with Queen high · Ante bonus on prial, running flush & run"}</text>
        </svg>
        {game === "blackjack" && <span className="casino-shoe" aria-hidden="true" />}
        <span className="casino-tray" aria-hidden="true">{[...Array(8)].map((_, i) => <i key={i} />)}</span>

        <div className="casino-dealer">
          <span className="casino-dealer__tag">Dealer{dealerTotal !== null ? ` · ${dealerTotal}` : ""}{dealerLabel ? ` · ${dealerLabel}` : ""}</span>
          <div className="casino-cards">
            {game === "blackjack" && bj?.dealer.map((c, i) => <span key={`${bj.handNumber}-d${i}`} className="casino-card-slot" style={{ ["--deal" as string]: i * 6 + 5 }}><CardFace c={c} hidden={bj.dealerHoleHidden && i === 1} /></span>)}
            {game === "brag" && brag?.dealer.map((c, i) => <span key={`${brag.handNumber}-d${i}`} className="casino-card-slot" style={{ ["--deal" as string]: i * 6 + 5 }}><CardFace c={c} hidden={!brag.dealerRevealed} /></span>)}
          </div>
        </div>

        {s?.seats.map((p, order) => {
          const isYou = p.id === "you";
          const value = game === "blackjack" && p.cards.length ? handValue(p.cards).total : undefined;
          const label = game === "brag" && p.cards.length === 3 && (isYou || phase === "settled") ? BRAG_LABELS[bragValue(p.cards)[0]] : undefined;
          const result = (p as { result?: string }).result;
          const stake = game === "blackjack" ? (p as { bet: number }).bet : (p as { ante: number }).ante + (p as { playBet: number }).playBet;
          const turn = game === "blackjack" && bj?.phase === "playing" && bj.seats[bj.turnSeat]?.id === p.id;
          return <div key={p.id} className={`casino-seat${isYou ? " casino-seat--you" : ""}${turn ? " casino-seat--turn" : ""}${result ? ` casino-seat--${result}` : ""}`} style={seatPos(seatOrder[order] ?? order)}>
            <div className="casino-cards">{p.cards.map((c, i) => <span key={`${s.handNumber}-${p.id}-${i}`} className="casino-card-slot" style={{ ["--deal" as string]: i * 6 + order }}><CardFace c={isYou || phase === "settled" ? c : undefined} hidden={!isYou && phase !== "settled"} /></span>)}</div>
            {stake > 0 && <span className="casino-seat__stake"><i aria-hidden="true" />{stake.toLocaleString()}</span>}
            <span className="casino-seat__plate"><b>{isYou ? "You" : p.name}</b>{(value !== undefined && (isYou || phase === "settled")) ? <em>{value}</em> : label ? <em>{label}</em> : null}</span>
            {result && <span className="casino-seat__result">{resultLabel[result] ?? result}</span>}
          </div>;
        })}
        <p className="casino-status" role="status">{s?.lastAction ?? status}</p>
      </div>
    </div>

    <div className="casino-dock" role="group" aria-label={`${meta.title} actions`}>
      {phase === "betting" || phase === "ante" ? <>
        <div className="casino-chips" role="group" aria-label="Choose your stake">
          {chipValues.map((v) => <button key={v} type="button" className={`casino-chip casino-chip--${v}`} onClick={() => { sfx("chipStack"); setBet((b) => nextStake(b, v, table?.minBet ?? 25, maxBet)); }} aria-label={`Add ${v}`}>{v}</button>)}
          <button type="button" className="casino-dock__ghost" onClick={() => setBet(table?.minBet ?? 25)}>Reset</button>
        </div>
        <span className="casino-dock__stake">{game === "blackjack" ? "Bet" : "Ante"} <b>{bet.toLocaleString()}</b><small>max {maxBet.toLocaleString()}</small></span>
        <button onClick={startHand} className="casino-dock__primary">{game === "blackjack" ? "Deal" : "Ante up"}</button>
      </> : null}
      {yourTurn ? <>
        <button onClick={() => { sfx("cardDeal"); setBj((g) => g ? bjAct(g, "you", "hit") : g); }} className="casino-dock__primary casino-dock__primary--green">Hit</button>
        <button onClick={() => { sfx("button"); setBj((g) => g ? bjAct(g, "you", "stand") : g); }} className="casino-dock__primary">Stand</button>
        <button onClick={() => { sfx("chipDrop"); setBj((g) => g ? bjAct(g, "you", "double") : g); }} disabled={!youSeat || youSeat.cards.length !== 2} className="casino-dock__primary casino-dock__primary--rose">Double</button>
      </> : null}
      {game === "brag" && brag?.phase === "decide" ? <>
        <button onClick={() => { sfx("chipDrop"); setBrag((g) => g ? bragAct(g, "you", "play") : g); }} className="casino-dock__primary">Play {bet.toLocaleString()}</button>
        <button onClick={() => { sfx("button"); setBrag((g) => g ? bragAct(g, "you", "fold") : g); }} className="casino-dock__ghost">Fold</button>
      </> : null}
      {game === "blackjack" && bj && (bj.phase === "playing" || bj.phase === "dealer") && !yourTurn ? <span className="casino-dock__wait">Dealer is playing…</span> : null}
      {phase === "settled" ? <button onClick={() => { sfx("button"); if (game === "blackjack") setBj((g) => g ? { ...g, phase: "betting" } : g); else setBrag((g) => g ? { ...g, phase: "ante" } : g); }} className="casino-dock__primary">Next hand</button> : null}
    </div>
    <p className="casino-footnote">Free-play chips · No cash value · Same wallet &amp; league as Luxe Poker · <button type="button" onClick={() => setRulesOpen(true)} className="underline underline-offset-2">Rules &amp; fair play</button></p>
    {rulesOpen && <CasinoRulesSheet game={game} onClose={() => setRulesOpen(false)} />}
  </section>;
}
