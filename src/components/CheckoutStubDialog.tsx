import { Lock, ShieldCheck, X } from "lucide-react";

export type PricedItem = {
  id: string;
  label: string;
  badge: string;
  priceGBP: string;
};

/**
 * Stripe-ready checkout stub — shows the real price and the legal line that
 * will apply when payments go live, but the button is disabled until Stripe
 * keys are connected. Nothing is charged, ever, in this build.
 */
export function CheckoutStubDialog({ item, onClose }: { item: PricedItem; onClose: () => void }) {
  const isCoinPack = item.id.startsWith("pack-");
  return (
    <div className="ad-break" role="dialog" aria-modal="true" aria-label="Checkout preview">
      <div className="ad-break__card">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-amber-200"><Lock className="h-4 w-4" /> Checkout · coming soon</p>
          <button onClick={onClose} aria-label="Close checkout" className="rounded-lg bg-white/10 p-1.5 text-white/60 transition hover:bg-white/20"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/12 bg-black/35 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-black text-white">{item.label}</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-white/50">{item.badge}</p>
            </div>
            <p className="text-2xl font-black text-amber-100">{item.priceGBP}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-[11px] leading-relaxed text-white/55">
          <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> {isCoinPack ? "Gold Coins are for fun only — zero real-world value, never redeemable for cash or prizes." : "Cosmetic only — this item can never be converted back into cash, prizes, or draw entries."}</p>
          <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> Non-refundable digital content, delivered instantly on this device.</p>
          <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> {isCoinPack ? "Bonus Sweep Tickets are included free — tickets are never sold." : "Store chips are for casual social tables only — they never affect the weekly league."}</p>
        </div>

        <button disabled className="mt-5 w-full cursor-not-allowed rounded-xl bg-white/10 px-4 py-3.5 text-sm font-black uppercase tracking-wider text-white/40">
          Payments open after legal approval
        </button>
        <p className="mt-3 text-center text-[10px] text-white/40">
          Stripe checkout stub — connect live keys to enable. Nothing is charged in this build.
        </p>
      </div>
    </div>
  );
}
