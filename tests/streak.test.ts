import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DAILY_CHIPS, PERFECT_WEEK_BONUS_CHIPS, STARTING_CHIPS, claimDaily } from "../api/wallet";
import type { Store } from "../api/accounts";
import {
  STREAK_TIERS, advanceStreak, dayDiff, daysToPerfectWeek, formatCount, isDay, isPerfectWeek, nextMilestone, streakHeadline, streakTier, weekWindow,
} from "../src/lib/streak";
import { STREAK_TIMELINE, streakMarkup, streakRootAttributes, streakSceneModel } from "../src/components/streakScene";
import { announceStreak, previewStreak } from "../src/lib/streakEvents";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const css = read("src/components/streakCelebration.css");
const scene = read("src/components/streakScene.ts");

function memoryStore(): Store {
  const data = new Map<string, string>();
  return {
    async get(k) { return data.get(k) ?? null; },
    async set(k, v) { data.set(k, v); },
    async take(k) { const v = data.get(k) ?? null; data.delete(k); return v; },
    async incr(k) { const n = Number(data.get(k) ?? 0) + 1; data.set(k, String(n)); return n; },
  } as unknown as Store;
}
const dayN = (n: number, hour = 12) => new Date(Date.UTC(2026, 9, 1 + n, hour));

// ---------- the rules ----------

test("days are real UTC calendar days and differences are whole days", () => {
  assert.equal(isDay("2026-10-29"), true);
  for (const bad of ["2026-02-30", "2026-13-01", "26-10-29", "2026-10-29T00:00:00Z", "", null, undefined, 20261029]) assert.equal(isDay(bad), false, String(bad));
  assert.equal(dayDiff("2026-10-28", "2026-10-29"), 1);
  assert.equal(dayDiff("2026-02-28", "2026-03-01"), 1, "across a month end");
  assert.equal(dayDiff("2026-12-31", "2027-01-01"), 1, "across a year end");
  assert.equal(dayDiff("2026-10-29", "2026-10-27"), -2);
  assert.ok(Number.isNaN(dayDiff("nope", "2026-10-29")));
});

test("the streak grows on back-to-back days, restarts after a gap and ignores the same day", () => {
  assert.equal(advanceStreak(undefined, undefined, "2026-10-29"), 1, "first ever check-in");
  assert.equal(advanceStreak("2026-10-28", 4, "2026-10-29"), 5, "next day");
  assert.equal(advanceStreak("2026-10-27", 4, "2026-10-29"), 1, "a missed day starts again");
  assert.equal(advanceStreak("2026-10-29", 4, "2026-10-29"), 4, "same day adds nothing");
  assert.equal(advanceStreak("2026-10-30", 4, "2026-10-29"), 4, "a clock that moved back adds nothing");
  assert.equal(advanceStreak("2026-10-28", undefined, "2026-10-29"), 2, "a wallet saved before streaks counts as one day");
  assert.equal(advanceStreak("garbage", 9, "2026-10-29"), 1, "an unreadable last day starts again");
  assert.equal(advanceStreak("2026-10-28", -3, "2026-10-29"), 2, "a bad saved streak counts as one");
});

test("every seventh day is a Perfect Week", () => {
  assert.deepEqual([1, 6, 7, 8, 13, 14, 21, 303].map(isPerfectWeek), [false, false, true, false, false, true, true, false]);
  assert.equal(isPerfectWeek(0), false);
  assert.equal(isPerfectWeek(2.5), false);
  assert.deepEqual([0, 1, 6, 7, 8].map(daysToPerfectWeek), [7, 6, 1, 7, 6]);
});

test("the flame tier follows the streak and the tiers only grow", () => {
  assert.deepEqual([1, 2, 3, 6, 7, 29, 30, 99, 100, 5000].map((n) => streakTier(n).id), ["spark", "spark", "flame", "flame", "blaze", "blaze", "inferno", "inferno", "legend", "legend"]);
  for (let i = 1; i < STREAK_TIERS.length; i++) {
    assert.ok(STREAK_TIERS[i].min > STREAK_TIERS[i - 1].min && STREAK_TIERS[i].embers >= STREAK_TIERS[i - 1].embers && STREAK_TIERS[i].sparks >= STREAK_TIERS[i - 1].sparks);
  }
  assert.equal(nextMilestone(303), 365);
  assert.equal(nextMilestone(7), 14);
  assert.equal(nextMilestone(1000), null);
});

