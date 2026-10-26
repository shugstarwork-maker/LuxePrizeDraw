// Per-draw key terms — the summary every draw card links to. Built from the general
// draw terms and the category schedules so the two never disagree. Draft only.
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";
import { prizeSchedules } from "./DrawSchedules";

export type DrawCategory = "vehicle" | "cash" | "bitcoin" | "gaming" | "holiday" | "other";
export type DrawTermsInfo = { drawName: string; category: DrawCategory; prize: string; entry: string };

/** Best-fit prize category from a draw's name or category label. */
export function categoryFor(label: string): DrawCategory {
  if (/bitcoin|btc|crypto/i.test(label)) return "bitcoin";
  if (/car|vehicle|supercar|motor|\bR8\b|MK4|R32|ferrari|lamborghini|mclaren|bentley|aston|porsche|audi|bmw|golf/i.test(label)) return "vehicle";
  if (/gaming|console|playstation|xbox|pc bundle/i.test(label)) return "gaming";
  if (/holiday|travel|villa|escape|resort|hotel|trip|island/i.test(label)) return "holiday";
  if (/cash|£|money|gbp/i.test(label)) return "cash";
  return "other";
}

const SCHEDULE: Record<DrawCategory, number> = { vehicle: 0, gaming: 1, cash: 2, bitcoin: 2, holiday: 3, other: 3 };

const go = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); };

export function drawKeyTerms({ drawName, category, prize, entry }: DrawTermsInfo): { title: string; text: string; ref?: string }[] {
  const [scheduleTitle, scheduleText] = prizeSchedules[SCHEDULE[category]];
  return [
    { title: "Status", text: `${drawName} is a pre-launch preview. It is not open: no entries are accepted and no payments are taken. These are draft terms pending legal approval, not final official rules.` },
    { title: "Promoter", text: "LuxePrizeDraw Ltd, company number SC888447, registered in Scotland. Contact: director@luxeprizedraw.com.", ref: "scope" },
    { title: "Prize", text: `${prize}. The exact prize, its specification and value will be verified and published before the draw opens. Images may be illustrative. The prize won't be reduced or withheld because too few entries were sold.`, ref: "prizes" },
    { title: "Entry and free route", text: `Proposed paid entry: ${entry}. A free postal entry route will be shown alongside the paid route, with the same chance per entry and access to the same prize. The postal address and deadline will be in the approved rules.`, ref: "free-entry" },
    { title: "Who can enter", text: "Proposed minimum age 18. Permitted territories will be stated before opening. Promoter staff, people administering the draw and their households can't enter. Age, identity and residence checks may be needed.", ref: "eligibility" },
    { title: "Dates and winner selection", text: "Opening and closing dates and time zone, entry limits and the draw date will be published before entry. The winner is selected by a verifiably random computer process or independent supervision, and records are kept for audit.", ref: "selection" },
    { title: "Closing date and changes", text: "Low sales are never a reason to extend, reduce or cancel. If a draw is lawfully cancelled, paid entries are refunded.", ref: "changes" },
    { title: scheduleTitle, text: scheduleText, ref: "draw-schedules" },
    { title: "Play responsibly", text: "Entering is not an investment or a way to make money. Never spend more than you can afford.", ref: "responsible" },
  ];
}

export function DrawTermsButton({ terms }: { terms: DrawTermsInfo }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const readFull = (ref?: string) => { setOpen(false); go(`/terms${ref ? `#${ref}` : ""}`); window.setTimeout(() => { if (ref) document.getElementById(ref)?.scrollIntoView({ behavior: "smooth" }); else window.scrollTo(0, 0); }, 300); };
  return <>
    <button type="button" className="deck-card__terms" onClick={(e) => { e.stopPropagation(); setOpen(true); }} aria-haspopup="dialog"><FileText className="h-3 w-3" aria-hidden="true" />Terms &amp; conditions</button>
    {open && createPortal(<div className="draw-terms" role="dialog" aria-modal="true" aria-labelledby="draw-terms-title" onClick={() => setOpen(false)}>
      <div className="draw-terms__sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-200">Key terms · draft for legal review</p>
            <h2 id="draw-terms-title" className="mt-1 text-xl font-black text-white">{terms.drawName}</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close terms" className="rounded-lg bg-white/10 p-2"><X className="h-4 w-4" /></button>
        </div>
        <ol className="mt-4 space-y-3">
          {drawKeyTerms(terms).map((t) => <li key={t.title} className="rounded-xl border border-white/10 bg-white/[.03] p-3">
            <b className="block text-sm text-amber-100">{t.title}</b>
            <p className="mt-1 text-xs leading-relaxed text-white/70">{t.text}</p>
            {t.ref && <button type="button" onClick={() => readFull(t.ref)} className="mt-1.5 text-[11px] font-bold text-amber-200 underline underline-offset-2">Read the full section</button>}
          </li>)}
        </ol>
        <button type="button" onClick={() => readFull()} className="mt-4 w-full rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-3 text-sm font-black text-black">Read the general terms for all draws</button>
      </div>
    </div>, document.body)}
  </>;
}
