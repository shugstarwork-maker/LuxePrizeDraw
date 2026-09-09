import React from "react";
import { ArrowRight, Car, Gift, Plane, ShoppingBag, Sparkles } from "lucide-react";

const freeDraws = [
  { title: "£100K Founder Package", detail: "Cash, Dubai lifestyle and business-launch experience", icon: Gift, tone: "from-amber-400 to-orange-600" },
  { title: "Dream Sports Car Experience", detail: "A premium driving and track-day prize experience", icon: Car, tone: "from-sky-400 to-blue-700" },
  { title: "Dream Lads Holiday", detail: "A luxury group escape built for unforgettable memories", icon: Plane, tone: "from-emerald-400 to-teal-600" },
  { title: "Ladies Shopping Holiday", detail: "Five-star stay, style and city-shopping experience", icon: ShoppingBag, tone: "from-pink-400 to-rose-600" },
];

export const FreeDraws: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
  <section id="free-draws" className="py-20 sm:py-28 scroll-mt-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-emerald-300/25 bg-gradient-to-br from-emerald-950/50 via-black to-[#151007] p-6 sm:p-10">
        <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200"><Sparkles className="w-3.5 h-3.5" /> No purchase needed</span><h2 className="mt-5 text-3xl sm:text-5xl font-bold tracking-tight">Free Draws</h2><p className="mt-4 text-white/60 leading-relaxed">Enter directly for free. Each draw has its own entry and prize details—no deposits, paid chips, or game results are required to take part.</p></div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{freeDraws.map(({ title, detail, icon: Icon, tone }) => <article key={title} className="rounded-3xl border border-white/10 bg-black/35 p-5"><div className={`flex w-11 h-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tone}`}><Icon className="w-5 h-5" /></div><h3 className="mt-5 font-bold text-lg">{title}</h3><p className="mt-2 min-h-12 text-sm leading-relaxed text-white/55">{detail}</p><button type="button" onClick={onEnter} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-[#D4AF37] hover:text-black">Enter free draw <ArrowRight className="w-3.5 h-3.5" /></button></article>)}</div>
      </div>
    </div>
  </section>
);
