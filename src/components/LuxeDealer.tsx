import React from "react";

// Vex Delacroix — fictional AI croupier of the Luxe Lounge, rendered from an
// AI-generated portrait (user-supplied asset, public/dealer/vex-bust.png).
// Life: breathing idle, gold glow pulse on the player's turn, a flick-tilt
// when the hand is dealt, and the phase-aware banter bubble above.
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
      <div key={key} className="luxe-dealer-bubble mb-1.5 max-w-48 rounded-2xl border border-amber-200/40 bg-black/75 px-3 py-1.5 text-center text-[10px] font-bold leading-tight text-amber-100 backdrop-blur">
        {LINES[key]}
      </div>
      <div className={`luxe-dealer-medallion ${active ? "luxe-dealer-alive" : ""} ${dealing ? "luxe-dealer-deal" : ""}`}>
        <img src="/dealer/vex-bust.png" alt="Vex Delacroix, AI croupier" className="h-24 w-24 rounded-full object-cover sm:h-28 sm:w-28" draggable={false}/>
      </div>
    </div>
  );
};
