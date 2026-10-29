// The daily-streak celebration as a full-screen overlay. The scene itself (markup, timeline and
// particles) lives in streakScene.ts and its looks in streakCelebration.css. This wrapper adds what
// only React knows about: sound, the keyboard, the page behind it, and when to close.
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useAudio } from "../audio/AudioProvider";
import type { SoundEffect } from "../audio/config";
import "./streakCelebration.css";
import { playStreakScene, streakMarkup, streakRootAttributes, streakSceneModel, type StreakCue, type StreakScene, type StreakSceneInput } from "./streakScene";

/** One sound per beat of the scene. The number rolling is left quiet on purpose. */
const CUE_SOUNDS: Record<StreakCue, SoundEffect | null> = {
  ignite: "levelUp",
  roll: null,
  stamp: "chipDrop",
  perfect: "jackpotReveal",
  reward: "coinWin",
};

const LEAVE_MS = 220;

export function StreakCelebration({ input, onDone }: { input: StreakSceneInput; onDone: () => void }) {
  const { play } = useAudio();
  const playRef = useRef(play);
  playRef.current = play;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const model = useMemo(() => streakSceneModel(input), [input]);
  const html = useMemo(() => ({ __html: streakMarkup(model) }), [model]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const pageScroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    try { root.focus({ preventScroll: true }); } catch { /* the overlay may already be gone */ }

    let scene: StreakScene | null = null;
    let leaving = false;
    let leaveTimer = 0;
    const isReady = () => root.classList.contains("is-ready");

    const close = () => {
      if (leaving) return;
      leaving = true;
      root.setAttribute("data-leaving", "true");
      leaveTimer = window.setTimeout(() => doneRef.current(), reduced ? 0 : LEAVE_MS);
    };

    scene = playStreakScene(root, model, {
      reducedMotion: reduced,
      onCue: (cue) => { const sound = CUE_SOUNDS[cue]; if (sound) playRef.current(sound); },
    });

    // The Continue button only works once the scene has finished; a tap anywhere else skips ahead to it.
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest("[data-streak-close]")) { if (isReady()) close(); return; }
      if (!isReady()) scene?.skip();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); if (isReady()) close(); else scene?.skip(); return; }
      if (e.key === "Tab") {
        // The button is the only thing to reach, so keep focus on it (or on the overlay while it is waiting).
        e.preventDefault();
        const button = root.querySelector<HTMLButtonElement>("[data-streak-close]");
        (button && !button.disabled ? button : root).focus({ preventScroll: true });
        return;
      }
      if ((e.key === "Enter" || e.key === " ") && !isReady() && document.activeElement === root) { e.preventDefault(); scene?.skip(); }
    };
    root.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(leaveTimer);
      window.removeEventListener("keydown", onKey);
      root.removeEventListener("click", onClick);
      scene?.destroy();
      document.body.style.overflow = pageScroll;
      try { opener?.focus({ preventScroll: true }); } catch { /* it may have been removed */ }
    };
  }, [model]);

  if (typeof document === "undefined") return null;
  // The class name never changes after this: the scene adds is-ready and is-skipped to it directly,
  // and React replacing the whole class list would wipe them.
  return createPortal(
    <div ref={rootRef} className="streak" role="dialog" aria-modal="true" aria-label="Daily streak" tabIndex={-1} {...streakRootAttributes(model)} dangerouslySetInnerHTML={html} />,
    document.body,
  );
}
