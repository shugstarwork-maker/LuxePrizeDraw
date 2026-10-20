import { compareHands, evaluateHand, POKER_RANKS, POKER_SUITS, type PokerCard } from "../lib/poker";

export type HoldemCard = PokerCard;
export type HoldemStage = "preflop" | "flop" | "turn" | "river" | "showdown";
export type BotStyle = "tight" | "balanced" | "loose";

export type HoldemPlayer = {
  id: string;
  name: string;
  initials: string;
  isBot: boolean;
  style: BotStyle;
  chips: number;
  bet: number;          // committed this street
  handBet: number;      // committed this hand
  cards: HoldemCard[];
  folded: boolean;
  allIn: boolean;
  sittingOut: boolean;
};

export type HoldemAction = "fold" | "check" | "call" | "raise";

export type HoldemState = {
  players: HoldemPlayer[];
  deck: HoldemCard[];
  board: HoldemCard[];
  pot: number;
  stage: HoldemStage;
  dealerIndex: number;
  turnIndex: number;
  currentBet: number;     // highest bet this street
  minRaise: number;
  smallBlind: number;
  bigBlind: number;
  handOver: boolean;
  winners: { id: string; amount: number; label: string }[];
  lastAction: string;
  handNumber: number;
};

export function makeHoldemDeck(): HoldemCard[] {
  return POKER_SUITS.flatMap((suit) => POKER_RANKS.map((rank, index) => ({ rank, suit, value: index + 2 })));
}

export function shuffleHoldem(deck: HoldemCard[], rng: () => number = Math.random): HoldemCard[] {
  const out = [...deck];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const BOT_POOL: { name: string; style: BotStyle }[] = [
  { name: "Amelia K.", style: "tight" },
  { name: "Marcus B.", style: "balanced" },
  { name: "Ruby C.", style: "loose" },
  { name: "Theo M.", style: "balanced" },
  { name: "Sofia L.", style: "tight" },
];

export const initialsOf = (name: string) => name.split(/[\s.]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function createTable(opts: {
  playerName: string;
  playerChips: number;
  botCount: number;
  botChips: number;
  smallBlind: number;
  bigBlind: number;
}): HoldemState {
  const players: HoldemPlayer[] = [
    { id: "you", name: opts.playerName || "You", initials: initialsOf(opts.playerName || "You"), isBot: false, style: "balanced", chips: opts.playerChips, bet: 0, handBet: 0, cards: [], folded: false, allIn: false, sittingOut: false },
    ...BOT_POOL.slice(0, Math.max(1, Math.min(5, opts.botCount))).map((bot, i) => ({
      id: `bot-${i}`, name: bot.name, initials: initialsOf(bot.name), isBot: true, style: bot.style,
      chips: opts.botChips, bet: 0, handBet: 0, cards: [], folded: false, allIn: false, sittingOut: false,
    })),
  ];
  return {
    players, deck: [], board: [], pot: 0, stage: "preflop",
    dealerIndex: players.length - 1, turnIndex: 0, currentBet: 0,
    minRaise: opts.bigBlind, smallBlind: opts.smallBlind, bigBlind: opts.bigBlind,
    handOver: true, winners: [], lastAction: "Take a seat — deal the first hand.", handNumber: 0,
  };
}

const activePlayers = (s: HoldemState) => s.players.filter((p) => !p.folded && !p.sittingOut);
const canAct = (p: HoldemPlayer) => !p.folded && !p.allIn && !p.sittingOut && p.chips > 0;

function nextToAct(s: HoldemState, from: number): number {
  for (let step = 1; step <= s.players.length; step++) {
    const i = (from + step) % s.players.length;
    if (canAct(s.players[i])) return i;
  }
  return -1;
}

function startStreet(s: HoldemState, stage: HoldemStage): HoldemState {
  const players = s.players.map((p) => ({ ...p, bet: 0 }));
  const next: HoldemState = { ...s, players, stage, currentBet: 0, minRaise: s.bigBlind };
  next.turnIndex = nextToAct(next, next.dealerIndex);
  if (stage === "flop") next.board = [...s.board, s.deck[0], s.deck[1], s.deck[2]];
  if (stage === "turn" || stage === "river") next.board = [...s.board, s.deck[0]];
  next.lastAction = stage === "flop" ? "Flop dealt." : stage === "turn" ? "Turn card dealt." : "River card dealt.";
  return next;
}

export function seatPlayer(s: HoldemState, playerId: string): HoldemState {
  return { ...s, players: s.players.map((p) => p.id === playerId ? { ...p, sittingOut: false, folded: true, cards: [] } : p) };
}

export function dealHand(prev: HoldemState): HoldemState {
  const seated = prev.players.filter((p) => p.chips > 0 && !p.sittingOut);
  if (seated.length < 2) {
    return { ...prev, handOver: true, winners: [], lastAction: "Waiting for another player with chips to sit in." };
  }
  const players = prev.players.map((p) => ({
    ...p, cards: [], bet: 0, handBet: 0, folded: p.chips <= 0 || p.sittingOut, allIn: false, sittingOut: p.sittingOut || p.chips <= 0,
  }));
  const deck = shuffleHoldem(makeHoldemDeck());
  const dealerIndex = (prev.dealerIndex + 1) % players.length;
  let s: HoldemState = {
    ...prev, players, deck, board: [], pot: 0, stage: "preflop", dealerIndex,
    currentBet: 0, minRaise: prev.bigBlind, handOver: false, winners: [], handNumber: prev.handNumber + 1,
    lastAction: `Hand #${prev.handNumber + 1} dealt.`,
  };
  // deal two cards each
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < players.length; i++) {
      const p = players[(dealerIndex + 1 + i) % players.length];
      if (!p.sittingOut) p.cards.push(deck.shift()!);
    }
  }
  // blinds
  const sbIndex = nextToAct(s, dealerIndex);
  const bbIndex = nextToAct(s, sbIndex);
  const post = (i: number, amount: number) => {
    const p = s.players[i];
    const paid = Math.min(amount, p.chips);
    p.chips -= paid; p.bet = paid; p.handBet = paid;
    if (p.chips === 0) p.allIn = true;
    s.pot += paid;
  };
  post(sbIndex, s.smallBlind);
  post(bbIndex, s.bigBlind);
  s.currentBet = s.bigBlind;
  s.turnIndex = nextToAct(s, bbIndex);
  s.lastAction = `${players[sbIndex].name} posts ${s.smallBlind}, ${players[bbIndex].name} posts ${s.bigBlind}.`;
  return s;
}

