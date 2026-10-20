// Luxe Blackjack — casino rules: dealer stands on all 17s, blackjack pays 3:2,
// double down on any two cards, dealer peeks… simplified to player-vs-dealer with bot seats.
import { POKER_RANKS, POKER_SUITS, type PokerCard } from "../lib/poker";

export type BjCard = PokerCard;
export type BjPhase = "betting" | "playing" | "dealer" | "settled";

export type BjSeat = {
  id: string;
  name: string;
  initials: string;
  isBot: boolean;
  chips: number;
  bet: number;
  cards: BjCard[];
  done: boolean;      // stood / bust / blackjack
  bust: boolean;
  blackjack: boolean;
  doubled: boolean;
  result?: "win" | "lose" | "push" | "blackjack";
};

export type BjState = {
  seats: BjSeat[];
  dealer: BjCard[];
  dealerHoleHidden: boolean;
  deck: BjCard[];
  phase: BjPhase;
  turnSeat: number;   // seat index currently acting (-1 none)
  handNumber: number;
  lastAction: string;
  minBet: number;
};

export const initialsOfBj = (name: string) => name.split(/[\s.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function makeBjDeck(): BjCard[] {
  // 4-deck shoe, like casino blackjack
  const one = POKER_SUITS.flatMap((suit) => POKER_RANKS.map((rank, index) => ({ rank, suit, value: index + 2 })));
  const shoe = [...one, ...one, ...one, ...one];
  for (let i = shoe.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shoe[i], shoe[j]] = [shoe[j], shoe[i]]; }
  return shoe;
}

export function handValue(cards: BjCard[]): { total: number; soft: boolean } {
  let total = 0, aces = 0;
  for (const c of cards) { if (c.value >= 11 && c.value <= 13) total += 10; else if (c.value === 14) { total += 11; aces++; } else total += c.value; }
  let soft = aces > 0;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  if (aces === 0) soft = false;
  return { total, soft };
}

const BJ_BOTS = ["Amelia K.", "Marcus B.", "Ruby C.", "Theo M.", "Sofia L."];
const nextSeat = (s: BjState, from: number) => { for (let i = from + 1; i < s.seats.length; i++) if (!s.seats[i].done && s.seats[i].bet > 0) return i; return -1; };

export function createBjTable(opts: { playerChips: number; botCount: number; botChips: number; minBet: number }): BjState {
  const seats: BjSeat[] = [
    { id: "you", name: "You", initials: "YOU", isBot: false, chips: opts.playerChips, bet: 0, cards: [], done: false, bust: false, blackjack: false, doubled: false },
    ...BJ_BOTS.slice(0, Math.max(0, Math.min(5, opts.botCount))).map((name, i) => ({
      id: `bot-${i}`, name, initials: initialsOfBj(name), isBot: true, chips: opts.botChips, bet: 0, cards: [], done: false, bust: false, blackjack: false, doubled: false,
    })),
  ];
  return { seats, dealer: [], dealerHoleHidden: true, deck: [], phase: "betting", turnSeat: -1, handNumber: 0, lastAction: "Place your bet — the dealer is waiting.", minBet: opts.minBet };
}

export function placeBets(prev: BjState, playerBet: number): BjState {
  const deck = prev.deck.length > 52 ? prev.deck : makeBjDeck();
  const seats = prev.seats.map((p) => ({ ...p, cards: [], done: false, bust: false, blackjack: false, doubled: false, result: undefined }));
  const s: BjState = { ...prev, seats, deck, dealer: [], dealerHoleHidden: true, phase: "playing", handNumber: prev.handNumber + 1, lastAction: `Hand #${prev.handNumber + 1} — good luck.` };
  for (const p of s.seats) {
    const bet = p.isBot ? Math.min(p.chips, s.minBet * (1 + Math.floor(Math.random() * 4))) : Math.min(playerBet, p.chips);
    p.bet = bet; p.chips -= bet;
  }
  // deal two each, dealer last — standard order
  for (let round = 0; round < 2; round++) {
    for (const p of s.seats) if (p.bet > 0) p.cards.push(s.deck.shift()!);
    s.dealer.push(s.deck.shift()!);
  }
  for (const p of s.seats) {
    const v = handValue(p.cards);
    if (v.total === 21) { p.blackjack = true; p.done = true; }
  }
  s.turnSeat = nextSeat(s, -1);
  if (s.turnSeat === -1) return dealerPlay(s);
  return s;
}

export type BjAction = "hit" | "stand" | "double";

export function bjAct(prev: BjState, seatId: string, action: BjAction): BjState {
  if (prev.phase !== "playing" || prev.turnSeat < 0) return prev;
  const idx = prev.seats.findIndex((p) => p.id === seatId);
  if (idx !== prev.turnSeat) return prev;
  const s: BjState = { ...prev, seats: prev.seats.map((p) => ({ ...p, cards: [...p.cards] })), deck: [...prev.deck], dealer: [...prev.dealer] };
  const p = s.seats[idx];
  if (action === "hit") {
    p.cards.push(s.deck.shift()!);
    const v = handValue(p.cards);
    if (v.total > 21) { p.bust = true; p.done = true; s.lastAction = `${p.name} hits — bust on ${v.total}.`; }
    else if (v.total === 21) { p.done = true; s.lastAction = `${p.name} hits to 21.`; }
    else s.lastAction = `${p.name} hits — ${v.total}.`;
  } else if (action === "double") {
    if (p.cards.length !== 2 || p.chips < p.bet) return prev;
    p.chips -= p.bet; p.bet *= 2; p.doubled = true;
    p.cards.push(s.deck.shift()!);
    const v = handValue(p.cards);
    if (v.total > 21) { p.bust = true; }
    p.done = true;
    s.lastAction = `${p.name} doubles down — ${v.total}${p.bust ? ", bust" : ""}.`;
  } else {
    p.done = true;
    s.lastAction = `${p.name} stands on ${handValue(p.cards).total}.`;
  }
  if (p.done) s.turnSeat = nextSeat(s, idx);
  if (s.turnSeat === -1) return dealerPlay(s);
  return s;
}

function dealerPlay(prev: BjState): BjState {
  const s: BjState = { ...prev, seats: prev.seats.map((p) => ({ ...p, cards: [...p.cards] })), deck: [...prev.deck], dealer: [...prev.dealer] };
  s.phase = "dealer"; s.dealerHoleHidden = false;
  const anyoneAlive = s.seats.some((p) => p.bet > 0 && !p.bust && !p.blackjack);
  let dv = handValue(s.dealer);
  if (anyoneAlive) while (dv.total < 17) { s.dealer.push(s.deck.shift()!); dv = handValue(s.dealer); }
  const dealerBust = dv.total > 21;
  const dealerBj = s.dealer.length === 2 && dv.total === 21;
  const parts: string[] = [];
  for (const p of s.seats) {
    if (p.bet === 0) continue;
    const v = handValue(p.cards);
    if (p.bust) { p.result = "lose"; parts.push(`${p.name} busts`); }
    else if (p.blackjack) {
      if (dealerBj) { p.result = "push"; p.chips += p.bet; parts.push(`${p.name} pushes`); }
      else { p.result = "blackjack"; p.chips += p.bet + Math.floor(p.bet * 1.5); parts.push(`${p.name} — BLACKJACK pays 3:2`); }
    }
    else if (dealerBj) { p.result = "lose"; parts.push(`${p.name} loses to dealer blackjack`); }
    else if (dealerBust) { p.result = "win"; p.chips += p.bet * 2; parts.push(`${p.name} wins — dealer bust`); }
    else if (v.total > dv.total) { p.result = "win"; p.chips += p.bet * 2; parts.push(`${p.name} wins ${v.total} vs ${dv.total}`); }
    else if (v.total === dv.total) { p.result = "push"; p.chips += p.bet; parts.push(`${p.name} pushes on ${v.total}`); }
    else { p.result = "lose"; parts.push(`${p.name} loses ${v.total} vs ${dv.total}`); }
  }
  s.phase = "settled";
  s.lastAction = `${dealerBust ? `Dealer busts on ${dv.total}` : `Dealer stands on ${dv.total}`}. ${parts.join(" · ")}.`;
  return s;
}

/** Basic-strategy bot decision. */
export function bjBotAction(s: BjState, bot: BjSeat): BjAction {
  const v = handValue(bot.cards);
  const dealerUp = handValue(s.dealer.slice(0, 1)).total;
  if (bot.cards.length === 2 && bot.chips >= bot.bet) {
    if (v.total === 11) return "double";
    if (v.total === 10 && dealerUp <= 9) return "double";
    if (v.total === 9 && dealerUp >= 3 && dealerUp <= 6) return "double";
  }
  if (v.soft) return v.total >= 18 ? "stand" : "hit";
  if (v.total >= 17) return "stand";
  if (v.total >= 13 && dealerUp <= 6) return "stand";
  if (v.total === 12 && dealerUp >= 4 && dealerUp <= 6) return "stand";
  return "hit";
}
