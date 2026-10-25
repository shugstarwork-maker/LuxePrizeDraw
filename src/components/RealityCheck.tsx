import { useEffect, useState } from "react";
import { AlarmClock, Coffee, X } from "lucide-react";
import { playBlocked, reminderMinutes, sessionMinutes } from "../lib/responsiblePlay";

const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); };

/**
 * Global reality-check pop-up. Polls the session clock and interrupts play at
 * the configured interval (30/60/120 min, set in the Responsible Play Centre).
 * Suppressed entirely while a cooling-off/self-exclusion is active — those
 * screens carry their own stronger messaging.
 */
export function RealityCheck() {
  const [due, setDue] = useState<number | null>(null);

  useEffect(() => {
    let lastFired = -1;
    const id = window.setInterval(() => {
      if (playBlocked().blocked) { setDue(null); return; }
      const mins = sessionMinutes();
      const interval = reminderMinutes();
      const milestone = Math.floor(mins / interval);
      if (milestone >= 1 && mins >= milestone * interval && milestone !== lastFired) {
        lastFired = milestone;
        setDue(mins);
      }
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (due === null) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Reality check" data-testid="reality-check-popup">
      <div className="w-full max-w-md rounded-3xl border border-amber-200/30 bg-[#14100a] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-amber-200"><AlarmClock className="h-4 w-4" /> Reality check</p>
          <button onClick={() => setDue(null)} aria-label="Dismiss reality check" data-testid="reality-dismiss" className="rounded-lg bg-white/10 p-1.5 text-white/60 transition hover:bg-white/20"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-4 text-2xl font-black" data-testid="reality-minutes">You've been playing for {due} minutes</p>
        <p className="mt-2 text-xs leading-relaxed text-white/60">
          Everything here is free-play with zero cash value — even so, regular breaks keep it fun.
          You can change how often this appears in the Responsible Play Centre.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button onClick={() => setDue(null)} data-testid="reality-continue" className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-3 text-xs font-black text-black shadow-lg active:scale-95">Keep playing</button>
          <button onClick={() => { setDue(null); navigate("/responsible-play"); }} data-testid="reality-break" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-black text-white/75 active:scale-95"><Coffee className="h-4 w-4" /> Take a break</button>
        </div>
      </div>
    </div>
  );
}
