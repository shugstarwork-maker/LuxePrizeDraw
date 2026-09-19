const bolts = Array.from({ length: 5 }, (_, index) => index + 1);
const notes = Array.from({ length: 18 }, (_, index) => index + 1);

export function StormBackdrop({ moneyRain = false }: { moneyRain?: boolean }) {
  return <div className="lightning-backdrop" aria-hidden="true">
    <div className="lightning-backdrop__sky" />
    <div className="lightning-backdrop__cloud lightning-backdrop__cloud--one" />
    <div className="lightning-backdrop__cloud lightning-backdrop__cloud--two" />
    <div className="lightning-backdrop__rain" />
    {bolts.map((bolt) => <span key={bolt} className={`lightning-backdrop__bolt lightning-backdrop__bolt--${bolt}`} />)}
    {moneyRain && <div className="money-rain">{notes.map((note) => <span key={note} className={`money-rain__note money-rain__note--${note}`}>£</span>)}</div>}
  </div>;
}
