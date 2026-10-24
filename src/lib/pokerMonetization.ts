// Monetization demo layer — ad-supported chips and casual social tables.
// Pre-launch simulation only: no real ads are served, no payments are taken,
// and chips earned or spent here never touch the weekly league standings.

export const AD_REWARD_CHIPS = 500;
export const AD_LENGTH_SECONDS = 15;
export const ADS_PER_DAY = 5;

const ADS_KEY = "luxe-poker-ads";

type AdLedger = { day: string; count: number };

function ledger(): AdLedger {
  try {
    const raw = localStorage.getItem(ADS_KEY);
    const parsed = raw ? (JSON.parse(raw) as AdLedger) : null;
    const today = new Date().toDateString();
    if (parsed && parsed.day === today) return parsed;
    return { day: today, count: 0 };
  } catch {
    return { day: new Date().toDateString(), count: 0 };
  }
}

export function adsWatchedToday(): number { return ledger().count; }
export function adsRemainingToday(): number { return Math.max(0, ADS_PER_DAY - ledger().count); }

export function recordAdWatched(): number {
  const l = ledger();
  const next: AdLedger = { day: l.day, count: Math.min(ADS_PER_DAY, l.count + 1) };
  try { localStorage.setItem(ADS_KEY, JSON.stringify(next)); } catch { /* demo only */ }
  return next.count;
}

// ── Casual social tables ────────────────────────────────────────────────────
// Chips spent in these rooms are pure entertainment: no XP, no league points,
// no prizes. League tables read from the same wallet but never from here.

export type SocialTable = {
  id: string;
  name: string;
  vibe: string;
  smallBlind: number;
  bigBlind: number;
  buyIn: number;
  bots: number;
  note: string;
};

export const SOCIAL_TABLES: SocialTable[] = [
  { id: "porch", name: "The Front Porch", vibe: "Chatty micro-stakes", smallBlind: 1, bigBlind: 2, buyIn: 40, bots: 5, note: "Penny-ante banter — no league points, ever." },
  { id: "rookie", name: "Rookie Social", vibe: "Learn the ropes", smallBlind: 2, bigBlind: 5, buyIn: 100, bots: 5, note: "Soft table for new faces. Chips here are just for fun." },
  { id: "highroll", name: "High-Roller Lounge", vibe: "Big stacks, zero stakes", smallBlind: 50, bigBlind: 100, buyIn: 2000, bots: 5, note: "Splash your store chips around — nothing counts but bragging rights." },
];

export function socialTableById(id: string): SocialTable {
  return SOCIAL_TABLES.find((t) => t.id === id) ?? SOCIAL_TABLES[0];
}
