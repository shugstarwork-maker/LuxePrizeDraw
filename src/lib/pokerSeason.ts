// ── Luxe Poker Seasons ──
// 4-week seasons on top of the weekly league race:
//   Weeks 1–3  — qualification: weekly leaderboards + scheduled club tournaments earn season points.
//   Week 4     — championship: qualification standings freeze, finalists are published,
//                the championship event runs, and digital trophies / profile honours are awarded.
// Long-term player development: tournament finishes, decisions reviewed, consistency,
// and season-over-season improvement are tracked per player.
import {
  LEAGUE_TIERS, competitiveRating, confirmedXP, currentLeague, ensureWeek,
  loadReviewQueue, playerId, provisionalXP, tierByIndex, weekEndsIn, weekKey, weeklyBoard, weeklyCutoffs,
  type LeagueRow,
} from "./pokerLeague";

// ── Season calendar ──
export const WEEKS_PER_SEASON = 4;
export const QUALIFICATION_WEEKS = 3; // weeks 1–3 qualify, week 4 is championship week
// Fixed epoch: season 1 began in ISO week 2026-W43 (seasons are anchored, not per-device)
const EPOCH_UTC = Date.UTC(2026, 9, 19); // Monday of 2026-W43

const hashStr = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const mulberry32 = (seed: number) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function isoWeekIndex(d = new Date()): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day); // Monday of this ISO week
  return Math.floor((date.getTime() - EPOCH_UTC) / (7 * 86400000));
}

export type SeasonInfo = {
  season: number;            // 1-based season number
  weekInSeason: number;      // 1..4
  phase: "qualification" | "championship";
  week: string;              // current week key
  endsIn: string;            // human countdown to week end
};

export function seasonInfo(d = new Date()): SeasonInfo {
  const idx = Math.max(0, isoWeekIndex(d));
  const season = Math.floor(idx / WEEKS_PER_SEASON) + 1;
  const weekInSeason = (idx % WEEKS_PER_SEASON) + 1;
  return { season, weekInSeason, phase: weekInSeason <= QUALIFICATION_WEEKS ? "qualification" : "championship", week: weekKey(d), endsIn: weekEndsIn(d) };
}

// ── Season store ──
export type ClubEvent = {
  id: string; name: string; week: string; dayLabel: string; timeLabel: string;
  blinds: string; buyIn: number; fieldSize: number;
  registered: boolean; place?: number; points?: number; finished: boolean;
};
export type Trophy = { id: string; season: number; kind: "champion" | "runner-up" | "third" | "finalist"; label: string; at: number };
export type Honour = { id: string; season: number; label: string; detail: string; at: number };
export type SeasonArchive = {
  season: number; tierIndexEnd: number; seasonXP: number; ratingEnd: number;
  weeklyXP: number[]; tournamentsPlayed: number; bestFinish?: number; trophies: Trophy[];
};
export type ChampionshipState = {
  season: number; frozenAt: number; finalists: { name: string; xp: number; you: boolean }[];
  entered: boolean; result?: { place: number; trophy: Trophy["kind"] };
};

type SeasonStore = {
  season: number;
  seasonXP: number;                    // confirmed+provisional league XP accumulated this season
  weekSnapshots: Record<string, number>; // weekKey -> XP earned that week
  tierStart: number; ratingStart: number;
  events: ClubEvent[];                 // fixtures seen/generated (all weeks of this season)
  championships: ChampionshipState[];  // past + current championship records
  trophies: Trophy[];
  honours: Honour[];
  archive: SeasonArchive[];            // previous seasons (most recent last)
};
const SEASON_KEY = "luxe-poker-season";

// ── Weekly fixtures: deterministic club tournament schedule ──
const EVENT_POOL = [
  { name: "Tuesday Club Night", day: 1, time: "19:00", blinds: "10 / 20", buyIn: 200, field: 24 },
  { name: "Thursday Showdown", day: 3, time: "20:00", blinds: "25 / 50", buyIn: 500, field: 32 },
  { name: "Saturday High Roller", day: 5, time: "21:00", blinds: "50 / 100", buyIn: 1000, field: 40 },
] as const;
const DOW = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function fixturesForWeek(week: string): ClubEvent[] {
  const rng = mulberry32(hashStr("fixtures:" + week));
  const monday = mondayOf(week);
  return EVENT_POOL.map((tpl, i) => {
    const date = new Date(monday + tpl.day * 86400000);
    const past = date.getTime() + 22 * 3600000 < Date.now(); // event window closed ~22:00 local
    return {
      id: `EV-${week}-${i}`,
      name: tpl.name, week,
      dayLabel: DOW[tpl.day], timeLabel: tpl.time,
      blinds: tpl.blinds, buyIn: tpl.buyIn, fieldSize: tpl.field,
      registered: false, finished: past,
      // deterministic simulated results for past events the player never entered
      ...(past ? { place: undefined, points: 0 } : {}),
    } as ClubEvent;
  }).map((e) => ({ ...e, id: e.id + "-" + (Math.floor(rng() * 36 ** 3)).toString(36).toUpperCase() }));
}
function mondayOf(week: string): number {
  const [y, w] = week.split("-W").map(Number);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const jan4Day = (jan4.getUTCDay() + 6) % 7;
  const mondayW1 = jan4.getTime() - jan4Day * 86400000;
  return mondayW1 + (w - 1) * 7 * 86400000;
}