test("the week row ends on the check-in day and lights the last N days", () => {
  const four = weekWindow("2026-10-29", 4);
  assert.equal(four.length, 7);
  assert.equal(four[6].date, "2026-10-29");
  assert.equal(four[6].today, true);
  assert.deepEqual(four.map((d) => d.lit), [false, false, false, true, true, true, true]);
  assert.equal(four.filter((d) => d.today).length, 1);
  assert.equal(four[0].date, "2026-10-23");
  assert.equal(four[6].label, "Th", "29 Oct 2026 is a Thursday");
  assert.ok(weekWindow("2026-10-29", 303).every((d) => d.lit));
  assert.deepEqual(weekWindow("2026-10-29", 1).map((d) => d.lit), [false, false, false, false, false, false, true]);
});

test("the words under the number are about the streak and never promise money", () => {
  assert.deepEqual(streakHeadline(1), { title: "Streak started", sub: "Come back tomorrow to keep it burning." });
  assert.deepEqual(streakHeadline(7), { title: "Perfect Week", sub: "7 days in a row." });
  assert.equal(streakHeadline(14).title, "2 Perfect Weeks");
  assert.equal(streakHeadline(3).title, "Flame unlocked");
  assert.equal(streakHeadline(5).sub, "2 more days to a Perfect Week.");
  assert.equal(streakHeadline(6).sub, "1 more day to a Perfect Week.");
  assert.equal(streakHeadline(303).sub, "62 more days to 365.");
  for (let n = 1; n <= 400; n++) {
    const { title, sub } = streakHeadline(n);
    assert.ok(title && sub, `words for ${n}`);
    assert.ok(!/£|\$|cash|prize|win|jackpot|entry|entries|ticket/i.test(`${title} ${sub}`), `no money words for ${n}`);
  }
  assert.equal(formatCount(1234567), "1,234,567");
  assert.equal(formatCount(-5), "0");
});

// ---------- the server counts the days ----------

test("daily claims on back-to-back days build the streak and keep the best one", async () => {
  const s = memoryStore();
  const first = await claimDaily(s, "ACC-s", dayN(0));
  assert.deepEqual(first, { granted: true, chips: STARTING_CHIPS + DAILY_CHIPS, streak: 1, bestStreak: 1, day: "2026-10-01", reward: DAILY_CHIPS, bonus: 0 });
  const second = await claimDaily(s, "ACC-s", dayN(1));
  assert.equal(second.streak, 2);
  assert.equal(second.day, "2026-10-02");
  const dup = await claimDaily(s, "ACC-s", dayN(1, 23));
  assert.deepEqual(dup, { granted: false, chips: STARTING_CHIPS + 2 * DAILY_CHIPS, streak: 2, bestStreak: 2, day: "2026-10-02", reward: 0, bonus: 0 });
  const missed = await claimDaily(s, "ACC-s", dayN(4)); // two days skipped
  assert.equal(missed.streak, 1);
  assert.equal(missed.bestStreak, 2, "the best run is remembered");
  assert.equal(missed.chips, STARTING_CHIPS + 3 * DAILY_CHIPS);
});

test("the day changes at midnight UTC, not 24 hours after the last claim", async () => {
  const s = memoryStore();
  await claimDaily(s, "ACC-u", new Date("2026-10-27T23:59:59Z"));
  const next = await claimDaily(s, "ACC-u", new Date("2026-10-28T00:00:01Z"));
  assert.equal(next.granted, true);
  assert.equal(next.streak, 2);
});

test("a seventh day in a row is a Perfect Week and pays the bonus, which is currently set to nothing", async () => {
  const s = memoryStore();
  let last = await claimDaily(s, "ACC-p", dayN(0));
  for (let i = 1; i < 7; i++) last = await claimDaily(s, "ACC-p", dayN(i));
  assert.equal(last.streak, 7);
  assert.equal(isPerfectWeek(last.streak), true);
  assert.equal(last.bonus, PERFECT_WEEK_BONUS_CHIPS);
  assert.equal(last.chips, STARTING_CHIPS + 7 * DAILY_CHIPS + PERFECT_WEEK_BONUS_CHIPS);
  assert.equal(PERFECT_WEEK_BONUS_CHIPS, 0, "turning the bonus on is a deliberate change to the economy; update this test with it");
  assert.equal((await claimDaily(s, "ACC-p", dayN(7))).bonus, 0, "the eighth day is not a Perfect Week");
});

