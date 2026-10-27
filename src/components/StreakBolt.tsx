// Full-screen lightning bolt that flashes across the table when a player reaches a hand streak.
// Remounts on each trigger (via key) and reports completion so the parent can clear it.
export function StreakBolt({ onDone }: { onDone: () => void }) {
  return <div className="streak-bolt" aria-hidden="true" onAnimationEnd={onDone}>
    <svg viewBox="0 0 120 600" preserveAspectRatio="none">
      <polygon points="78,0 24,330 58,330 26,600 104,250 68,250 98,0" />
    </svg>
  </div>;
}
