// Mounted once near the top of the app. It waits for a streak day to be counted (see
// lib/streakEvents.ts), then plays the celebration on whichever screen the player is on.
// Opening any page with ?streakPreview=7 (any number from 1 to 9999) plays it as a preview that
// collects nothing, which is how the animation is checked without waiting for a new day.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { onStreak, previewStreak, type StreakEvent } from "../lib/streakEvents";

const StreakCelebration = lazy(() => import("./StreakCelebration").then((m) => ({ default: m.StreakCelebration })));

type Queued = { id: number; event: StreakEvent };

export function StreakCelebrationHost() {
  const [queue, setQueue] = useState<Queued[]>([]);
  const counter = useRef(0);
  const push = useCallback((event: StreakEvent) => setQueue((q) => [...q, { id: (counter.current += 1), event }]), []);

  useEffect(() => onStreak(push), [push]);
  const previewed = useRef(false);
  useEffect(() => {
    if (previewed.current) return; // development mode runs effects twice; one link plays one preview
    previewed.current = true;
    const n = previewStreak(window.location.search);
    if (n >= 1) push({ streak: n, reward: 200, preview: true });
  }, [push]);

  const current = queue[0];
  const next = useCallback(() => setQueue((q) => q.slice(1)), []);
  if (!current) return null;
  return <Suspense fallback={null}><StreakCelebration key={current.id} input={current.event} onDone={next} /></Suspense>;
}
