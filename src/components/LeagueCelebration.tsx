// Weekly league move ceremony — Duolingo-style. When a new week promotes or
// relegates you, the league ladder glides from your old division to your new one,
// the new badge bursts in, and you continue when ready. Rendered in a portal so it
// appears on whichever lounge screen you're on.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TrendingDown, TrendingUp } from "lucide-react";
import { COHORT_SIZE, LEAGUE_TIERS, PROMOTE_COUNT, RELEGATE_COUNT } from "../lib/pokerLeague";
import { LeagueBadge } from "./LeagueBadge";

export type Celebration = { type: "promote" | "demote"; fromTier: string; toTier: string; fromColour: string; toColour: string; rank?: number } | null;

const STEP = 112; // px between badges on the ceremony ladder

export function LeagueCelebration({ celebration, onDone }: { celebration: Celebration; onDone: () => void }) {
  const [stage, setStage] = useState<"start" | "glide" | "landed">("start");
  useEffect(() => {
    if (!celebration) return;
    setStage("start");
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setStage("landed"); return; }
    const a = window.setTimeout(() => setStage("glide"), 900);
    const b = window.setTimeout(() => setStage("landed"), 2500);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, [celebration]);
  if (!celebration || typeof document === "undefined") return null;

  const up = celebration.type === "promote";
  const fromIndex = Math.max(0, LEAGUE_TIERS.findIndex((t) => t.name === celebration.fromTier));
  const toIndex = Math.max(0, LEAGUE_TIERS.findIndex((t) => t.name === celebration.toTier));
  const focus = stage === "start" ? fromIndex : toIndex;
  const landed = stage === "landed";

  return createPortal(<div className={`league-move ${up ? "league-move--up" : "league-move--down"}`} role="dialog" aria-modal="true" aria-label={up ? `Promoted to ${celebration.toTier} League` : `Relegated to ${celebration.toTier} League`}>
    {up && landed && <div className="league-move__confetti" aria-hidden="true">{[...Array(24)].map((_, i) => <span key={i} style={{ animationDelay: `${(i % 12) * 70}ms`, left: `${(i * 41) % 100}%` }} />)}</div>}
    <p className="league-move__kicker">Week complete{celebration.rank ? ` · you finished #${celebration.rank} of ${COHORT_SIZE}` : ""}</p>

    <div className="league-move__viewport" aria-hidden="true">
      <div className="league-move__track" style={{ transform: `translateX(${-(focus * STEP + STEP / 2)}px)`, transition: stage === "start" ? "none" : up ? "transform 1.4s cubic-bezier(.22,1.35,.36,1)" : "transform 1.4s cubic-bezier(.45,.05,.3,1)" }}>
        {LEAGUE_TIERS.map((t, i) => <div key={t.name} className={`league-move__badge${i === focus ? " league-move__badge--focus" : ""}${landed && i === toIndex ? " league-move__badge--landed" : ""}`} style={{ width: STEP, ...(i === focus ? { filter: `drop-shadow(0 0 28px ${t.glow})` } : {}) }}>
          <LeagueBadge tierIndex={i} size={i === focus ? 92 : 58} locked={i > Math.max(fromIndex, toIndex)} />
        </div>)}
      </div>
      <span className="league-move__you">{up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}YOU</span>
    </div>

    <div className={`league-move__copy${landed ? " league-move__copy--in" : ""}`}>
      <h2 style={{ color: celebration.toColour }}>{up ? `Promoted to ${celebration.toTier} League!` : `${celebration.toTier} League`}</h2>
      <p>{up
        ? `You finished in the top ${PROMOTE_COUNT} of the ${celebration.fromTier} League. New week, tougher table — keep climbing.`
        : `You finished in the bottom ${RELEGATE_COUNT} of the ${celebration.fromTier} League, so you drop one division. Finish top ${PROMOTE_COUNT} this week to win it back.`}</p>
    </div>
    <button type="button" className="league-move__continue" onClick={onDone} disabled={!landed}>Continue</button>
  </div>, document.body);
}
