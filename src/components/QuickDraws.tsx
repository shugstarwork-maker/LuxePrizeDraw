import React, { useEffect, useState } from "react";
import { Coins, Gift, Sparkles, Ticket } from "lucide-react";

type QuickDraw = { id: string; title: string; prize: string; image: string; accent: string; coinCost: number; entries: number };

const QUICK_DRAWS: QuickDraw[] = [
  { id: "cash-sprint", title: "Cash Sprint", prize: "£1,000 cash prize", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=90", accent: "from-emerald-400/75 to-emerald-950/90", coinCost: 100, entries: 5 },
  { id: "supercar-weekend", title: "Supercar Weekend", prize: "Luxury driving experience", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=90", accent: "from-red-500/75 to-red-950/90", coinCost: 150, entries: 8 },
  { id: "five-star-escape", title: "Five-Star Escape", prize: "Luxury weekend for two", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=90", accent: "from-[#D4AF37]/75 to-amber-950/90", coinCost: 200, entries: 10 },
];

export const QuickDraws: React.FC = () => {
  const [coinz, setCoinz] = useState(250);
  const [claimedToday, setClaimedToday] = useState(false);
  const [message, setMessage] = useState("Your Karma Coinz are a free in-app gift.");

  useEffect(() => {
    const saved = Number(localStorage.getItem("karma_coinz_balance"));
    const claimDate = localStorage.getItem("karma_coinz_claim_date");
    if (Number.isFinite(saved) && saved >= 0) setCoinz(saved);
    setClaimedToday(claimDate === new Date().toDateString());
  }, []);

  const saveBalance = (next: number) => {
    setCoinz(next);
    localStorage.setItem("karma_coinz_balance", String(next));
  };

  const claimGift = () => {
    if (claimedToday) return setMessage("Your next free Coinz gift is available tomorrow.");
    saveBalance(coinz + 50);
    localStorage.setItem("karma_coinz_claim_date", new Date().toDateString());
    setClaimedToday(true);
    setMessage("50 Karma Coinz gifted. Use them for bonus free entries.");
  };

  const redeem = (draw: QuickDraw) => {
    if (coinz < draw.coinCost) return setMessage(`You need ${draw.coinCost - coinz} more Karma Coinz for this bonus entry.`);
    saveBalance(coinz - draw.coinCost);
    setMessage(`${draw.entries} bonus free entries selected for ${draw.title} in this browser preview.`);
  };

  return <section id="quick-draws" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-br from-[#0b1521] via-[#102331] to-[#130e1d] py-20 sm:py-28">
    <div className="pointer-events-none absolute -left-28 top-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-[140px]" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><div className="interactive-badge inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100"><Coins className="h-3.5 w-3.5" /> Karma Coinz Quick Draws</div><h2 className="mt-4 text-3xl font-light text-white sm:text-5xl">More chances. <span className="font-bold text-[#D4AF37]">Faster draws.</span></h2><p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">Use gifted Karma Coinz to unlock bonus free entries for smaller, faster prize draws. Coinz stay inside this app and have no cash or external monetary value.</p></div><div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-4"><div className="text-[10px] font-bold uppercase tracking-widest text-cyan-100">Your gifted balance</div><div className="mt-1 flex items-center gap-2 text-2xl font-black text-white"><Coins className="h-5 w-5 text-[#D4AF37]" /> {coinz.toLocaleString()} Coinz</div><button type="button" onClick={claimGift} className="mt-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#f6d46b] hover:text-white"><Gift className="mr-1 inline h-3.5 w-3.5" /> {claimedToday ? "Gift claimed today" : "Claim 50 free Coinz"}</button></div></div>
      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70" aria-live="polite">{message}</div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">{QUICK_DRAWS.map((draw) => <article key={draw.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-xl transition hover:-translate-y-1 hover:border-[#D4AF37]/60"><div className="relative h-48 overflow-hidden"><img src={draw.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /><div className={`absolute inset-0 bg-gradient-to-t ${draw.accent}`} /><div className="absolute bottom-4 left-5"><h3 className="text-xl font-black text-white">{draw.title}</h3><p className="mt-1 text-xs font-bold text-white/85">{draw.prize}</p></div></div><div className="p-5"><div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-cyan-100"><Ticket className="h-3.5 w-3.5" /> {draw.entries} bonus entries</span><span className="font-black text-[#f6d46b]">{draw.coinCost} Coinz</span></div><button type="button" onClick={() => redeem(draw)} className="mt-5 w-full rounded-xl bg-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#f6d46b]">Unlock bonus entries</button></div></article>)}</div>
      <p className="mt-6 text-center text-[10px] leading-relaxed text-white/45"><Sparkles className="mr-1 inline h-3.5 w-3.5 text-[#D4AF37]" />Karma Coinz are gifted, non-transferable, cannot be purchased or withdrawn, and are not redeemable for cash, goods, services, or any external value. Quick Draw selections are a browser-only preview until the launch game service is enabled. See competition terms for eligibility and draw details.</p>
    </div>
  </section>;
};
