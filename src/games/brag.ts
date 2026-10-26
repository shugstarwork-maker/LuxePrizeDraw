// Luxe 3 Card Brag — the British classic, casino style: ante, play or fold vs the dealer.
// Dealer qualifies with Queen-high or better. Brag rankings: prial > running flush > run > flush > pair > high.
import { POKER_RANKS, POKER_SUITS, type PokerCard } from "../lib/poker";
import { secureShuffle } from "../lib/secureRandom";

export type BragCard = PokerCard;
export type BragPhase = "ante" | "decide" | "settled";

export type BragSeat = {
  id: string; name: string; initials: string; isBot: boolean;
  chips: number; ante: number; playBet: number;
  cards: BragCard[]; folded: boolean;
  result?: "win" | "lose" | "push";
};

export type BragState = {
  seats: BragSeat[];
  dealer: BragCard[];
  dealerRevealed: boolean;
  deck: BragCard[];
  phase: BragPhase;
  turnSeat: number;
  handNumber: number;
  lastAction: string;
  minAnte: number;
};

const BRAG_BOTS = ["Amelia K.", "Marcus B.", "Ruby C.", "Theo M.", "Sofia L."];
export const initialsOfBrag = (name: string) => name.split(/[\s.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function shuffledDeck(): BragCard[] {
  const d = POKER_SUITS.flatMap((suit) => POKER_RANKS.map((rank, index) => ({ rank, suit, value: index + 2 })));
  secureShuffle(d);
  return d;
}

// Brag hand value — returns [category, ...tiebreakers], higher is better.
// Aces high; best run is A-2-3, then A-K-Q. Best prial is 3-3-3, then A-A-A.
export function bragValue(cards: BragCard[]): number[] {
  const vals = cards.map((c) => c.value).sort((a, b) => b - a); // 14 = ace
  const flush = cards.every((c) => c.suit === cards[0].suit);
  const isPrial = vals[0] === vals[1] && vals[1] === vals[2];
  const uniq = new Set(vals);
  let run = false, runHigh = vals[0];
  if (uniq.size === 3) {
    if (vals[0] - vals[2] === 2) run = true; // any three consecutive (A-2-3 included via 14,3,2? no: 14-2=12)
    if (vals[0] === 14 && vals[1] === 3 && vals[2] === 2) { run = true; runHigh = 15; } // A-2-3 beats A-K-Q
  }
  if (isPrial) return [5, vals[0] === 3 ? 15 : vals[0]]; // prial of threes top
  if (run && flush) return [4, runHigh, vals[1], vals[2]];
  if (run) return [3, runHigh, vals[1], vals[2]];
  if (flush) return [2, ...vals];
  if (vals[0] === vals[1] || vals[1] === vals[2]) {
    const pair = vals[0] === vals[1] ? vals[0] : vals[1];
    const kicker = vals[0] === vals[1] ? vals[2] : vals[0];
    return [1, pair, kicker];
  }
  return [0, ...vals];
}

export const BRAG_LABELS = ["High card", "Pair", "Flush", "Run", "Running flush", "Prial"];
const cmp = (a: number[], b: number[]) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] ?? 0) - (b[i] ?? 0); if (d) return d; } return 0; };

export function createBragTable(opts: { playerChips: number; botCount: number; botChips: number; minAnte: number }): BragState {
  const seats: BragSeat[] = [
    { id: "you", name: "You", initials: "YOU", isBot: false, chips: opts.playerChips, ante: 0, playBet: 0, cards: [], folded: false },
    ...BRAG_BOTS.slice(0, Math.max(0, Math.min(5, opts.botCount))).map((name, i) => ({ id: `bot-${i}`, name, initials: initialsOfBrag(name), isBot: true, chips: opts.botChips, ante: 0, playBet: 0, cards: [], folded: false })),
  ];
  return { seats, dealer: [], dealerRevealed: false, deck: [], phase: "ante", turnSeat: -1, handNumber: 0, lastAction: "Place your ante to get three cards.", minAnte: opts.minAnte };
}

