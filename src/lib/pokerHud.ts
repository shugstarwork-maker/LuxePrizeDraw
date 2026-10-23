/**
 * Smart HUD — LuxePrizeDraw's built-in, everyone-sees-the-same-stats read.
 *
 * Third-party tracking software is banned at Luxe tables, so the HUD is part
 * of the game itself: every seat's core NLH stats are tracked openly from the
 * hands played here and shown to anyone who taps an avatar.
 *
 * Tracked stats:
 *  - Hands  — hands dealt where the player was seated in
 *  - VPIP   — % of hands they voluntarily put chips in preflop (call/raise)
 *  - PFR    — % of hands they raised preflop
 *  - SD     — % of showdowns they went to that they won
 *
 * Pure and synchronous — the component feeds it engine states and actions.
 */

export type HudEntry = {
  hands: number;
  vpipHands: number;
  pfrHands: number;
  showdowns: number;
  showdownWins: number;
};

export type HudBook = Record<string, HudEntry>;

export const HUD_STORAGE_KEY = "luxe-poker-hud";

const emptyEntry = (): HudEntry => ({ hands: 0, vpipHands: 0, pfrHands: 0, showdowns: 0, showdownWins: 0 });

export const vpipPct = (e: HudEntry) => (e.hands ? Math.round((e.vpipHands / e.hands) * 100) : null);
export const pfrPct = (e: HudEntry) => (e.hands ? Math.round((e.pfrHands / e.hands) * 100) : null);
export const showdownWinPct = (e: HudEntry) => (e.showdowns ? Math.round((e.showdownWins / e.showdowns) * 100) : null);

/** Style read from the stats — needs a small sample before it commits. */
export function styleTag(e: HudEntry): { label: string; colour: string } {
  if (e.hands < 5) return { label: "Reading…", colour: "#d6c08a" };
  const v = (e.vpipHands / e.hands) * 100;
  const r = (e.pfrHands / e.hands) * 100;
  if (v < 20) return { label: "Rock", colour: "#9db4ff" };
  if (v >= 40 && r < 15) return { label: "Calling station", colour: "#f0a35e" };
  if (v >= 35 && r >= 22) return { label: "Loose cannon", colour: "#ff7d7d" };
  if (v < 32 && r >= 18) return { label: "Tight-aggressive", colour: "#7be3a8" };
  return { label: "Balanced", colour: "#ffe095" };
}

type MinimalPlayer = { id: string; name: string; sittingOut: boolean; folded: boolean };
type MinimalState = {
  players: MinimalPlayer[];
  stage: string;
  handOver: boolean;
  winners: { id: string }[];
};

/**
 * Session HUD tracker. Keyed by player name so reads survive reseats and
 * (via localStorage) whole sessions. Per-hand sets make sure one player only
 * counts once per hand for VPIP / PFR no matter how often they act.
 */
export class HudTracker {
  private book: HudBook;
  private handVpip = new Set<string>();
  private handPfr = new Set<string>();

  constructor(saved?: string | null) {
    this.book = {};
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as HudBook;
        for (const [name, e] of Object.entries(parsed)) {
          if (e && typeof e.hands === "number") this.book[name] = { ...emptyEntry(), ...e };
        }
      } catch { /* corrupt storage — start fresh */ }
    }
  }

  private entry(name: string): HudEntry {
    return (this.book[name] ??= emptyEntry());
  }

  /** Call with the freshly dealt state (handNumber incremented). */
  handStart(state: MinimalState): void {
    this.handVpip.clear();
    this.handPfr.clear();
    for (const p of state.players) if (!p.sittingOut) this.entry(p.name).hands += 1;
  }

  /**
   * Call with the state BEFORE the action is applied, plus who acted.
   * Only preflop voluntary chip commitments count toward VPIP/PFR.
   */
  recordAction(state: MinimalState, playerId: string, action: string): void {
    if (state.stage !== "preflop" || state.handOver) return;
    const p = state.players.find((x) => x.id === playerId);
    if (!p || p.sittingOut) return;
    if (action === "call" && !this.handVpip.has(p.name)) { this.entry(p.name).vpipHands += 1; this.handVpip.add(p.name); }
    if (action === "raise") {
      if (!this.handVpip.has(p.name)) { this.entry(p.name).vpipHands += 1; this.handVpip.add(p.name); }
      if (!this.handPfr.has(p.name)) { this.entry(p.name).pfrHands += 1; this.handPfr.add(p.name); }
    }
  }

  /** Call once when a hand finishes (winners set). Showdown = river dealt. */
  handEnd(state: MinimalState & { board: unknown[] }): void {
    if (state.board.length !== 5) return; // ended before showdown
    const won = new Set(state.winners.map((w) => w.id));
    for (const p of state.players) {
      if (p.sittingOut || p.folded) continue;
      const e = this.entry(p.name);
      e.showdowns += 1;
      if (won.has(p.id)) e.showdownWins += 1;
    }
  }

  statsFor(name: string): HudEntry {
    return this.book[name] ?? emptyEntry();
  }

  toJSON(): string {
    return JSON.stringify(this.book);
  }
}
