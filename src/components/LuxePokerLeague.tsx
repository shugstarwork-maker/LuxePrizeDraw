import React, { useMemo, useState } from "react";
import { Bot, ChevronRight, Crown, RotateCcw, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { rank: string; value: number; suit: Suit };
type Stage = "pre-flop" | "flop" | "turn" | "river" | "showdown";
type Score = { values: number[]; label: string };
type Action = "check" | "call" | "raise" | "fold";

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const valueByRank: Record<string, number> = Object.fromEntries(ranks.map((rank, index) => [rank, index + 2]));
const boardCount: Record<Stage, number> = { "pre-flop": 0, flop: 3, turn: 4, river: 5, showdown: 5 };
const makeDeck = () => suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit, value: valueByRank[rank] })));
const shuffle = (deck: Card[]) => [...deck].sort(() => Math.random() - 0.5);
const cardKey = (card: Card) => `${card.rank}${card.suit}`;
const isRed = (suit: Suit) => suit === "♥" || suit === "♦";

const getStraightHigh = (values: number[]) => {
  const sorted = [...new Set(values)].sort((a, b) => b - a);
  const withLowAce = sorted.includes(14) ? [...sorted, 1] : sorted;
  for (let index = 0; index <= withLowAce.length - 5; index += 1) if (withLowAce[index] - withLowAce[index + 4] === 4) return withLowAce[index];
  return 0;
};
const evaluate = (cards: Card[]): Score => {
  const counts = new Map<number, number>();
  cards.forEach((card) => counts.set(card.value, (counts.get(card.value) || 0) + 1));
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const sorted = [...new Set(cards.map((card) => card.value))].sort((a, b) => b - a);
  const straightHigh = getStraightHigh(sorted);
  const flush = suits.map((suit) => cards.filter((card) => card.suit === suit).sort((a, b) => b.value - a.value)).find((group) => group.length >= 5);
  const flushStraightHigh = flush ? getStraightHigh(flush.map((card) => card.value)) : 0;
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
const compare = (a: Score, b: Score) => a.values.reduce((result, value, index) => result || value - (b.values[index] || 0), 0);

const CardView: React.FC<{ card?: Card; hidden?: boolean; small?: boolean }> = ({ card, hidden, small }) => (
  <div className={`relative flex ${small ? "h-14 w-10 sm:h-16 sm:w-11" : "h-16 w-11 sm:h-20 sm:w-14"} items-center justify-center rounded-lg border text-lg font-black shadow-md ${hidden ? "border-[#D4AF37]/35 bg-[linear-gradient(135deg,#362103,#0a0805)] text-[#f8d778]" : "border-stone-300 bg-[#faf7ee]"} ${card && isRed(card.suit) ? "text-red-600" : "text-slate-950"}`}>
    {hidden ? <span className="text-xl">✦</span> : card && <><span>{card.rank}<small className="ml-0.5 text-xs">{card.suit}</small></span><span className="absolute bottom-1 right-1 text-[9px] opacity-65">{card.suit}</span></>}
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
  const [handActive, setHandActive] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [raiseSize, setRaiseSize] = useState(100);
  const [handNumber, setHandNumber] = useState(1);
  const [wins, setWins] = useState(0);
  const [status, setStatus] = useState("Choose Deal to begin a private free-play hand.");
  const [history, setHistory] = useState<string[]>(["Table open · 25 / 50 blinds"]);
  const [joined, setJoined] = useState<string | null>(null);
  const playerScore = useMemo(() => playerCards.length === 2 && board.length === 5 ? evaluate([...playerCards, ...board]) : null, [playerCards, board]);
  const addHistory = (message: string) => setHistory((entries) => [message, ...entries].slice(0, 4));
  const setPlayerAction = (message: string) => { setStatus(message); addHistory(message); };

  const startHand = () => {
    if (playerChips < 100 || opponentChips < 100) { setStatus("Reset the table to restore the free-play stack."); return; }
    const nextDeck = shuffle(makeDeck());
    setDeck(nextDeck.slice(4)); setPlayerCards([nextDeck[0], nextDeck[2]]); setOpponentCards([nextDeck[1], nextDeck[3]]);
    setBoard([]); setPot(150); setPlayerChips((chips) => chips - 50); setOpponentChips((chips) => chips - 100);
    setStage("pre-flop"); setRevealed(false); setHandActive(true); setPlayerAction("Hand dealt · Luxe Host posts 100 big blind. Your call is 50.");
  };
  const settle = (nextBoard: Card[], finalPot = pot) => {
    const yours = evaluate([...playerCards, ...nextBoard]); const theirs = evaluate([...opponentCards, ...nextBoard]); const result = compare(yours, theirs);
    setRevealed(true); setHandActive(false); setStage("showdown");
    if (result > 0) { setPlayerChips((chips) => chips + finalPot); setWins((value) => value + 1); setPlayerAction(`Showdown · You win ${finalPot} chips with ${yours.label}.`); }
    else if (result < 0) { setOpponentChips((chips) => chips + finalPot); setPlayerAction(`Showdown · Luxe Host wins ${finalPot} chips with ${theirs.label}.`); }
    else { setPlayerChips((chips) => chips + finalPot / 2); setOpponentChips((chips) => chips + finalPot / 2); setPlayerAction(`Showdown · Split pot with ${yours.label}.`); }
  };
  const advanceStreet = () => {
    const nextVisible = boardCount[stage] === 0 ? 3 : boardCount[stage] + 1;
    const nextBoard = deck.slice(0, nextVisible); setBoard(nextBoard);
    if (nextVisible === 5) { setStage("river"); setPlayerAction("River dealt · Luxe Host checks. Make your final decision."); return; }
    const nextStage: Stage = nextVisible === 3 ? "flop" : "turn";
    setStage(nextStage); setPlayerAction(`${nextStage === "flop" ? "Flop" : "Turn"} dealt · Luxe Host checks.`);
  };
  const takeAction = (action: Action) => {
    if (!handActive) return;
    if (action === "fold") { setOpponentChips((chips) => chips + pot); setRevealed(true); setHandActive(false); setPlayerAction(`You fold · Luxe Host collects ${pot} chips.`); return; }
    const amount = action === "call" ? 50 : action === "raise" ? raiseSize : 0;
    if (amount > 0 && (playerChips < amount || opponentChips < amount)) { setStatus("Both players need enough free-play chips to continue."); return; }
    const hostFolds = action === "raise" && Math.random() < Math.min(0.42, raiseSize / 1300);
    if (hostFolds) { setPlayerChips((chips) => chips + pot); setWins((value) => value + 1); setRevealed(true); setHandActive(false); setPlayerAction(`Luxe Host folds to your ${raiseSize}-chip raise · You collect ${pot} chips.`); return; }
    if (amount) { setPlayerChips((chips) => chips - amount); setOpponentChips((chips) => chips - amount); setPot((value) => value + amount * 2); }
    if (stage === "river") { settle(board, pot + amount * 2); return; }
    advanceStreet();
  };
  const reset = () => { setPlayerChips(2500); setOpponentChips(2500); setDeck([]); setPlayerCards([]); setOpponentCards([]); setBoard([]); setPot(0); setHandActive(false); setRevealed(false); setStage("pre-flop"); setHandNumber(1); setWins(0); setHistory(["Table reset · 25 / 50 blinds"]); setStatus("Table reset. Choose Deal to begin a private free-play hand."); };
  const nextHand = () => { setHandNumber((value) => value + 1); startHand(); };
  const tournaments = [{ name: "Midnight Gold Sit & Go", players: "6 / 9", start: "Starts in 12 min", buyIn: 250 }, { name: "Weekend Luxe Knockout", players: "42 / 64", start: "Tonight, 20:00", buyIn: 500 }];
  const joinTournament = (name: string, buyIn: number) => { if (joined === name) return; if (playerChips < buyIn) { setStatus("You need more free-play chips for this lobby."); return; } setPlayerChips((chips) => chips - buyIn); setJoined(name); setStatus(`Seat reserved for ${name}. This local preview uses no cash or purchasable chips.`); };
  const callAmount = stage === "pre-flop" ? 50 : 0;

  return <section id="poker-league" className="game-arena-stage py-20 sm:py-28 scroll-mt-28"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="arena-surface overflow-hidden rounded-[2rem] border border-[#D4AF37]/30 bg-gradient-to-br from-[#241504] via-[#100b04] to-black p-6 shadow-[0_0_70px_rgba(212,175,55,0.12)] sm:p-10"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-[#F8D778]"><img src="/games/poker-league.svg" alt="" className="h-5 w-5 rounded-md object-cover" /> Private free-play table</div><h2 className="mt-4 text-3xl font-bold sm:text-5xl">Luxe Poker League</h2><p className="mt-2 text-sm text-white/55">Hand #{handNumber} · 25 / 50 blinds · {wins} hands won</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/75 hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Reset table</button></div><p className="mt-3 max-w-3xl text-white/60">A polished Texas Hold’em practice table with virtual chips only. No cash wagering, deposits, or purchasable chips.</p><div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_.7fr]"><article className="rounded-3xl border border-[#D4AF37]/25 bg-[#0b150e]/95 p-4 sm:p-7"><div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/50"><span className="inline-flex items-center gap-2"><Bot className="h-4 w-4 text-[#f8d778]" /> Luxe Host · {opponentChips.toLocaleString()}</span><span className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-[#f8d778]">Pot {pot.toLocaleString()}</span></div><div className="mt-5 flex justify-center gap-3 poker-card-row">{opponentCards.length ? opponentCards.map((card) => <CardView key={cardKey(card)} card={card} hidden={!revealed} />) : <><CardView hidden /><CardView hidden /></>}</div><div className="my-7 rounded-[2rem] border-4 border-[#d4af37]/40 bg-[radial-gradient(ellipse_at_center,_#376c43,_#0b2816)] p-5 shadow-inner sm:p-8"><div className="mb-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[.18em] text-emerald-100/60"><span>Community cards</span><span>{stage.replace("-", " ")}</span></div><div className="flex min-h-20 items-center justify-center gap-2 sm:gap-3">{[0, 1, 2, 3, 4].map((index) => board[index] ? <CardView key={cardKey(board[index])} card={board[index]} /> : <div key={index} className="h-16 w-11 rounded-lg border border-dashed border-white/20 bg-black/20 sm:h-20 sm:w-14" />)}</div></div><div className="flex justify-center gap-3 poker-card-row">{playerCards.length ? playerCards.map((card) => <CardView key={cardKey(card)} card={card} />) : <><CardView hidden /><CardView hidden /></>}</div><div className="mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-white/50"><span>You · {playerChips.toLocaleString()} chips</span><span className="text-[#f8d778]">{playerScore && revealed ? playerScore.label : handActive ? "Your move" : "Ready to deal"}</span></div><p aria-live="polite" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm text-emerald-100"><ShieldCheck className="mr-2 inline h-4 w-4" />{status}</p>{handActive ? <div className="mt-5 space-y-3"><div className="flex items-center justify-between text-xs text-white/55"><span>Raise sizing</span><span className="font-black text-[#f8d778]">{raiseSize} chips</span></div><input aria-label="Raise sizing" type="range" min="100" max="500" step="50" value={raiseSize} onChange={(event) => setRaiseSize(Number(event.target.value))} className="w-full accent-[#D4AF37]" /><div className="grid grid-cols-3 gap-2"><button type="button" onClick={() => takeAction("fold")} className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-2 py-3 text-xs font-bold text-rose-200">Fold</button><button type="button" onClick={() => takeAction(callAmount ? "call" : "check")} className="rounded-xl border border-white/15 bg-white/10 px-2 py-3 text-xs font-bold text-white">{callAmount ? `Call ${callAmount}` : "Check"}</button><button type="button" onClick={() => takeAction("raise")} className="rounded-xl bg-[#D4AF37] px-2 py-3 text-xs font-black text-black">Raise</button></div></div> : <button type="button" onClick={playerCards.length ? nextHand : startHand} className="mt-5 w-full rounded-xl bg-[#D4AF37] px-4 py-3 font-black uppercase tracking-wider text-black hover:bg-[#f4cf5c]">{playerCards.length ? "Deal next hand" : "Deal private hand"}</button>}</article><aside className="space-y-5"><div className="overflow-hidden rounded-3xl border border-[#D4AF37]/25"><img src="/games/poker-league.svg" alt="Premium poker table artwork" className="h-36 w-full object-cover" /><div className="bg-black/45 p-4"><p className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-[#f8d778]" /> Live hand notes</p><div className="mt-3 space-y-2">{history.map((item, index) => <p key={`${item}-${index}`} className="border-l-2 border-[#D4AF37]/50 pl-3 text-xs text-white/55">{item}</p>)}</div></div></div><div className="rounded-3xl border border-white/10 bg-black/40 p-5"><div className="flex items-center gap-2"><Crown className="h-5 w-5 text-[#D4AF37]" /><h3 className="font-bold">Tournament lobby</h3></div><div className="mt-4 space-y-3">{tournaments.map((tournament) => <div key={tournament.name} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="flex justify-between gap-3"><div><h4 className="text-sm font-bold">{tournament.name}</h4><p className="mt-1 text-xs text-white/50">{tournament.players} players · {tournament.start}</p></div><span className="text-xs font-black text-[#F8D778]">{tournament.buyIn} chips</span></div><button type="button" disabled={joined === tournament.name} onClick={() => joinTournament(tournament.name, tournament.buyIn)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-[10px] font-black uppercase tracking-wider disabled:cursor-default disabled:opacity-60">{joined === tournament.name ? "Seat reserved" : "Reserve seat"}<ChevronRight className="h-3.5 w-3.5" /></button></div>)}</div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-black/30 p-4"><Users className="h-4 w-4 text-[#D4AF37]" /><p className="mt-2 text-xl font-black">1,248</p><p className="text-[10px] uppercase text-white/45">Players</p></div><div className="rounded-2xl border border-white/10 bg-black/30 p-4"><Trophy className="h-4 w-4 text-[#D4AF37]" /><p className="mt-2 text-xl font-black">12</p><p className="text-[10px] uppercase text-white/45">Tables</p></div></div></aside></div></div></div></section>;
};
