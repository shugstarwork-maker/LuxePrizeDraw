// Anti-Cheat Engine — demo telemetry + risk scoring for perfect-information
// board games (chess, draughts, Connect Four). Pre-launch simulation: moves
// are recorded locally and the scoring pipeline is fully exercised, but no
// enforcement is applied to real players yet.
//
// Three detection modules feed one risk score:
//   A. Move-quality analysis — consecutive engine-best moves (centipawn-loss
//      proxy; the live server runs real engines per position).
//   B. Move-time analytics — standard deviation of move times; mechanical
//      constant pacing signals a second-device solver.
//   C. Focus telemetry — app loses focus right before a move = alt-tab lookup.
//
// 3-strike pipeline: shadow flag (≥60) → match kill (≥75, prize matches) →
// hardware ban (confirmed by human review; device/IP/payout blacklisted —
// wired to enforcement_actions in db/schema.sql).

export type MoveSample = {
  at: number;              // ms timestamp
  thinkMs: number;         // time the player spent on this move
  engineMatch: boolean;    // did the move match the engine's #1 choice
  focusLostBefore: boolean; // app lost focus during this turn
};

export type RiskTier = "clean" | "shadow_flag" | "match_kill" | "hardware_ban";

export type RiskReport = {
  score: number;           // 0–100
  tier: RiskTier;
  modules: { quality: number; timing: number; focus: number };
  reasons: string[];
};

// ── Thresholds ──────────────────────────────────────────────────────────────

export const RISK_SHADOW_FLAG = 60;
export const RISK_MATCH_KILL = 75;
export const ENGINE_MATCH_STREAK_FLAG = 15;   // consecutive engine-best moves
export const MIN_TIMING_SAMPLES = 6;          // need this many moves to judge rhythm
export const MECHANICAL_STDDEV_MS = 400;      // below this = robotic pacing
export const FOCUS_PATTERN_RATIO = 0.6;       // >60% of turns with a focus loss

// ── Module B: move-time analytics ───────────────────────────────────────────

export function timingStdDev(samples: MoveSample[]): number {
  if (samples.length < 2) return Infinity;
  const times = samples.map((s) => s.thinkMs);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((a, t) => a + (t - mean) ** 2, 0) / times.length;
  return Math.sqrt(variance);
}

function timingScore(samples: MoveSample[]): { points: number; reason?: string } {
  if (samples.length < MIN_TIMING_SAMPLES) return { points: 0 };
  const sd = timingStdDev(samples);
  if (sd < MECHANICAL_STDDEV_MS) {
    return { points: 40, reason: `Mechanical move pacing (σ=${Math.round(sd)}ms across ${samples.length} moves)` };
  }
  return { points: 0 };
}

// ── Module A: move-quality analysis ─────────────────────────────────────────

function qualityScore(samples: MoveSample[]): { points: number; reason?: string } {
  let streak = 0;
  let best = 0;
  for (const s of samples) {
    streak = s.engineMatch ? streak + 1 : 0;
    best = Math.max(best, streak);
  }
  if (best >= ENGINE_MATCH_STREAK_FLAG) {
    return { points: 45, reason: `${best} consecutive engine-best moves — grandmaster precision` };
  }
  if (best >= 8) return { points: 20, reason: `${best}-move engine streak (suspicious)` };
  return { points: 0 };
}

// ── Module C: focus telemetry ───────────────────────────────────────────────

function focusScore(samples: MoveSample[]): { points: number; reason?: string } {
  if (samples.length < MIN_TIMING_SAMPLES) return { points: 0 };
  const losses = samples.filter((s) => s.focusLostBefore).length;
  const ratio = losses / samples.length;
  if (ratio >= FOCUS_PATTERN_RATIO) {
    return { points: 35, reason: `App lost focus before ${losses}/${samples.length} moves — alt-tab pattern` };
  }
  return { points: 0 };
}

// ── Combined risk score + 3-strike pipeline ─────────────────────────────────

export function assessMatch(samples: MoveSample[], opts: { confirmedByReview?: boolean } = {}): RiskReport {
  const q = qualityScore(samples);
  const t = timingScore(samples);
  const f = focusScore(samples);
  const score = Math.min(100, q.points + t.points + f.points);
  const reasons = [q.reason, t.reason, f.reason].filter(Boolean) as string[];

  let tier: RiskTier = "clean";
  if (opts.confirmedByReview && score >= RISK_MATCH_KILL) tier = "hardware_ban";
  else if (score >= RISK_MATCH_KILL) tier = "match_kill";
  else if (score >= RISK_SHADOW_FLAG) tier = "shadow_flag";

  return { score, tier, modules: { quality: q.points, timing: t.points, focus: f.points }, reasons };
}

/** What the system does at each tier (client-facing copy + enforcement). */
export const TIER_ACTIONS: Record<RiskTier, { label: string; action: string }> = {
  clean: { label: "Clean", action: "No action." },
  shadow_flag: { label: "Shadow flag", action: "Quietly paired only with other flagged accounts or test bots." },
  match_kill: { label: "Match kill", action: "Match aborted. Opponent awarded the win and entries; suspect's tickets frozen." },
  hardware_ban: { label: "Hardware ban", action: "Account locked. Device ID, IP range and payout details blacklisted." },
};

// ── Match-clock / stall rules (server-enforced at launch) ──────────────────

export const MOVE_TIME_LIMIT_SECONDS = 30;    // per-move ceiling
export const STALL_WARNING_SECONDS = 20;      // warn before the ceiling

// ── In-match telemetry recorder (client side, demo) ─────────────────────────

export class MatchTelemetry {
  private samples: MoveSample[] = [];
  private turnStartedAt = 0;
  private focusLostThisTurn = false;

  turnStarted(now = Date.now()): void {
    this.turnStartedAt = now;
    this.focusLostThisTurn = false;
  }

  focusLost(): void {
    if (this.turnStartedAt > 0) this.focusLostThisTurn = true;
  }

  /** engineMatch is simulated in demo play — live servers compute it. */
  movePlayed(opts: { engineMatch?: boolean } = {}, now = Date.now()): MoveSample | null {
    if (this.turnStartedAt === 0) return null;
    const sample: MoveSample = {
      at: now,
      thinkMs: now - this.turnStartedAt,
      engineMatch: opts.engineMatch ?? false,
      focusLostBefore: this.focusLostThisTurn,
    };
    this.samples.push(sample);
    this.turnStartedAt = 0;
    this.focusLostThisTurn = false;
    return sample;
  }

  report(): RiskReport {
    return assessMatch(this.samples);
  }

  get moveCount(): number {
    return this.samples.length;
  }
}
