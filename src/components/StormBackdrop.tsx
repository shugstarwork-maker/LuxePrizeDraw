const bolts = Array.from({ length: 5 }, (_, index) => index + 1);

export function StormBackdrop() {
  return <div className="lightning-backdrop" aria-hidden="true">
    <div className="lightning-backdrop__sky" />
    <div className="lightning-backdrop__cloud lightning-backdrop__cloud--one" />
    <div className="lightning-backdrop__cloud lightning-backdrop__cloud--two" />
    <div className="lightning-backdrop__rain" />
    {bolts.map((bolt) => <span key={bolt} className={`lightning-backdrop__bolt lightning-backdrop__bolt--${bolt}`} />)}
  </div>;
}
