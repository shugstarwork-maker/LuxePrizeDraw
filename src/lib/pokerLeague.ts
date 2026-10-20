// Duolingo-style weekly leagues: 30-player cohorts, XP race, promotion/relegation.
export type LeagueTier = { name: string; colour: string; glow: string; promote: number; demote: number };
export const LEAGUE_TIERS: LeagueTier[] = [
  { name: "Bronze", colour: "#c98a4b", glow: "rgba(201,138,75,.4)", promote: 20, demote: 0 },
  { name: "Silver", colour: "#c7cbd4", glow: "rgba(199,203,212,.4)", promote: 15, demote: 25 },
  { name: "Gold", colour: "#f6c945", glow: "rgba(246,201,69,.45)", promote: 10, demote: 22 },
  { name: "Sapphire", colour: "#5ec2e8", glow: "rgba(94,194,232,.45)", promote: 7, demote: 20 },
  { name: "Ruby", colour: "#e85e7a", glow: "rgba(232,94,122,.45)", promote: 5, demote: 18 },
  { name: "Diamond", colour: "#9be8ff", glow: "rgba(155,232,255,.5)", promote: 3, demote: 15 },
];
export const COHORT_SIZE = 30;

export function weekKey(d = new Date()): string {
  // ISO-style week starting Monday: "2026-W42"
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const fDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fDay + 3);
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function weekEndsIn(d = new Date()): string {
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  const end = new Date(d); end.setDate(end.getDate() + (6 - day)); end.setHours(23, 59, 59, 0);
  const diff = end.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000), hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

const LEAGUE_NAMES = ["Aria", "Dex", "Priya", "Kofi", "Lena", "Marco", "Zara", "Owen", "Ines", "Ravi", "Tessa", "Hugo", "Nina", "Felix", "Amber", "Silas", "Maya", "Ruben", "Cleo", "Jude", "Farah", "Nico", "Isla", "Otto", "Wren", "Kai", "Noor", "Elio", "Suki", "Vlad", "Opal", "Reece"];
const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const mulberry32 = (seed: number) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

export type LeagueRow = { name: string; xp: number; you: boolean };

type LeagueState = { week: string; tierIndex: number; xp: number; seed: number };
const KEY = "luxe-poker-league";

export function ensureWeek(): LeagueState {
  const week = weekKey();
  let st: LeagueState = { week, tierIndex: 0, xp: 0, seed: hashStr(week) };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const prev = JSON.parse(raw) as LeagueState;
      if (prev.week === week) return prev;
      // New week: finish last week's league — apply promotion/demotion, then reset points.
      const board = weeklyBoard(prev).map((r) => ({ ...r, points: r.xp }));
      const tier = LEAGUE_TIERS[prev.tierIndex];
      const demoteCount = tier.demote > 0 ? COHORT_SIZE - tier.demote : 0;
      const results = finishLeague(board, prev.tierIndex, tier.promote, demoteCount);
      const mine = results.find((r) => r.you);
      const tierIndex = mine ? mine.nextTierIndex : prev.tierIndex;
      st = { week, tierIndex, xp: 0, seed: hashStr(week + tierIndex) };
    }
  } catch { /* fresh start */ }
  localStorage.setItem(KEY, JSON.stringify(st));
  return st;
}

export function currentLeague(): LeagueState { return ensureWeek(); }

export function weeklyBoard(st: LeagueState): LeagueRow[] {
  const rng = mulberry32(st.seed + st.tierIndex * 977);
  const tierBoost = 1 + st.tierIndex * 0.55;
  const rivals: LeagueRow[] = LEAGUE_NAMES.slice(0, COHORT_SIZE - 1).map((name) => {
    const base = 60 + rng() * rng() * 900; // skewed: a few grinders, many casuals
    return { name, xp: Math.round(base * tierBoost), you: false };
  });
  return [...rivals, { name: "You", xp: st.xp, you: true }].sort((a, b) => b.xp - a.xp);
}

export function weeklyCutoffs(board: LeagueRow[], tierIndex: number): { promoteXP: number; demoteXP: number } {
  const tier = LEAGUE_TIERS[tierIndex];
  const promoteXP = tier.promote > 0 && board.length > tier.promote ? board[tier.promote - 1].xp : 0;
  const demoteXP = tier.demote > 0 && board.length > tier.demote ? board[tier.demote].xp : 0;
  return { promoteXP, demoteXP };
}

export function tierByIndex(i: number): LeagueTier { return LEAGUE_TIERS[Math.max(0, Math.min(LEAGUE_TIERS.length - 1, i))]; }

export function leagueXPForHand(won: boolean, pot: number): number {
  return (won ? 15 : 4) + Math.min(10, Math.floor(pot / 250));
}

// ── Tournament system: points by finishing place, weekly league finish with promote/demote ──
export const TOURNAMENT_POINTS = [100, 75, 60, 50, 40, 30, 20, 10];
export function pointsForFinish(place: number): number {
  return TOURNAMENT_POINTS[place - 1] ?? 5;
}

export type LeagueFinish<T> = T & { rank: number; nextTierIndex: number; points: 0 };

/** Rank a league board, apply promotion/demotion, reset points for the next league week. */
export function finishLeague<T extends { points: number }>(
  players: T[],
  tierIndex: number,
  promoteCount: number,
  demoteCount: number,
): LeagueFinish<T>[] {
  const standings = [...players].sort((a, b) => b.points - a.points);
  return standings.map((player, index) => {
    const rank = index + 1;
    let nextTierIndex = tierIndex;
    if (rank <= promoteCount) nextTierIndex = Math.min(LEAGUE_TIERS.length - 1, tierIndex + 1);
    else if (demoteCount > 0 && rank > standings.length - demoteCount) nextTierIndex = Math.max(0, tierIndex - 1);
    return { ...player, rank, nextTierIndex, points: 0 };
  });
}

/** Weekly league race points for a tournament/table finish. */
export function recordTableFinish(place: number): LeagueState {
  return recordWeeklyXP(pointsForFinish(place));
}

export function recordWeeklyXP(amount: number): LeagueState {
  const st = ensureWeek();
  const next = { ...st, xp: st.xp + amount };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
