export function potChipCount(pot: number) {
  return Number.isFinite(pot) && pot > 0 ? Math.min(9, Math.max(1, Math.ceil(pot / 250))) : 0;
}
/** Symbolic stack height; exact value is always the live numeric pot, not chip count. */
export function LuxePotChips({ pot }: { pot: number }) {
  const count = potChipCount(pot);
  if (!count) return null;
  return <div className="luxe-pot-chips" aria-label={`Table pot: ${pot.toLocaleString()} virtual chips. Stack is illustrative.`}>
    <div className="luxe-pot-chips__stack" aria-hidden="true" key={pot}>{Array.from({ length: count }, (_, index) => <span className="luxe-pot-chip" key={index} style={{ bottom: `${index * 4}px`, zIndex: index }}><span>♛<b>LUXE</b><small>POKER</small></span></span>)}</div>
    <b className="luxe-pot-chips__amount">{pot.toLocaleString()}</b>
  </div>;
}
