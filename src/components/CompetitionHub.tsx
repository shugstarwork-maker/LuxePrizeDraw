import React from "react";
import { Car, Gamepad2, Gift, Heart, Plane, ShoppingBag, Star, Trophy, Users, Crown } from "lucide-react";

const categories = [
  { title: "Games", subtitle: "Play, compete and unlock bonus entries", icon: Gamepad2, accent: "from-violet-500 to-fuchsia-500", id: "games" },
  { title: "Prize Draw", subtitle: "Explore every live Luxe prize experience", icon: Gift, accent: "from-amber-400 to-orange-500", id: "prizes" },
  { title: "Sports Car Draw", subtitle: "Your next dream drive is one entry away", icon: Car, accent: "from-sky-400 to-blue-600", id: "prizes" },
  { title: "Dream Lads Holiday", subtitle: "A once-in-a-lifetime escape with your crew", icon: Plane, accent: "from-emerald-400 to-teal-500", id: "dubai-gallery" },
  { title: "Ladies Shopping Holiday", subtitle: "Fashion, five-star stays and unforgettable city moments", icon: ShoppingBag, accent: "from-pink-400 to-rose-500", id: "dubai-gallery" },
];

const leaderboards = [
  { title: "Top Ticket Holders", icon: Trophy, rows: [["1", "A. Thompson", "248 tickets"], ["2", "M. Khan", "196 tickets"], ["3", "S. Williams", "180 tickets"]] },
  { title: "Recent Winners", icon: Star, rows: [["1", "S. Ahmed", "Dubai escape"], ["2", "J. Turner", "£5,000 cash"], ["3", "L. Morgan", "VIP experience"]] },
  { title: "Top Donors", icon: Heart, rows: [["1", "R. Patel", "£2,400 raised"], ["2", "C. Jones", "£1,875 raised"], ["3", "D. Green", "£1,420 raised"]] },
  { title: "Legends", icon: Crown, rows: [["1", "The Founders", "Platinum"], ["2", "Golden Circle", "Gold"], ["3", "Luxe Insiders", "Silver"]] },
];

export const CompetitionHub: React.FC = () => {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="competition-hub" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[#D4AF37]/5 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em] mb-3">Choose your experience</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">The Luxe Prize Draws hub</h2>
          <p className="mt-4 text-white/55 leading-relaxed">From game-time rewards to dream holidays and the biggest prize draws, choose where your next story begins.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Prize draw categories">
          {categories.map(({ title, subtitle, icon: Icon, accent, id }) => (
            <button key={title} type="button" onClick={() => scrollTo(id)} className="group text-left rounded-3xl competition-card border border-white/10 bg-white/[0.035] p-5 min-h-64 flex flex-col justify-between overflow-hidden relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D4AF37]">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent} opacity-70`} />
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}><Icon className="w-6 h-6 text-white" /></div>
              <div>
                <h3 className="text-xl font-bold leading-tight">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{subtitle}</p>
                <span className="inline-block mt-5 text-[10px] uppercase tracking-[0.16em] font-black text-[#D4AF37]">Explore now</span>
              </div>
            </button>
          ))}
        </div>

        <div id="leaderboards" className="mt-20 scroll-mt-28">
          <div className="flex items-end justify-between gap-4 mb-7"><div><p className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em] mb-2">Live community rankings</p><h2 className="text-3xl font-bold">Leaderboards</h2></div><Users className="w-7 h-7 text-[#D4AF37]" /></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {leaderboards.map(({ title, icon: Icon, rows }) => <article key={title} className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm"><div className="flex items-center gap-2 text-[#D4AF37]"><Icon className="w-4 h-4" /><h3 className="text-xs font-black uppercase tracking-wider">{title}</h3></div><ol className="mt-4 space-y-3">{rows.map(([rank, name, value]) => <li key={rank} className="grid grid-cols-[1.5rem_1fr_auto] gap-2 items-center text-sm"><span className="font-mono text-[#D4AF37]">{rank}</span><span className="font-semibold truncate">{name}</span><span className="text-[11px] text-white/50 whitespace-nowrap">{value}</span></li>)}</ol></article>)}
          </div>
        </div>
      </div>
    </section>
  );
};