function freshStore(): SeasonStore {
  const info = seasonInfo();
  const lg = ensureWeek();
  return {
    season: info.season, seasonXP: 0, weekSnapshots: {},
    tierStart: lg.tierIndex, ratingStart: competitiveRating(),
    events: fixturesForWeek(info.week),
    championships: [], trophies: [], honours: [], archive: [],
  };
}

function loadStore(): SeasonStore {
  let st: SeasonStore;
  try {
    const raw = localStorage.getItem(SEASON_KEY);
    st = raw ? (JSON.parse(raw) as SeasonStore) : freshStore();
  } catch { st = freshStore(); }
  const info = seasonInfo();
  if (st.season !== info.season) {
    // Season rollover: archive the finished season, then reset for the new one.
    const lg = ensureWeek();
    const weeklyXP = Object.values(st.weekSnapshots);
    const played = st.events.filter((e) => e.registered && e.place != null);
    const seasonTrophies = st.trophies.filter((t) => t.season === st.season);
    st.archive = [...st.archive, {
      season: st.season, tierIndexEnd: lg.tierIndex, seasonXP: st.seasonXP,
      ratingEnd: competitiveRating(), weeklyXP,
      tournamentsPlayed: played.length,
      bestFinish: played.length ? Math.min(...played.map((e) => e.place!)) : undefined,
      trophies: seasonTrophies,
    }].slice(-8);
    st = {
      ...freshStore(), archive: st.archive, trophies: st.trophies, honours: st.honours,
      championships: st.championships,
      tierStart: lg.tierIndex, ratingStart: competitiveRating(),
    };
  }
  // Make sure this week's fixtures exist in the store (new week inside a season)
  if (!st.events.some((e) => e.week === info.week)) st.events = [...st.events, ...fixturesForWeek(info.week)];
  saveStore(st);
  return st;
}
function saveStore(st: SeasonStore) { localStorage.setItem(SEASON_KEY, JSON.stringify(st)); }

/** Live season view: syncs season XP from the league ledger and returns the store + calendar. */
export function getSeason(): { info: SeasonInfo; store: SeasonStore } {
  const info = seasonInfo();
  const st = loadStore();
  const xp = confirmedXP() + provisionalXP();
  if (st.weekSnapshots[info.week] !== xp) {
    const prevTotal = Object.values(st.weekSnapshots).reduce((n, v) => n + v, 0);
    st.weekSnapshots[info.week] = xp;
    st.seasonXP = prevTotal - (st.weekSnapshots[info.week] - xp) + xp; // recompute below cleanly
    st.seasonXP = Object.entries(st.weekSnapshots).filter(([w]) => w !== info.week).reduce((n, [, v]) => n + v, 0) + xp;
    saveStore(st);
  }
  return { info, store: st };
}

// ── Weekly leaderboard + division progress ──
export type DivisionProgress = {
  board: LeagueRow[]; yourRank: number; tierName: string; tierColour: string;
  toPromotionXP: number;      // XP still needed to reach the promotion cut
  promotionProgress: number;  // 0..1 toward this week's promotion cut
  onTrack: "promote" | "safe" | "demote";
};
export function divisionProgress(): DivisionProgress {
  const lg = currentLeague();
  const board = weeklyBoard(lg);
  const cut = weeklyCutoffs(board, lg.tierIndex);
  const you = board.find((r) => r.you)!;
  const rank = board.findIndex((r) => r.you) + 1;
  const need = Math.max(0, cut.promoteXP - you.xp);
  const progress = cut.promoteXP > 0 ? Math.min(1, you.xp / cut.promoteXP) : 1;
  const onTrack = rank <= 10 ? "promote" : rank > board.length - 10 ? "demote" : "safe";
  const tier = tierByIndex(lg.tierIndex);
  return { board, yourRank: rank, tierName: tier.name, tierColour: tier.colour, toPromotionXP: need, promotionProgress: progress, onTrack };
}

// ── Club tournaments ──
export function weekFixtures(): ClubEvent[] { return getSeason().store.events.filter((e) => e.week === seasonInfo().week); }
export function registerForEvent(id: string): ClubEvent | null {
  const st = loadStore();
  const ev = st.events.find((e) => e.id === id);
  if (!ev || ev.finished) return null;
  ev.registered = true;
  saveStore(st);
  return ev;
}
/** Record the player's result in a club event (called when a table run finishes). */
export function recordEventResult(id: string, place: number): ClubEvent | null {
  const st = loadStore();
  const ev = st.events.find((e) => e.id === id);
  if (!ev) return null;
  ev.registered = true; ev.finished = true; ev.place = place;
  ev.points = place === 1 ? 100 : place === 2 ? 75 : place === 3 ? 60 : place <= 6 ? 50 - (place - 4) * 10 : 10;
  // honour: first club event win
  if (place === 1 && !st.honours.some((h) => h.label === "Club event winner")) {
    st.honours.push({ id: `HON-${Date.now().toString(36).toUpperCase()}`, season: st.season, label: "Club event winner", detail: `Won ${ev.name} (${ev.week})`, at: Date.now() });
  }
  saveStore(st);
  return ev;
}

