import { ChevronLeft, ChevronRight, Crown, Trophy, Volume2, VolumeX, MessageCircle, Users, HelpCircle, PanelRightClose, PanelRightOpen, Settings, Info, LogOut, Wallet } from "lucide-react";
import { useState, type MouseEvent, type ReactNode } from "react";

/**
 * Zone B — the persistent HUD frame. On wide landscape it becomes the
 * control-room console: a black column on the right styled after pro poker
 * apps — labelled nav buttons, the table card, SEAT & STACKS, a labelled
 * Chat / Settings / Players row, a TABLE OPTIONS list (only options not
 * already in the nav or quick row), then your cards and the action dock,
 * which stays pinned to the bottom of the column so it never covers the felt.
 * The console minimises into a slim tab strip (one tab per option) so the
 * felt can run nearly edge-to-edge; the action dock then floats bottom-centre.
 * Everywhere else the wrapper is display:contents and the four corners pin:
 *   Top Left     table info & league standing
 *   Top Right    menu / leaderboard / audio shortcuts
 *   Bottom Left  chat & social toggle (opens the chat popover)
 *   Bottom Right player profile mini-card (bankroll + active bet)
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
  players,
  onSettings,
  ticker,
  handStrip,
  dock,
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
  /** Seat roster for the Players popover in the console. */
  players?: { name: string; chips: number; isBot: boolean }[];
  /** Settings — cycles the table theme. */
  onSettings?: () => void;
  /** Console slots (wide landscape control-room): tournament ticker, your
   *  face-up cards on the black pad, and the action/deal dock. On narrower
   *  layouts these render in their classic positions instead. */
  ticker?: ReactNode;
  handStrip?: ReactNode;
  dock?: ReactNode;
}) {
  const [playersOpen, setPlayersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const minimise = (e: MouseEvent<HTMLElement>) => e.currentTarget.closest(".poker-playing-page")?.classList.add("poker-console-min");
  const expand = (e: MouseEvent<HTMLElement>) => e.currentTarget.closest(".poker-playing-page")?.classList.remove("poker-console-min");
  const openChat = (e: MouseEvent<HTMLElement>) => { expand(e); if (!chatOpen) onChat(); };
  const openHelp = (e: MouseEvent<HTMLElement>) => { expand(e); setHelpOpen(true); setPlayersOpen(false); setInfoOpen(false); };
  return (
    <div className="poker-console" data-testid="poker-console">
      <button type="button" className="poker-console__collapse" aria-label="Minimise console to tabs" onClick={minimise}><PanelRightClose className="h-4 w-4" /><span>Minimise</span></button>
      {/* Minimised state: one tab per option. Sound works in place; every
          other tab re-opens the console straight to that option. */}
      <div className="poker-console-tabs" data-testid="poker-console-tabs" role="toolbar" aria-label="Table options">
        <button type="button" className="hud-icon-btn" aria-label="Expand console" onClick={expand}><PanelRightOpen className="h-4 w-4" /></button>
        <button type="button" className="hud-icon-btn" aria-label="Back to lobby" onClick={onLobby}><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" className="hud-icon-btn" aria-label="League leaderboard" onClick={onLeaderboard}><Trophy className="h-4 w-4" /></button>
        <button type="button" className="hud-icon-btn" aria-label="Open table chat" onClick={openChat}><MessageCircle className="h-4 w-4" /></button>
        <button type="button" className="hud-icon-btn" aria-label={audioOn ? "Mute audio" : "Unmute audio"} onClick={onAudio}>{audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}</button>
        <button type="button" className="hud-icon-btn" aria-label="How to play" onClick={openHelp}><HelpCircle className="h-4 w-4" /></button>
      </div>

      {/* Labelled nav row — back, Leaderboard, Sound. */}
      <div className="hud-zone hud-zone--tr">
        <button type="button" className="hud-icon-btn" aria-label="Back to lobby" onClick={onLobby}><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" className="console-nav-btn" aria-label="League leaderboard" onClick={onLeaderboard}><Trophy className="h-4 w-4" /><span>Leaderboard</span></button>
        <button type="button" className="console-nav-btn" aria-label={audioOn ? "Mute audio" : "Unmute audio"} onClick={onAudio}>{audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}<span>Sound</span></button>
      </div>

      {/* Table card — crown coin emblem + table lines, like the pro apps. */}
      <div className="hud-zone hud-zone--tl">
        <div className="hud-panel console-table-card" aria-label="Table information">
          <span className="console-table-card__coin" aria-hidden="true"><Crown className="h-4 w-4" /></span>
          <span className="console-table-card__body">
            <p className="hud-panel__row console-table-card__title"><b>{tableName}</b></p>
            <p className="hud-panel__row">Blinds {blinds} · Hand #{handNumber}</p>
            <p className="hud-panel__row console-table-card__tier"><span style={{ color: tierColour }}>{tierName}</span> · {leagueXp} XP</p>
          </span>
        </div>
      </div>

      {ticker}

      {/* Seat & stacks. */}
      <div className="hud-zone hud-zone--br">
        <p className="console-section"><Wallet className="h-3 w-3" />Seat &amp; Stacks</p>
        <div className="hud-panel console-seat-panel" aria-label="Your seat">
          <span className="console-seat-panel__icon" aria-hidden="true"><Wallet className="h-3.5 w-3.5" /></span>
          <span className="console-seat-panel__body">
            <p className="hud-panel__row">You · <b>{atTable.toLocaleString()}</b> at table</p>
            <p className="hud-panel__row">Wallet {wallet.toLocaleString()}{activeBet > 0 ? <> · active bet <b>{activeBet.toLocaleString()}</b></> : ""}</p>
          </span>
        </div>
      </div>

      {/* Chat toggle keeps its classic bottom-left slot outside the console. */}
      <div className="hud-zone hud-zone--bl">
        {chatOpen && chatPanel}
        <button type="button" className="hud-icon-btn" aria-label={chatOpen ? "Close table chat" : "Open table chat"} onClick={onChat}><MessageCircle className="h-4 w-4" /></button>
      </div>

      {/* Labelled quick row: Chat / Settings / Players. */}
      <div className="poker-console-quick" data-testid="poker-console-quick">
        <button type="button" className="console-nav-btn" aria-label={chatOpen ? "Close table chat" : "Open table chat"} onClick={onChat}><MessageCircle className="h-4 w-4" /><span>Chat</span></button>
        <button type="button" className="console-nav-btn" aria-label="Table settings" onClick={onSettings}><Settings className="h-4 w-4" /><span>Settings</span></button>
        <button type="button" className="console-nav-btn" aria-label={playersOpen ? "Hide players" : "Show players"} onClick={() => { setPlayersOpen((v) => !v); setHelpOpen(false); setInfoOpen(false); }}><Users className="h-4 w-4" /><span>Players</span></button>
        {playersOpen && <div className="hud-chat-pop poker-console-pop" role="log" aria-label="Players at the table">
          {(players ?? []).map((p) => <p key={p.name}><b>{p.name}</b>{p.isBot ? "" : " (you)"} — {p.chips.toLocaleString()}</p>)}
        </div>}
      </div>

      {/* TABLE OPTIONS — chevron rows, like the pro apps. */}
      <div className="poker-console-options" data-testid="poker-console-options">
        <p className="console-section">Table Options</p>
        <button type="button" className="console-option-row" aria-label="Table info" onClick={() => { setInfoOpen((v) => !v); setPlayersOpen(false); setHelpOpen(false); }}><Info className="h-3.5 w-3.5" /><span>Table Info</span><ChevronRight className="h-3.5 w-3.5" /></button>
        <button type="button" className="console-option-row" aria-label="How to play" onClick={openHelp}><HelpCircle className="h-3.5 w-3.5" /><span>How to Play</span><ChevronRight className="h-3.5 w-3.5" /></button>
        <button type="button" className="console-option-row" aria-label="Leave table" onClick={onLobby}><LogOut className="h-3.5 w-3.5" /><span>Leave Table</span><ChevronRight className="h-3.5 w-3.5" /></button>
        {infoOpen && <div className="hud-chat-pop poker-console-pop" role="note" aria-label="Table info detail">
          <p><b>{tableName}</b> — Blinds {blinds}, hand #{handNumber}.</p>
          <p>{tierName} League · {leagueXp} XP. Blinds rise on the ticker clock; free-play chips only.</p>
        </div>}
        {helpOpen && <div className="hud-chat-pop poker-console-pop" role="note" aria-label="How to play">
          <p><b>No-Limit Texas Hold'em.</b> Two hole cards, five community cards — make the best five-card hand. Blinds rise on the ticker clock.</p>
          <p>Free-play chips only — no cash value, ever.</p>
        </div>}
      </div>

      {handStrip && <div className="poker-console-hand" data-testid="poker-console-hand">{handStrip}</div>}
      {dock}
    </div>
  );
}
