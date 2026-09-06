import React, { useState, useEffect } from "react";
import { Sparkles, Ticket, Globe, ShieldCheck, Zap, Menu, X, ArrowRight, Heart } from "lucide-react";

interface NavbarProps {
  onOpenEntry: () => void;
  onOpenWallet: () => void;
  onOpenAiAdvisor: () => void;
  ticketCount: number;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenEntry,
  onOpenWallet,
  onOpenAiAdvisor,
  ticketCount,
  activeSection,
  setActiveSection,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 68, hours: 14, mins: 32, secs: 45 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: "prizes", label: "The £220K Package" },
    { id: "dubai-gallery", label: "Dubai Gallery" },
    { id: "hall-of-fame", label: "Hall of Fame (£100K+)" },
    { id: "draw-verification", label: "Auditable Draw" },
    { id: "charity-impact", label: "Charity (25%)" },
    { id: "one-click-demo", label: "One-Click & AI" },
    { id: "ai-evaluator", label: "AI Feasibility" },
    { id: "customizer", label: "Simulator" },
    { id: "live-draw", label: "Live Draw" },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      {/* Top Philanthropic & Subscription Announcement Ribbon */}
      <div className="bg-gradient-to-r from-rose-950/80 via-neutral-900 to-amber-950/80 border-b border-white/10 py-1.5 px-4 text-center text-[10px] sm:text-xs text-white/90 backdrop-blur-md flex items-center justify-center gap-2">
        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
        <span>
          <strong className="text-rose-300 font-semibold">25% of all ticket & subscription proceeds</strong> go directly to global education & youth enterprise charities
        </span>
        <button
          onClick={() => scrollTo("charity-impact")}
          className="hidden sm:inline text-[#D4AF37] hover:underline font-bold ml-1 uppercase tracking-wider text-[9px]"
        >
          View Impact &rarr;
        </button>
      </div>

      <nav
        id="main-navbar"
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-black/85 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl"
            : "bg-gradient-to-b from-black/80 to-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo & Brand matching Immersive UI */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] shrink-0">
                <div className="w-5 h-5 border-2 border-black rotate-45"></div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold tracking-tighter uppercase text-white">UAE Dream</span>
                  <span className="hidden sm:inline-block text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                    2026 Draw
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                  £100K Cash &middot; 3-Yr Visa &middot; LLC
                </p>
              </div>
            </div>

            {/* Desktop Nav links with Immersive UI typography */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-medium tracking-widest uppercase text-white/60">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => scrollTo(item.id)}
                  className={`hover:text-[#D4AF37] transition-colors py-1 ${
                    activeSection === item.id ? "text-[#D4AF37] font-bold border-b border-[#D4AF37]" : ""
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Action buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Draw Countdown Pill */}
              <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-wider uppercase text-white/70">
                <span className="text-white/40">Draw:</span>
                <span className="font-mono font-bold text-[#D4AF37]">
                  {timeLeft.days}D {timeLeft.hours}H {timeLeft.mins}M
                </span>
              </div>

              {/* AI Advisor Button */}
              <button
                id="navbar-ai-advisor-btn"
                onClick={onOpenAiAdvisor}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest text-white/80 hover:bg-white/10 hover:border-white/40 transition-all"
                title="Ask AI Business Advisor"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>AI Advisor</span>
              </button>

              {/* Ticket Wallet Button */}
              <button
                id="navbar-ticket-wallet-btn"
                onClick={onOpenWallet}
                className="flex items-center gap-2 px-3.5 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest text-white/90 hover:bg-white/10 transition-all relative"
              >
                <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Tickets</span>
                {ticketCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#D4AF37] text-black font-bold text-[9px] flex items-center justify-center">
                    {ticketCount}
                  </span>
                )}
              </button>

              {/* Primary CTA: Enter Competition */}
              <button
                id="navbar-enter-now-btn"
                onClick={onOpenEntry}
                className="group flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-widest rounded-full shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:bg-[#e6c352] transition-all hover:scale-105 active:scale-95"
              >
                <span>Enter & Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                id="mobile-ticket-count-btn"
                onClick={onOpenWallet}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-amber-300"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>{ticketCount}</span>
              </button>

              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-3">
              <div className="grid grid-cols-1 gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    onOpenAiAdvisor();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm font-medium border border-slate-700"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Ask AI UAE Advisor</span>
                </button>

                <button
                  onClick={() => {
                    onOpenEntry();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20"
                >
                  <span>Claim Tickets & Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
