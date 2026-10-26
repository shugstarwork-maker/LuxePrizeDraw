import { useState } from 'react';
import { ChessBoard } from './GamesArena';
import { useAudio } from '../audio/AudioProvider';
import { bumpStat } from '../lib/achievements';
const navGo = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); };
export function LuxeChessPage() {
  const { play } = useAudio();
  const [muted, setMuted] = useState(false);
  return <main className="luxe-chess-play-page">
    <nav aria-label="Chess controls"><a href="/arcade" onClick={(e) => { e.preventDefault(); navGo("/arcade"); }}>‹ Luxe Arcade</a><span>LUXE CHESS</span><button type="button" aria-pressed={muted} onClick={() => setMuted(value => !value)}>{muted ? 'Enable game sounds' : 'Mute game sounds'}</button></nav>
    <div className="luxe-chess-play-page__game"><ChessBoard sound={effect => { if (!muted) play(effect); }} onResult={result => { if (result === "win") bumpStat("chessFinished"); }} /></div>
    <p>Local two-player chess · Free-play · No cash value</p>
  </main>;
}
