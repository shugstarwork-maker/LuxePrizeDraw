import React from "react";

// Vex Delacroix — fictional AI croupier of the Luxe Lounge. Original SVG
// character (no real-person likeness): blinking eyes, talking mouth, a
// dealing arm that sweeps when cards go out, and phase-aware salon banter.
type DealerProps = { stage: string; active: boolean; mood: "idle" | "win" | "lose" };

const LINES: Record<string, string> = {
  idle: "Take your seat. The salon awaits.",
  deal: "Cards are out — fortune favours the bold.",
  flop: "The flop, mesdames et messieurs.",
  turn: "The turn. Everything can change.",
  river: "The river. No turning back now.",
  yourmove: "Your move.",
  win: "Magnifique — the pot is yours.",
  lose: "The house extends its sympathies.",
};

export const LuxeDealer: React.FC<DealerProps> = ({ stage, active, mood }) => {
  const dealing = stage === "pre-flop";
  const key = mood === "win" ? "win" : mood === "lose" ? "lose" : active ? "yourmove" : dealing ? "deal" : stage in LINES ? stage : "idle";
  return (
    <div className="pointer-events-none absolute left-1/2 top-1 z-30 flex -translate-x-1/2 flex-col items-center">
      <div key={key} className="luxe-dealer-bubble mb-1 max-w-44 rounded-2xl border border-amber-200/40 bg-black/75 px-3 py-1.5 text-center text-[10px] font-bold leading-tight text-amber-100 backdrop-blur">
        {LINES[key]}
      </div>
      <svg viewBox="0 0 120 150" className="h-24 w-24 drop-shadow-[0_6px_16px_rgba(0,0,0,.5)]" aria-label="Vex Delacroix, AI croupier" role="img">
        {/* torso: midnight tuxedo with gold lapels */}
        <path d="M28 150 C28 112 44 98 60 98 C76 98 92 112 92 150 Z" fill="#101014"/>
        <path d="M60 100 L46 150 L60 128 L74 150 Z" fill="#1d1d24"/>
        <path d="M60 100 L49 118 L60 150 M60 100 L71 118 L60 150" stroke="#d4af37" strokeWidth="1.4" fill="none" opacity=".9"/>
        <path d="M55 100 L60 112 L65 100 L60 96 Z" fill="#f3f0e6"/>
        <path d="M52 94 L60 99 L52 104 Z M68 94 L60 99 L68 104 Z" fill="#d4af37"/>
        {/* head */}
        <ellipse cx="60" cy="66" rx="21" ry="24" fill="#e8c39a"/>
        {/* slicked hair */}
        <path d="M39 62 C39 40 52 34 60 34 C70 34 81 42 81 62 C77 52 74 48 66 46 C58 44 46 50 39 62 Z" fill="#17130e"/>
        {/* ears */}
        <ellipse cx="38.5" cy="68" rx="3.4" ry="5" fill="#dfb48c"/><ellipse cx="81.5" cy="68" rx="3.4" ry="5" fill="#dfb48c"/>
        {/* brows */}
        <path d="M47 58 Q53 55 58 58" stroke="#17130e" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M62 58 Q67 55 73 58" stroke="#17130e" strokeWidth="2" fill="none" strokeLinecap="round"/>
        {/* eyes (blink) — pupils slide toward the player when it's your move */}
        <g className="luxe-dealer-eye">
          <ellipse cx="52" cy="65" rx="4.6" ry="4" fill="#fff"/><circle cx={active ? 53.6 : 52.8} cy="65.6" r="2" fill="#241a10"/>
        </g>
        <g className="luxe-dealer-eye" style={{ animationDelay: ".08s" }}>
          <ellipse cx="68" cy="65" rx="4.6" ry="4" fill="#fff"/><circle cx={active ? 69.6 : 68.8} cy="65.6" r="2" fill="#241a10"/>
        </g>
        {/* nose */}
        <path d="M60 66 L58.5 74 Q60 76 61.5 74" stroke="#c99e73" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        {/* mouth (talks while speaking / your move) */}
        <ellipse cx="60" cy="82" rx="6.5" ry={key === "idle" ? 1.6 : 3} fill="#7c3a2d" className={key === "idle" ? "" : "luxe-dealer-mouth-talk"} style={{ transformBox: "fill-box", transformOrigin: "center" }}/>
        {/* dealing arm + card (sweeps when the hand is dealt) */}
        <g className={dealing ? "luxe-dealer-arm-deal" : ""} style={{ transformBox: "view-box", transformOrigin: "94px 96px" }}>
          <path d="M90 104 Q108 98 110 84" stroke="#101014" strokeWidth="9" fill="none" strokeLinecap="round"/>
          <circle cx="110" cy="82" r="5.5" fill="#e8c39a"/>
          {dealing && <rect x="104" y="66" width="12" height="17" rx="2" fill="#f8f6ef" stroke="#d4af37" strokeWidth="1" transform="rotate(18 110 74)"/>}
        </g>
        {/* gold pocket square + buttons */}
        <rect x="70" y="120" width="7" height="5" fill="#d4af37" opacity=".85"/>
      </svg>
    </div>
  );
};
