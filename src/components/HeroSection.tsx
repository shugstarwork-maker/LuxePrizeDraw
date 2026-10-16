import React from "react";
import { Sparkles, Trophy, ArrowRight, ShieldCheck, CheckCircle2, Zap, Smartphone, Coins, Building2, Palette, Landmark, Star, ExternalLink, Palmtree, Camera, Gift, Flame, Lock } from "lucide-react";
import { CompetitionStats } from "../types";
import dubaiSkylineNight from "../assets/images/dubai_skyline_night_1787855491978.jpg";

interface HeroSectionProps {
  onOpenEntry: () => void;
  onExplorePrizes: () => void;
  onTestOneClick: () => void;
  stats: CompetitionStats;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenEntry,
  onExplorePrizes,
  onTestOneClick,
  stats,
}) => {
  const prizeHighlights = [
    {
      icon: Coins,
      title: "£100K Cold Cash",
      subtitle: "Clean seed grant, zero equity",
      badge: "Pure Seed Capital",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
    {
      icon: Palmtree,
      title: "2-Week 5-Star Trip",
      subtitle: "Luxury hotel suite, flights & chauffeur",
      badge: "5-Star VIP Holiday",
      color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    },
    {
      icon: ShieldCheck,
      title: "3-Yr Relocation",
      subtitle: "VIP onboarding + founder support",
      badge: "0% Personal Tax",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      icon: Building2,
      title: "UK Limited Company",
      subtitle: "Registered in England & Wales or Scotland",
      badge: "Turnkey License",
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      icon: Smartphone,
      title: "Web & Mobile App",
      subtitle: "With One-Click Book & AI Copilot",
      badge: "Flagship Tech Stack",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
    {
      icon: Palette,
      title: "Full Brand Suite",
      subtitle: "Logo, design system & pitch deck",
      badge: "Agency Grade",
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    },
    {
      icon: Landmark,
      title: "VIP Banking",
      subtitle: "GBP corporate accounts",
      badge: "Fast-Track Setup",
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    },
  ];

  return (
    <div className="relative pt-32 pb-24 overflow-hidden">
      {/* Cinematic city skyline backdrop with subtle dark fade & gold lighting */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <img
          src={dubaiSkylineNight}
          alt="City skyline at night"
          className="w-full h-full object-cover object-center opacity-25 scale-105 filter blur-[0.5px]"
          referrerPolicy="no-referrer"
        />
        {/* Multilayer gradient overlays to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-950/90 to-neutral-950" />
        <div className="absolute inset-0 bg-radial from-transparent via-neutral-950/70 to-neutral-950" />
      </div>

      {/* Background ambient lighting effects matching Immersive UI */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-10 w-[500px] h-[400px] bg-[#1E40AF]/15 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-purple-900/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Hero Header & Primary CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light leading-[1.1] text-white tracking-tight">
              Win Your <span className="font-bold text-[#D4AF37]">Future</span> <br className="hidden sm:inline" />
              with Luxe Prize Draws
            </h1>

            <div className="inline-flex w-fit max-w-full items-center gap-2 self-start rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase leading-relaxed tracking-[0.16em] text-[#D4AF37]">
                Exclusive 2026 Franchise Opportunity
              </span>
            </div>

            <p className="text-base sm:text-lg text-white/50 max-w-xl leading-relaxed">
              The ultimate founder prize package. We don't just give you a prize; we set you up to own and run your own Luxe Prize Draws franchise in the UK with <strong className="text-white font-semibold">£100,000 Cash</strong>, an all-inclusive <strong className="text-[#D4AF37] font-semibold">2-Week 5-Star Luxury Holiday</strong>, a <strong className="text-white font-semibold">3-Year Founder Relocation Package</strong>, and a custom <strong className="text-[#D4AF37] font-semibold">App with One-Click Book & AI</strong>.
            </p>

            {/* Action Buttons matching Immersive UI */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                id="hero-claim-ticket-btn"
                onClick={onOpenEntry}
                className="group relative px-8 sm:px-10 py-4 sm:py-5 bg-[#D4AF37] text-black font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(212,175,55,0.35)] hover:scale-105 active:scale-95 transition-all text-center"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>One-Click Book Entry</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              </button>

              <button
                id="hero-test-one-click-btn"
                onClick={onTestOneClick}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-white/5 border border-white/10 font-bold text-xs sm:text-sm uppercase tracking-widest text-white rounded-xl backdrop-blur-md hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                <span>Explore AI Suite</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Free Entry &middot; Zero Purchase Required &middot; Global Draw</span>
            </div>

            {/* Community Perk Unlock Milestone Progress Bar */}
            {(() => {
              const currentEntries = stats.totalEntries || 38450;
              const nextMilestone = 50000;
              const prevMilestone = 25000;
              const progressPct = Math.min(
                100,
                Math.max(0, Math.round(((currentEntries - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
              );
              const remaining = Math.max(0, nextMilestone - currentEntries);

              return (
                <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-black/80 to-neutral-900/90 border border-[#D4AF37]/30 shadow-xl backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                            Community Perk Milestone
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Flame className="w-2.5 h-2.5" />
                            Level 2
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50">
                          Next unlock: <strong className="text-amber-300 font-medium">+£10,000 Cash Booster & 5 VIP Flight Upgrades</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-extrabold text-[#D4AF37]">
                        {progressPct}%
                      </span>
                      <span className="text-[9px] text-white/40 block font-mono">
                        {remaining.toLocaleString()} left
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="relative w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-emerald-400 transition-all duration-1000 shadow-[0_0_12px_rgba(212,175,55,0.6)] relative overflow-hidden"
                      style={{ width: `${progressPct}%` }}
                    >
                      <div className="absolute inset-0 bg-white/25 animate-pulse" />
                    </div>
                  </div>

                  {/* Milestone Markers */}
                  <div className="grid grid-cols-3 gap-2 text-[9px] pt-1">
                    <div className="text-left">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        25K: Unlocked
                      </span>
                      <span className="text-white/40 block truncate">Marina Yacht Party</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[#D4AF37] font-bold flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3" />
                        50K: Target
                      </span>
                      <span className="text-white/60 block truncate">+£10K Booster</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white/40 font-bold flex items-center justify-end gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        75K: Tier 3
                      </span>
                      <span className="text-white/30 block truncate">Supercar Month</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Column: Immersive Glass Metric Cards */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-4">
            {/* Headline prize visual: £100K cash stack */}
            <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#D4AF37]/15 via-black/60 to-black/80 p-6 sm:p-8 backdrop-blur-xl">
              <div className="pointer-events-none absolute -top-10 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[#D4AF37]/25 blur-[80px]" />
              <div className="relative flex flex-col items-center text-center">
                <img
                  src="/prizes/cash-stack.svg"
                  alt="Stacks of cash representing the £100,000 headline prize"
                  className="h-40 w-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.35)] sm:h-48"
                />
                <p className="mt-4 text-[10px] font-black uppercase tracking-[.2em] text-[#D4AF37]">
                  Headline prize — Bitcoin or cash
                </p>
                <p className="mt-1 text-2xl font-black tracking-tight text-white">£100,000</p>
                <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-white/45">
                  Winner chooses £100K of Bitcoin or £100K cash, paid on activation. Pre-launch preview — no entry or payment yet.
                </p>
              </div>
            </div>

            {/* Top Cash Card */}
            <div className="bg-white/5 border border-white/10 p-6 sm:p-7 rounded-2xl backdrop-blur-xl relative overflow-hidden group hover:border-[#D4AF37]/40 transition-colors">
              <div className="absolute top-0 right-0 p-5 opacity-20 text-[#D4AF37]">
                <Coins className="w-12 h-12" />
              </div>
              <h3 className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                <span>Grand Seed Capital</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">0% EQUITY</span>
              </h3>
              <div className="text-3xl sm:text-4xl font-bold mb-1 text-white tracking-tight">
                £100,000 <span className="text-lg font-medium text-white/50">GBP</span>
              </div>
              <p className="text-xs text-white/40">Paid directly into your UK bank account upon activation.</p>
            </div>

            {/* Middle 3-Column Split Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                <h3 className="text-yellow-400 text-[10px] uppercase tracking-widest font-bold mb-1">Luxury Holiday</h3>
                <div className="text-xl font-bold text-white">2 Weeks</div>
                <p className="text-[9px] text-white/40 mt-0.5 uppercase tracking-wider">5-Star Luxury</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                <h3 className="text-blue-400 text-[10px] uppercase tracking-widest font-bold mb-1">Relocation</h3>
                <div className="text-xl font-bold text-white">3 Years</div>
                <p className="text-[9px] text-white/40 mt-0.5 uppercase tracking-wider">Founder Relocation</p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                <h3 className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold mb-1">Banking</h3>
                <div className="text-xl font-bold text-white">VIP Tier-1</div>
                <p className="text-[9px] text-white/40 mt-0.5 uppercase tracking-wider">Corporate Hub</p>
              </div>
            </div>

            {/* AI Core Features Card with Gradient */}
            <div className="bg-gradient-to-br from-[#1E40AF]/20 via-purple-900/20 to-black/40 border border-white/10 p-6 rounded-2xl backdrop-blur-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-indigo-300 text-xs uppercase tracking-widest font-bold">Launch-Ready Founder Stack</h3>
                  <p className="text-[11px] text-white/50">Built to convert, support and scale from day one</p>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-widest font-bold">
                  ACTIVE
                </span>
              </div>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_#818cf8]"></div>
                  <span>Frictionless one-tap booking with Apple Pay</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                  <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]"></div>
                  <span>Always-on multilingual AI client concierge</span>
                </li>
                <li className="flex items-center gap-3 text-xs sm:text-sm text-white/80">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"></div>
                  <span>UK business setup pathway and tax-ready guidance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 7 Prize Pillar Cards Grid in Immersive UI aesthetic */}
        <div className="mt-20">
          <div className="flex flex-col items-center text-center mb-10 space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">
              Complete Turnkey Package Specifications
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-white">
              The 7 Pillars of the <span className="font-bold text-[#D4AF37]">Luxe Grand Prize</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {prizeHighlights.map((prize, idx) => {
              const IconComp = prize.icon;
              return (
                <div
                  key={idx}
                  id={`hero-prize-card-${idx}`}
                  className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.1)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:border-[#D4AF37]/40 transition-colors">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-white/5 text-white/70 border border-white/10">
                      {prize.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                    {prize.title}
                  </h3>
                  <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                    {prize.subtitle}
                  </p>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/30 uppercase text-[10px] tracking-wider">Turnkey Setup</span>
                    <button
                      onClick={onExplorePrizes}
                      className="text-[#D4AF37] hover:text-white font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-all uppercase text-[10px] tracking-widest"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Entrants Ticker Bar matching Immersive UI */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-white/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium uppercase tracking-wider text-white/60">Live Entrants:</span>
              <span className="font-mono text-[#D4AF37] font-bold text-sm">{stats.totalEntries.toLocaleString()} Verified</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto max-w-full text-xs text-white/60 scrollbar-none">
              {stats.recentEntrants.slice(0, 3).map((entrant, i) => (
                <div key={i} className="flex items-center gap-2 shrink-0 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                  <span className="font-mono text-[#D4AF37] text-[11px] font-semibold">{entrant.id}</span>
                  <span className="text-white text-xs">{entrant.name}</span>
                  <span className="text-white/40 text-[10px]">({entrant.country})</span>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenEntry}
              className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-white flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>Join live draw</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
