import React, { useState } from "react";
import {
  Trophy, Award, Crown, Sparkles, Star, CheckCircle2,
  MapPin, ShieldCheck, TrendingUp, ExternalLink, Filter, ChevronRight
} from "lucide-react";

export interface HallOfFameWinner {
  id: string;
  name: string;
  avatar: string;
  country: string;
  flag: string;
  winningsGBP: number;
  drawDate: string;
  edition: string;
  ventureCreated: string;
  location: string;
  storyQuote: string;
  tier: "Grand Champion" | "Centurion Icon" | "Master Builder";
  verifiedCertId: string;
  featuredMedia?: string;
  category: "Tech & AI" | "Luxury Hospitality" | "FinTech & Web3" | "E-commerce" | "CleanTech";
}

export const HALL_OF_FAME_WINNERS: HallOfFameWinner[] = [
  {
    id: "hof-1",
    name: "Tariq Al-Mansoor & Sophie Chen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    country: "United Kingdom",
    flag: "🇬🇧 🇦🇪",
    winningsGBP: 220000,
    drawDate: "November 2025",
    edition: "Autumn Founder Grand Draw",
    ventureCreated: "Aethelgard AI Logistics (Edinburgh Innovation Hub)",
    location: "Edinburgh & London",
    storyQuote: "Winning the £220,000 package gave us the license, a London penthouse, and seed runway to scale to £3.2M ARR in our first 10 months.",
    tier: "Grand Champion",
    verifiedCertId: "DET-CERT-2025-884102",
    category: "Tech & AI",
  },
  {
    id: "hof-2",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    country: "Canada",
    flag: "🇨🇦",
    winningsGBP: 185000,
    drawDate: "August 2025",
    edition: "Summer Solstice Venture Series",
    ventureCreated: "SilkRoad Private Client Escapes & Yacht Concierge",
    location: "Scotland & Vancouver",
    storyQuote: "From entering with a 10-ticket bundle to receiving a call with the verified notary deed. The 3-year founder relocation package changed everything for my family.",
    tier: "Centurion Icon",
    verifiedCertId: "DET-CERT-2025-773194",
    category: "Luxury Hospitality",
  },
  {
    id: "hof-3",
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    country: "Australia",
    flag: "🇦🇺",
    winningsGBP: 150000,
    drawDate: "May 2025",
    edition: "Spring Horizon Draw",
    ventureCreated: "Apex Quant Algorithms (London FinTech Centre)",
    location: "Glasgow & Sydney",
    storyQuote: "The 0% corporate and personal tax advantage along with £50k liquid cash paid out in 48 hours was the ultimate catalyst for my fund.",
    tier: "Centurion Icon",
    verifiedCertId: "DET-CERT-2025-612093",
    category: "FinTech & Web3",
  },
  {
    id: "hof-4",
    name: "Dr. Liam & Aisha O'Connor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    country: "Ireland",
    flag: "🇮🇪",
    winningsGBP: 120000,
    drawDate: "February 2025",
    edition: "Winter Pioneer Gala",
    ventureCreated: "Solaris Water Tech & Coastal Agriscience",
    location: "Edinburgh Tech Hub",
    storyQuote: "We combined the relocation grant and business license to deploy clean-water sensors across UK coastal farms.",
    tier: "Master Builder",
    verifiedCertId: "DET-CERT-2025-492104",
    category: "CleanTech",
  },
  {
    id: "hof-5",
    name: "Carlos & Isabella Mendez",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    country: "Spain",
    flag: "🇪🇸",
    winningsGBP: 110000,
    drawDate: "December 2024",
    edition: "Year-End Platinum Draw",
    ventureCreated: "Iberia Luxe D2C Fashion & Arabian Scents",
    location: "London Design District",
    storyQuote: "Moving into our sponsored Marina apartment on day one made the transition seamless. Forever grateful for this life-altering platform.",
    tier: "Master Builder",
    verifiedCertId: "DET-CERT-2024-910482",
    category: "E-commerce",
  }
];

