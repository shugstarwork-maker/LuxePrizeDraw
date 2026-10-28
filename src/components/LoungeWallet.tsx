// Lounge wallet: the player's balances and the Gold Coin packs. The packs are the same product,
// wording and monthly card cap as the poker lounge. Checkout stays locked until payments are
// legally approved, so nothing is charged from here.
import { useState } from "react";
import { Coins, ShieldCheck } from "lucide-react";
import { COIN_PACKS, loadWallet, purchaseWithinCap } from "../lib/currencies";
import { CheckoutStubDialog, type PricedItem } from "./CheckoutStubDialog";
import { useAudio } from "../audio/AudioProvider";

export function LoungeWallet({ chips }: { chips: number }) {
  const { play } = useAudio();
  const [wallet] = useState(loadWallet);
  const [item, setItem] = useState<PricedItem | null>(null);
  const [notice, setNotice] = useState("");

  const choose = (id: string) => {
    const pack = COIN_PACKS.find((p) => p.id === id);
    if (!pack) return;
    const cap = purchaseWithinCap(pack.id);
    if (!cap.allowed) { setNotice(cap.reason ?? ""); return; }
    setNotice("");
    play("button");
    setItem({ id: pack.id, label: `${pack.coins.toLocaleString("en-GB")} Gold Coins`, badge: `+ ${pack.bonusTickets} free Sweep Tickets`, priceGBP: pack.priceGBP });
  };

  return <section aria-label="Wallet" className="rounded-2xl border border-amber-200/30 bg-black/35 p-4 sm:p-5">
    <p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-200">Wallet</p>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <p className="font-mono text-xl font-black text-amber-100">{chips.toLocaleString("en-GB")}</p>
        <p className="text-[11px] text-white/55">Free-play chips for the tables. No cash value.</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <p className="font-mono text-xl font-black text-amber-100">🪙 {wallet.goldCoins.toLocaleString("en-GB")}</p>
        <p className="text-[11px] text-white/55">Gold Coins. Zero real-world value, never redeemable.</p>
      </div>
    </div>

    <h3 className="mt-5 text-sm font-black text-white">Buy a pack</h3>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {COIN_PACKS.map((p) => (
        <button key={p.id} type="button" onClick={() => choose(p.id)} className="relative rounded-xl border border-amber-200/25 bg-black/40 px-4 py-3 text-left transition hover:border-amber-200/60 active:scale-95">
          {p.tag && <span className="absolute -top-2 right-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-black">{p.tag}</span>}
          <p className="font-mono text-lg font-black text-amber-100"><Coins className="mr-1 inline h-4 w-4" aria-hidden="true" />{p.coins.toLocaleString("en-GB")}</p>
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-violet-300">+ {p.bonusTickets} free tickets</p>
          <b className="mt-1 block text-sm font-black text-emerald-200">{p.priceGBP}</b>
        </button>
      ))}
    </div>
    {notice && <p role="status" className="mt-3 rounded-xl border border-rose-300/30 bg-rose-400/10 p-3 text-xs text-rose-100">{notice}</p>}
    <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-white/55"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />Gold Coins are for fun, practice and social climbing. Every pack includes free bonus Sweep Tickets. Checkout stays locked until payments are legally approved. Card purchases are capped at £250 per month.</p>
    {item && <CheckoutStubDialog item={item} onClose={() => setItem(null)} />}
  </section>;
}
