import { PrizeUnlockBar } from "./PrizeUnlockBar";
import React, { useState } from "react";
import {
  Coins, ShieldCheck, Building2, Smartphone, Palette, Landmark, Palmtree,
  CheckCircle2, Sparkles, ChevronRight, Zap, Award, Compass
} from "lucide-react";
import { PRIZE_PILLARS } from "../data/prizeDetails";
import { PrizePillar } from "../types";

interface PrizeShowcaseProps {
  onOpenEntry: () => void;
  onTestOneClick: () => void;
}

export const PrizeShowcase: React.FC<PrizeShowcaseProps> = ({
  onOpenEntry,
  onTestOneClick,
}) => {
  const [selectedPillarId, setSelectedPillarId] = useState<string>("luxury-holiday");

  const getPillarIcon = (name: string) => {
    switch (name) {
      case "Coins": return Coins;
      case "Palmtree": return Palmtree;
      case "ShieldCheck": return ShieldCheck;
      case "Building2": return Building2;
      case "Smartphone": return Smartphone;
      case "Palette": return Palette;
      case "Landmark": return Landmark;
      case "Award": return Award;
      case "Compass": return Compass;
      case "Sparkles": return Sparkles;
      default: return Sparkles;
    }
  };

  const pillarArt: Record<string, string> = {
    Coins: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=85",
    Palmtree: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85",
    ShieldCheck: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=85",
    Building2: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=85",
    Smartphone: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=85",
    Palette: "https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=900&q=85",
    Landmark: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=85",
  };
  const activePillar = PRIZE_PILLARS.find((p) => p.id === selectedPillarId) || PRIZE_PILLARS[0];

  return (
    <section id="prizes" className="py-24 relative">
      {/* Decorative radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Estimated £220,000+ Comprehensive Valuation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
            The Complete <span className="font-bold text-[#D4AF37]">Luxe Prize Draws Package</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
            Every single component required to establish, operate, fund, and scale a high-growth business in Dubai with zero personal income tax.
          </p>
        </div>

        {/* Pillar Selection Tabs - 7 Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5 mb-8">
          {PRIZE_PILLARS.map((pillar) => {
            const isSelected = pillar.id === selectedPillarId;
            return (
              <button
                key={pillar.id}
                id={`prize-tab-${pillar.id}`}
                onClick={() => setSelectedPillarId(pillar.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between backdrop-blur-xl ${
                  isSelected
                    ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <img src={pillarArt[pillar.iconName] || pillarArt.Coins} alt="" className={`h-9 w-9 rounded-xl object-cover ring-1 ${isSelected ? "ring-[#D4AF37]" : "ring-white/15"}`} />
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-[#D4AF37]" : "text-white/40"}`}>
                    {pillar.emoji ? `${pillar.emoji} ${pillar.valueGBP}` : pillar.valueGBP}
                  </span>
                </div>
                <div>
                  <p className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-white/70"}`}>
                    {pillar.shortTitle}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-white/40 mt-1 truncate">{pillar.badge}</p>
                  <PrizeUnlockBar valueGBP={Number(pillar.valueGBP.replace(/[£,]/g, ""))} label={pillar.shortTitle} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Detailed Showcase Box */}
        <div className="p-6 sm:p-10 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Core Details & Quote */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold uppercase tracking-wider">
                    {activePillar.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-white/70 border border-white/10 text-xs font-semibold uppercase tracking-wider">
                    {activePillar.prizeTier === "alternative" ? "Wacky Alternative" : "Traditional Prize"}
                  </span>
                  <span className="text-xs text-white/50 font-mono">Valued at {activePillar.valueGBP}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-light text-white">
                  <span className="mr-2">{activePillar.emoji}</span>
                  {activePillar.title}
                </h3>
                <p className="text-sm font-medium text-[#D4AF37]">
                  {activePillar.tagline}
                </p>
              </div>

              <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                {activePillar.description}
              </p>

              {activePillar.valueBreakdown && (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                      Value Breakdown
                    </p>
                    <span className="text-[11px] font-mono text-[#D4AF37]">{activePillar.valueGBP} total</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {activePillar.valueBreakdown.map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-black/20 border border-white/10">
                        <p className="text-[10px] uppercase tracking-wider text-white/40">{item.label}</p>
                        <p className="text-sm font-bold text-white mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special callout if Web & Mobile App */}
              {activePillar.id === "web-mobile-app" && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1E40AF]/20 via-purple-900/20 to-black/30 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-[#D4AF37]" />
                    <span>Proprietary Tech Integration Included</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Your app will be built with our instant <strong className="text-[#D4AF37]">One-Click Book</strong> technology and an autonomous <strong className="text-indigo-300">24/7 AI Business Copilot</strong> for automated client handling, quote generation, and multilingual conversion.
                  </p>
                  <button
                    onClick={onTestOneClick}
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-white pt-1"
                  >
                    <span>Launch Interactive Demo Sandbox</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Highlight Quote */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 italic text-xs text-white/70 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>&ldquo;{activePillar.highlightQuote}&rdquo;</span>
              </div>
            </div>

            {/* Right Col: Exact Deliverables Checklist & Specs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center justify-between">
                  <span>Exact Deliverables</span>
                  <span className="text-emerald-400 font-mono font-normal lowercase">100% covered</span>
                </h4>

                <div className="space-y-2.5">
                  {activePillar.keyDeliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {activePillar.specifications.map((spec, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{spec.label}</p>
                    <p className="text-xs font-bold text-white mt-0.5">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Enter Button CTA */}
              <button
                id={`prize-action-btn-${activePillar.id}`}
                onClick={onOpenEntry}
                className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] transition-all flex items-center justify-center gap-2"
              >
                <span>Enter To Win This Entire Package</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
