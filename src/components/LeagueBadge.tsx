// League badges — one gem-shield per tier, drawn in the tier's colour. Higher tiers
// gain more facets and crown points so each division reads as a step up.
import { LEAGUE_TIERS } from "../lib/pokerLeague";

export function LeagueBadge({ tierIndex, size = 56, locked = false, className = "" }: { tierIndex: number; size?: number; locked?: boolean; className?: string }) {
  const tier = LEAGUE_TIERS[Math.max(0, Math.min(LEAGUE_TIERS.length - 1, tierIndex))];
  const id = `lb-${tierIndex}-${locked ? "l" : "u"}`;
  const colour = locked ? "#4b4b55" : tier.colour;
  const points = Math.min(5, 1 + Math.floor(tierIndex / 2));        // crown points: 1 → 5
  const facets = 3 + Math.min(4, Math.floor(tierIndex / 2));         // inner facets: 3 → 7
  const crown = Array.from({ length: points }, (_, i) => {
    const x = 50 + (i - (points - 1) / 2) * 11;
    return `M${x - 4} 18 L${x} 8 L${x + 4} 18 Z`;
  }).join(" ");
  return <svg viewBox="0 0 100 110" width={size} height={size * 1.1} className={className} role="img" aria-label={`${tier.name} League${locked ? " (locked)" : ""}`}>
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity={locked ? 0.15 : 0.85} />
        <stop offset=".35" stopColor={colour} />
        <stop offset="1" stopColor="#000000" stopOpacity=".55" />
      </linearGradient>
      <radialGradient id={`${id}-r`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".6" stopColor="#fff" stopOpacity="0" /></radialGradient>
    </defs>
    {tierIndex > 0 && <path d={crown} fill={locked ? "#3a3a42" : "#ffe9a8"} stroke="#000" strokeOpacity=".35" strokeWidth="1" />}
    <path d="M50 18 L86 30 L82 70 Q78 92 50 104 Q22 92 18 70 L14 30 Z" fill={`url(#${id}-g)`} stroke={locked ? "#2a2a30" : "#000"} strokeOpacity=".5" strokeWidth="2.5" />
    {Array.from({ length: facets }, (_, i) => {
      const a = (Math.PI * 2 * i) / facets - Math.PI / 2;
      return <line key={i} x1="50" y1="60" x2={50 + Math.cos(a) * 30} y2={60 + Math.sin(a) * 34} stroke="#fff" strokeOpacity={locked ? 0.05 : 0.18} strokeWidth="1.5" />;
    })}
    <path d="M50 18 L86 30 L82 70 Q78 92 50 104 Q22 92 18 70 L14 30 Z" fill={`url(#${id}-r)`} />
    <text x="50" y="68" textAnchor="middle" fontSize="20" fontWeight="900" fontFamily="Georgia, serif" fill={locked ? "#6b6b75" : "#fff"} stroke="#000" strokeOpacity=".35" strokeWidth=".8">{locked ? "🔒" : tierIndex === LEAGUE_TIERS.length - 1 ? "♛" : String(tierIndex + 1)}</text>
  </svg>;
}

/** Duolingo-style row of every league; your league is lit, higher ones locked. */
export function LeagueLadder({ tierIndex }: { tierIndex: number }) {
  return <div className="league-ladder" role="list" aria-label="League divisions">
    {LEAGUE_TIERS.map((t, i) => <div key={t.name} role="listitem" className={`league-ladder__step${i === tierIndex ? " league-ladder__step--you" : ""}`} style={i === tierIndex ? { filter: `drop-shadow(0 0 12px ${t.glow})` } : undefined} aria-current={i === tierIndex ? "true" : undefined}>
      <LeagueBadge tierIndex={i} size={i === tierIndex ? 46 : 34} locked={i > tierIndex} />
      {i === tierIndex && <span style={{ color: t.colour }}>{t.name}</span>}
    </div>)}
  </div>;
}
