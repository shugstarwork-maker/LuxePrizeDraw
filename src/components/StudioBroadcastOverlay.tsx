import { useEffect, useState } from "react";
import { Radio, ScanLine } from "lucide-react";
import { loadBroadcast, onBroadcastChange, type StudioBroadcast } from "../lib/studioBroadcast";

/** Studio broadcast overlay for the table canvas — renders the simulated
 *  live-dealer feed (camera label, latest OCR read, latest chat line) while
 *  the /studio demo panel is on air. Hidden entirely when off air. */
export function StudioBroadcastOverlay() {
  const [b, setB] = useState<StudioBroadcast>(() => loadBroadcast());
  useEffect(() => onBroadcastChange(() => setB(loadBroadcast())), []);
  if (!b.live) return null;
  const latest = b.reads[0];
  const chat = b.chat[0];
  return <div className="poker-studio-overlay pointer-events-none absolute inset-0 z-30">
    <div className="studio-scanlines absolute inset-0 opacity-60" aria-hidden="true" />
    <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-300 backdrop-blur-sm">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /><Radio className="h-3 w-3" /> Live · {b.camera}
    </div>
    {latest && <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[9px] font-bold text-emerald-300 backdrop-blur-sm">
      <ScanLine className="h-3 w-3" /> Shoe read {latest.card} · {latest.confidence}%
    </div>}
    {chat && <div className="absolute inset-x-3 bottom-2 rounded-xl bg-black/75 px-3 py-1.5 text-[10px] text-white/80 backdrop-blur-sm">
      <b className="text-amber-100">{chat.from}:</b> {chat.text}
    </div>}
  </div>;
}