function streetComplete(s: HoldemState): boolean {
  const actors = activePlayers(s).filter((p) => !p.allIn);
  if (actors.length === 0) return true;
  return actors.every((p) => p.bet === s.currentBet) && actors.every((p) => p.handBet > 0 || s.currentBet === 0);
}

export function settleHand(s: HoldemState): HoldemState {
  const contenders = s.players.filter((p) => !p.folded && !p.sittingOut);
  const scores = contenders.map((p) => ({ p, score: evaluateHand([...p.cards, ...s.board]) }));
  const best = scores.reduce((a, b) => (compareHands(a.score, b.score) >= 0 ? a : b));
  const winners = scores.filter((x) => compareHands(x.score, best.score) === 0);
  const share = Math.floor(s.pot / winners.length);
  let remainder = s.pot - share * winners.length; // odd chips go to the first winners — nothing leaks
  const players = s.players.map((p) => {
    const win = winners.find((w) => w.p.id === p.id);
    return win ? { ...p, chips: p.chips + share + (remainder-- > 0 ? 1 : 0) } : p;
  });
  return {
    ...s, players, stage: "showdown", handOver: true,
    winners: winners.map((w) => ({ id: w.p.id, amount: share, label: w.score.label })),
    lastAction: winners.length > 1
      ? `Split pot — ${winners.map((w) => w.p.name).join(" & ")} win ${share.toLocaleString()} each with ${best.score.label}.`
      : `${winners[0].p.name} wins ${share.toLocaleString()} with ${best.score.label}.`,
  };
}

