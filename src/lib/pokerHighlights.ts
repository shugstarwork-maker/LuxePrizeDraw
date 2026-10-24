// Automated highlights feed ("Bad Beat Timeline") — the app clips notable
// hands as they settle: biggest wins, worst bad beats, and crazy bluffs.
// Stored locally per device; each clip can be shared/exported with one tap.

export type HighlightType = "big-win" | "bad-beat" | "bluff";

export type Highlight = {
  id: string;
  type: HighlightType;
  handNumber: number;
  table: string;
  pot: number;
  board: string[];            // community cards shown, e.g. ["K♠","7♦"]
  yourCards: string[];        // your hole cards where known
  note: string;               // human-readable clip caption
  at: number;                 // epoch ms
  season: number;
  week: string;
};

const STORAGE_KEY = "luxe-poker-highlights";
const MAX_CLIPS = 30; // rolling feed — newest first, trimmed

const cardStr = (c: { rank: string; suit: string } | null | undefined) => (c ? `${c.rank}${c.suit}` : "");

export function loadHighlights(): Highlight[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((h) => h && typeof h.id === "string" && typeof h.at === "number") : [];
  } catch {
    return [];
  }
}

export function saveHighlights(list: Highlight[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_CLIPS))); } catch { /* storage full — skip */ }
}

/** Records a clip and keeps the feed trimmed. Returns the updated feed. */
export function recordHighlight(h: Omit<Highlight, "id" | "at">): Highlight[] {
  const clip: Highlight = { ...h, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: Date.now() };
  const next = [clip, ...loadHighlights()].slice(0, MAX_CLIPS);
  saveHighlights(next);
  return next;
}

/**
 * Decide whether a settled hand deserves a clip, and what kind.
 * Thresholds are chip amounts on the free-play league tables.
 */
export function classifyHand(input: {
  won: boolean;
  pot: number;
  wentToShowdown: boolean;
  yourBestCardRank?: string; // e.g. "A" — used for bluff detection
  handLabel?: string;        // winning hand label where available
}): { type: HighlightType; note: string } | null {
  const { won, pot, wentToShowdown } = input;
  if (won && pot >= 400) {
    return { type: "big-win", note: `Biggest win — scooped a ${pot.toLocaleString()} chip pot${input.handLabel ? ` with ${input.handLabel}` : ""}.` };
  }
  if (!won && wentToShowdown && pot >= 300) {
    return { type: "bad-beat", note: `Bad beat — lost a ${pot.toLocaleString()} chip pot at showdown.` };
  }
  if (won && !wentToShowdown && pot >= 200) {
    return { type: "bluff", note: `Crazy bluff — everyone folded to your pressure, ${pot.toLocaleString()} chips without a showdown.` };
  }
  return null;
}

/** TikTok/Instagram-style share caption for a clip. */
export function highlightCaption(h: Highlight): string {
  const tag = h.type === "big-win" ? "BIG WIN" : h.type === "bad-beat" ? "BAD BEAT" : "BLUFF";
  const cards = [...h.yourCards, h.board.length ? `| ${h.board.join(" ")}` : ""].filter(Boolean).join(" ");
  return `${tag} at the ${h.table} — ${h.note}${cards ? ` ${cards}` : ""} · Luxe Poker League Season ${h.season} · free-play, no cash value`;
}

export function buildCardStrings(cards: ({ rank: string; suit: string } | null)[]): string[] {
  return cards.map(cardStr).filter(Boolean);
}
