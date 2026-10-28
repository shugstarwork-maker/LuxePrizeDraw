// Puts a board or card game into browser full screen while it is being played.
// Full screen is requested when the game page opens (right after the player's tap) and
// released when they leave it. Browsers that cannot full-screen an element, such as iPhone
// Safari, keep the page at full height and the game still fills the screen.
import { useEffect, useRef, type ReactNode } from "react";

export function GameFullscreen({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof el.requestFullscreen !== "function" || document.fullscreenElement) return;
    el.requestFullscreen().catch(() => { /* not allowed here: the page still fills the screen */ });
    return () => {
      if (document.fullscreenElement === el) void document.exitFullscreen().catch(() => { /* already left */ });
    };
  }, []);

  // In full screen the element is held to the screen height, so it scrolls itself when a lobby is taller.
  return <div ref={ref} className="min-h-[100dvh] overflow-y-auto bg-[#070605]">{children}</div>;
}