export function applyAction(s: HoldemState, playerId: string, action: HoldemAction, raiseTo = 0): HoldemState {
  if (s.handOver) return s;
  const index = s.players.findIndex((p) => p.id === playerId);
  if (index < 0 || index !== s.turnIndex) return s;
  let next: HoldemState = { ...s, players: s.players.map((p) => ({ ...p, cards: [...p.cards] })) };
  const p = next.players[index];
  const toCall = next.currentBet - p.bet;

  if (action === "fold") {
    p.folded = true;
    next.lastAction = `${p.name} folds.`;
  } else if (action === "check") {
    if (toCall > 0) return s; // can't check facing a bet
    next.lastAction = `${p.name} checks.`;
  } else if (action === "call") {
    const paid = Math.min(toCall, p.chips);
    p.chips -= paid; p.bet += paid; p.handBet += paid; next.pot += paid;
    if (p.chips === 0) p.allIn = true;
    next.lastAction = `${p.name} calls ${paid.toLocaleString()}.`;
  } else if (action === "raise") {
    const target = Math.max(raiseTo, next.currentBet + next.minRaise);
    const need = target - p.bet;
    const paid = Math.min(need, p.chips);
    p.chips -= paid; p.bet += paid; p.handBet += paid; next.pot += paid;
    if (p.bet > next.currentBet) {
      next.minRaise = p.bet - next.currentBet;
      next.currentBet = p.bet;
    }
    if (p.chips === 0) p.allIn = true;
    next.lastAction = `${p.name} raises to ${p.bet.toLocaleString()}${p.allIn ? " (all-in)" : ""}.`;
  }

  // everyone but one folded?
  const remaining = activePlayers(next);
  if (remaining.length === 1) {
    const players = next.players.map((pl) => pl.id === remaining[0].id ? { ...pl, chips: pl.chips + next.pot } : pl);
    return { ...next, players, pot: 0, handOver: true, stage: "showdown",
      winners: [{ id: remaining[0].id, amount: next.pot, label: "Last player standing" }],
      lastAction: `${remaining[0].name} wins ${next.pot.toLocaleString()} — everyone folded.` };
  }

  if (streetComplete(next)) {
    if (next.stage === "river") return settleHand(next);
    let out = next;
    // advance streets; if everyone is all-in there is nobody left to act — run the board out
    while (true) {
      const nextStage: HoldemStage = out.stage === "preflop" ? "flop" : out.stage === "flop" ? "turn" : "river";
      out = startStreet({ ...out, deck: out.deck.slice(nextStage === "flop" ? 3 : 1) }, nextStage);
      if (out.stage === "river") return settleHand(out);
      if (out.turnIndex !== -1) return out; // someone can act on this street
    }
  }

  next.turnIndex = nextToAct(next, index);
  return next;
}

// ── Bot decisions ──
function handStrength(p: HoldemPlayer, board: HoldemCard[]): number {
  if (board.length >= 3) {
    const score = evaluateHand([...p.cards, ...board]);
    const category = score.values[0];
    return Math.min(1, category / 8 + (score.values[1] ?? 0) / 100);
  }
  // preflop heuristic
  const [a, b] = p.cards;
  const pair = a.value === b.value;
  const high = Math.max(a.value, b.value);
  const suited = a.suit === b.suit;
  const gap = Math.abs(a.value - b.value);
  let v = (high / 14) * 0.55 + (pair ? 0.35 : 0) + (suited ? 0.06 : 0) + (gap <= 1 ? 0.06 : gap === 2 ? 0.03 : 0);
  if (pair && a.value >= 10) v += 0.15;
  return Math.min(1, v);
}

export function botAction(s: HoldemState, bot: HoldemPlayer, rng: () => number = Math.random): { action: HoldemAction; raiseTo?: number } {
  const strength = handStrength(bot, s.board);
  const toCall = s.currentBet - bot.bet;
  const potOdds = toCall > 0 ? toCall / (s.pot + toCall) : 0;
  const aggression = bot.style === "loose" ? 0.25 : bot.style === "tight" ? -0.12 : 0;
  const nerve = strength + aggression + (rng() - 0.5) * 0.22;

  if (toCall === 0) {
    if (nerve > 0.72 && bot.chips > s.bigBlind * 2) {
      return { action: "raise", raiseTo: s.currentBet + Math.max(s.minRaise, Math.floor(s.pot * (0.5 + rng() * 0.6))) || s.bigBlind * 2 };
    }
    return { action: "check" };
  }
  if (nerve < potOdds + 0.12) return { action: "fold" };
  if (nerve > 0.8 && bot.chips > toCall + s.bigBlind) {
    return { action: "raise", raiseTo: s.currentBet + Math.max(s.minRaise, Math.floor(toCall * (1 + rng()))) };
  }
  return { action: "call" };
}
