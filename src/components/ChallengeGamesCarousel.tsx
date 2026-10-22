// Featured challenge-games carousel — stacked 3D deck, one hero card per game.
import { ChevronLeft, ChevronRight, MapPin, Timer, Swords, Trophy, Star, Sparkles, Coins } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CHALLENGE_GAMES = [
  {
    id: "chess", title: "Chess", image: "/games/chess.svg",
    rating: "9.9", match: "99%",
    facts: [["Full legal rules", MapPin], ["10-minute clock", Timer], ["Weekly league", Trophy], ["Cinematic board", Star]],
  },
  {
    id: "connect4", title: "Connect Four", image: "/games/connect-four.svg",
    rating: "9.7", match: "97%",
    facts: [["Disc drops", MapPin], ["Win-line glow", Sparkles], ["Weekly league", Trophy], ["Cinematic board", Star]],
  },
  {
    id: "draughts", title: "Draughts", image: "/games/draughts.svg",
    rating: "9.6", match: "96%",
    facts: [["Mandatory captures", Swords], ["Crowned kings", Trophy], ["Weekly league", Coins], ["Cinematic board", Star]],
  },
] as const;

export type ChallengeGameId = (typeof CHALLENGE_GAMES)[number]["id"];

export function ChallengeGamesCarousel({ onPlay }: { onPlay: (id: ChallengeGameId) => void }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setActive((v) => (v + 1) % CHALLENGE_GAMES.length), 5000);
    return () => window.clearInterval(t);
  }, [paused, active]);
  const n = CHALLENGE_GAMES.length;
  const prev = (active + n - 1) % n;
  const next = (active + 1) % n;
  const order = [prev, active, next];

  return <section className="lounge-stack" aria-label="Challenge game boards" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="lounge-stack__stage"
      onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const d = e.changedTouches[0].clientX - startX.current;
        if (d > 50) setActive((v) => (v + n - 1) % n);
        if (d < -50) setActive((v) => (v + 1) % n);
        startX.current = null;
      }}>
      {order.map((idx) => {
        const g = CHALLENGE_GAMES[idx];
        const pos = idx === active ? "c" : idx === prev ? "l" : "r";
        return <article key={g.id} className={`lounge-stack__card lounge-stack__card--${pos}`} onClick={() => { if (pos === "l") setActive(prev); if (pos === "r") setActive(next); }}>
          <img className="lounge-stack__bg" src={g.image} alt={`${g.title} board artwork`} loading="lazy" />
          <div className="lounge-stack__shade" aria-hidden="true" />
          <span className="lounge-stack__vertical" aria-hidden="true">{g.title}</span>
          <div className="lounge-stack__panel">
            {g.facts.map(([label, Icon]) => <p key={label as string}><Icon className="h-3.5 w-3.5" aria-hidden="true" /><span>{label as string}</span></p>)}
          </div>
          <div className="lounge-stack__bottom">
            <div className="lounge-stack__stats">
              <span><b>{g.rating}</b><small>Table rating</small></span>
              <span><b>{g.match}</b><small>Player match</small></span>
              <span><b>Free</b><small>Free-play</small></span>
            </div>
            <button className="lounge-stack__play" onClick={(e) => { e.stopPropagation(); onPlay(g.id); }}>Play now <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </article>;
      })}
      <button aria-label="Previous game" className="lounge-stack__arrow lounge-stack__arrow--l" onClick={() => setActive((v) => (v + n - 1) % n)}><ChevronLeft /></button>
      <button aria-label="Next game" className="lounge-stack__arrow lounge-stack__arrow--r" onClick={() => setActive((v) => (v + 1) % n)}><ChevronRight /></button>
    </div>
    <div className="lounge-stack__dots">{CHALLENGE_GAMES.map((x, i) => <button key={x.id} aria-label={x.title} onClick={() => setActive(i)} className={i === active ? "on" : ""} />)}</div>
    <p className="mt-2 text-center text-[10px] text-white/40">Free-play only · No deposits, cash wagering or cash-out · Shared weekly league</p>
  </section>;
}
