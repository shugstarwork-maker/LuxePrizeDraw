const bolts = Array.from({ length: 7 }, (_, index) => index + 1);
const particles = Array.from({ length: 42 }, (_, index) => index + 1);
export type BackdropTheme = "money" | "cars" | "heels" | "ties";
const symbols: Record<BackdropTheme, string> = { money: "£", cars: "🚘", heels: "👠", ties: "👔" };

export function StormBackdrop({ theme }: { theme?: BackdropTheme }) {
  return <div className="lightning-backdrop" aria-hidden="true">
    <div className="lightning-backdrop__sky" /><div className="lightning-backdrop__cloud lightning-backdrop__cloud--one" /><div className="lightning-backdrop__cloud lightning-backdrop__cloud--two" /><div className="seasonal-snow">{Array.from({ length: 36 }, (_, i) => <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDuration: `${12 + i % 12}s`, animationDelay: `${-i * .8}s`, width: `${3 + i % 4}px`, height: `${3 + i % 4}px` }} />)}</div><div className="santa-flight"><span className="santa-flight__sleigh">🎅🛷</span><span className="santa-flight__reins" /><span>🦌</span><span>🦌</span><span>🦌</span></div><div className="lightning-backdrop__flash" />
    {bolts.map((bolt) => <span key={bolt} className={`lightning-backdrop__bolt lightning-backdrop__bolt--${bolt}`} />)}
    {theme && <div className={`money-rain money-rain--${theme}`}>{particles.map((particle) => <span key={particle} className={`money-rain__note money-rain__note--${particle}`}>{symbols[theme]}</span>)}</div>}
  </div>;
}
