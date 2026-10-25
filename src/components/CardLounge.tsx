// Shared Luxe card lounge: lobby carousel + landscape table + weekly league + shared chip wallet.
// Used by Blackjack and 3 Card Brag — identical setup to the Luxe Poker Lounge.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Crown, Gift, Spade, Volume2, VolumeX } from "lucide-react";
import { ensureWeek, leagueXPForHand, tierByIndex, weekEndsIn, weeklyBoard, weeklyCutoffs, recordWeeklyXP } from "../lib/pokerLeague";
import { createBjTable, placeBets, bjAct, bjBotAction, handValue, type BjState } from "../games/blackjack";
import { createBragTable, bragAnteUp, bragAct, bragValue, BRAG_LABELS, type BragState } from "../games/brag";
import { LuxePlayingCard } from "./LuxePlayingCard";

export type LoungeGame = "blackjack" | "brag";

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
const play = () => {};

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
  const [chips, setChips] = useWallet();
  const [screen, setScreen] = useState<"lobby" | "table">("lobby");
  const [table, setTable] = useState<typeof LOUNGE_TABLES[number] | null>(null);
  const [slide, setSlide] = useState(0);
  const [status, setStatus] = useState("Choose a table to sit down.");
  const [muted, setMuted] = useState(false);
  const [bet, setBet] = useState(50);
  const [league, setLeague] = useState(() => ensureWeek());
  const [leagueOpen, setLeagueOpen] = useState(false);
  const [rewardReady, setRewardReady] = useState(() => localStorage.getItem(DAILY_KEY) !== new Date().toDateString());
  const [bj, setBj] = useState<BjState | null>(null);
  const [brag, setBrag] = useState<BragState | null>(null);
  const settledRef = useRef(0);
  const botTimer = useRef<number | null>(null);

  const leagueBoard = useMemo(() => weeklyBoard(league), [league]);
  const leagueTier = tierByIndex(league.tierIndex);
  const yourRank = leagueBoard.findIndex((r) => r.you) + 1;
  const cutoffs = weeklyCutoffs(leagueBoard, league.tierIndex);

  const note = (m: string) => setStatus(m);
  const dailyReward = () => {
    if (!rewardReady) return;
    localStorage.setItem(DAILY_KEY, new Date().toDateString());
    setRewardReady(false);
    setChips((v) => v + 200);
    setLeague(recordWeeklyXP(10));
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
    if (game === "brag" && chips < bet * 2) { note("Brag needs your ante plus a matching play bet — keep at least double the ante in your wallet."); return; }
    // Reserve the full stake the hand could need (blackjack double-down / brag play bet); unused chips return at settle.
    const reserve = bet * 2;
    if (chips < reserve) { note(`This stake needs ${reserve.toLocaleString()} chips in reserve.`); return; }
    setChips((v) => v - reserve);
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
    const won = back > committed;
    if (committed > 0) setLeague(recordWeeklyXP(leagueXPForHand(won, committed > 0)));
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
            <Crown className="h-5 w-5" style={{ color: leagueTier.colour }} /><b className="mt-3 block">{leagueTier.name} League</b><small className="text-white/55">Ends in {weekEndsIn()} · #{yourRank || "—"} of {leagueBoard.length}</small>
          </div>
          <div className="rounded-2xl border border-amber-200/30 bg-amber-300/10 p-4"><Spade className="h-5 w-5 text-amber-200" /><b className="mt-3 block">Same wallet as poker</b><small className="text-white/55">Chips and league XP are shared across all Luxe lounges</small></div>
        </div>

        {/* league board */}
        <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: `${leagueTier.colour}55`, background: "#0007" }}>
          <p className="text-xs text-white/55">{league.tierIndex < 5 ? `Top ${Math.floor(leagueBoard.length / 2)} go up` : "Top division — hold your spot"}{league.tierIndex > 0 ? ` · bottom ${Math.floor(leagueBoard.length / 2)} drop down` : ""} · top half ({cutoffs.promoteXP}+ XP) promotes</p>
          <div className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
            {leagueBoard.slice(0, leagueOpen ? 30 : 10).map((row, i) => {
              const rank = i + 1; const half = Math.floor(leagueBoard.length / 2);
              const zone = league.tierIndex < 5 && rank <= half ? "promote" : league.tierIndex > 0 && rank > leagueBoard.length - half ? "demote" : "";
              return <div key={row.name} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${row.you ? "border-amber-300/70 bg-amber-300/15" : zone === "promote" ? "border-emerald-300/25 bg-emerald-300/5" : zone === "demote" ? "border-rose-300/25 bg-rose-300/5" : "border-white/8 bg-black/25"}`}>
                <span className={`w-7 text-center font-mono text-xs font-black ${zone === "promote" ? "text-emerald-300" : zone === "demote" ? "text-rose-300" : "text-white/40"}`}>{rank}</span>
                <span className="flex-1 text-sm font-bold">{row.name}</span>
                <span className="font-mono text-xs text-white/60">{row.xp} XP</span>
              </div>;
            })}
          </div>
          <button onClick={() => setLeagueOpen(!leagueOpen)} className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 py-2 text-xs font-black">{leagueOpen ? "Show less" : "Show all 30 players"}</button>
        </div>
        {status !== "Choose a table to sit down." && <p className="mt-5 rounded-xl border border-amber-200/20 bg-amber-300/10 p-3 text-sm text-amber-100">{status}</p>}
        <p className="mt-6 text-center text-[10px] text-white/35">Free-play only · No deposits, cash wagering or cash-out · 18+ social play</p>
      </div>
    </section>;
  }

  // ── Table ──
  return <section id={`lounge-${game}`} className="poker-playing-page min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_52%)] px-3 py-4 pb-28 text-white">
    <div className="poker-landscape-gate" role="status"><span aria-hidden="true">↻</span><h2>Turn your phone sideways</h2><p>{meta.title} is played in landscape. Rotate your phone to see the table and controls.</p><button type="button" onClick={leave}>Back to the lobby</button></div>
    <div className="poker-playing-wrap mx-auto max-w-5xl">
      <header className="flex items-center justify-between rounded-2xl border border-amber-200/30 bg-black/35 px-3 py-2">
        <button onClick={leave} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-black"><ChevronLeft className="h-4 w-4" />Lobby</button>
        <span className="font-mono text-sm font-black text-amber-100">{chips.toLocaleString()} wallet · <span style={{ color: leagueTier.colour }}>{leagueTier.name} {league.xp}XP</span></span>
        <button onClick={() => setMuted(!muted)} aria-label={muted ? "Turn sound on" : "Turn sound off"} aria-pressed={muted} className="rounded-lg bg-white/10 p-2">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
      </header>
      <article className="poker-game-article relative mt-4 overflow-hidden rounded-[2rem] border border-amber-200/50 p-4 sm:p-6">
        <div className="poker-surface-frame relative rounded-[2rem]">
          <div className="lounge-table-felt">
            <img src={meta.image} alt="" className="lounge-table-felt__bg" />
            {/* dealer */}
            <div className="lounge-dealer-row">
              <span className="lounge-dealer-tag">Dealer {s && (game === "blackjack" ? (bj?.dealerHoleHidden ? "" : `· ${handValue(bj.dealer).total}`) : brag?.dealerRevealed ? `· ${BRAG_LABELS[bragValue(brag.dealer)[0]]}` : "")}</span>
              <div className="lounge-cards-row">
                {game === "blackjack" && bj?.dealer.map((c, i) => <CardFace key={i} c={c} hidden={bj.dealerHoleHidden && i === 1} />)}
                {game === "brag" && brag?.dealer.map((c, i) => <CardFace key={i} c={c} hidden={!brag.dealerRevealed} />)}
              </div>
            </div>
            {/* seats */}
            <div className="lounge-seats-row">
              {s?.seats.map((p) => {
                const isYou = p.id === "you";
                const cards = p.cards;
                const value = game === "blackjack" ? handValue(cards).total : undefined;
                const label = game === "brag" && cards.length === 3 ? BRAG_LABELS[bragValue(cards)[0]] : undefined;
                const result = (p as { result?: string }).result;
                return <div key={p.id} className={`lounge-seat ${isYou ? "lounge-seat--you" : ""} ${result === "win" || result === "blackjack" ? "lounge-seat--won" : result === "lose" ? "lounge-seat--lost" : ""}`}>
                  <span className="lounge-seat__name">{p.name}</span>
                  <div className="lounge-cards-row">{cards.map((c, i) => <CardFace key={i} c={isYou || phase === "settled" ? c : undefined} hidden={!isYou && phase !== "settled"} />)}</div>
                  <span className="lounge-seat__meta">{isYou && cards.length > 0 ? (value !== undefined ? value : label) : ""} {result ? `· ${result.toUpperCase()}` : ""}</span>
                  <span className="lounge-seat__bet">{(game === "blackjack" ? (p as { bet: number }).bet : (p as { ante: number }).ante) > 0 ? `Bet ${game === "blackjack" ? (p as { bet: number }).bet : (p as { ante: number }).ante}` : ""}</span>
                </div>;
              })}
            </div>
            <p className="lounge-table-status">{s?.lastAction ?? status}</p>
          </div>
        </div>
      </article>

      {/* controls */}
      <div className="poker-below-table mt-4 flex flex-col items-center gap-3">
        {phase === "betting" || phase === "ante" ? <div className="flex items-center gap-3 rounded-2xl border border-amber-200/40 bg-black/50 p-3">
          <input type="range" min={table?.minBet ?? 25} max={Math.max(chips, table?.minBet ?? 25)} step={25} value={bet} onChange={(e) => setBet(Number(e.target.value))} className="w-40 accent-amber-300" />
          <span className="font-mono text-sm font-black text-amber-100">{bet}</span>
          <button onClick={startHand} className="rounded-xl bg-gradient-to-b from-amber-200 to-amber-500 px-5 py-3 text-sm font-black text-black">{game === "blackjack" ? "Deal" : "Ante up"}</button>
        </div> : null}
        {yourTurn ? <div className="flex gap-3 rounded-2xl border border-amber-200/40 bg-black/50 p-3">
          <button onClick={() => setBj((g) => g ? bjAct(g, "you", "hit") : g)} className="rounded-xl bg-gradient-to-b from-emerald-200 to-emerald-500 px-6 py-3 text-sm font-black text-black">Hit</button>
          <button onClick={() => setBj((g) => g ? bjAct(g, "you", "stand") : g)} className="rounded-xl bg-gradient-to-b from-amber-200 to-amber-500 px-6 py-3 text-sm font-black text-black">Stand</button>
          <button onClick={() => setBj((g) => g ? bjAct(g, "you", "double") : g)} disabled={!youSeat || youSeat.cards.length !== 2} className="rounded-xl bg-gradient-to-b from-rose-300 to-rose-500 px-6 py-3 text-sm font-black text-black disabled:opacity-40">Double</button>
        </div> : null}
        {game === "brag" && brag?.phase === "decide" ? <div className="flex gap-3 rounded-2xl border border-amber-200/40 bg-black/50 p-3">
          <button onClick={() => setBrag((g) => g ? bragAct(g, "you", "play") : g)} className="rounded-xl bg-gradient-to-b from-amber-200 to-amber-500 px-6 py-3 text-sm font-black text-black">Play {bet}</button>
          <button onClick={() => setBrag((g) => g ? bragAct(g, "you", "fold") : g)} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black">Fold</button>
        </div> : null}
        {phase === "settled" ? <button onClick={() => { if (game === "blackjack") setBj((g) => g ? { ...g, phase: "betting" } : g); else setBrag((g) => g ? { ...g, phase: "ante" } : g); }} className="rounded-xl bg-gradient-to-b from-amber-200 to-amber-500 px-6 py-3 text-sm font-black text-black">Next hand</button> : null}
        <p className="text-[10px] text-white/40">Free-play chips · No cash value · Same wallet & league as Luxe Poker</p>
      </div>
    </div>
  </section>;
}
