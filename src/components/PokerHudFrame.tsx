import { ChevronLeft, Trophy, Volume2, VolumeX, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Zone B — the persistent HUD frame. The same four corners on every card-game
 * table (landscape only, via CSS) so players build muscle memory:
 *   Top Left     table info & league standing
 *   Top Right    menu / leaderboard / audio shortcuts
 *   Bottom Left  chat & social toggle (opens the chat popover)
 *   Bottom Right player profile mini-card (bankroll + active bet)
 * Zone C (contextual action buttons) stays in the existing action dock.
 */
export function PokerHudFrame({
  tableName,
  blinds,
  handNumber,
  tierName,
  tierColour,
  leagueXp,
  wallet,
  atTable,
  activeBet,
  audioOn,
  onAudio,
  onLobby,
  onLeaderboard,
  onChat,
  chatOpen,
  chatPanel,
}: {
  tableName: string;
  blinds: string;
  handNumber: number;
  tierName: string;
  tierColour: string;
  leagueXp: number;
  wallet: number;
  atTable: number;
  activeBet: number;
  audioOn: boolean;
  onAudio: () => void;
  onLobby: () => void;
  onLeaderboard: () => void;
  onChat: () => void;
  chatOpen: boolean;
  chatPanel: ReactNode;
}) {
  return (
    <>
      <div className="hud-zone hud-zone--tl">
        <div className="hud-panel" aria-label="Table information">
          <p className="hud-panel__row"><b>{tableName}</b></p>
          <p className="hud-panel__row">Blinds {blinds} · Hand #{handNumber}</p>
          <p className="hud-panel__row"><span style={{ color: tierColour }}>{tierName} League</span> · {leagueXp} XP</p>
        </div>
      </div>
      <div className="hud-zone hud-zone--tr">
        <button type="button" className="hud-icon-btn" aria-label="Back to lobby" onClick={onLobby}><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" className="hud-icon-btn" aria-label="League leaderboard" onClick={onLeaderboard}><Trophy className="h-4 w-4" /></button>
        <button type="button" className="hud-icon-btn" aria-label={audioOn ? "Mute audio" : "Unmute audio"} onClick={onAudio}>{audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
      </div>
      <div className="hud-zone hud-zone--bl">
        {chatOpen && chatPanel}
        <button type="button" className="hud-icon-btn" aria-label={chatOpen ? "Close table chat" : "Open table chat"} onClick={onChat}><MessageCircle className="h-4 w-4" /></button>
      </div>
      <div className="hud-zone hud-zone--br">
        <div className="hud-panel" aria-label="Your seat">
          <p className="hud-panel__row">You · <b>{atTable.toLocaleString()}</b> at table</p>
          <p className="hud-panel__row">Wallet {wallet.toLocaleString()}{activeBet > 0 ? <> · active bet <b>{activeBet.toLocaleString()}</b></> : ""}</p>
        </div>
      </div>
    </>
  );
}