export const HallOfFameSection: React.FC<{ onOpenEntry?: () => void }> = ({ onOpenEntry }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeWinnerModal, setActiveWinnerModal] = useState<HallOfFameWinner | null>(null);

  const filteredWinners = selectedCategory === "ALL"
    ? HALL_OF_FAME_WINNERS
    : HALL_OF_FAME_WINNERS.filter(w => w.category === selectedCategory);

  const totalDistributedGBP = HALL_OF_FAME_WINNERS.reduce((sum, w) => sum + w.winningsGBP, 0);

  return (
    <section id="hall-of-fame" className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-neutral-950 via-slate-950 to-neutral-950 border-t border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37]" />
            <span>Exclusive &pound;100K+ Club</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
            Hall of <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-400">Fame</span>
          </h2>

          <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
            Honouring extraordinary winners who claimed over <strong className="text-white font-medium">&pound;100,000+</strong> in dream business relocation packages, tax-free cash, and relocation to the UK.
          </p>

          {/* Quick Stat Pill for Mobile & Desktop */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 text-xs">
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-white/60">Total Hall of Fame Distributed:</span>
              <strong className="text-white font-mono">&pound;{totalDistributedGBP.toLocaleString()}</strong>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Independent Notary Verified</span>
            </div>
          </div>
        </div>

        {/* Mobile-Friendly Category Filters */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
          {["ALL", "Tech & AI", "Luxury Hospitality", "FinTech & Web3", "CleanTech", "E-commerce"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shrink-0 active:scale-95 ${
                selectedCategory === cat
                  ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {cat === "ALL" ? "All Champions" : cat}
            </button>
          ))}
        </div>

        {/* Grid of Winners - Responsive Bento / Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredWinners.map((winner, idx) => {
            const isTopChampion = idx === 0 && selectedCategory === "ALL";
            return (
              <div
                key={winner.id}
                onClick={() => setActiveWinnerModal(winner)}
                className={`group relative rounded-3xl p-6 sm:p-7 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden border ${
                  isTopChampion
                    ? "bg-gradient-to-b from-neutral-900/90 via-slate-900/90 to-black border-[#D4AF37]/50 shadow-2xl md:col-span-2 lg:col-span-1 shadow-[#D4AF37]/10"
                    : "bg-neutral-900/80 hover:bg-neutral-900 border-white/10 hover:border-[#D4AF37]/40"
                }`}
              >
                {/* Gold ambient badge banner */}
                <div className="absolute top-0 right-0 p-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]">
                    <Star className="w-3 h-3 fill-[#D4AF37]" />
                    <span>{winner.tier}</span>
                  </span>
                </div>

                <div className="space-y-5">
                  {/* Avatar & Basic Identity */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={winner.avatar}
                        alt={winner.name}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#D4AF37]/60 shadow-lg"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-1 -right-1 text-base shadow-sm">
                        {winner.flag}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                        {winner.name}
                      </h3>
                      <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#D4AF37]" />
                        <span>{winner.location}</span>
                      </p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
                        {winner.edition}
                      </span>
                    </div>
                  </div>

                  {/* Prize Volume Display Card */}
                  <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block">
                      Total Package & Cash Won
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-400 font-mono">
                        &pound;{winner.winningsGBP.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Venture Built */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block">
                      Venture Launched in the UK:
                    </span>
                    <p className="text-xs font-semibold text-white/90">
                      {winner.ventureCreated}
                    </p>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xs text-white/60 italic font-light line-clamp-3 leading-relaxed border-l-2 border-[#D4AF37]/40 pl-3">
                    &ldquo;{winner.storyQuote}&rdquo;
                  </blockquote>
                </div>

                {/* Footer of card: Verified Deed & View Story */}
                <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{winner.verifiedCertId}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Story</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action card for potential next winner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-neutral-900 via-slate-900 to-neutral-900 border border-[#D4AF37]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-[10px] uppercase font-bold tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next Draw: October 31, 2026</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-white">
              Will You Be The Next <span className="font-extrabold text-[#D4AF37]">&pound;100K+ Legend?</span>
            </h3>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl font-light">
              Secure your verified entry now to enter the official live draw witnessed by independent notaries.
            </p>
          </div>

          <button
            onClick={onOpenEntry}
            className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-[#e6c352] hover:to-amber-400 text-black font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-[#D4AF37]/20 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>Enter The &pound;220K Draw</span>
          </button>
        </div>
      </div>

      {/* Modal Dialog for Deep-Dive Story */}
      {activeWinnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 border border-[#D4AF37]/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setActiveWinnerModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-all"
            >
              &times;
            </button>

            <div className="flex items-center gap-4">
              <img
                src={activeWinnerModal.avatar}
                alt={activeWinnerModal.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37]"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  {activeWinnerModal.tier} &bull; {activeWinnerModal.edition}
                </span>
                <h3 className="text-xl font-bold text-white">{activeWinnerModal.name}</h3>
                <p className="text-xs text-white/60 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{activeWinnerModal.location}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[10px] uppercase text-white/40 block font-bold">Prize Value (GBP)</span>
                <span className="text-xl font-extrabold text-[#D4AF37] font-mono">
                  &pound;{activeWinnerModal.winningsGBP.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-white/40 block font-bold">Relocation Confirmed</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">3-Year Investor</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">The Luxe Transformation Story</h4>
              <p className="text-xs text-white/70 leading-relaxed">
                &ldquo;{activeWinnerModal.storyQuote}&rdquo;
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/40">Notary Deed:</span>
              <span className="text-emerald-400 font-bold">{activeWinnerModal.verifiedCertId}</span>
            </div>

            <button
              onClick={() => {
                setActiveWinnerModal(null);
                if (onOpenEntry) onOpenEntry();
              }}
              className="w-full py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-xs uppercase tracking-widest transition-all shadow-lg"
            >
              Enter Next Grand Draw
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