// ── Championship (week 4) ──
const CHAMPIONSHIP_FIELD = 8;
export function championship(): ChampionshipState {
  const { info, store } = getSeason();
  const existing = store.championships.find((c) => c.season === info.season);
  if (existing) return existing;
  // Freeze the qualification standings: season XP decides the finalists.
  const rng = mulberry32(hashStr("champ:" + info.season));
  const tier = ensureWeek().tierIndex;
  const tierBoost = 1 + tier * 0.55;
  const rivals = Array.from({ length: CHAMPIONSHIP_FIELD - 1 }, (_, i) => ({
    name: `Qualifier ${String.fromCharCode(65 + i)}`,
    xp: Math.round((st => st)(store.seasonXP) * (0.7 + rng() * 0.7) * tierBoost),
    you: false,
  }));
  const finalists = [...rivals, { name: "You", xp: store.seasonXP, you: true }]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, CHAMPIONSHIP_FIELD);
  const c: ChampionshipState = { season: info.season, frozenAt: Date.now(), finalists, entered: false };
  store.championships = [...store.championships.filter((x) => x.season !== info.season), c];
  saveStore(store);
  return c;
}
export function enterChampionship(): ChampionshipState {
  const st = loadStore();
  const info = seasonInfo();
  const c = st.championships.find((x) => x.season === info.season) ?? championship();
  const cur = st.championships.find((x) => x.season === info.season);
  if (cur) { cur.entered = true; saveStore(st); return cur; }
  return c;
}
/** Settle the championship with the player's finishing place; awards the trophy + honour. */
export function recordChampionshipResult(place: number): ChampionshipState | null {
  const st = loadStore();
  const info = seasonInfo();
  const c = st.championships.find((x) => x.season === info.season);
  if (!c || !c.entered) return null;
  const kind: Trophy["kind"] = place === 1 ? "champion" : place === 2 ? "runner-up" : place === 3 ? "third" : "finalist";
  c.result = { place, trophy: kind };
  const label = kind === "champion" ? `Season ${c.season} Champion` : kind === "runner-up" ? `Season ${c.season} Runner-up` : kind === "third" ? `Season ${c.season} Third place` : `Season ${c.season} Finalist`;
  st.trophies = [...st.trophies.filter((t) => t.season !== c.season), { id: `TR-${c.season}-${kind.toUpperCase()}`, season: c.season, kind, label, at: Date.now() }];
  if (kind === "champion") st.honours.push({ id: `HON-${Date.now().toString(36).toUpperCase()}`, season: c.season, label: "Champion's honours", detail: `Won the Season ${c.season} championship final`, at: Date.now() });
  saveStore(st);
  return c;
}

// ── Long-term player development ──
export type DevelopmentStats = {
  tournamentsPlayed: number; bestFinish?: number; avgFinish?: number;
  decisionsReviewed: number;            // hands/results sent through the review queue
  consistencyWeeks: number;             // weeks this season with XP earned
  avgWeeklyXP: number;
  seasonXP: number;
  prevSeasonXP?: number; xpChangePct?: number;   // vs previous season
  tierNow: string; tierDelta?: number;           // division movement since season start
  ratingNow: number; ratingDelta: number;        // since season start
  trophies: Trophy[]; honours: Honour[];
};
export function developmentStats(): DevelopmentStats {
  const { store } = getSeason();
  const played = store.events.filter((e) => e.registered && e.place != null);
  const reviews = loadReviewQueue().length;
  const weekly = Object.values(store.weekSnapshots);
  const activeWeeks = weekly.filter((v) => v > 0).length;
  const prev = store.archive[store.archive.length - 1];
  const lg = currentLeague();
  const ratingNow = competitiveRating();
  return {
    tournamentsPlayed: played.length,
    bestFinish: played.length ? Math.min(...played.map((e) => e.place!)) : undefined,
    avgFinish: played.length ? Math.round((played.reduce((n, e) => n + e.place!, 0) / played.length) * 10) / 10 : undefined,
    decisionsReviewed: reviews,
    consistencyWeeks: activeWeeks,
    avgWeeklyXP: weekly.length ? Math.round(weekly.reduce((n, v) => n + v, 0) / weekly.length) : 0,
    seasonXP: store.seasonXP,
    prevSeasonXP: prev?.seasonXP,
    xpChangePct: prev && prev.seasonXP > 0 ? Math.round(((store.seasonXP - prev.seasonXP) / prev.seasonXP) * 100) : undefined,
    tierNow: LEAGUE_TIERS[lg.tierIndex].name,
    tierDelta: lg.tierIndex - store.tierStart,
    ratingNow, ratingDelta: ratingNow - store.ratingStart,
    trophies: store.trophies, honours: store.honours,
  };
}

/** Stable competitive ID for leaderboard display — same one the league engine uses. */
export function seasonPlayerId(): string { return playerId(); }
