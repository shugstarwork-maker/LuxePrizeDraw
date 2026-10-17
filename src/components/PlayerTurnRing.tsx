import type { ReactNode } from 'react';
export function turnRingProgress(seconds: number, duration = 20) {
  return Number.isFinite(seconds) && Number.isFinite(duration) && duration > 0 ? Math.max(0, Math.min(1, seconds / duration)) : 0;
}
export function PlayerTurnRing({ active, seconds, name, children }: { active: boolean; seconds: number; name: string; children: ReactNode }) {
  const progress = turnRingProgress(seconds);
  return <span className={`player-turn-ring${active ? ' player-turn-ring--active' : ''}`} role="img" aria-label={active ? `${name}: ${Math.max(0, Math.ceil(seconds))} seconds remaining on practice turn timer` : `${name} gold avatar rim`}>
    <svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20" className="player-turn-ring__base" />{active && <circle cx="22" cy="22" r="20" className="player-turn-ring__clock" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - progress)} />}</svg>
    <span className="player-turn-ring__avatar">{children}</span>
  </span>;
}
