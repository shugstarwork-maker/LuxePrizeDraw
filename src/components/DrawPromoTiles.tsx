import React from "react";
import { ArrowUpRight } from "lucide-react";

const draws = [
  { title: "Cash Draw", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=90", accent: "from-emerald-400/70 to-[#0a352b]/80" },
  { title: "Supercar Draw", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=90", accent: "from-red-500/70 to-[#24070b]/85" },
  { title: "Luxury Escape", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=90", accent: "from-[#D4AF37]/70 to-[#251807]/85" },
];

export const DrawPromoTiles: React.FC = () => <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3" aria-label="Featured prize draws">
  {draws.map((draw) => <a key={draw.title} href="#prizes" className="group relative min-h-28 overflow-hidden rounded-2xl border border-white/15 bg-black shadow-lg transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/70 sm:min-h-36">
    <img src={draw.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
    <span className={`absolute inset-0 bg-gradient-to-t ${draw.accent}`} />
    <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-3 text-[10px] font-black uppercase tracking-[0.12em] text-white sm:p-4 sm:text-xs"><span>{draw.title}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
  </a>)}
  <p className="col-span-3 px-1 text-center text-[9px] leading-relaxed text-white/45">Featured draw schedules, eligibility, and prize details are set out in the competition terms.</p>
</div>;
