import React, { useMemo, useState } from "react";
import { ChevronRight, CircleDollarSign, Crown, RotateCcw, ShieldCheck, Trophy, Users } from "lucide-react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { rank: string; value: number; suit: Suit };
type Stage = "pre-flop" | "flop" | "turn" | "river" | "showdown";
type Score = { values: number[]; label: string };

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const valueByRank: Record<string, number> = Object.fromEntries(ranks.map((rank, index) => [rank, index + 2]));
const stageCards: Record<Stage, number> = { "pre-flop": 0, flop: 3, turn: 4, river: 5, showdown: 5 };

const makeDeck = () => suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit, value: valueByRank[rank] })));
const shuffle = (deck: Card[]) => [...deck].sort(() => Math.random() - 0.5);
const isRed = (suit: Suit) => suit === "♥" || suit === "♦";
const cardKey = (card: Card) => `${card.rank}${card.suit}`;

const evaluate = (cards: Card[]): Score => {
  const counts = new Map<number, number>();
  cards.forEach((card) => counts.set(card.value, (counts.get(card.value) || 0) + 1));
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const sorted = [...new Set(cards.map((card) => card.value))].sort((a, b) => b - a);
  const straightHigh = (() => {
    const values = sorted.includes(14) ? [...sorted, 1] : sorted;
    for (let i = 0; i <= values.length - 5; i += 1) if (values[i] - values[i + 4] === 4) return values[i];
    return 0;
  })();
  const flush = suits.map((suit) => cards.filter((card) => card.suit === suit).sort((a, b) => b.value - a.value)).find((group) => group.length >= 5);
  const flushStraightHigh = flush ? evaluate(flush).values[0] : 0;
  if (flush && flushStraightHigh >= 5) return { values: [8, flushStraightHigh], label: flushStraightHigh === 14 ? "Royal flush" : "Straight flush" };
  if (groups[0]?.[1] === 4) return { values: [7, groups[0][0], ...sorted.filter((value) => value !== groups[0][0]).slice(0, 1)], label: "Four of a kind" };
  if (groups[0]?.[1] === 3 && groups[1]?.[1] >= 2) return { values: [6, groups[0][0], groups[1][0]], label: "Full house" };
  if (flush) return { values: [5, ...flush.slice(0, 5).map((card) => card.value)], label: "Flush" };
  if (straightHigh) return { values: [4, straightHigh], label: "Straight" };
  if (groups[0]?.[1] === 3) return { values: [3, groups[0][0], ...sorted.filter((value) => value !== groups[0][0]).slice(0, 2)], label: "Three of a kind" };
  if (groups[0]?.[1] === 2 && groups[1]?.[1] === 2) return { values: [2, groups[0][0], groups[1][0], ...sorted.filter((value) => value !== groups[0][0] && value !== groups[1][0]).slice(0, 1)], label: "Two pair" };
  if (groups[0]?.[1] === 2) return { values: [1, groups[0][0], ...sorted.filter((value) => value !== groups[0][0]).slice(0, 3)], label: "One pair" };
  return { values: [0, ...sorted.slice(0, 5)], label: "High card" };
};

const compare = (a: Score, b: Score) => {
  for (let i = 0; i < Math.max(a.values.length, b.values.length); i += 1) if ((a.values[i] || 0) !== (b.values[i] || 0)) return (a.values[i] || 0) - (b.values[i] || 0);
  return 0;
};

const CardView: React.FC<{ card?: Card; hidden?: boolean }> = ({ card, hidden }) => (
  <div className={`flex h-16 w-11 items-center justify-center rounded-lg border text-lg font-black shadow-md sm:h-20 sm:w-14 ${hidden ? "border-[#D4AF37]/30 bg-gradient-to-br from-[#2b1a04] to-[#080604] text-[#D4AF37]" : "border-white/20 bg-[#faf7ee]"} ${card && isRed(card.suit) ? "text-red-600" : "text-slate-950"}`}>
    {hidden ? "✦" : card && <span>{card.rank}<small className="ml-0.5 text-sm">{card.suit}</small></span>}
  </div>
);

