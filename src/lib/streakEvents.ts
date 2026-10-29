// A small message line between the code that collects the daily chips and the celebration that
// plays for them, so the lounges do not need to know the celebration exists.
export const STREAK_EVENT = "luxe:streak";

export type StreakEvent = {
  /** Days in a row, counting today. */
  streak: number;
  /** The UTC day the streak was counted for (YYYY-MM-DD). */
  day?: string;
  /** Free-play chips collected today. */
  reward?: number;
  /** Extra free-play chips for a Perfect Week. */
  bonus?: number;
  /** A preview plays the scene and collects nothing. */
  preview?: boolean;
};

/** The streak from ?streakPreview=N (1 to 9999), or 0 when the page was not opened for a preview. */
export function previewStreak(search: string): number {
  const raw = new URLSearchParams(search).get("streakPreview");
  const n = raw && /^\d{1,4}$/.test(raw) ? Number(raw) : 0;
  return n >= 1 ? n : 0;
}

/** Says that a streak day was just counted. Safe to call anywhere, including where there is no window. */
export function announceStreak(event: StreakEvent): void {
  try { window.dispatchEvent(new CustomEvent<StreakEvent>(STREAK_EVENT, { detail: event })); } catch { /* no DOM */ }
}

/** Listens for streak days. Returns the function that stops listening. */
export function onStreak(handler: (event: StreakEvent) => void): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<StreakEvent>).detail;
    if (detail && Number.isFinite(detail.streak)) handler(detail);
  };
  window.addEventListener(STREAK_EVENT, listener);
  return () => window.removeEventListener(STREAK_EVENT, listener);
}
