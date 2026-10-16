import React, { useEffect, useState } from "react";
import type { LaunchDraw } from "./LaunchBuildPage";

const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(value);
const categories = ["All", "Cash", "Holidays", "Experiences"];

export function LaunchGauge() {
  return <svg viewBox="0 0 100 100" className="launch-gauge" role="img" aria-label="Verified sales unavailable">
    {Array.from({ length: 48 }, (_, index) => {
      const angle = index / 48 * Math.PI * 2 - Math.PI / 2;
      const inner = index % 6 === 0 ? 41.5 : 43.6;
      return <line key={index} x1={50 + Math.cos(angle) * 45.5} y1={50 + Math.sin(angle) * 45.5} x2={50 + Math.cos(angle) * inner} y2={50 + Math.sin(angle) * inner} />;
    })}
    <circle cx="50" cy="50" r="38" />
    <text x="50" y="56">—</text>
  </svg>;
}

export function LaunchSegments() {
  return <div className="launch-segments" aria-hidden="true">{Array.from({ length: 26 }, (_, index) => <span key={index} />)}</div>;
}

export function LaunchCategoryShowcase({ items, label }: { items: LaunchDraw[]; label: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(media.matches);
    const syncVisibility = () => setHidden(document.hidden);
    syncMotion(); syncVisibility();
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => { media.removeEventListener("change", syncMotion); document.removeEventListener("visibilitychange", syncVisibility); };
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || reducedMotion || hidden || items.length < 2) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % items.length), 5000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reducedMotion, hidden, items.length]);
  if (!items.length) return null;
  const current = index % items.length;
  const draw = items[current];
  const move = (direction: number) => { setPaused(true); setIndex((current + direction + items.length) % items.length); };
  return <section className="launch-showcase" aria-label={`${label} showcase`} aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="launch-showcase-heading"><h2>{label}</h2><span>{items.length} proposed draws</span></div>
    <div className="launch-hud">
      <div className="launch-scanlines" aria-hidden="true" />
      <div className="launch-stage" key={draw.id} role="group" aria-roledescription="slide" aria-label={`${current + 1} of ${items.length}: ${draw.title}`}>
        <div className="launch-stage-copy"><p className="launch-kicker">{draw.grade} // {draw.cat}</p>
          <h3>{draw.title}</h3><p className="launch-kicker">Pre-launch prize proposal</p>
          <p className="launch-meta">Proposed entry <b>{money(draw.price)}</b> · Target <b>{money(draw.target)}</b></p>
          <button className="launch-button" disabled>{draw.paused ? "Paused" : "Launch pending"}</button>
        </div>
        <div className="launch-stage-gauge"><LaunchGauge /><LaunchSegments /><p>Verified sales unavailable</p></div>
      </div>
      <div className="launch-showcase-controls">
        <button type="button" aria-label={`Previous ${label} draw`} onClick={() => move(-1)} disabled={items.length < 2}>‹</button>
        <div className="launch-dots">{items.map((item, itemIndex) => <button type="button" key={item.id} aria-label={`Show ${item.title}`} aria-current={current === itemIndex ? "true" : undefined} onClick={() => { setPaused(true); setIndex(itemIndex); }}><span /></button>)}</div>
        <button type="button" aria-label={`Next ${label} draw`} onClick={() => move(1)} disabled={items.length < 2}>›</button>
      </div>
      {items.length > 1 && !reducedMotion && <button type="button" className="launch-rotation" onClick={() => setPaused(value => !value)}>{paused ? "Resume rotation" : "Pause rotation"}</button>}
    </div>
  </section>;
}

export function LaunchDrawCard({ draw }: { draw: LaunchDraw }) {
  return <article className={`launch-card${draw.paused ? " launch-card-paused" : ""}`}>
      <div className="launch-card-top"><LaunchGauge /><div><p className="launch-kicker">{draw.cat} // Proposed</p><h2>{draw.title}</h2><p className="launch-meta">{draw.grade}</p></div></div>
      <p className="launch-meta">Proposed entry <b>{money(draw.price)}</b> · Target <b>{money(draw.target)}</b></p>
      <LaunchSegments /><p className="launch-meta">Verified sales unavailable. No winner selected.</p>
      <p className="launch-kicker">{draw.paused ? "Paused" : "Not open · Awaiting approved rules"}</p>
      <button className="launch-button" disabled>Launch pending</button>
    </article>;
}

export function LaunchCatalogue({ draws }: { draws: LaunchDraw[] }) {
  const [filter, setFilter] = useState("All");
  return <>
    <div className="launch-showcases">{categories.slice(1).map(category => <div key={category}><LaunchCategoryShowcase items={draws.filter(draw => draw.cat === category)} label={category === "Holidays" ? "Luxury holidays" : `${category} draws`} /></div>)}</div>
    <div className="launch-filters" role="group" aria-label="Filter proposed draws">{categories.map(category => <button type="button" key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}</div>
    <div className="launch-grid">{draws.filter(draw => filter === "All" || draw.cat === filter).map(draw => <div key={draw.id}><LaunchDrawCard draw={draw} /></div>)}</div>
  </>;
}
