import { ShieldCheck, X } from "lucide-react";
import { pfrPct, showdownWinPct, styleTag, vpipPct, type HudEntry } from "../lib/pokerHud";

function Meter({ label, hint, pct, colour }: { label: string; hint: string; pct: number | null; colour: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-white/60">{label}</span>
        <span className="font-mono text-sm font-black" style={{ color: colour }}>{pct === null ? "—" : `${pct}%`}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct ?? 0}%`, background: colour }} />
      </div>
      <p className="mt-1 text-[9px] text-white/40">{hint}</p>
    </div>
  );
}

/**
 * Smart HUD card — tap any avatar at a Luxe table to see their core stats.
 * Same read for everyone: built-in, open, no third-party trackers allowed.
 */
export function PokerSmartHud({ name, initials, entry, live, onClose }: {
  name: string;
  initials: string;
  entry: HudEntry;
  /** live multiplayer opponent — stats build from hands watched at this table */
  live?: boolean;
  onClose: () => void;
}) {
  const tag = styleTag(entry);
  const vpip = vpipPct(entry);
  const pfr = pfrPct(entry);
  const sd = showdownWinPct(entry);
  return (
    <div className="poker-hud-overlay" role="dialog" aria-label={`Smart HUD for ${name}`} onClick={onClose}>
      <div className="poker-hud-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Close Smart HUD" onClick={onClose} className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-white/50 hover:text-white"><X className="h-4 w-4" /></button>
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-amber-200/60 bg-gradient-to-br from-amber-900 to-black font-black text-amber-100">{initials}</span>
          <div>
            <p className="font-black text-amber-100">{name}</p>
            <span className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider" style={{ background: `${tag.colour}22`, color: tag.colour, border: `1px solid ${tag.colour}55` }}>{tag.label}</span>
          </div>
        </div>
        {entry.hands === 0 ? (
          <p className="mt-4 rounded-xl bg-white/5 p-3 text-center text-xs text-white/55">No hands tracked yet — stats build automatically as {name} plays at your tables.</p>
        ) : (
          <div className="mt-4 space-y-3">
            <Meter label="VPIP" hint="How often they voluntarily play a hand" pct={vpip} colour="#7be3a8" />
            <Meter label="PFR" hint="How often they come in raising" pct={pfr} colour="#ff9d66" />
            <Meter label="Won at showdown" hint={entry.showdowns ? `${entry.showdownWins} of ${entry.showdowns} showdowns` : "No showdowns yet"} pct={sd} colour="#ffe095" />
          </div>
        )}
        <p className="mt-4 flex items-start gap-1.5 border-t border-white/10 pt-3 text-[9px] leading-relaxed text-white/40">
          <ShieldCheck className="mt-px h-3 w-3 flex-none text-emerald-200/70" />
          <span>Smart HUD — the same read for everyone at the table. Third-party tracking software is banned at Luxe tables{live ? " · live opponent stats build as hands complete" : ""} · {entry.hands} hand{entry.hands === 1 ? "" : "s"} tracked.</span>
        </p>
      </div>
    </div>
  );
}
