const bolts = Array.from({ length: 7 }, (_, index) => index + 1);
const particles = Array.from({ length: 42 }, (_, index) => index + 1);
export type BackdropTheme = "money" | "cars" | "heels" | "ties";
const symbols: Record<BackdropTheme, string> = { money: "£", cars: "🚘", heels: "👠", ties: "👔" };

export function StormBackdrop({ theme }: { theme?: BackdropTheme }) {
  return <div className="lightning-backdrop" aria-hidden="true">
    <div className="lightning-backdrop__sky" /><div className="lightning-backdrop__cloud lightning-backdrop__cloud--one" /><div className="lightning-backdrop__cloud lightning-backdrop__cloud--two" /><div className="lightning-backdrop__rain lightning-backdrop__rain--far" /><div className="lightning-backdrop__rain lightning-backdrop__rain--near" /><div className="lightning-backdrop__flash" />
    {bolts.map((bolt) => <span key={bolt} className={`lightning-backdrop__bolt lightning-backdrop__bolt--${bolt}`} />)}
    {theme && <div className={`money-rain money-rain--${theme}`}>{particles.map((particle) => <span key={particle} className={`money-rain__note money-rain__note--${particle}`}>{symbols[theme]}</span>)}</div>}
  </div>;
}
