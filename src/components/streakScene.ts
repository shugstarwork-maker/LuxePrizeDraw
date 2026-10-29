// The daily-streak celebration, written without React so the same code drives the app and the
// standalone preview page. `streakMarkup` turns a model into HTML (pure, easy to test) and
// `playStreakScene` runs the timeline on it: sound cues, a few particle bursts, the count-up and
// the Continue button. All movement itself is CSS (streakCelebration.css), driven by the
// `--t-*` times below, so the two files must change together.
import { WEEK, formatCount, isDay, isPerfectWeek, streakHeadline, streakTier, weekWindow, type StreakTierId } from "../lib/streak";

export type StreakSceneInput = {
  /** Days in a row, counting today. */
  streak: number;
  /** The streak before today. Defaults to one less. */
  previous?: number;
  /** The UTC day of the check-in (YYYY-MM-DD). Defaults to today. */
  day?: string;
  /** Free-play chips collected today. */
  reward?: number;
  /** Extra free-play chips for a Perfect Week. */
  bonus?: number;
  /** A preview shows the scene but collects nothing. */
  preview?: boolean;
};
export type StreakSceneModel = { streak: number; previous: number; day: string; reward: number; bonus: number; preview: boolean };

/** When each beat starts, in milliseconds after the scene opens. CSS reads these as `--t-*`. */
export const STREAK_TIMELINE = { ignite: 100, roll: 800, week: 1500, fuse: 1900, stamp: 2500, perfect: 2600, reward: 2800, ready: 3600 } as const;

const MAX_STREAK = 99_999;
const MAX_CHIPS = 1_000_000;
const ROLL_STAGGER_MS = 110;
/** How long one odometer column spins. The stylesheet reads it as `--roll`. */
const ROLL_MS = 1300;

