// Featured card-games carousel — stacked 3D deck, one hero card per game.
import { ChevronLeft, ChevronRight, MapPin, CalendarDays, Users, Trophy, Star, Sparkles, Coins } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LOUNGE_GAMES = [
  {
    id: "poker", title: "Texas Hold'em", image: "/games/holdem-card.png", href: "/poker",
    rating: "9.8", match: "98%", chips: "1,000",
    facts: [["No-limit Hold'em", MapPin], ["6-seat tables", Users], ["Weekly league", Trophy], ["Free-play chips", Coins]],
  },
  {
    id: "blackjack", title: "Luxe Blackjack", image: "/games/blackjack-card.png", href: "/blackjack",
    rating: "9.7", match: "96%", chips: "1,000",
    facts: [["Beat the dealer", MapPin], ["3:2 blackjack", Star], ["Weekly league", Trophy], ["Free-play chips", Coins]],
  },
  {
    id: "brag", title: "3 Card Brag", image: "/games/brag-card.png", href: "/brag",
    rating: "9.6", match: "95%", chips: "1,000",
    facts: [["The British classic", MapPin], ["Ante & play", Sparkles], ["Weekly league", Trophy], ["Free-play chips", Coins]],
  },
] as const;

const go = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); };

export function LoungeGamesCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setActive((v) => (v + 1) % LOUNGE_GAMES.length), 5000);
    return () => window.clearInterval(t);
  }, [paused, active]);
  const n = LOUNGE_GAMES.length;
  const prev = (active + n - 1) % n;
  const next = (active + 1) % n;
  const order = [prev, active, next];

  return <section className="lounge-stack" aria-label="Card game lounges" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
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
        const g = LOUNGE_GAMES[idx];
        const pos = idx === active ? "c" : idx === prev ? "l" : "r";
        return <article key={g.id} className={`lounge-stack__card lounge-stack__card--${pos}`} onClick={() => { if (pos === "l") setActive(prev); if (pos === "r") setActive(next); }}>
          <img className="lounge-stack__bg" src={g.image} alt={`${g.title} table artwork`} loading="lazy" />
          <div className="lounge-stack__shade" aria-hidden="true" />
          <span className="lounge-stack__vertical" aria-hidden="true">{g.title}</span>
          <div className="lounge-stack__panel">
            {g.facts.map(([label, Icon]) => <p key={label as string}><Icon className="h-3.5 w-3.5" aria-hidden="true" /><span>{label as string}</span></p>)}
          </div>
          <div className="lounge-stack__bottom">
            <div className="lounge-stack__stats">
              <span><b>{g.rating}</b><small>Table rating</small></span>
              <span><b>{g.match}</b><small>Player match</small></span>
              <span><b>{g.chips}</b><small>Free chips</small></span>
            </div>
            <button className="lounge-stack__play" onClick={(e) => { e.stopPropagation(); go(g.href); }}>Play now <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </article>;
      })}
      <button aria-label="Previous game" className="lounge-stack__arrow lounge-stack__arrow--l" onClick={() => setActive((v) => (v + n - 1) % n)}><ChevronLeft /></button>
      <button aria-label="Next game" className="lounge-stack__arrow lounge-stack__arrow--r" onClick={() => setActive((v) => (v + 1) % n)}><ChevronRight /></button>
    </div>
    <div className="lounge-stack__dots">{LOUNGE_GAMES.map((x, i) => <button key={x.id} aria-label={x.title} onClick={() => setActive(i)} className={i === active ? "on" : ""} />)}</div>
    <p className="mt-2 text-center text-[10px] text-white/40">Free-play only · No deposits, cash wagering or cash-out · Shared wallet & weekly league</p>
  </section>;
}
