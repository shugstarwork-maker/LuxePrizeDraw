import React, { useState } from "react";
import {
  Building2, Palette, Smartphone, Sparkles, CheckCircle2,
  CreditCard, ShieldCheck, Zap, Sliders, ArrowRight, Layers, Palmtree, Star, Compass
} from "lucide-react";
import { FREEZONES_DATA, PRIZE_PILLARS } from "../data/prizeDetails";

interface PackageCustomizerProps {
  onOpenEntry: () => void;
}

export const PackageCustomizer: React.FC<PackageCustomizerProps> = ({ onOpenEntry }) => {
  const [selectedZone, setSelectedZone] = useState("england-wales");
  const [companyName, setCompanyName] = useState("AURA GLOBAL");
  const [industry, setIndustry] = useState("Tech & AI Software");
  const [brandStyle, setBrandStyle] = useState<"luxury-gold" | "cyber-emerald" | "royal-sapphire">("luxury-gold");
  const [selectedHotel, setSelectedHotel] = useState("the-savoy");
  const [oneClickFeature, setOneClickFeature] = useState("instant-vip-booking");
  const [selectedPrizeId, setSelectedPrizeId] = useState("monthly-stipend");

  const hotelOptions = [
    {
      id: "the-savoy",
      name: "The Savoy",
      location: "Strand, London",
      tier: "5-Star Luxury River Suite",
    },
    {
      id: "the-balmoral",
      name: "The Balmoral",
      location: "Edinburgh, Scotland",
      tier: "Iconic Castle View Suite",
    },
    {
      id: "gleneagles",
      name: "Gleneagles Resort",
      location: "Auchterarder, Scotland",
      tier: "5-Star Estate Room",
    },
    {
      id: "cliveden",
      name: "Cliveden House",
      location: "Berkshire, England",
      tier: "5-Star Private Garden Suite",
    },
  ];

  const brandThemes = {
    "luxury-gold": {
      name: "Luxury Gold & Obsidian",
      badge: "Prestige Tier",
      cardGradient: "from-amber-500 via-amber-600 to-yellow-800",
      accent: "text-amber-400",
      border: "border-amber-500/40",
      bgPill: "bg-amber-500/20 text-amber-300",
    },
    "cyber-emerald": {
      name: "Emerald Horizon & Titanium",
      badge: "High-Growth Tech",
      cardGradient: "from-emerald-500 via-teal-600 to-slate-900",
      accent: "text-emerald-400",
      border: "border-emerald-500/40",
      bgPill: "bg-emerald-500/20 text-emerald-300",
    },
    "royal-sapphire": {
      name: "Royal Sapphire & Platinum",
      badge: "Institutional VIP",
      cardGradient: "from-blue-600 via-indigo-700 to-slate-950",
      accent: "text-blue-400",
      border: "border-blue-500/40",
      bgPill: "bg-blue-500/20 text-blue-300",
    },
  };

  const currentTheme = brandThemes[brandStyle];
  const activeZoneObj = FREEZONES_DATA.find((z) => z.id === selectedZone) || FREEZONES_DATA[0];
  const activeHotelObj = hotelOptions.find((h) => h.id === selectedHotel) || hotelOptions[0];
  const activePrizeObj = PRIZE_PILLARS.find((pillar) => pillar.id === selectedPrizeId) || PRIZE_PILLARS[0];

  return (
    <section id="customizer" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Prize Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
            Design Your <span className="font-bold text-[#D4AF37]">Winning UK Setup</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
            Mix classic founder rewards with bold wildcard tiers, then preview the luxury lifestyle and launch energy behind the prize package that fits your ambition.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span>Configure Your Prize Preferences</span>
              </h3>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Select Prize Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRIZE_PILLARS.map((pillar) => {
                    const isSelected = selectedPrizeId === pillar.id;
                    return (
                      <button
                        key={pillar.id}
                        type="button"
                        onClick={() => setSelectedPrizeId(pillar.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-white/10 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-white truncate">
                            <span className="mr-1">{pillar.emoji}</span>
                            {pillar.shortTitle}
                          </p>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#D4AF37] mt-1">{pillar.valueGBP}</p>
                        <p className="text-[9px] text-white/40 mt-0.5">
                          {pillar.prizeTier === "alternative" ? "Wacky alternative tier" : "Traditional prize tier"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5-Star Hotel Choice */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
                  <Palmtree className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Select 2-Week 5-Star Luxury Resort</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hotelOptions.map((hotel) => (
                    <button
                      key={hotel.id}
                      type="button"
                      onClick={() => setSelectedHotel(hotel.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        selectedHotel === hotel.id
                          ? "bg-white/10 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white">{hotel.name}</p>
                        {selectedHotel === hotel.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#D4AF37] mt-1">{hotel.location}</p>
                      <p className="text-[9px] text-white/40 mt-0.5">{hotel.tier}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Your Desired Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
                  placeholder="e.g. AURA GLOBAL LLC"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-3 text-sm font-bold text-[#D4AF37] tracking-wider focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Formation Jurisdiction */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Select UK Formation Route
                </label>
                <div className="space-y-2">
                  {FREEZONES_DATA.slice(0, 3).map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZone(zone.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                        selectedZone === zone.id
                          ? "bg-white/10 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white">{zone.name}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">{zone.tag}</p>
                      </div>
                      {selectedZone === zone.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branding Theme Palette */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Brand Identity Style & Archetype
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(brandThemes) as Array<keyof typeof brandThemes>).map((key) => {
                    const theme = brandThemes[key];
                    const isSelected = brandStyle === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setBrandStyle(key)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-white/10 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className={`h-4 rounded-md bg-gradient-to-r ${theme.cardGradient} mb-1.5`}></div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white leading-tight">{theme.name.split("&")[0]}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* One Click Feature Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  App One-Click Booking Customization
                </label>
                <select
                  value={oneClickFeature}
                  onChange={(e) => setOneClickFeature(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="instant-vip-booking">1-Touch VIP Service & Consultation Booking</option>
                  <option value="instant-ecom-checkout">One-Click Luxury E-Commerce & Product Checkout</option>
                  <option value="instant-concierge-dispatch">1-Tap Chauffeur & Yacht Concierge Dispatch</option>
                  <option value="instant-b2b-retainer">One-Click Client Retainer & Escrow Agreement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Live Simulation Preview Display */}
          <div className="lg:col-span-6 space-y-6">
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${activePrizeObj.accentColor} border border-white/15 shadow-2xl backdrop-blur-xl space-y-4 text-white`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-white/70">
                    {activePrizeObj.prizeTier === "alternative" ? "Wacky prize tier" : "Traditional prize tier"}
                  </p>
                  <h4 className="text-lg sm:text-xl font-semibold mt-1">
                    <span className="mr-2">{activePrizeObj.emoji}</span>
                    {activePrizeObj.title}
                  </h4>
                  <p className="text-sm text-white/80 mt-1">{activePrizeObj.tagline}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-black/20 border border-white/20">
                  {activePrizeObj.valueGBP}
                </span>
              </div>

              <p className="text-sm text-white/80 leading-relaxed">
                {activePrizeObj.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {(activePrizeObj.valueBreakdown || activePrizeObj.specifications.slice(0, 3)).map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-black/20 border border-white/10">
                    <p className="text-[9px] uppercase tracking-wider text-white/55">{item.label}</p>
                    <p className="font-bold text-white mt-1">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-xs text-white/85">
                <span className="text-white/60 uppercase tracking-[0.2em] text-[9px] font-bold">Aspirational angle</span>
                <p className="mt-1 leading-relaxed">{activePrizeObj.highlightQuote}</p>
              </div>
            </div>

            {/* 1. 2-Week 5-Star VIP Holiday Boarding & Suite Pass Mockup */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-900/20 via-black/40 to-[#1E40AF]/20 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37] flex items-center justify-center font-bold text-black text-xs">
                    <Palmtree className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] text-[#D4AF37] uppercase tracking-widest font-bold">VIP Concierge & Travel Suite</p>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">14-Day 5-Star UK Vacation Pass</h4>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                  ALL-INCLUSIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[8px] uppercase tracking-wider text-white/40">5-Star Accommodation</p>
                  <p className="font-bold text-[#D4AF37] text-xs truncate">{activeHotelObj.name}</p>
                  <p className="text-[8px] text-white/40 truncate">{activeHotelObj.tier}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[8px] uppercase tracking-wider text-white/40">Duration & Flight Class</p>
                  <p className="font-bold text-white text-xs">14 Days / Business Class (2 Pax)</p>
                  <p className="text-[8px] text-emerald-400">LHR VIP Airport Escort</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[8px] uppercase tracking-wider text-white/40">Chauffeur Service</p>
                  <p className="font-bold text-white text-xs">24/7 Private Luxury Vehicle</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[8px] uppercase tracking-wider text-white/40">Dining & Excursions</p>
                  <p className="font-bold text-emerald-400 text-xs">£4,000 Michelin Dining + Yacht</p>
                </div>
              </div>
            </div>

            {/* 2. UK Company Certificate Mockup */}
            <div className="p-5 rounded-2xl bg-white/5 border border-[#D4AF37]/30 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-bold text-[#D4AF37] text-xs">
                    UK
                  </div>
                  <div>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest font-semibold">UK Companies House</p>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trade License Certificate</h4>
                  </div>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% OWNERSHIP
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[8px] uppercase tracking-wider text-white/40">Registered Entity</p>
                  <p className="font-bold text-[#D4AF37] truncate">{companyName || "YOUR VENTURE LLC"}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[8px] uppercase tracking-wider text-white/40">Jurisdiction</p>
                  <p className="font-bold text-white truncate">{activeZoneObj.name.split("(")[0]}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[8px] uppercase tracking-wider text-white/40">License Type</p>
                  <p className="font-bold text-white">{industry}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[8px] uppercase tracking-wider text-white/40">Founder Relocation</p>
                  <p className="font-bold text-emerald-400">3-Year Founder Relocation</p>
                </div>
              </div>
            </div>

            {/* 3. VIP Corporate Titanium Debit Card Mockup */}
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${currentTheme.cardGradient} shadow-2xl text-white relative overflow-hidden h-48 flex flex-col justify-between border ${currentTheme.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] tracking-widest uppercase opacity-70">UK Business Banking</p>
                  <p className="text-xs font-bold tracking-widest uppercase mt-0.5">CORPORATE TITANIUM</p>
                </div>
                <div className="w-8 h-6 rounded bg-amber-300/30 border border-amber-300/60 flex items-center justify-center text-[8px] font-mono font-bold">
                  CHIP
                </div>
              </div>

              <div>
                <p className="font-mono text-sm sm:text-base tracking-[0.25em] font-semibold text-white/90">
                  4892 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 9012
                </p>
              </div>

              <div className="flex items-end justify-between text-xs">
                <div>
                  <p className="text-[8px] opacity-70 uppercase tracking-wider">Company / Holder</p>
                  <p className="font-bold tracking-wide uppercase text-xs">{companyName || "YOUR VENTURE LLC"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] opacity-70 uppercase tracking-wider">Seed Balance</p>
                  <p className="font-mono font-bold text-emerald-300">£100,000.00 GBP</p>
                </div>
              </div>
            </div>

            {/* Direct CTA */}
            <button
              onClick={onOpenEntry}
              className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] transition-all flex items-center justify-center gap-2"
            >
              <span>Lock in {activePrizeObj.shortTitle} & Get Official Ticket</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
