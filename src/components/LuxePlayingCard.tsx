import React from "react";
import type { PokerCard } from '../lib/poker';
export const LuxePlayingCard: React.FC<{ card?: PokerCard; hidden?: boolean }> = ({ card, hidden }) => {
  const red = card && (card.suit === '♥' || card.suit === '♦');
  return <div className={`poker-card luxe-playing-card ${hidden ? 'luxe-playing-card--back' : red ? 'luxe-playing-card--red' : 'luxe-playing-card--face'}`} aria-label={hidden ? 'Face-down Luxe card' : card ? `${card.rank} ${card.suit}` : 'Empty card'}>
    {hidden ? <><span aria-hidden="true">♛</span><b>LUXE</b><small>POKER</small></> : card && <><b className="luxe-playing-card__rank">{card.rank}<small>{card.suit}</small></b><span className="luxe-playing-card__suit" aria-hidden="true">{card.suit}</span><small className="luxe-playing-card__brand">LUXE</small></>}
  </div>;
}
