// Shared stacked-deck card — full-bleed artwork, vertical title, frosted
// facts panel, stats row and a gold pill call-to-action.
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DrawTermsButton, type DrawTermsInfo } from "./DrawTermsSheet";
import { formatTickets } from "../lib/drawProgress";

/** Tickets sold toward unlocking a draw; `needed` is undefined while the target is TBC. */
export type DeckProgress = { sold: number; needed?: number };

export type DeckFact = [string, LucideIcon];
export type DeckStat = { value: string; label: string };

export function DeckCard({ image, video, title, facts = [], stats = [], cta, onCta, note, terms, progress, className, children }: {
  image?: string;
  /** Short looping clip; the image, if given, is shown until it loads. */
  video?: string;
  className?: string;
  title: string;
  facts?: readonly DeckFact[];
  stats?: readonly DeckStat[];
  cta?: string;
  onCta?: () => void;
  note?: string;
  /** Prize draws pass their key terms; the card then links to them. */
  terms?: DrawTermsInfo;
  progress?: DeckProgress;
  children?: ReactNode;
}) {
  return <article className={`deck-card${className ? ` ${className}` : ""}`}>
    {video ? <video className="deck-card__bg" src={video} poster={image} autoPlay muted loop playsInline preload="none" aria-label={`${title} preview`} /> : image ? <img className="deck-card__bg" src={image} alt={`${title} preview`} loading="lazy" decoding="async" /> : <div className="deck-card__bg deck-card__bg--plain" aria-hidden="true" />}
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
      {progress && <div className="deck-card__progress">
        <div className="deck-card__track" role="progressbar" aria-label={`Tickets sold toward unlocking ${title}`} aria-valuemin={0} aria-valuemax={progress.needed ?? 0} aria-valuenow={progress.sold}><span style={{ width: `${progress.needed ? Math.min(100, (progress.sold / progress.needed) * 100) : 0}%` }} /></div>
        <small>{progress.needed ? `${formatTickets(progress.sold)} of ${formatTickets(progress.needed)} tickets to unlock` : "Tickets to unlock: TBC"}</small>
      </div>}
      {note && <p className="deck-card__note">{note}</p>}
      {terms && <DrawTermsButton terms={terms} />}
    </div>
  </article>;
}

export const deckGo = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
};
