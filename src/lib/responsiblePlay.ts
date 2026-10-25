// Responsible Play Centre — player-protection controls.
//
// Pre-launch everything here is enforced locally on this device: session-time
// reminders, cooling-off pauses and self-exclusion are real gates (they lock
// checkout and play surfaces immediately), with the server-side enforcement,
// marketing suppression and cross-device sync designed in db/schema.sql
// (enforcement_actions) activating at launch.

const EXCLUSION_KEY = "luxe-self-exclusion-v1";
const SESSION_KEY = "luxe-session-clock-v1";
const REMINDER_KEY = "luxe-session-reminder-v1";

// ── Self-exclusion & cooling-off ────────────────────────────────────────────

export type ExclusionKind = "cooling_off_24h" | "cooling_off_7d" | "self_exclusion_30d" | "self_exclusion_180d" | "permanent";

export type Exclusion = {
  kind: ExclusionKind;
  startedAt: number;   // epoch ms
  endsAt: number;      // epoch ms (far-future for permanent)
};

export const EXCLUSION_PERIODS: Record<ExclusionKind, { label: string; hours: number; blurb: string }> = {
  cooling_off_24h: { label: "24-hour cooling-off", hours: 24, blurb: "A short pause. All play and purchases lock until it ends." },
  cooling_off_7d: { label: "7-day cooling-off", hours: 24 * 7, blurb: "A full week away. Locks play, purchases and league scoring." },
  self_exclusion_30d: { label: "30-day self-exclusion", hours: 24 * 30, blurb: "A formal exclusion. Cannot be lifted early once set." },
  self_exclusion_180d: { label: "6-month self-exclusion", hours: 24 * 180, blurb: "The strongest local control. Server-enforced and cross-device at launch." },
  permanent: { label: "Permanent exclusion", hours: 100 * 365 * 24, blurb: "Locks this account for good. Irreversible — combined with GAMSTOP at launch for UK-wide coverage." },
};

function loadExclusion(): Exclusion | null {
  try {
    const raw = localStorage.getItem(EXCLUSION_KEY);
    if (!raw) return null;
    const ex = JSON.parse(raw) as Exclusion;
    if (!ex || typeof ex.endsAt !== "number") return null;
    if (Date.now() >= ex.endsAt) { localStorage.removeItem(EXCLUSION_KEY); return null; }
    return ex;
  } catch {
    return null;
  }
}

/** Active exclusion, or null. Expired exclusions clear themselves. */
export function activeExclusion(): Exclusion | null {
  return loadExclusion();
}

/** Set an exclusion. Irreversible until expiry — there is no early-lift API
 *  by design (mirrors the UK self-exclusion contract). */
export function setExclusion(kind: ExclusionKind): Exclusion {
  const period = EXCLUSION_PERIODS[kind];
  const ex: Exclusion = { kind, startedAt: Date.now(), endsAt: Date.now() + period.hours * 3600_000 };
  try { localStorage.setItem(EXCLUSION_KEY, JSON.stringify(ex)); } catch { /* demo only */ }
  return ex;
}

/** Single gate every play/purchase surface checks. */
export function playBlocked(): { blocked: true; exclusion: Exclusion } | { blocked: false } {
  const ex = loadExclusion();
  return ex ? { blocked: true, exclusion: ex } : { blocked: false };
}

export function exclusionTimeLeft(ex: Exclusion): string {
  if (ex.kind === "permanent") return "permanently";
  const ms = Math.max(0, ex.endsAt - Date.now());
  const hours = Math.ceil(ms / 3600_000);
  if (hours >= 48) return `${Math.ceil(hours / 24)} days`;
  return `${hours} hours`;
}

// ── Session clock & reality-check reminders ─────────────────────────────────

export const SESSION_REMINDER_OPTIONS_MINUTES = [30, 60, 120] as const;
export const DEFAULT_REMINDER_MINUTES = 60;

export function reminderMinutes(): number {
  try {
    const v = Number(localStorage.getItem(REMINDER_KEY));
    return (SESSION_REMINDER_OPTIONS_MINUTES as readonly number[]).includes(v) ? v : DEFAULT_REMINDER_MINUTES;
  } catch {
    return DEFAULT_REMINDER_MINUTES;
  }
}

export function setReminderMinutes(minutes: number): void {
  if (!(SESSION_REMINDER_OPTIONS_MINUTES as readonly number[]).includes(minutes)) return;
  try { localStorage.setItem(REMINDER_KEY, String(minutes)); } catch { /* demo only */ }
}

/** Session start timestamp; persists across reloads, resets after 6h idle. */
export function sessionStartedAt(now = Date.now()): number {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const started = Number(raw);
      if (Number.isFinite(started) && now - started < 6 * 3600_000) return started;
    }
    localStorage.setItem(SESSION_KEY, String(now));
    return now;
  } catch {
    return now;
  }
}

export function sessionMinutes(now = Date.now()): number {
  return Math.max(0, Math.floor((now - sessionStartedAt(now)) / 60_000));
}

/** Whether a reality-check reminder is due right now. */
export function reminderDue(now = Date.now()): boolean {
  const mins = sessionMinutes(now);
  return mins > 0 && mins % reminderMinutes() === 0 ? true : mins >= reminderMinutes() && mins % reminderMinutes() < 1;
}

// ── Support links ───────────────────────────────────────────────────────────

export const SUPPORT_LINKS = [
  { name: "GamCare", url: "https://www.gamcare.org.uk", note: "Free, confidential support and live chat, 24/7." },
  { name: "BeGambleAware", url: "https://www.begambleaware.org", note: "Advice, self-assessment tools and treatment finder." },
  { name: "GAMSTOP", url: "https://www.gamstop.co.uk", note: "National self-exclusion across UK-licensed operators." },
  { name: "Citizens Advice", url: "https://www.citizensadvice.org.uk", note: "Free help with debt and consumer rights." },
] as const;

export const RESPONSIBLE_PLAY_NOTE =
  "LuxePrizeDraw is a free-to-play, pre-launch product. Gold Coins and chips have zero real-world value. These controls are live on this device now; server-side enforcement and cross-device sync activate at launch alongside 18+ verification." as const;
