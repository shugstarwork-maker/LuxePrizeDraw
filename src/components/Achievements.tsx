// Achievement badges: the medal art, the unlock toast (mounted once at the app root)
// and the badge cabinet shown in the player portal and lounge profile.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "../audio/AudioProvider";
import { ACHIEVEMENT_EVENT, RARITY_COLOUR, achievementById, achievementCase, type Achievement } from "../lib/achievements";

export function AchievementMedal({ a, size = 64, locked = false }: { a: Achievement; size?: number; locked?: boolean }) {
  const c = locked ? "#3d3d46" : RARITY_COLOUR[a.rarity];
  const id = `am-${a.id}-${locked ? "l" : "u"}`;
  return <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${a.title}${locked ? " (locked)" : ""}`}>
    <defs>
      <radialGradient id={id} cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#fff" stopOpacity={locked ? 0.1 : 0.85} /><stop offset=".4" stopColor={c} /><stop offset="1" stopColor="#000" stopOpacity=".6" /></radialGradient>
    </defs>
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M50 2 L56 14 L44 14 Z" fill={c} opacity={locked ? 0.25 : 0.85} transform={`rotate(${i * 30} 50 50)`} />)}
    <circle cx="50" cy="50" r="36" fill={`url(#${id})`} stroke="#000" strokeOpacity=".45" strokeWidth="2.5" />
    <circle cx="50" cy="50" r="28" fill="none" stroke="#fff" strokeOpacity={locked ? 0.06 : 0.28} strokeWidth="1.5" />
    <text x="50" y="60" textAnchor="middle" fontSize="28" fontWeight="900" fill={locked ? "#5b5b66" : "#fff"} style={{ filter: locked ? "grayscale(1)" : undefined }}>{locked ? "🔒" : a.icon}</text>
  </svg>;
}

/** Listens for unlocks and celebrates each one in turn. Mount once at the app root. */
export function AchievementToaster() {
  const { play } = useAudio();
  const [queue, setQueue] = useState<Achievement[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const ids = (e as CustomEvent<string[]>).detail ?? [];
      setQueue((q) => [...q, ...ids.map(achievementById).filter((a): a is Achievement => Boolean(a))]);
    };
    window.addEventListener(ACHIEVEMENT_EVENT, on);
    return () => window.removeEventListener(ACHIEVEMENT_EVENT, on);
  }, []);
  const current = queue[0];
  useEffect(() => {
    if (!current) return;
    play("levelUp");
    const t = window.setTimeout(() => setQueue((q) => q.slice(1)), 3800);
    return () => window.clearTimeout(t);
  }, [current, play]);
  if (!current || typeof document === "undefined") return null;
  return createPortal(<div className="achievement-toast" role="status" aria-live="polite" key={current.id} style={{ borderColor: RARITY_COLOUR[current.rarity], boxShadow: `0 18px 50px #000c, 0 0 40px ${RARITY_COLOUR[current.rarity]}55` }} onClick={() => setQueue((q) => q.slice(1))}>
    <div className="achievement-toast__medal"><AchievementMedal a={current} size={56} /></div>
    <div className="min-w-0">
      <p className="achievement-toast__kicker" style={{ color: RARITY_COLOUR[current.rarity] }}>Achievement unlocked · {current.rarity}</p>
      <p className="achievement-toast__title">{current.title}</p>
      <p className="achievement-toast__detail">{current.detail}</p>
    </div>
  </div>, document.body);
}

export function AchievementCabinet() {
  const [items, setItems] = useState(achievementCase);
  useEffect(() => {
    const refresh = () => setItems(achievementCase());
    window.addEventListener(ACHIEVEMENT_EVENT, refresh);
    return () => window.removeEventListener(ACHIEVEMENT_EVENT, refresh);
  }, []);
  const earned = items.filter((a) => a.unlockedAt).length;
  return <section className="mt-8 rounded-[1.75rem] border border-amber-200/25 bg-[linear-gradient(145deg,#1c1508,#0c0904_70%)] p-5" aria-labelledby="achievements-title">
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Badge cabinet</p>
        <h3 id="achievements-title" className="mt-1 text-lg font-black text-amber-100">Achievements</h3>
      </div>
      <p className="font-mono text-sm font-black text-amber-100">{earned}/{items.length}</p>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
      {items.map((a) => <div key={a.id} className={`achievement-tile${a.unlockedAt ? " achievement-tile--earned" : ""}`} title={a.detail}>
        <AchievementMedal a={a} size={52} locked={!a.unlockedAt} />
        <b>{a.title}</b>
        {a.unlockedAt ? <small>{new Date(a.unlockedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small>
          : <><span className="achievement-tile__bar" aria-hidden="true"><i style={{ width: `${Math.round(a.progress * 100)}%` }} /></span><small>{Math.min(a.current, a.target).toLocaleString()}/{a.target.toLocaleString()}</small></>}
      </div>)}
    </div>
    <p className="mt-3 text-[10px] text-white/40">Free-play honours — no cash value.</p>
  </section>;
}
