const bolts = Array.from({ length: 5 }, (_, index) => index + 1);
const notes = Array.from({ length: 18 }, (_, index) => index + 1);

export function StormBackdrop({ bright = false }: { bright?: boolean }) {
  if (bright) return <div className="money-backdrop" aria-hidden="true">
    <div className="money-backdrop__sky" />
    <div className="money-backdrop__glow" />
    <div className="money-backdrop__notes">{notes.map((note) => <span key={note} className={`money-backdrop__note money-backdrop__note--${note}`}>£</span>)}</div>
  </div>;
  return <div className="lightning-backdrop" aria-hidden="true">
    <div className="lightning-backdrop__sky" />
    <div className="lightning-backdrop__cloud lightning-backdrop__cloud--one" />
    <div className="lightning-backdrop__cloud lightning-backdrop__cloud--two" />
    <div className="lightning-backdrop__rain" />
    {bolts.map((bolt) => <span key={bolt} className={`lightning-backdrop__bolt lightning-backdrop__bolt--${bolt}`} />)}
  </div>;
}