test("a wallet saved before streaks existed carries on from one day", async () => {
  const s = memoryStore();
  await s.set("wallet:ACC-old", JSON.stringify({ chips: 640, dailyDay: "2026-10-27" }));
  const claim = await claimDaily(s, "ACC-old", new Date("2026-10-28T10:00:00Z"));
  assert.equal(claim.streak, 2);
  assert.equal(claim.chips, 640 + DAILY_CHIPS);
  const same = await claimDaily(s, "ACC-old", new Date("2026-10-28T22:00:00Z"));
  assert.equal(same.granted, false);
  assert.equal(same.streak, 2);
});

test("two claims at the same moment pay once", async () => {
  const s = memoryStore();
  const [a, b] = await Promise.all([claimDaily(s, "ACC-race", dayN(0)), claimDaily(s, "ACC-race", dayN(0))]);
  assert.equal([a, b].filter((c) => c.granted).length, 1);
  assert.equal(Math.max(a.chips, b.chips), STARTING_CHIPS + DAILY_CHIPS);
});

// ---------- the scene ----------

test("the scene model keeps only whole numbers and a real day", () => {
  const now = new Date("2026-10-29T10:00:00Z");
  assert.deepEqual(streakSceneModel({ streak: NaN }, now), { streak: 1, previous: 0, day: "2026-10-29", reward: 0, bonus: 0, preview: false });
  assert.equal(streakSceneModel({ streak: -4 }, now).streak, 1);
  assert.equal(streakSceneModel({ streak: 12.9 }, now).streak, 12);
  assert.equal(streakSceneModel({ streak: 1e12 }, now).streak, 99_999);
  assert.equal(streakSceneModel({ streak: 7, previous: 50 }, now).previous, 6, "the old number is always below the new one");
  assert.equal(streakSceneModel({ streak: 7, day: '"><img src=x onerror=alert(1)>' }, now).day, "2026-10-29");
  assert.equal(streakSceneModel({ streak: 7, day: "2026-10-01" }, now).day, "2026-10-01");
  assert.equal(streakSceneModel({ streak: 7, reward: "9<b>" as unknown as number }, now).reward, 0);
  assert.equal(streakSceneModel({ streak: 7, preview: true }, now).preview, true);
});

