import React from "react";

/** Display approved source copy verbatim: never infer a cash alternative or a fee. */
export function DrawValueHighlights({ entry = "Pending approval", prize = "Valuation pending", prizeLabel = "Proposed prize value", hidePrize = false }: { entry?: string; prize?: string; prizeLabel?: string; hidePrize?: boolean }) {
  return <section className="draw-value-highlights" aria-label="Entry and prize preview">
    <dl className={`draw-value-highlights__grid${hidePrize ? " draw-value-highlights__grid--entry-only" : ""}`}>
      <div className="draw-value-highlights__entry"><dt>Proposed entry</dt><dd>{entry}</dd></div>
      {!hidePrize && <div className="draw-value-highlights__prize"><dt>{prizeLabel}</dt><dd>{prize}</dd></div>}
    </dl>
    <p>Approval pending · Entries not open</p>
  </section>;
}
