import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

/**
 * Explicit full-screen toggle for the poker table. Full-screen is only ever
 * entered through this button (a user gesture), and the control doubles as
 * rotate guidance on phones. Gameplay state is never remounted — only the
 * containing page element is sent full-screen.
 */
export function PokerFullscreen() {
  const [active, setActive] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const sync = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = () => {
    const table = document.getElementById("poker-league");
    if (!table || typeof table.requestFullscreen !== "function") {
      setUnsupported(true);
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      table.requestFullscreen().catch(() => setUnsupported(true));
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded-xl border border-amber-200/40 bg-black/50 px-4 py-2 text-xs font-black text-amber-100 shadow-lg backdrop-blur"
        aria-pressed={active}
      >
        {active ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        {active ? "Exit full-screen" : "Enter full-screen table"}
      </button>
      <p className="text-[10px] text-white/45">Turn your phone sideways for the best view of the table.</p>
      {unsupported && (
        <p role="status" className="text-[10px] text-amber-200">
          Fullscreen is unavailable in this browser — rotate your phone sideways instead.
        </p>
      )}
    </div>
  );
}
