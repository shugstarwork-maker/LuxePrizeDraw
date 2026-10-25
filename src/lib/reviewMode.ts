// App Store / Google Play review mode — remote camouflage switch.
//
// When ON, the app presents as a 100% free-play social game: prize lobbies,
// Sweep Ticket references and the redemption store are hidden from review
// builds. Resolution order (first hit wins):
//   1. ?review=1 URL flag (demo/QA)
//   2. Remote flag — GET /api/config/review-mode (Firebase Remote Config /
//      LaunchDarkly equivalent at launch), cached for REMOTE_TTL_MS
//   3. Local override (localStorage), set from the profile toggle
//
// During review: is_app_store_review_active = true. Post-approval the ops
// team flips the server flag and every client picks it up within the TTL —
// no app update required.

const REVIEW_KEY = "luxe-review-mode";
export const REMOTE_CACHE_KEY = "luxe-review-mode-remote-v1";
const REMOTE_TTL_MS = 5 * 60 * 1000; // re-poll the flag every 5 minutes

export const REVIEW_FLAG_NAME = "is_app_store_review_active" as const;

type RemoteCache = { active: boolean; fetchedAt: number };

function readRemoteCache(): RemoteCache | null {
  try {
    const raw = localStorage.getItem(REMOTE_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw) as RemoteCache;
    if (typeof cache.active !== "boolean" || typeof cache.fetchedAt !== "number") return null;
    return cache;
  } catch {
    return null;
  }
}

function writeRemoteCache(active: boolean): void {
  try { localStorage.setItem(REMOTE_CACHE_KEY, JSON.stringify({ active, fetchedAt: Date.now() })); } catch { /* demo only */ }
}

/** Synchronous read for render paths: URL flag → local override → remote cache → review-safe default (ON). */
export function reviewModeEnabled(): boolean {
  try {
    if (typeof window !== "undefined" && window.location.search.includes("review=1")) return true;
    const local = localStorage.getItem(REVIEW_KEY);
    if (local === "1") return true;
    if (local === "0") return false;          // explicit local off wins over the cache
    // Fail safe: with no signal at all, assume review mode so a fresh install
    // (e.g. an App Store reviewer) never flashes prize copy before the first
    // remote sync completes.
    return readRemoteCache()?.active ?? true;
  } catch {
    return true;
  }
}

/** Local override (profile toggle / QA). Pass null to clear and follow the remote flag. */
export function setReviewMode(on: boolean | null): void {
  try {
    if (on === null) localStorage.removeItem(REVIEW_KEY);
    else localStorage.setItem(REVIEW_KEY, on ? "1" : "0");
  } catch { /* demo only */ }
}

/** Fetch the remote flag from the server and cache it. Returns the resolved state. */
export async function syncReviewModeFromRemote(): Promise<boolean> {
  try {
    const cache = readRemoteCache();
    if (cache && Date.now() - cache.fetchedAt < REMOTE_TTL_MS) return reviewModeEnabled();
    const res = await fetch("/api/config/review-mode");
    if (res.ok) {
      const data = (await res.json()) as { [REVIEW_FLAG_NAME]?: boolean };
      writeRemoteCache(Boolean(data[REVIEW_FLAG_NAME]));
    }
  } catch {
    // Offline / pre-launch: fall back to whatever is cached or local.
  }
  return reviewModeEnabled();
}

// ── Camouflage copy contract ────────────────────────────────────────────────
// One place for every string that changes between review and production
// builds, mirroring the store-submission spec.

export type CamouflageCopy = {
  lobbyHeader: string;      // "Luxe Social Lounge" in review, "Luxe Prize Draw" live
  disclaimer: string;       // chip/ledger line under tables
  rewardsTab: boolean;      // false = REWARDS hidden from navigation
  prizeText: boolean;       // false = all prize/ticket/points references hidden
};

export function camouflageCopy(review = reviewModeEnabled()): CamouflageCopy {
  return review
    ? {
        lobbyHeader: "Luxe Social Lounge",
        disclaimer: "Free-Play Tokens Only · Entertainment Purposes",
        rewardsTab: false,
        prizeText: false,
      }
    : {
        lobbyHeader: "Luxe Prize Draw",
        disclaimer: "Free-play · No cash value",
        rewardsTab: true,
        prizeText: true,
      };
}
