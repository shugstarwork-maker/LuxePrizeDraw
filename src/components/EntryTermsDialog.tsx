import { FileText, ShieldCheck, Ticket, X } from "lucide-react";
import { createPortal } from "react-dom";

const go = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
};

export type EntryPrize = { name: string; value: string; entry: string; partner?: string };

/**
 * Entry flow for every prize draw card: tapping the entry-fee button opens the
 * draw terms first; the final Enter button sits inside. While the platform is
 * pre-launch, the final button routes to the draw preview instead of taking a
 * payment — entries and payments open only after the rules are legally approved.
 */
export function EntryTermsDialog({ prize, onClose }: { prize: EntryPrize; onClose: () => void }) {
  const fee = prize.entry.replace(/\s*entry\s*$/i, "");
  // Portal to body: page-enter animations leave a transform on ancestors, which
  // would trap position:fixed inside the page container instead of the viewport.
  return createPortal(
    <div className="entry-terms-overlay" role="dialog" aria-modal="true" aria-label={`Entry terms for ${prize.name}`} onClick={onClose}>
      <div className="entry-terms-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Close terms" onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-white/50 transition hover:text-white"><X className="h-4 w-4" /></button>

        <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.2em] text-amber-200"><FileText className="h-3.5 w-3.5" /> Prize draw entry</p>
        <h3 className="mt-2 pr-8 text-2xl font-black text-amber-50">{prize.name}</h3>
        <p className="mt-1 text-xs text-white/55">Prize value {prize.value} · {fee} per entry{prize.partner ? ` · supplied by ${prize.partner}` : ""}</p>

        <div className="mt-4 max-h-56 space-y-2.5 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-4 text-[11px] leading-relaxed text-white/65">
          <p className="font-black uppercase tracking-wider text-amber-100/90">Draw terms — summary</p>
          <p>1. Entries cost {fee} each. A free postal entry route is available for every draw — one entry per stamped envelope, treated identically to paid entries.</p>
          <p>2. One winner per draw, selected by a provably fair, publicly verifiable draw. The full draw record is published after each draw closes.</p>
          <p>3. The prize is as described and pictured (or clearly labelled illustrative). A fixed cash alternative will be published in the approved rules where offered.</p>
          <p>4. Winner obligations such as insurance, delivery, siting or running costs are disclosed in the full rules before any entry opens.</p>
          <p>5. No winner ever pays LuxePrizeDraw Ltd a prize-release or administration fee.</p>
          <p>6. A share of net proceeds supports Serenity Soul CIC community wellbeing work, reconciled and evidenced publicly.</p>
          <p>7. Entrants must be 18+ and resident in an eligible jurisdiction. Full terms apply to every entry.</p>
        </div>

        <button type="button" onClick={() => go("/terms")} className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-black text-white/70 transition hover:border-amber-200/40 hover:text-amber-100">Read the full terms</button>

        <button type="button" onClick={() => go("/draws")} className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 py-3.5 text-sm font-black text-black shadow-lg transition active:scale-[.98]">
          <Ticket className="h-4 w-4" /> Enter this draw — {prize.entry}
        </button>

        <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-white/40">
          <ShieldCheck className="mt-px h-3 w-3 flex-none text-emerald-200/70" />
          <span>Pre-launch: entries and payments open only after the competition rules are legally approved. No payment is taken today — the button previews the draw details.</span>
        </p>
      </div>
    </div>,
    document.body,
  );
}
