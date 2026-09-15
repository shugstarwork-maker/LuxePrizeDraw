export const POKER_SUITS = ["♠", "♥", "♦", "♣"] as const;
export const POKER_RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;

export type PokerSuit = (typeof POKER_SUITS)[number];
export type PokerRank = (typeof POKER_RANKS)[number];
export type PokerCard = { rank: PokerRank; value: number; suit: PokerSuit };
export type HandScore = { values: number[]; label: string };

const categoryLabels = ["High card", "One pair", "Two pair", "Three of a kind", "Straight", "Flush", "Full house", "Four of a kind", "Straight flush"];

const compareValues = (a: number[], b: number[]) => {
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
};

const straightHigh = (values: number[]) => {
  const unique = [...new Set(values)].sort((a, b) => b - a);
  if (unique.includes(14)) unique.push(1);
  for (let index = 0; index <= unique.length - 5; index += 1) {
    if (unique[index] - unique[index + 4] === 4) return unique[index];
  }
  return 0;
};

export const scoreFiveCardHand = (cards: PokerCard[]): HandScore => {
  if (cards.length !== 5) throw new Error("A five-card score requires exactly five cards.");

  const values = cards.map(card => card.value).sort((a, b) => b - a);
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const flush = cards.every(card => card.suit === cards[0].suit);
  const highStraight = straightHigh(values);
  const kickers = (excluded: number[]) => values.filter(value => !excluded.includes(value));

  if (flush && highStraight) return { values: [8, highStraight], label: categoryLabels[8] };
  if (groups[0][1] === 4) return { values: [7, groups[0][0], ...kickers([groups[0][0]])], label: categoryLabels[7] };
  if (groups[0][1] === 3 && groups[1][1] === 2) return { values: [6, groups[0][0], groups[1][0]], label: categoryLabels[6] };
  if (flush) return { values: [5, ...values], label: categoryLabels[5] };
  if (highStraight) return { values: [4, highStraight], label: categoryLabels[4] };
  if (groups[0][1] === 3) return { values: [3, groups[0][0], ...kickers([groups[0][0]])], label: categoryLabels[3] };
  if (groups[0][1] === 2 && groups[1][1] === 2) return { values: [2, groups[0][0], groups[1][0], ...kickers([groups[0][0], groups[1][0]])], label: categoryLabels[2] };
  if (groups[0][1] === 2) return { values: [1, groups[0][0], ...kickers([groups[0][0]])], label: categoryLabels[1] };
  return { values: [0, ...values], label: categoryLabels[0] };
};

export const evaluateHand = (cards: PokerCard[]): HandScore => {
  if (cards.length < 5 || cards.length > 7) throw new Error("A poker hand must contain five to seven cards.");
  let best: HandScore | undefined;
  for (let a = 0; a < cards.length - 4; a += 1) for (let b = a + 1; b < cards.length - 3; b += 1) for (let c = b + 1; c < cards.length - 2; c += 1) for (let d = c + 1; d < cards.length - 1; d += 1) for (let e = d + 1; e < cards.length; e += 1) {
    const candidate = scoreFiveCardHand([cards[a], cards[b], cards[c], cards[d], cards[e]]);
    if (!best || compareValues(candidate.values, best.values) > 0) best = candidate;
  }
  return best!;
};

export const compareHands = (a: HandScore, b: HandScore) => compareValues(a.values, b.values);