test("the markup shows the right week, tier and words for each streak", () => {
  const html = (streak: number, extra = {}) => streakMarkup(streakSceneModel({ streak, day: "2026-10-29", reward: 200, ...extra }));
  const lit = (h: string) => (h.match(/class="streak__chip is-lit/g) ?? []).length;

  const one = html(1);
  assert.equal(lit(one), 1);
  assert.match(one, /Streak started/);
  assert.ok(!one.includes("streak__fuse"), "one lit day has no fuse to burn along");

  const four = html(4);
  assert.equal(lit(four), 4);
  assert.match(four, /Keep it burning/);
  assert.match(four, /3 more days to a Perfect Week\./);
  assert.match(four, /streak__fuse/);

  const week = html(7);
  assert.equal(lit(week), 7);
  assert.match(week, /is-perfect/);
  assert.match(week, /Perfect Week/);
  assert.match(week, /streak__title-crown/);
  assert.equal((week.match(/class="streak__chip[^"]*is-today/g) ?? []).length, 1);
  assert.match(week, /aria-current="date"/);

  assert.ok(!html(99).includes('class="streak__crown"'), "the crown is for the Legend tier only");
  assert.match(html(100), /class="streak__crown"/);

  assert.match(html(303), /aria-label="303 day streak"/);
  assert.deepEqual(streakRootAttributes(streakSceneModel({ streak: 7 })), { "data-tier": "blaze", "data-perfect": "true" });
  assert.deepEqual(streakRootAttributes(streakSceneModel({ streak: 8 })), { "data-tier": "blaze", "data-perfect": "false" });
});

test("every column of the odometer lands on the right digit", () => {
  const html = streakMarkup(streakSceneModel({ streak: 303, previous: 302, day: "2026-10-29" }));
  assert.equal((html.match(/class="streak__digit is-rolling"/g) ?? []).length, 1, "only the ones column changes");
  assert.equal((html.match(/class="streak__glyph"/g) ?? []).length, 2, "the other two just show their digit");
  // Rows are a blank, then 0-9 three times over. The reel stops on --to, which must show the new digit.
  const rowsFor = (streak: number, previous: number) => {
    const out: { digit: number; to: number; from: number }[] = [];
    const markup = streakMarkup(streakSceneModel({ streak, previous, day: "2026-10-29" }));
    const digits = String(streak).split("");
    const reels = [...markup.matchAll(/class="streak__reel" style="--from:(\d+);--to:(\d+)"/g)];
    const columns = [...markup.matchAll(/class="streak__digit( is-rolling)?"/g)].map((m) => Boolean(m[1]));
    let r = 0;
    columns.forEach((rolls, i) => { if (rolls) { out.push({ digit: Number(digits[i]), from: Number(reels[r][1]), to: Number(reels[r][2]) }); r += 1; } });
    return out;
  };
  const cases: Array<[number, number]> = [[1, 0], [2, 1], [10, 9], [100, 99], [303, 302], [990, 989], [1000, 999], [41, 40], [7, 6], [99_999, 99_998]];
  for (const [streak, previous] of cases) {
    for (const col of rowsFor(streak, previous)) {
      assert.ok(col.to > col.from, `${previous}→${streak}: the reel moves forward`);
      assert.equal((col.to - 1) % 10, col.digit, `${previous}→${streak}: lands on ${col.digit}`);
      assert.ok(col.to <= 30, `${previous}→${streak}: stays inside the 31 rows`);
    }
  }
});

test("a preview says so and collects nothing; a real claim states the chips are free-play", () => {
  const preview = streakMarkup(streakSceneModel({ streak: 5, reward: 200, preview: true }));
  assert.match(preview, />Preview</);
  assert.match(preview, /Preview only\. Nothing was collected\./);
  const real = streakMarkup(streakSceneModel({ streak: 5, reward: 200 }));
  assert.match(real, />Daily streak</);
  assert.match(real, /Free-play chips only\. No cash value\./);
  assert.match(real, /<b data-count="200">\+200<\/b><span>free-play chips<\/span>/);
  assert.ok(!/class="streak__reward"/.test(streakMarkup(streakSceneModel({ streak: 5 }))), "no reward line when nothing was paid");
  const bonus = streakMarkup(streakSceneModel({ streak: 7, reward: 200, bonus: 50 }));
  assert.match(bonus, /Perfect Week bonus/);
  assert.match(bonus, /data-count="50"/);
  assert.ok(!/NaN|undefined|null/.test(real + bonus + preview), "no stray values in the page");
});

test("the words on screen never suggest cash, prizes or draw entries", () => {
  for (const streak of [1, 3, 7, 14, 30, 100, 303]) {
    for (const preview of [false, true]) {
      const shown = streakMarkup(streakSceneModel({ streak, reward: 200, bonus: streak % 7 === 0 ? 50 : 0, preview, day: "2026-10-29" }))
        .replace(/<(svg|style|script)[\s\S]*?<\/\1>/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/No cash value/g, "");
      assert.ok(!/cash|prize|entry|entries|ticket|jackpot|win|£|\$/i.test(shown), `the text shown for a ${streak} day streak stays about free-play chips and the streak: ${shown.replace(/\s+/g, " ")}`);
    }
  }
});

// ---------- the stylesheet keeps up with the markup ----------

const escapeRx = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("every class the scene writes has a rule in the stylesheet, and the other way round", () => {
  const models = [1, 4, 7, 14, 30, 100, 303].map((streak) => streakSceneModel({ streak, previous: streak - 1, day: "2026-10-29", reward: 200, bonus: 50, preview: streak === 4 }));
  const used = new Set<string>();
  for (const model of models) for (const m of streakMarkup(model).matchAll(/streak__[a-z0-9-]+/g)) used.add(m[0]);
  // Particles are made by the script: one class for the kind (spark, coin, confetti) and one of four confetti colours.
  used.add("streak__p");
  const kinds = [...(scene.match(/type Burst = ([^;]+);/)?.[1] ?? "").matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(kinds, ["spark", "coin", "confetti"]);
  for (const kind of kinds) used.add(`streak__p--${kind}`);
  for (const n of [0, 1, 2, 3]) used.add(`streak__p--c${n}`);
  const markers = new Set(["streak__loop", "streak__scene"]); // markers for the skip rule, and the root inside the overlay
  const unstyled = [...used].filter((c) => !markers.has(c) && !new RegExp(`\\.${escapeRx(c)}(?![\\w-])`).test(css));
  assert.deepEqual(unstyled, [], "classes written by the scene but missing from the CSS");

  const styled = new Set([...css.matchAll(/\.(streak__[a-z0-9-]+)/g)].map((m) => m[1]));
  const orphaned = [...styled].filter((c) => !used.has(c) && !/--c\d$/.test(c));
  assert.deepEqual(orphaned, [], "classes in the CSS that the scene never writes");
  for (const state of ["is-lit", "is-today", "is-perfect", "is-rolling", "is-ready", "is-skipped"]) assert.ok(css.includes(`.${state}`), `.${state} is styled`);
});

test("the timing variables the stylesheet reads are all set by the scene", () => {
  const timeline = Object.keys(STREAK_TIMELINE);
  const wanted = [...css.matchAll(/var\(--t-([a-z]+)\)/g)].map((m) => m[1]);
  assert.ok(wanted.length > 0);
  for (const name of new Set(wanted)) assert.ok(timeline.includes(name), `--t-${name} is in STREAK_TIMELINE`);

  const declaredInCss = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const setByScript = new Set([...scene.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]));
  const read = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  const missing = [...read].filter((v) => !v.startsWith("--t-") && !declaredInCss.has(v) && !setByScript.has(v));
  assert.deepEqual(missing, [], "CSS variables nobody sets");
  assert.ok(STREAK_TIMELINE.ready > STREAK_TIMELINE.reward && STREAK_TIMELINE.reward > STREAK_TIMELINE.stamp && STREAK_TIMELINE.stamp > STREAK_TIMELINE.week, "the beats run in order");
});

test("the overlay respects reduced motion, sits above the poker tables and hides the button until the scene is done", () => {
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.streak \{[^}]*z-index: 1650;/s);
  assert.match(css, /\.streak__cta \{[^}]*opacity: 0;[^}]*pointer-events: none;/s);
  assert.match(css, /\.streak\.is-ready \.streak__cta \{[^}]*opacity: 1;[^}]*pointer-events: auto;/s);
  assert.match(css, /\.streak\.is-skipped \*:not\(\.streak__loop\)/, "a skipped scene keeps the flame alive");
});

