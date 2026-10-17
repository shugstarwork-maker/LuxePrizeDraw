import { LuxePotChips } from "./LuxePotChips";
import type { ReactNode } from "react";
/** Owner-supplied table scenery; live game state is rendered separately. */
export function PokerTableArtwork({ pot, stage, children, winner }: { pot: number; stage: string; children?: ReactNode; winner?: "player" | "host" | "split" | null }) {
  return <div className="poker-table-scroll" role="region" aria-label="Poker table; full table visible" tabIndex={0}><div className="poker-table-artwork">
    <img src="/games/luxe-poker-table.png" alt="Luxe Poker black leather table with gold rails, crown and chip stacks" width={1568} height={882} />
    <div className="poker-table-artwork__live">{children}<LuxePotChips pot={pot} winner={winner} /></div>
    <div className="poker-table-artwork__state" role="status"><b>Pot: {pot.toLocaleString()} virtual chips</b><span>{stage} · Free-play · No cash value</span></div>
  </div></div>;
}
