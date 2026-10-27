// Shared stacked-deck card — full-bleed artwork, vertical title, frosted
// facts panel, stats row and a gold pill call-to-action.
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DrawTermsButton, type DrawTermsInfo } from "./DrawTermsSheet";
import { formatTickets } from "../lib/drawProgress";

/** Tickets sold toward unlocking a draw; `needed` is undefined while the target is TBC. */
export type DeckProgress = { sold: number; needed?: number };

export type DeckFact = [string, LucideIcon];
export type DeckStat = { value: string; label: string; amount?: boolean };
/** Entry price, prize, and cash alternative shown on the bar under the artwork. */
export type DeckSummary = { entry: string; prize: string; cash: string };

const pending = (value: string | undefined) => !value || /^(tbc|to be confirmed|pending)$/i.test(value) ? "Pending approval" : value;

function drawSummary(title: string, facts: readonly DeckFact[], stats: readonly DeckStat[], terms?: DrawTermsInfo, summary?: DeckSummary): DeckSummary | null {
  if (summary) return summary;
  const value = (re: RegExp) => stats.find((stat) => re.test(stat.label))?.value;
  const entry = value(/^entry$/i) ?? terms?.entry;
  const prize = value(/^prize$|prize value|package value|of bitcoin/i);
  const cash = value(/cash equivalent|^cash$/i);
  const cashOnly = facts.some(([label]) => /cash only/i.test(label));
  if (!entry && !prize && !cash && !terms) return null;
  const prizeText = pending(prize);
  return {
    entry: pending(entry),
    prize: prizeText,
    cash: pending(cash) === "Pending approval" && cashOnly ? prizeText : pending(cash),
  };
}

export function DeckCard({ image, video, title, facts = [], stats = [], summary, cta, ctaLabel, onCta, note, terms, progress, className, titleClassName, backdrop, children }: {
  image?: string;
  /** Short looping clip; the image, if given, is shown until it loads. */
  video?: string;
  className?: string;
  title: string;
  /** Extra class for the prize heading, used by the cash carousel pulse. */
  titleClassName?: string;
  facts?: readonly DeckFact[];
  stats?: readonly DeckStat[];
  /** When set, these three figures are the bar. Otherwise they are read from the stats. */
  summary?: DeckSummary;
  cta?: string;
  /** Accessible name when the visible label must not imply a live entry. */
  ctaLabel?: string;
  onCta?: () => void;
  note?: string;
  /** Prize draws pass their key terms; the card then links to them. */
  terms?: DrawTermsInfo;
  progress?: DeckProgress;
  /** Decorative layer drawn over the artwork, under the title bar. */
  backdrop?: ReactNode;
  children?: ReactNode;
}) {
  const figures = drawSummary(title, facts, stats, terms, summary);
  const entryAmount = stats.some((stat) => stat.amount && /^entry$/i.test(stat.label));
  return <article className={`deck-card${className ? ` ${className}` : ""}`}>
    <div className="deck-card__stage">
      {video ? <video className="deck-card__bg" src={video} poster={image} autoPlay muted loop playsInline preload="none" aria-label={`${title} preview`} /> : image ? <img className="deck-card__bg" src={image} alt={`${title} preview`} loading="lazy" decoding="async" /> : <div className="deck-card__bg deck-card__bg--plain" aria-hidden="true" />}
      {backdrop}
    </div>
    <div className="deck-card__bar">
      <div className="deck-card__bar-head">
        <h3 className={`deck-card__title${titleClassName ? ` ${titleClassName}` : ""}`}>{title}</h3>
        {cta && onCta && <button type="button" className="deck-card__play" aria-label={ctaLabel} onClick={(e) => { e.stopPropagation(); onCta(); }}>{cta} <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></button>}
      </div>
      {figures && <dl className="deck-card__bar-grid">
        <div><dt>Entry</dt><dd className={entryAmount ? "cash-entry-amount" : undefined}>{figures.entry}</dd></div>
        <div><dt>Prize</dt><dd>{figures.prize}</dd></div>
        <div><dt>Cash alternative</dt><dd>{figures.cash}</dd></div>
      </dl>}
      {!figures && facts.length > 0 && <p className="deck-card__facts">{facts.slice(0, 3).map(([label]) => label).join(" · ")}</p>}
      {children && <div className="deck-card__extra">{children}</div>}
      {(progress || note || terms) && <div className="deck-card__meta">
        {progress && <div className="deck-card__progress">
          <div className="deck-card__track" role="progressbar" aria-label={progress.needed ? `${formatTickets(progress.sold)} of ${formatTickets(progress.needed)} tickets toward ${title}. Indicative target, not a confirmed entry cap.` : `Tickets sold toward unlocking ${title}`} aria-valuemin={0} aria-valuemax={progress.needed ?? 0} aria-valuenow={progress.sold}><span style={{ width: `${progress.needed ? Math.min(100, (progress.sold / progress.needed) * 100) : 0}%` }} /></div>
          <small>{progress.needed ? `${formatTickets(progress.sold)} of ${formatTickets(progress.needed)} tickets` : `${formatTickets(progress.sold)} tickets sold`}</small>
          {progress.needed != null && <small className="deck-card__target-note">Indicative target, not a confirmed entry cap.</small>}
        </div>}
        {note && <p className="deck-card__note">{note}</p>}
        {terms && <DrawTermsButton terms={terms} />}
      </div>}
    </div>
  </article>;
}

export const deckGo = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
};
