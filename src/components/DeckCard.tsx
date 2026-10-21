// Shared stacked-deck card — full-bleed artwork, vertical title, frosted
// facts panel, stats row and a gold pill call-to-action.
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type DeckFact = [string, LucideIcon];
export type DeckStat = { value: string; label: string };

export function DeckCard({ image, title, facts = [], stats = [], cta, onCta, note, children }: {
  image?: string;
  title: string;
  facts?: readonly DeckFact[];
  stats?: readonly DeckStat[];
  cta?: string;
  onCta?: () => void;
  note?: string;
  children?: ReactNode;
}) {
  return <article className="deck-card">
    {image ? <img className="deck-card__bg" src={image} alt={`${title} preview`} loading="lazy" decoding="async" /> : <div className="deck-card__bg deck-card__bg--plain" aria-hidden="true" />}
    <div className="deck-card__shade" aria-hidden="true" />
    <span className="deck-card__vertical" aria-hidden="true">{title}</span>
    {facts.length > 0 && <div className="deck-card__panel">
      {facts.slice(0, 4).map(([label, Icon]) => <p key={label}><Icon className="h-3.5 w-3.5" aria-hidden="true" /><span>{label}</span></p>)}
    </div>}
    <div className="deck-card__bottom">
      <h3 className="deck-card__title">{title}</h3>
      {children}
      {stats.length > 0 && <div className="deck-card__stats">
        {stats.slice(0, 3).map((s) => <span key={s.label}><b>{s.value}</b><small>{s.label}</small></span>)}
      </div>}
      {cta && onCta && <button type="button" className="deck-card__play" onClick={(e) => { e.stopPropagation(); onCta(); }}>{cta} <ChevronRight className="h-4 w-4" aria-hidden="true" /></button>}
      {note && <p className="deck-card__note">{note}</p>}
    </div>
  </article>;
}

export const deckGo = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
};
