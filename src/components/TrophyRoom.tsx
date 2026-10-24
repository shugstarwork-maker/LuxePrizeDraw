import { useEffect, useMemo, useRef, useState } from "react";
import { Trophy, Medal, Lock, Crown } from "lucide-react";
import { trophyCase, kindLabel, type Trophy as TrophyItem } from "../lib/pokerTrophies";

/**
 * The Interactive Trophy Room — a 3D-tilting display case of league trophies,
 * championship bracelets and season rings. Tilt follows pointer/device motion;
 * locked slots stay dark with an engraved lock.
 */
export function TrophyRoom() {
  const trophies = useMemo(trophyCase, []);
  const earned = trophies.filter((t) => t.earned);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const caseRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = caseRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top - 200 || e.clientY > r.bottom + 200) return;
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = ((e.clientY - (r.top + r.height / 2)) / Math.max(1, r.height) - 0.5) * 2;
      setTilt({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const shelf = (items: TrophyItem[], label: string) => (
    <div className="trophy-shelf" key={label}>
      <p className="trophy-shelf__label">{label}</p>
      <div className="trophy-shelf__row" role="list">
        {items.map((t) => (
          <div key={t.id} role="listitem" className={`trophy-slot ${t.earned ? "trophy-slot--earned" : ""}`} style={t.earned ? { ["--trophy-glow" as string]: t.colour } : undefined}>
            <span className="trophy-slot__icon" aria-hidden="true">
              {t.earned ? (t.kind === "bracelet" ? <Medal className="h-6 w-6" /> : t.kind === "champion" ? <Crown className="h-6 w-6" /> : <Trophy className="h-6 w-6" />) : <Lock className="h-4 w-4" />}
            </span>
            <p className="trophy-slot__title">{t.title}</p>
            <p className="trophy-slot__detail">{t.earned ? `Season ${t.season}` : t.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="trophy-room" aria-label="Trophy room">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.2em] text-amber-200"><Trophy className="h-3.5 w-3.5" /> Trophy room</p>
        <span className="text-[10px] font-black text-white/45">{earned.length} of {trophies.length} unlocked</span>
      </div>
      <div
        ref={caseRef}
        className="trophy-case"
        style={{ transform: `perspective(900px) rotateY(${tilt.x * 7}deg) rotateX(${-tilt.y * 4}deg)` }}
      >
        <div className="trophy-case__glass" aria-hidden="true" />
        {shelf(trophies.filter((t) => t.kind === "tier"), "League trophies")}
        {shelf(trophies.filter((t) => t.kind === "bracelet"), "Championship bracelets")}
      </div>
      <p className="mt-2 text-center text-[9px] text-white/35">Free-play honours — trophies mark league progression, never cash prizes.</p>
    </section>
  );
}
