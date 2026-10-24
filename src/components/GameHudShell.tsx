import { type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Shared board-game HUD shell — mirrors the poker table chrome so every game
// carries the same functional elements:
//   • top bar: back navigation + wallet/arena balance
//   • circular player avatars flanking the board
//   • bottom-left dynamic legal line: "<game state> · Free-play · No cash value"

export type HudPlayer = {
  name: string;
  badge: string;          // piece colour / side, e.g. "Ivory" / "Onyx"
  piece: string;          // emoji marker
  active: boolean;
  stat?: string;          // e.g. clock or captured count
};

export function GameHudShell({
  title,
  balanceLabel,
  stateLabel,       // dynamic game state, e.g. "Turn 12" / "Move 8 · Ivory to move"
  players,
  muted,
  onToggleMute,
  onExit,
  children,
}: {
  title: string;
  balanceLabel: string;   // e.g. "1,000 coins wallet · arena rating 800"
  stateLabel: string;
  players: [HudPlayer, HudPlayer];
  muted: boolean;
  onToggleMute: () => void;
  onExit: () => void;
  children: ReactNode;
}) {
  return <div className="game-hud" data-testid="game-hud">
    <header className="flex items-center justify-between gap-2 rounded-2xl border border-amber-200/30 bg-black/35 px-3 py-2" data-testid="hud-topbar">
      <button onClick={onExit} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-black" data-testid="hud-exit">‹ Arena</button>
      <span className="font-mono text-xs font-black text-amber-100 sm:text-sm" data-testid="hud-balance">{balanceLabel}</span>
      <button onClick={onToggleMute} aria-pressed={muted} className="rounded-lg bg-white/10 p-2">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
    </header>

    <article className="relative mt-3 overflow-hidden rounded-[2rem] border border-amber-200/50 bg-[radial-gradient(ellipse_at_center,#2a2318,#151009_55%,#090604)] p-3 shadow-[0_0_70px_rgba(212,175,55,.22),inset_0_0_140px_rgba(0,0,0,0.5)] sm:p-5">
      <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[.24em] text-amber-200">{title}</p>
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        {/* Left avatar */}
        <HudAvatar player={players[0]} side="left" />
        <div className="min-w-0 flex-1">{children}</div>
        {/* Right avatar */}
        <HudAvatar player={players[1]} side="right" />
      </div>
      {/* Dynamic legal disclaimer — same position and pattern as the poker table */}
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-white/40" role="status" data-testid="hud-disclaimer">
        {stateLabel} · Free-play · No cash value
      </p>
    </article>
  </div>;
}

function HudAvatar({ player, side }: { player: HudPlayer; side: "left" | "right" }) {
  return <div className={`flex w-14 shrink-0 flex-col items-center gap-1 sm:w-20 ${side === "right" ? "order-last" : ""}`} data-testid={`hud-avatar-${side}`}>
    <span className={`grid h-11 w-11 place-items-center rounded-full border-2 text-lg transition sm:h-14 sm:w-14 sm:text-2xl ${player.active ? "border-amber-300 bg-amber-400/15 shadow-[0_0_18px_rgba(252,211,77,.45)]" : "border-white/15 bg-black/40"}`}>
      {player.piece}
    </span>
    <b className="max-w-full truncate text-center text-[10px] font-black text-white sm:text-[11px]">{player.name}</b>
    <span className="text-center text-[8px] font-black uppercase tracking-widest text-white/40">{player.badge}</span>
    {player.stat && <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-mono text-[9px] font-black text-amber-100">{player.stat}</span>}
  </div>;
}