export function bragAnteUp(prev: BragState, playerAnte: number): BragState {
  const seats = prev.seats.map((p) => ({ ...p, cards: [], folded: false, result: undefined, playBet: 0 }));
  const s: BragState = { ...prev, seats, deck: shuffledDeck(), dealer: [], dealerRevealed: false, phase: "decide", handNumber: prev.handNumber + 1, lastAction: `Hand #${prev.handNumber + 1} — three cards each.` };
  for (const p of s.seats) {
    const ante = p.isBot ? Math.min(p.chips, s.minAnte * (1 + Math.floor(Math.random() * 3))) : Math.min(playerAnte, p.chips);
    p.ante = ante; p.chips -= ante;
    for (let i = 0; i < 3; i++) p.cards.push(s.deck.shift()!);
  }
  for (let i = 0; i < 3; i++) s.dealer.push(s.deck.shift()!);
  s.turnSeat = s.seats.findIndex((p) => !p.isBot && !p.folded);
  return s;
}

export type BragAction = "play" | "fold";

export function bragAct(prev: BragState, seatId: string, action: BragAction): BragState {
  if (prev.phase !== "decide") return prev;
  const idx = prev.seats.findIndex((p) => p.id === seatId);
  if (idx < 0) return prev;
  const s: BragState = { ...prev, seats: prev.seats.map((p) => ({ ...p, cards: [...p.cards] })), dealer: [...prev.dealer] };
  const p = s.seats[idx];
  if (action === "fold") { p.folded = true; s.lastAction = `${p.name} folds — ante lost.`; }
  else {
    if (p.chips < p.ante) return prev; // play bet must match ante
    p.playBet = p.ante; p.chips -= p.ante;
    s.lastAction = `${p.name} plays ${p.ante.toLocaleString()}.`;
  }
  // bots decide instantly after the player
  for (const b of s.seats) {
    if (!b.isBot || b.folded || b.playBet > 0) continue;
    const v = bragValue(b.cards);
    const strong = v[0] >= 1 || (v[0] === 0 && v[1] >= 12); // pair+ or Q-high+
    if (strong && b.chips >= b.ante) { b.playBet = b.ante; b.chips -= b.ante; }
    else b.folded = true;
  }
  return settleBrag(s);
}

function settleBrag(prev: BragState): BragState {
  const s: BragState = { ...prev, seats: prev.seats.map((p) => ({ ...p, cards: [...p.cards] })), dealer: [...prev.dealer] };
  s.phase = "settled"; s.dealerRevealed = true;
  const dv = bragValue(s.dealer);
  const dealerQualifies = dv[0] >= 1 || dv[1] >= 12; // Queen-high or better
  const parts: string[] = [];
  for (const p of s.seats) {
    if (p.ante === 0) continue;
    if (p.folded) { p.result = "lose"; continue; }
    const v = bragValue(p.cards);
    const label = BRAG_LABELS[v[0]];
    if (!dealerQualifies) {
      // dealer doesn't qualify: play bet returned, ante pays 1:1
      p.result = "win"; p.chips += p.ante * 2 + p.playBet;
      parts.push(`${p.name} wins ante (dealer no qualify)`);
      continue;
    }
    const d = cmp(v, dv);
    if (d > 0) {
      p.result = "win";
      let pay = p.ante * 2 + p.playBet * 2; // ante + play both pay 1:1
      // prial / running flush bonus on the ante
      if (v[0] === 5) pay += p.ante * 4;
      else if (v[0] === 4) pay += p.ante * 3;
      else if (v[0] === 3) pay += p.ante;
      p.chips += pay;
      parts.push(`${p.name} wins with ${label}${v[0] >= 3 ? " +bonus" : ""}`);
    } else if (d === 0) { p.result = "push"; p.chips += p.ante + p.playBet; parts.push(`${p.name} pushes`); }
    else { p.result = "lose"; parts.push(`${p.name} loses — dealer ${BRAG_LABELS[dv[0]]}`); }
  }
  s.lastAction = `Dealer shows ${BRAG_LABELS[dv[0]]}${dealerQualifies ? "" : " (no qualify)"}. ${parts.join(" · ") || "Everyone folded."}.`;
  return s;
}
