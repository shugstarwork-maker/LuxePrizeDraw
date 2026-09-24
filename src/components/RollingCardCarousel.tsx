import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

type RollingCardCarouselProps<T> = {
  items: readonly T[];
  getKey: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  label: string;
  className?: string;
  interval?: number;
  compactControls?: boolean;
  enableArrivalEffects?: boolean;
};

export function RollingCardCarousel<T>({ items, getKey, renderItem, label, className = "", interval = 5000, compactControls = false, enableArrivalEffects = true }: RollingCardCarouselProps<T>) {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const next = () => setActive(index => (index + 1) % items.length);
  const previous = () => setActive(index => (index - 1 + items.length) % items.length);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reducedMotion || items.length < 2) return;
    const timer = window.setInterval(next, interval);
    return () => window.clearInterval(timer);
  }, [interval, items.length, reducedMotion]);

  if (!items.length) return null;
  return <div aria-label={label} className={className} onKeyDown={event => {
    if (event.key === "ArrowLeft") previous();
    if (event.key === "ArrowRight") next();
  }}>
    <div tabIndex={0} onTouchStart={event => { startX.current = event.touches[0].clientX; }} onTouchEnd={event => {
      if (startX.current === null) return;
      const distance = event.changedTouches[0].clientX - startX.current;
      if (distance > 50) previous();
      if (distance < -50) next();
      startX.current = null;
    }} className="outline-none focus-visible:ring-2 focus-visible:ring-amber-200">
      <div key={getKey(items[active])} className={`carousel-card-stage carousel-card-stage--${active % 4}${enableArrivalEffects ? " carousel-card-stage--arriving" : ""}`}>{enableArrivalEffects && <><span aria-hidden="true" className="carousel-card-stage__lightning" /><span aria-hidden="true" className="carousel-card-stage__flash" /></>}{renderItem(items[active], active)}</div>
    </div>
    <div className={`mt-5 flex items-center justify-between ${compactControls ? "gap-2" : "gap-3"}`}>
      <button aria-label={`Previous ${label}`} onClick={previous} className={compactControls ? "grid h-12 w-12 place-items-center rounded-2xl border border-amber-100/70 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-black shadow-[0_10px_24px_rgba(251,191,36,.28)] transition hover:-translate-y-0.5 hover:brightness-110 sm:inline-flex sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3 sm:text-xs sm:font-black" : "inline-flex items-center gap-2 rounded-2xl border border-amber-100/70 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-4 py-3 text-xs font-black text-black shadow-[0_10px_24px_rgba(251,191,36,.28)] transition hover:-translate-y-0.5 hover:brightness-110"}><ChevronLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button>
      <div className="flex max-w-[45%] flex-wrap justify-center gap-1.5">{items.map((item, index) => <button key={getKey(item)} aria-label={`Show ${getKey(item)}`} onClick={() => setActive(index)} className={`h-2.5 rounded-full transition ${active === index ? "w-7 bg-amber-200" : "w-2.5 bg-white/45"}`} />)}</div>
      <button aria-label={`Next ${label}`} onClick={next} className={compactControls ? "grid h-12 w-12 place-items-center rounded-2xl border border-amber-100/70 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 text-black shadow-[0_10px_24px_rgba(251,191,36,.28)] transition hover:-translate-y-0.5 hover:brightness-110 sm:inline-flex sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3 sm:text-xs sm:font-black" : "inline-flex items-center gap-2 rounded-2xl border border-amber-100/70 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 px-4 py-3 text-xs font-black text-black shadow-[0_10px_24px_rgba(251,191,36,.28)] transition hover:-translate-y-0.5 hover:brightness-110"}><span className="hidden sm:inline">Next</span><ChevronRight className="h-4 w-4" /></button>
    </div>
  </div>;
}