// ---------- wiring ----------

test("collecting the daily chips announces the streak, and the app plays it everywhere", () => {
  const client = read("src/lib/cardTableServer.ts");
  assert.match(client, /import \{ announceStreak \} from "\.\/streakEvents"/);
  assert.match(client, /if \(claim\.granted && Number\.isInteger\(claim\.streak\)/, "only a counted day plays it, and only when the server sent a streak");
  const app = read("src/App.tsx");
  assert.match(app, /<AchievementToaster \/><StreakCelebrationHost \/><\/div>/);
  const host = read("src/components/StreakCelebrationHost.tsx");
  assert.match(host, /lazy\(\(\) => import\("\.\/StreakCelebration"\)/, "the scene code loads only when it is needed");
  const overlay = read("src/components/StreakCelebration.tsx");
  assert.match(overlay, /role="dialog" aria-modal="true"/);
  assert.match(overlay, /createPortal\(/);
  assert.match(overlay, /reducedMotion: reduced/);
  assert.match(overlay, /className="streak"/);
  assert.ok(!/className=\{/.test(overlay), "React must never rewrite the class list the scene adds is-ready to");
  assert.match(overlay, /Escape/);
  const route = read("server.ts");
  assert.match(route, /return res\.json\(await wallet\.claimDaily\(/, "the route passes the whole claim through");
});

test("the streak preview link accepts only whole numbers from 1 to 9999", () => {
  assert.equal(previewStreak("?streakPreview=7"), 7);
  assert.equal(previewStreak("?x=1&streakPreview=303"), 303);
  assert.equal(previewStreak("?streakPreview=9999"), 9999);
  for (const bad of ["", "?streakPreview=", "?streakPreview=0", "?streakPreview=00", "?streakPreview=-3", "?streakPreview=10000", "?streakPreview=7.5", "?streakPreview=abc", "?streakPreview=7%20"]) {
    assert.equal(previewStreak(bad), 0, bad);
  }
  assert.doesNotThrow(() => announceStreak({ streak: 3 }), "safe where there is no window");
});