const whole = (value: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof value === "number" ? Math.floor(value) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

/** Clean up whatever the caller passed, so the markup below only ever sees safe whole numbers and a real day. */
export function streakSceneModel(input: StreakSceneInput, now: Date = new Date()): StreakSceneModel {
  const streak = whole(input.streak, 1, MAX_STREAK, 1);
  return {
    streak,
    previous: whole(input.previous, 0, streak - 1, streak - 1),
    day: isDay(input.day) ? input.day : now.toISOString().slice(0, 10),
    reward: whole(input.reward, 0, MAX_CHIPS, 0),
    bonus: whole(input.bonus, 0, MAX_CHIPS, 0),
    preview: input.preview === true,
  };
}

/** Attributes the overlay element needs so the stylesheet can tell the tier and the Perfect Week apart. */
export function streakRootAttributes(model: StreakSceneModel): { "data-tier": StreakTierId; "data-perfect": "true" | "false" } {
  return { "data-tier": streakTier(model.streak).id, "data-perfect": isPerfectWeek(model.streak) ? "true" : "false" };
}

// A small seeded generator, so a given streak always draws the same embers.
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (rand: () => number, lo: number, hi: number) => lo + rand() * (hi - lo);
const fixed = (n: number) => String(Math.round(n * 100) / 100);

const FLAME = `<svg class="streak__flame" viewBox="0 0 160 200" focusable="false">
<defs>
<linearGradient id="streak-g-outer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0"/><stop offset=".32" stop-color="#ffa930"/><stop offset=".7" stop-color="#f4601a"/><stop offset="1" stop-color="#b5200d"/></linearGradient>
<linearGradient id="streak-g-mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffc546"/><stop offset="1" stop-color="#ff8a1f"/></linearGradient>
<linearGradient id="streak-g-core" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe49a"/></linearGradient>
<radialGradient id="streak-g-base" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb347" stop-opacity=".9"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>
</defs>
<ellipse class="streak__f-base streak__loop" cx="80" cy="190" rx="52" ry="9" fill="url(#streak-g-base)"/>
<g class="streak__f streak__f--outer streak__loop"><path fill="url(#streak-g-outer)" d="M80 3C84 28 106 42 121 70c13 24 19 48 12 72-8 26-29 48-53 50-26 0-50-18-56-44-6-26 6-46 20-62 3 14 10 22 18 24C58 80 66 48 80 3Z"/></g>
<g class="streak__f streak__f--mid streak__loop"><path fill="url(#streak-g-mid)" d="M82 52c4 20 22 32 30 56 7 22 1 48-16 62-6 5-12 7-18 7-20-1-34-17-34-37 0-16 8-26 16-36 2 10 8 16 14 16-4-20 0-46 8-68Z"/></g>
<g class="streak__f streak__f--core streak__loop"><path fill="url(#streak-g-core)" d="M80 112c4 12 16 18 18 34 2 14-6 26-18 27-12-1-20-11-18-23 2-14 14-22 18-38Z"/></g>
<path d="M38 132c-3-14 3-26 11-36" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3.2" stroke-linecap="round"/>
</svg>`;

const crown = (cls: string, id: string) =>
  `<svg class="${cls}" viewBox="0 0 64 40" focusable="false" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".55" stop-color="#f2b63d"/><stop offset="1" stop-color="#a86f14"/></linearGradient></defs><path fill="url(#${id})" d="M4 34 8 10l14 13L32 4l10 19 14-13 4 24Z"/><rect x="4" y="34" width="56" height="4" rx="2" fill="#c58a1d"/><circle cx="8" cy="9" r="3" fill="#fff3c4"/><circle cx="32" cy="3.5" r="3" fill="#fff3c4"/><circle cx="56" cy="9" r="3" fill="#fff3c4"/></svg>`;

const CHIP_ICON = `<svg class="streak__reward-chip" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1a1105" stroke="#f2b63d" stroke-width="1.6"/><circle cx="12" cy="12" r="7.2" fill="none" stroke="#ffd978" stroke-width="1.4" stroke-dasharray="2.2 2.2"/><circle cx="12" cy="12" r="3" fill="#f2b63d"/></svg>`;

function embers(streak: number): string {
  const rand = seeded(streak * 9301 + 49297);
  return Array.from({ length: streakTier(streak).embers }, () =>
    `<i class="streak__ember streak__loop" style="--x:${fixed(between(rand, -24, 24))};--s:${fixed(between(rand, 2, 5.5))}px;--d:${fixed(between(rand, 2.4, 4.4))}s;--delay:${fixed(between(rand, 0, 3))}s;--dx:${fixed(between(rand, -26, 26))}px"></i>`,
  ).join("");
}

function sparks(streak: number): string {
  const count = streakTier(streak).sparks;
  const rand = seeded(streak * 7919 + 104729);
  return Array.from({ length: count }, (_, i) =>
    `<i class="streak__orbit-spark streak__loop" style="--a:${fixed((360 / count) * i)}deg;--r:${fixed(between(rand, 47, 54))};--o:${fixed(between(rand, 7, 11))}s;--z:${fixed(between(rand, 3, 5.5))}px"></i>`,
  ).join("");
}

// The number is an odometer: every column that changes spins a full turn and lands on its new
// digit, the way a slot machine reel does. Columns that do not change just show their digit.
function odometer(streak: number, previous: number): { html: string; landMs: number } {
  const now = String(streak);
  const before = String(previous).padStart(now.length, " ");
  const columns: string[] = [];
  let rolled = 0;
  let landMs = 0;
  for (let i = now.length - 1; i >= 0; i--) {
    const digit = Number(now[i]);
    const old = before[i];
    if (old === String(digit)) {
      columns[i] = `<span class="streak__digit"><i class="streak__glyph">${digit}</i></span>`;
      continue;
    }
    const from = old === " " ? 0 : 1 + Number(old);
    const steps = old === " " ? 11 + digit : 10 + ((digit - Number(old) + 10) % 10);
    const delay = STREAK_TIMELINE.roll + rolled * ROLL_STAGGER_MS;
    // A blank first row, then 0-9 three times over: the reel always has somewhere further to spin.
    const rows = `<i></i>${"0123456789".repeat(3).replace(/\d/g, "<i>$&</i>")}`;
    columns[i] = `<span class="streak__digit is-rolling" style="--roll-delay:${delay}ms"><span class="streak__reel" style="--from:${from};--to:${from + steps}">${rows}</span></span>`;
    landMs = Math.max(landMs, delay + ROLL_MS);
    rolled += 1;
  }
  return { html: columns.join(""), landMs };
}

function weekRow(model: StreakSceneModel): string {
  const days = weekWindow(model.day, model.streak);
  const first = days.findIndex((d) => d.lit);
  let wake = 0;
  const chips = days
    .map((d, i) => {
      const k = d.lit && !d.today ? `--k:${wake++};` : "";
      const state = `${d.lit ? " is-lit" : ""}${d.today ? " is-today" : ""}`;
      // The dark coin is always there; a lit day lays a gold coin with a tick on top of it.
      const lit = d.lit ? `<span class="streak__lit"><svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path class="streak__tick" pathLength="1" d="M6.5 12.6l3.7 3.7 7.4-8.6"/></svg></span>` : "";
      return `<li class="streak__chip${state}" style="--i:${i};${k}" data-day="${d.date}"${d.today ? ' aria-current="date"' : ""}><span class="streak__coin">${lit}</span><span class="streak__dow">${d.label}</span></li>`;
    })
    .join("");
  // The fuse runs behind the chips: gold up to yesterday, then a spark burns across to today.
  const fuse = model.streak > 1
    ? `<div class="streak__fuse" style="--first:${first}" aria-hidden="true"><i class="streak__fuse-base"></i><i class="streak__fuse-done"></i><i class="streak__fuse-burn"></i><i class="streak__spark"></i></div>`
    : "";
  return `<div class="streak__weekwrap">${fuse}<ol class="streak__week" aria-label="The last ${WEEK} days">${chips}</ol></div>`;
}

function rewardBlock(model: StreakSceneModel): string {
  if (model.reward + model.bonus <= 0) return "";
  const line = (n: number, text: string, extra = "") => `<p class="streak__reward-line${extra}">${CHIP_ICON}<b data-count="${n}">+${formatCount(n)}</b><span>${text}</span></p>`;
  return `<div class="streak__reward">${model.reward > 0 ? line(model.reward, "free-play chips") : ""}${model.bonus > 0 ? line(model.bonus, "Perfect Week bonus", " streak__reward-line--bonus") : ""}</div>`;
}

/** The inner HTML of the overlay. The overlay element itself carries the attributes from `streakRootAttributes`. */
export function streakMarkup(model: StreakSceneModel): string {
  const tier = streakTier(model.streak);
  const perfect = isPerfectWeek(model.streak);
  const { title, sub } = streakHeadline(model.streak);
  const toVars = Object.entries(STREAK_TIMELINE).map(([name, ms]) => `--t-${name}:${ms}ms`).join(";");
  const digits = odometer(model.streak, model.previous);
  const summary = `Day ${model.streak} streak. ${sub}${model.reward + model.bonus > 0 ? ` ${formatCount(model.reward + model.bonus)} free-play chips collected.` : ""}`;
  return `<div class="streak__scene" style="${toVars}">
<div class="streak__bg" aria-hidden="true"><i class="streak__vignette"></i><i class="streak__dust streak__loop"></i></div>
<div class="streak__fx" aria-hidden="true"></div>
<div class="streak__stage">
<p class="streak__eyebrow"><span>${model.preview ? "Preview" : "Daily streak"}</span></p>
<div class="streak__hero" aria-hidden="true">
<i class="streak__glow"><i class="streak__pulse streak__loop"></i></i><i class="streak__rays streak__loop"></i>
<div class="streak__medal"><i class="streak__ring streak__loop"></i><i class="streak__ticks streak__loop"></i><i class="streak__disc"></i></div>
<div class="streak__orbit">${sparks(model.streak)}</div>
${FLAME}
<div class="streak__embers">${embers(model.streak)}</div>
${tier.id === "legend" ? crown("streak__crown", "streak-g-crown") : ""}
<i class="streak__shock"></i>
</div>
<div class="streak__count" role="img" aria-label="${model.streak} day streak"><span class="streak__digits" style="--n:${String(model.streak).length};--roll:${ROLL_MS}ms;--land:${digits.landMs}ms" aria-hidden="true">${digits.html}</span><span class="streak__unit" aria-hidden="true">day streak</span></div>
<div class="streak__copy"><div class="streak__title${perfect ? " is-perfect" : ""}" role="heading" aria-level="2">${perfect ? crown("streak__title-crown", "streak-g-title-crown") : ""}<span>${title}</span></div><p class="streak__sub">${sub}</p></div>
${weekRow(model)}
${rewardBlock(model)}
<p class="streak__sr" role="status">${summary}</p>
</div>
<div class="streak__foot"><button type="button" class="streak__cta" data-streak-close disabled>Continue</button><p class="streak__fine">${model.preview ? "Preview only. Nothing was collected." : "Free-play chips only. No cash value."}</p></div>
</div>`;
}

export type StreakCue = "ignite" | "roll" | "stamp" | "perfect" | "reward";
export type StreakSceneOptions = {
  /** Skip all movement and show the finished scene. */
  reducedMotion?: boolean;
  /** Called at each beat, for sound. */
  onCue?: (cue: StreakCue) => void;
};
export type StreakScene = { skip: () => void; destroy: () => void };

type Burst = "spark" | "coin" | "confetti";

/** Runs the timeline on markup made by `streakMarkup` that is already in the page. */
export function playStreakScene(root: HTMLElement, model: StreakSceneModel, options: StreakSceneOptions = {}): StreakScene {
  const T = STREAK_TIMELINE;
  const timers: number[] = [];
  const fx = root.querySelector<HTMLElement>(".streak__fx");
  const counters = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
  const button = root.querySelector<HTMLButtonElement>("[data-streak-close]");
  const perfect = isPerfectWeek(model.streak);
  let frame = 0;
  let ready = false;
  let gone = false;

  const cue = (name: StreakCue) => { if (!gone) options.onCue?.(name); };
  const at = (ms: number, fn: () => void) => { timers.push(window.setTimeout(() => { if (!gone) fn(); }, ms)); };
  const setCounters = (t: number) => counters.forEach((el) => { el.textContent = `+${formatCount(Number(el.dataset.count) * t)}`; });
  const haptic = (pattern: number | number[]) => { try { if (!options.reducedMotion) navigator.vibrate?.(pattern); } catch { /* not supported */ } };

  const finish = () => {
    if (ready) return;
    ready = true;
    root.classList.add("is-ready");
    if (button) {
      button.disabled = false;
      try { button.focus({ preventScroll: true }); } catch { /* the button may be gone */ }
    }
  };

  // Particles are plain elements that remove themselves, so nothing needs cleaning up if they are skipped.
  const burst = (kind: Burst, count: number, from: Element | null, seed: number) => {
    if (!fx) return;
    const rand = seeded(seed);
    const box = root.getBoundingClientRect();
    const at0 = from?.getBoundingClientRect();
    const cx = at0 ? at0.left - box.left + at0.width / 2 : box.width / 2;
    const cy = at0 ? at0.top - box.top + at0.height / 2 : box.height * 0.3;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("i");
      const angle = kind === "confetti" ? between(rand, -Math.PI * 0.92, -Math.PI * 0.08) : between(rand, 0, Math.PI * 2);
      const reach = kind === "confetti" ? between(rand, box.width * 0.18, box.width * 0.62) : between(rand, 36, kind === "coin" ? 120 : 96);
      const life = kind === "confetti" ? between(rand, 1500, 2500) : between(rand, 700, 1300);
      p.className = `streak__p streak__p--${kind}${kind === "confetti" ? ` streak__p--c${i % 4}` : ""}`;
      p.style.cssText = `left:${fixed(cx)}px;top:${fixed(cy)}px;--x:${fixed(Math.cos(angle) * reach)}px;--y1:${fixed(Math.sin(angle) * reach * (kind === "confetti" ? 1.5 : 1))}px;--y2:${fixed(Math.sin(angle) * reach * 0.5 + (kind === "confetti" ? box.height * 0.5 : 28))}px;--r:${fixed(between(rand, -540, 540))}deg;--z:${fixed(between(rand, kind === "confetti" ? 6 : 3, kind === "confetti" ? 12 : 8))}px;--life:${fixed(life)}ms`;
      fx.appendChild(p);
      timers.push(window.setTimeout(() => p.remove(), life + 100));
    }
  };

  const countUp = (ms: number) => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setCounters(1 - Math.pow(1 - t, 3));
      if (t < 1 && !gone) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };

  const destroy = () => {
    gone = true;
    timers.forEach((id) => window.clearTimeout(id));
    cancelAnimationFrame(frame);
    fx?.replaceChildren();
  };

  if (options.reducedMotion) {
    root.classList.add("is-skipped");
    setCounters(1);
    finish();
    return { skip: () => {}, destroy };
  }

  setCounters(0);
  at(T.ignite, () => cue("ignite"));
  at(T.roll, () => cue("roll"));
  at(T.stamp, () => {
    cue("stamp");
    haptic(14);
    burst("spark", 16, root.querySelector(".streak__chip.is-today .streak__coin"), model.streak + 11);
  });
  if (perfect) {
    at(T.perfect, () => {
      cue("perfect");
      haptic([18, 50, 18]);
      burst("confetti", 64, root.querySelector(".streak__title"), model.streak + 23);
    });
  }
  at(T.reward, () => {
    if (counters.length === 0) return;
    cue("reward");
    countUp(T.ready - T.reward); // the chips finish counting just as Continue appears
    burst("coin", 12, root.querySelector(".streak__reward"), model.streak + 37);
  });
  at(T.ready, finish);

  return {
    skip: () => {
      if (ready) return;
      timers.forEach((id) => window.clearTimeout(id));
      cancelAnimationFrame(frame);
      fx?.replaceChildren(); // particles in flight lose their clean-up timers above
      root.classList.add("is-skipped");
      setCounters(1);
      finish();
    },
    destroy,
  };
}
