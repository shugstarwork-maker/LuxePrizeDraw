// Daily-streak rules, shared by the server (which counts the days) and the browser (which
// shows them). Pure functions only: no DOM, no React, no clock. A "day" is a UTC calendar
// day written YYYY-MM-DD, the same day the daily free-play chips use.

export const WEEK = 7;

const DAY_MS = 86_400_000;
const DAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar day written YYYY-MM-DD. */
export function isDay(value: unknown): value is string {
  return typeof value === "string" && DAY_FORMAT.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

/** Whole UTC days from `from` to `to`. Negative when `to` is earlier, NaN when either is not a day. */
export function dayDiff(from: string, to: string): number {
  if (!isDay(from) || !isDay(to)) return NaN;
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/**
 * The streak after a check-in on `today`, given the day of the last check-in and the streak it
 * ended on. Back-to-back days add one; a missed day starts again at one. A record that has a last
 * day but no streak yet (saved before streaks existed) counts as a one-day streak.
 */
export function advanceStreak(lastDay: string | undefined, streak: number | undefined, today: string): number {
  const current = Number.isInteger(streak) && (streak as number) > 0 ? (streak as number) : 1;
  if (!lastDay) return 1;
  const gap = dayDiff(lastDay, today);
  if (!Number.isFinite(gap)) return 1;
  if (gap <= 0) return current; // the same day, or a clock that moved back: nothing to add
  return gap === 1 ? current + 1 : 1;
}

/** A Perfect Week is every seventh day in a row: 7, 14, 21... */
export const isPerfectWeek = (streak: number): boolean => Number.isInteger(streak) && streak > 0 && streak % WEEK === 0;

/** Days of check-ins still needed for the next Perfect Week (7 straight after one). */
export const daysToPerfectWeek = (streak: number): number => WEEK - (Math.max(0, Math.floor(streak)) % WEEK);

export type StreakTierId = "spark" | "flame" | "blaze" | "inferno" | "legend";
export type StreakTier = { id: StreakTierId; label: string; min: number; embers: number; sparks: number };

/** The flame grows with the streak: more embers and orbiting sparks, then rays, then a crown. */
export const STREAK_TIERS: readonly StreakTier[] = [
  { id: "spark", label: "Spark", min: 1, embers: 5, sparks: 0 },
  { id: "flame", label: "Flame", min: 3, embers: 9, sparks: 2 },
  { id: "blaze", label: "Blaze", min: 7, embers: 14, sparks: 4 },
  { id: "inferno", label: "Inferno", min: 30, embers: 20, sparks: 6 },
  { id: "legend", label: "Legend", min: 100, embers: 26, sparks: 8 },
];

export function streakTier(streak: number): StreakTier {
  let tier = STREAK_TIERS[0];
  for (const t of STREAK_TIERS) if (streak >= t.min) tier = t;
  return tier;
}

const MILESTONES = [3, 7, 14, 30, 50, 75, 100, 150, 200, 250, 300, 365, 500, 730, 1000] as const;

/** The next round number to aim for, or null past the last one. */
export function nextMilestone(streak: number): number | null {
  return MILESTONES.find((m) => m > streak) ?? null;
}

export type WeekDay = { date: string; label: string; lit: boolean; today: boolean };

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

/** The seven UTC days ending on `day`, oldest first. The last `streak` of them (up to seven) are lit. */
export function weekWindow(day: string, streak: number): WeekDay[] {
  const end = Date.parse(`${day}T00:00:00Z`);
  const lit = Math.max(0, Math.min(WEEK, Math.floor(streak)));
  return Array.from({ length: WEEK }, (_, i) => {
    const behind = WEEK - 1 - i;
    const date = new Date(end - behind * DAY_MS);
    return { date: date.toISOString().slice(0, 10), label: WEEKDAYS[date.getUTCDay()], lit: i >= WEEK - lit, today: behind === 0 };
  });
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** The words shown under the number. Always about the streak, never about money. */
export function streakHeadline(streak: number): { title: string; sub: string } {
  const tier = streakTier(streak);
  const toWeek = daysToPerfectWeek(streak);
  const next = nextMilestone(streak);
  if (streak <= 1) return { title: "Streak started", sub: "Come back tomorrow to keep it burning." };
  if (isPerfectWeek(streak)) {
    const weeks = streak / WEEK;
    return { title: weeks === 1 ? "Perfect Week" : `${weeks} Perfect Weeks`, sub: `${streak} days in a row.` };
  }
  if (streak === tier.min) return { title: `${tier.label} unlocked`, sub: `${streak} days in a row.` };
  if (streak < 30) return { title: "Keep it burning", sub: `${toWeek} more ${plural(toWeek, "day", "days")} to a Perfect Week.` };
  if (next) return { title: "Keep it burning", sub: `${next - streak} more ${plural(next - streak, "day", "days")} to ${next}.` };
  return { title: "Keep it burning", sub: `${tier.label} status. Still going.` };
}

/** Whole numbers with thousands separators, the same everywhere. */
export const formatCount = (n: number): string => Math.max(0, Math.floor(n)).toLocaleString("en-GB");
