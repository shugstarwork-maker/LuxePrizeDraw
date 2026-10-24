import { useEffect, useRef, useState } from "react";
import { BadgePoundSterling, Clapperboard, X } from "lucide-react";
import { AD_LENGTH_SECONDS, AD_REWARD_CHIPS } from "../lib/pokerMonetization";

/**
 * Simulated rewarded-ad break — a placeholder for a real ad SDK (AdMob /
 * Google H5 rewarded ads) once the app ships. Plays a 15s demo card, then
 * credits free-play chips. Entry stays free: the only "payment" is attention.
 */
export function AdBreakOverlay({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(AD_LENGTH_SECONDS);
  const finished = useRef(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          if (!finished.current) { finished.current = true; onDone(); }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => { finished.current = true; onCancel(); };

  return (
    <div className="ad-break" role="dialog" aria-modal="true" aria-label="Sponsored break">
      <div className="ad-break__card">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-amber-200"><Clapperboard className="h-4 w-4" /> Sponsored break · demo</p>
          <button onClick={skip} aria-label="Close without reward" className="rounded-lg bg-white/10 p-1.5 text-white/60 transition hover:bg-white/20"><X className="h-4 w-4" /></button>
        </div>

        <div className="ad-break__screen mt-4">
          <BadgePoundSterling className="h-10 w-10 text-amber-300" />
          <p className="mt-3 text-lg font-black text-amber-50">LuxePrizeDraw sponsors your chips</p>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-white/55">
            This is where a rewarded video ad will play once an ad network is connected. Today it's a demo card — your reward still lands.
          </p>
        </div>

        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-1000" style={{ width: `${((AD_LENGTH_SECONDS - secondsLeft) / AD_LENGTH_SECONDS) * 100}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-white/50">
            <span>Reward: {AD_REWARD_CHIPS.toLocaleString()} free-play chips</span>
            <span className="font-mono text-amber-100">0:{String(secondsLeft).padStart(2, "0")}</span>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/40">
          Demo ad break — no real advertiser, no tracking. Chips are free-play with no cash value and can never be withdrawn or converted.
        </p>
      </div>
    </div>
  );
}
