// Achievements — milestone badges across every casino game. Games report counters
// (bumpStat / setStatMax / markTried); any badge whose target is newly met unlocks
// once and is announced through a "luxe:achievement" window event for the toaster.
// Free-play honours only — no cash value.

export type Rarity = "bronze" | "silver" | "gold" | "platinum";
export type StatKey =
  | "pokerHandsWon" | "pokerBigPot" | "pokerBestStreak"
  | "bjHandsWon" | "bjNaturals" | "bragHandsWon" | "bragPrials"
  | "chessFinished" | "connect4Finished" | "draughtsFinished"
  | "gamesTried" | "daysPlayed" | "promotions" | "bestTier";

export type Achievement = { id: string; title: string; detail: string; rarity: Rarity; stat: StatKey; target: number; icon: string };

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: "first-pot", title: "First Pot", detail: "Win your first hand of Hold'em", rarity: "bronze", stat: "pokerHandsWon", target: 1, icon: "♠" },
  { id: "grinder", title: "Grinder", detail: "Win 25 hands of Hold'em", rarity: "silver", stat: "pokerHandsWon", target: 25, icon: "♠" },
  { id: "card-shark", title: "Card Shark", detail: "Win 100 hands of Hold'em", rarity: "gold", stat: "pokerHandsWon", target: 100, icon: "🦈" },
  { id: "heater", title: "On a Heater", detail: "Win 3 Hold'em hands in a row", rarity: "silver", stat: "pokerBestStreak", target: 3, icon: "🔥" },
  { id: "high-roller", title: "High Roller", detail: "Take down a pot of 1,000 chips", rarity: "gold", stat: "pokerBigPot", target: 1000, icon: "💰" },
  { id: "natural-21", title: "Natural 21", detail: "Be dealt a blackjack", rarity: "silver", stat: "bjNaturals", target: 1, icon: "🂡" },
  { id: "dealer-beater", title: "Dealer Beater", detail: "Win 10 hands of blackjack", rarity: "silver", stat: "bjHandsWon", target: 10, icon: "♦" },
  { id: "prial", title: "Prial!", detail: "Hold three of a kind in 3-Card Brag", rarity: "gold", stat: "bragPrials", target: 1, icon: "♣" },
  { id: "braggart", title: "Braggart", detail: "Win 10 hands of 3-Card Brag", rarity: "silver", stat: "bragHandsWon", target: 10, icon: "♥" },
  { id: "checkmate", title: "Checkmate", detail: "Finish a chess game decisively", rarity: "bronze", stat: "chessFinished", target: 1, icon: "♚" },
  { id: "four-in-a-row", title: "Four in a Row", detail: "Finish a game of Connect Four", rarity: "bronze", stat: "connect4Finished", target: 1, icon: "●" },
  { id: "crowned", title: "Crowned", detail: "Finish a game of draughts", rarity: "bronze", stat: "draughtsFinished", target: 1, icon: "♛" },
  { id: "explorer", title: "Casino Explorer", detail: "Open 4 different casino games", rarity: "silver", stat: "gamesTried", target: 4, icon: "🧭" },
  { id: "grand-tour", title: "Grand Tour", detail: "Open all 8 casino games", rarity: "gold", stat: "gamesTried", target: 8, icon: "🗺" },
  { id: "regular", title: "Regular", detail: "Play on 7 different days", rarity: "silver", stat: "daysPlayed", target: 7, icon: "📅" },
  { id: "devoted", title: "Devoted", detail: "Play on 30 different days", rarity: "gold", stat: "daysPlayed", target: 30, icon: "⭐" },
  { id: "moving-up", title: "Moving Up", detail: "Earn your first league promotion", rarity: "silver", stat: "promotions", target: 1, icon: "⬆" },
  { id: "gold-standard", title: "Gold Standard", detail: "Reach the Gold League", rarity: "gold", stat: "bestTier", target: 2, icon: "🏅" },
  { id: "diamond-club", title: "Diamond Club", detail: "Reach the Diamond League", rarity: "platinum", stat: "bestTier", target: 8, icon: "💎" },
];

export const RARITY_COLOUR: Record<Rarity, string> = { bronze: "#c98a4b", silver: "#c7cbd4", gold: "#f6c945", platinum: "#9be8ff" };

type Store = { stats: Partial<Record<StatKey, number>>; tried: string[]; unlocked: Record<string, number> };
const KEY = "luxe-achievements-v1";
export const ACHIEVEMENT_EVENT = "luxe:achievement";

function load(): Store {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null") as Store | null;
    if (raw && typeof raw === "object") return { stats: raw.stats ?? {}, tried: raw.tried ?? [], unlocked: raw.unlocked ?? {} };
  } catch { /* fresh */ }
  return { stats: {}, tried: [], unlocked: {} };
}
function save(st: Store) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* storage unavailable */ } }

/** Unlock anything newly earned, persist, and announce it. Returns the new badges. */
function settle(st: Store): Achievement[] {
  const fresh = ACHIEVEMENTS.filter((a) => !(a.id in st.unlocked) && (st.stats[a.stat] ?? 0) >= a.target);
  for (const a of fresh) st.unlocked[a.id] = Date.now();
  save(st);
  if (fresh.length && typeof window !== "undefined") {
    try { window.dispatchEvent(new CustomEvent(ACHIEVEMENT_EVENT, { detail: fresh.map((a) => a.id) })); } catch { /* no DOM */ }
  }
  return fresh;
}

export function bumpStat(stat: StatKey, by = 1): Achievement[] {
  const st = load();
  st.stats[stat] = (st.stats[stat] ?? 0) + by;
  return settle(st);
}

export function setStatMax(stat: StatKey, value: number): Achievement[] {
  const st = load();
  if (value <= (st.stats[stat] ?? 0)) return [];
  st.stats[stat] = value;
  return settle(st);
}

/** Record that a casino game was opened; counts distinct games. */
export function markTried(gameId: string): Achievement[] {
  const st = load();
  if (st.tried.includes(gameId)) return [];
  st.tried = [...st.tried, gameId];
  st.stats.gamesTried = st.tried.length;
  return settle(st);
}

export type AchievementView = Achievement & { unlockedAt: number | null; progress: number; current: number };
export function achievementCase(): AchievementView[] {
  const st = load();
  return ACHIEVEMENTS.map((a) => {
    const current = st.stats[a.stat] ?? 0;
    return { ...a, unlockedAt: st.unlocked[a.id] ?? null, current, progress: Math.min(1, current / a.target) };
  });
}

export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
