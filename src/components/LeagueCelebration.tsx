// Duolingo-style league race: animated board rows + XP floaters + weekly
// promotion / relegation celebration overlay.
import { Crown, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export type Celebration = { type: "promote" | "demote"; fromTier: string; toTier: string; fromColour: string; toColour: string } | null;

export function LeagueCelebration({ celebration, onDone }: { celebration: Celebration; onDone: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!celebration) return;
    setVisible(true);
    const t = window.setTimeout(() => { setVisible(false); window.setTimeout(onDone, 450); }, 3400);
    return () => window.clearTimeout(t);
  }, [celebration, onDone]);
  if (!celebration) return null;
  const up = celebration.type === "promote";
  return <div className={`league-celebration ${visible ? "league-celebration--in" : "league-celebration--out"}`} role="status" aria-live="assertive">
    <div className="league-celebration__confetti" aria-hidden="true">{[...Array(18)].map((_, i) => <span key={i} style={{ animationDelay: `${(i % 9) * 90}ms`, left: `${(i * 53) % 100}%` }} />)}</div>
    <div className="league-celebration__card" style={{ borderColor: celebration.toColour, boxShadow: `0 0 60px ${celebration.toColour}88` }}>
      <span className="league-celebration__icon" style={{ color: celebration.toColour }}>{up ? <TrendingUp className="h-10 w-10" /> : <TrendingDown className="h-10 w-10" />}</span>
      <p className="league-celebration__kicker">{up ? "Promoted!" : "Relegated"}</p>
      <p className="league-celebration__tiers"><span style={{ color: celebration.fromColour }}>{celebration.fromTier}</span><Crown className="h-5 w-5" aria-hidden="true" /><span style={{ color: celebration.toColour }}>{celebration.toTier}</span></p>
      <p className="league-celebration__sub">{up ? "Top half of the weekly league — welcome to the next division." : "Bottom half of the weekly league — you drop a division. Win it back next week."}</p>
    </div>
  </div>;
}
