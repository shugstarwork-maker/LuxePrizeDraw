import React from "react";
import { Heart, Sparkles, GraduationCap, Award, ShieldCheck, Globe, Users, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { CHARITY_IMPACT_DATA } from "../data/prizeDetails";

interface CharityImpactSectionProps {
  onOpenEntry: () => void;
}

export const CharityImpactSection: React.FC<CharityImpactSectionProps> = ({ onOpenEntry }) => {
  return (
    <section id="charity-impact" className="relative py-20 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-full text-[10px] uppercase tracking-[0.2em] text-rose-400 font-bold">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
            <span>Philanthropic Commitment &middot; 25% of Ticket Revenue</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
            Every Entry Directly Fuels <br />
            <span className="font-bold bg-gradient-to-r from-rose-400 via-amber-300 to-[#D4AF37] bg-clip-text text-transparent">
              Global Education & Youth Founders
            </span>
          </h2>

          <p className="text-white/50 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
            When you enter the UAE Dream Package or join our Monthly Entry Club, you are directly investing in the next generation. A verified <strong className="text-white font-semibold">25% of all ticket bundles and recurring subscription proceeds</strong> fund real scholarships, laptops, and startup seed grants worldwide.
          </p>
        </div>

        {/* Live Charity Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">Total Donated</span>
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              £{CHARITY_IMPACT_DATA.totalRaisedGBP.toLocaleString()}
            </div>
            <p className="text-xs text-white/40 mt-1">Disbursed to verified non-profits</p>
            <div className="mt-3 w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-rose-400 h-full w-3/4 rounded-full"></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">Charity Allocation</span>
              <Award className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {CHARITY_IMPACT_DATA.percentageDonated}%
            </div>
            <p className="text-xs text-white/40 mt-1">Of every ticket & subscription</p>
            <div className="mt-3 w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-[#D4AF37] h-full w-full rounded-full"></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Scholarships</span>
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {CHARITY_IMPACT_DATA.scholarshipsFunded.toLocaleString()}+
            </div>
            <p className="text-xs text-white/40 mt-1">Students sponsored in school</p>
            <div className="mt-3 w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-4/5 rounded-full"></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">Micro-Grants</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {CHARITY_IMPACT_DATA.microGrantsAwarded}+
            </div>
            <p className="text-xs text-white/40 mt-1">Underprivileged founders launched</p>
            <div className="mt-3 w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-indigo-400 h-full w-2/3 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Partner Non-Profits Banner & Transparency */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent border border-white/10 backdrop-blur-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">Audited Philanthropy</span>
              <h3 className="text-2xl font-light text-white mt-1">Our Official Charity Partners</h3>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Independently Audited & Verified Disbursements</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CHARITY_IMPACT_DATA.partnerCharities.map((charity, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#D4AF37] px-2.5 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                    {charity.logoText}
                  </span>
                  <BookOpen className="w-4 h-4 text-white/30" />
                </div>
                <h4 className="text-base font-bold text-white">{charity.name}</h4>
                <p className="text-[11px] font-medium text-rose-300 uppercase tracking-wider">{charity.focus}</p>
                <p className="text-xs text-white/50 leading-relaxed font-light">{charity.description}</p>
              </div>
            ))}
          </div>

          {/* Call to Action Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-neutral-900 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                <span>Win Big While Giving Back</span>
              </h4>
              <p className="text-xs text-white/60 font-light max-w-xl">
                Subscribe to our Monthly Entry Club for £9.99/mo to secure 20 recurring entries every draw and directly donate £2.50 every month toward youth coding scholarships.
              </p>
            </div>

            <button
              onClick={onOpenEntry}
              className="px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-[#e6c352] hover:to-amber-400 text-black font-bold text-xs uppercase tracking-widest rounded-xl shadow-[0_5px_20px_rgba(212,175,55,0.3)] transition-all shrink-0 flex items-center gap-2 hover:scale-105"
            >
              <span>Get Entries & Support Charity</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