export const LuxePokerLeague: React.FC = () => {
  const [playerChips, setPlayerChips] = useState(2500);
  const [opponentChips, setOpponentChips] = useState(2500);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [opponentCards, setOpponentCards] = useState<Card[]>([]);
  const [board, setBoard] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [stage, setStage] = useState<Stage>("pre-flop");
  const [status, setStatus] = useState("Start a free-play heads-up hand.");
  const [handActive, setHandActive] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [joined, setJoined] = useState<string | null>(null);

  const playerScore = useMemo(() => playerCards.length === 2 && board.length === 5 ? evaluate([...playerCards, ...board]) : null, [playerCards, board]);
  const startHand = () => {
    if (playerChips < 100 || opponentChips < 100) { setStatus("Reset the table to restore virtual chips."); return; }
    const nextDeck = shuffle(makeDeck());
    setDeck(nextDeck.slice(4)); setPlayerCards([nextDeck[0], nextDeck[2]]); setOpponentCards([nextDeck[1], nextDeck[3]]);
    setBoard([]); setPot(200); setPlayerChips((chips) => chips - 100); setOpponentChips((chips) => chips - 100); setStage("pre-flop"); setRevealed(false); setHandActive(true); setStatus("Blinds posted. Your move: check or make a virtual-chip bet.");
  };
  const settle = (nextBoard: Card[]) => {
    const yours = evaluate([...playerCards, ...nextBoard]); const theirs = evaluate([...opponentCards, ...nextBoard]); const result = compare(yours, theirs);
    setRevealed(true); setHandActive(false); setStage("showdown");
    if (result > 0) { setPlayerChips((chips) => chips + pot); setStatus(`You win ${pot} virtual chips with ${yours.label}.`); }
    else if (result < 0) { setOpponentChips((chips) => chips + pot); setStatus(`Luxe Host wins ${pot} virtual chips with ${theirs.label}.`); }
    else { setPlayerChips((chips) => chips + pot / 2); setOpponentChips((chips) => chips + pot / 2); setStatus(`Split pot: both players have ${yours.label}.`); }
  };
  const advance = (action: "check" | "bet" | "fold") => {
    if (!handActive) return;
    if (action === "fold") { setOpponentChips((chips) => chips + pot); setHandActive(false); setRevealed(true); setStatus(`You folded. Luxe Host collects ${pot} virtual chips.`); return; }
    const bet = action === "bet" ? 100 : 0;
    if (bet && (playerChips < bet || opponentChips < bet)) { setStatus("Not enough virtual chips remain to make that bet."); return; }
    const aiCalls = action === "bet" ? Math.random() > 0.22 : true;
    if (!aiCalls) { setPlayerChips((chips) => chips + pot); setHandActive(false); setRevealed(true); setStatus(`Luxe Host folds. You collect ${pot} virtual chips.`); return; }
    if (bet) { setPlayerChips((chips) => chips - bet); setOpponentChips((chips) => chips - bet); setPot((value) => value + bet * 2); }
    const visible = stageCards[stage]; const nextVisible = visible === 0 ? 3 : visible === 3 ? 4 : visible === 4 ? 5 : 5;
    const nextBoard = deck.slice(0, nextVisible); setBoard(nextBoard);
    if (nextVisible === 5) settle(nextBoard); else { const nextStage: Stage = nextVisible === 3 ? "flop" : "turn"; setStage(nextStage); setStatus(`${nextStage === "flop" ? "Flop" : "Turn"} dealt. Luxe Host checks—your move.`); }
  };
  const reset = () => { setPlayerChips(2500); setOpponentChips(2500); setDeck([]); setPlayerCards([]); setOpponentCards([]); setBoard([]); setPot(0); setHandActive(false); setRevealed(false); setStage("pre-flop"); setStatus("Table reset. Start a free-play heads-up hand."); };
  const tournaments = [{ name: "Midnight Gold Sit & Go", players: "6 / 9", start: "Starts in 12 min", buyIn: 250 }, { name: "Weekend Luxe Knockout", players: "42 / 64", start: "Tonight, 20:00", buyIn: 500 }];
  const joinTournament = (name: string, buyIn: number) => { if (playerChips < buyIn) { setStatus("You need more virtual chips for this free-play table."); return; } setPlayerChips((chips) => chips - buyIn); setJoined(name); setStatus(`Seat reserved for ${name}. This is a local free-play preview.`); };

  return <section id="poker-league" className="py-20 sm:py-28 scroll-mt-28"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="rounded-[2rem] overflow-hidden border border-[#D4AF37]/30 bg-gradient-to-br from-[#241504] via-[#100b04] to-black p-6 sm:p-10 shadow-[0_0_70px_rgba(212,175,55,0.12)]"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-[#F8D778]"><img src="/games/poker-league.svg" alt="" className="h-5 w-5 rounded-md object-cover" /> Free-play only</div><h2 className="mt-4 text-3xl sm:text-5xl font-bold">Luxe Poker League</h2></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/75 hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Reset table</button></div><p className="mt-3 max-w-3xl text-white/60">Heads-up Texas Hold’em with virtual chips, local opponent actions and hand resolution. No cash wagering, deposits or purchasable chips.</p><div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><article className="rounded-3xl border border-[#D4AF37]/25 bg-[#0b150e] p-4 sm:p-7"><div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/50"><span>Luxe Host · {opponentChips.toLocaleString()} chips</span><span>Pot {pot.toLocaleString()}</span></div><div className="mt-5 flex justify-center gap-3">{opponentCards.length ? opponentCards.map((card) => <CardView key={cardKey(card)} card={card} hidden={!revealed} />) : <><CardView hidden /><CardView hidden /></>}</div><div className="my-8 rounded-[2rem] border-4 border-[#d4af37]/40 bg-[radial-gradient(ellipse_at_center,_#325d3b,_#0b2816)] p-5 sm:p-8"><div className="flex min-h-20 items-center justify-center gap-2 sm:gap-3">{[0, 1, 2, 3, 4].map((index) => board[index] ? <CardView key={cardKey(board[index])} card={board[index]} /> : <div key={index} className="h-16 w-11 rounded-lg border border-dashed border-white/20 bg-black/20 sm:h-20 sm:w-14" />)}</div></div><div className="flex justify-center gap-3">{playerCards.length ? playerCards.map((card) => <CardView key={cardKey(card)} card={card} />) : <><CardView hidden /><CardView hidden /></>}</div><div className="mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/50"><span>You · {playerChips.toLocaleString()} chips</span><span>{playerScore ? playerScore.label : stage.replace("-", " ")}</span></div><p aria-live="polite" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100"><ShieldCheck className="mr-2 inline h-4 w-4" />{status}</p><div className="mt-5 grid grid-cols-3 gap-2">{!handActive ? <button type="button" onClick={startHand} className="col-span-3 rounded-xl bg-[#D4AF37] px-4 py-3 font-black uppercase tracking-wider text-black hover:bg-[#f4cf5c]">{playerCards.length ? "Deal next hand" : "Start hand"}</button> : <><button type="button" onClick={() => advance("fold")} className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-3 text-xs font-bold text-rose-200 hover:bg-rose-400/20">Fold</button><button type="button" onClick={() => advance("check")} className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-bold text-white hover:bg-white/20">Check</button><button type="button" onClick={() => advance("bet")} className="rounded-xl bg-[#D4AF37] px-3 py-3 text-xs font-black text-black hover:bg-[#f4cf5c]">Bet 100</button></>}</div></article><aside className="space-y-5"><img src="/games/poker-league.svg" alt="Premium poker-table artwork" className="h-44 w-full rounded-3xl border border-[#D4AF37]/25 object-cover shadow-xl" /><div className="rounded-3xl border border-white/10 bg-black/40 p-5"><div className="flex items-center gap-2"><Crown className="h-5 w-5 text-[#D4AF37]" /><h3 className="font-bold">Tournament lobby</h3></div><div className="mt-4 space-y-3">{tournaments.map((tournament) => <div key={tournament.name} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="flex justify-between gap-3"><div><h4 className="text-sm font-bold">{tournament.name}</h4><p className="mt-1 text-xs text-white/50">{tournament.players} players · {tournament.start}</p></div><span className="text-xs font-black text-[#F8D778]">{tournament.buyIn} chips</span></div><button type="button" onClick={() => joinTournament(tournament.name, tournament.buyIn)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-white/20">{joined === tournament.name ? "Seat reserved" : "Reserve seat"}<ChevronRight className="h-3.5 w-3.5" /></button></div>)}</div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-black/30 p-4"><Users className="h-4 w-4 text-[#D4AF37]" /><p className="mt-2 text-xl font-black">1,248</p><p className="text-[10px] uppercase text-white/45">Players</p></div><div className="rounded-2xl border border-white/10 bg-black/30 p-4"><Trophy className="h-4 w-4 text-[#D4AF37]" /><p className="mt-2 text-xl font-black">12</p><p className="text-[10px] uppercase text-white/45">Tables</p></div></div></aside></div></div></div></section>;
};
