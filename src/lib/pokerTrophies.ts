// Trophy Room — the career display case. Each league tier reached unlocks a
// trophy engraved with the season in which it was first achieved, plus a
// championship bracelet for finishing a season in the promotion places.
// Free-play honours only — no cash value.

import { LEAGUE_TIERS } from "./pokerLeague";

export type TrophyTier = "tier" | "bracelet" | "champion";

export type Trophy = {
  id: string;
  kind: TrophyTier;
  title: string;
  detail: string;
  colour: string;
  season: number | null;  // season first earned, null while locked
  earned: boolean;
};

const STORAGE_KEY = "luxe-poker-trophies";

type TrophyStore = Record<string, number>; // trophyId -> season first earned

export function loadTrophyStore(): TrophyStore {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return raw && typeof raw === "object" ? raw as TrophyStore : {};
  } catch {
    return {};
  }
}

export function saveTrophyStore(store: TrophyStore): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* noop */ }
}

const kindLabel = (kind: TrophyTier) => kind === "tier" ? "League trophy" : kind === "bracelet" ? "Championship bracelet" : "Season champion ring";

/**
 * Unlock check, called whenever the league tier changes. `tierIndex` is the
 * player's current league tier; reaching a new tier for the first time records
 * the season it happened in. Returns ids newly unlocked (for celebrations).
 */
export function checkTrophyUnlocks(tierIndex: number, season: number): string[] {
  const store = loadTrophyStore();
  const fresh: string[] = [];
  for (let i = 0; i <= Math.min(tierIndex, LEAGUE_TIERS.length - 1); i++) {
    const id = `tier-${LEAGUE_TIERS[i].name.toLowerCase().replace(/\s+/g, "-")}`;
    if (!(id in store)) { store[id] = season; fresh.push(id); }
  }
  saveTrophyStore(store);
  return fresh;
}

/** Mark a promotion-places season finish (top of weekly board at settle). */
export function awardBracelet(tierIndex: number, season: number): boolean {
  const store = loadTrophyStore();
  const id = `bracelet-${LEAGUE_TIERS[Math.min(tierIndex, LEAGUE_TIERS.length - 1)].name.toLowerCase().replace(/\s+/g, "-")}`;
  if (id in store) return false;
  store[id] = season;
  saveTrophyStore(store);
  return true;
}

/** The full display case: every trophy, earned or still locked. */
export function trophyCase(): Trophy[] {
  const store = loadTrophyStore();
  return LEAGUE_TIERS.map((t) => {
    const id = `tier-${t.name.toLowerCase().replace(/\s+/g, "-")}`;
    const braceletId = `bracelet-${t.name.toLowerCase().replace(/\s+/g, "-")}`;
    return [
      {
        id, kind: "tier" as const,
        title: `${t.name} League trophy`,
        detail: `Reach the ${t.name} division`,
        colour: t.colour,
        season: store[id] ?? null,
        earned: id in store,
      },
      {
        id: braceletId, kind: "bracelet" as const,
        title: `${t.name} bracelet`,
        detail: `Finish a season in the ${t.name} promotion places`,
        colour: t.colour,
        season: store[braceletId] ?? null,
        earned: braceletId in store,
      },
    ];
  }).flat();
}

export { kindLabel };
