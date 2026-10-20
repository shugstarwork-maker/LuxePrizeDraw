// Featured card-games carousel — the Luxe lounge design, one card per game.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LOUNGE_GAMES = [
  { id: "poker", title: "Texas Hold'em", sub: "The ultimate poker experience", image: "/games/holdem-card.png", href: "/poker", seats: "6 seats" },
  { id: "blackjack", title: "Luxe Blackjack", sub: "Beat the dealer to 21", image: "/games/blackjack-card.png", href: "/blackjack", seats: "6 seats" },
  { id: "brag", title: "3 Card Brag", sub: "The great British classic", image: "/games/brag-card.png", href: "/brag", seats: "6 seats" },
];

export function LoungeGamesCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setActive((v) => (v + 1) % LOUNGE_GAMES.length), 5000);
    return () => window.clearInterval(t);
  }, [paused, active]);
  const g = LOUNGE_GAMES[active];
  return <section className="lounge-carousel" aria-label="Card game lounges" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
    <div className="lounge-carousel-card" onTouchStart={(e) => { startX.current = e.touches[0].clientX; }} onTouchEnd={(e) => {
      if (startX.current === null) return;
      const d = e.changedTouches[0].clientX - startX.current;
      if (d > 50) setActive((v) => (v + LOUNGE_GAMES.length - 1) % LOUNGE_GAMES.length);
      if (d < -50) setActive((v) => (v + 1) % LOUNGE_GAMES.length);
      startX.current = null;
    }}>
      <div className="lounge-carousel-card__top"><span>Featured table</span><span>{g.seats}</span></div>
      <div className="lounge-carousel-card__art">
        <img src={g.image} alt={`${g.title} table artwork`} loading="lazy" />
        <span className="lounge-carousel-card__pill">Free-play chips</span>
      </div>
      <div className="lounge-carousel-card__copy">
        <h1>{g.title}</h1>
        <p>{g.sub}</p>
        <a href={g.href} className="lounge-carousel-card__play">▶ Play now</a>
      </div>
      <button aria-label="Previous game" className="lounge-carousel-card__arrow lounge-carousel-card__arrow--l" onClick={() => setActive((v) => (v + LOUNGE_GAMES.length - 1) % LOUNGE_GAMES.length)}><ChevronLeft /></button>
      <button aria-label="Next game" className="lounge-carousel-card__arrow lounge-carousel-card__arrow--r" onClick={() => setActive((v) => (v + 1) % LOUNGE_GAMES.length)}><ChevronRight /></button>
      <div className="lounge-carousel-card__dots">{LOUNGE_GAMES.map((x, i) => <button key={x.id} aria-label={x.title} onClick={() => setActive(i)} className={i === active ? "on" : ""} />)}</div>
    </div>
    <p className="mt-2 text-center text-[10px] text-white/40">Free-play only · No deposits, cash wagering or cash-out · Shared wallet & weekly league</p>
  </section>;
}
