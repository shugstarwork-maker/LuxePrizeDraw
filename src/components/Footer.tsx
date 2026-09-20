import React from "react";
import { ShieldCheck, Trophy, Sparkles, Globe, Heart, ArrowUp } from "lucide-react";

interface FooterProps {
  onOpenEntry: () => void;
  onOpenWallet: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenEntry, onOpenWallet }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-12 text-white/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center font-bold text-black text-sm shadow-lg shadow-[#D4AF37]/20">
                LUXE
              </div>
              <div>
                <span className="font-bold text-sm uppercase tracking-wider text-white">LUXE PRIZE DRAWS</span>
                <p className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">Official 2026 Grand Draw</p>
              </div>
            </div>
            <p className="text-xs text-white/50 font-light leading-relaxed max-w-sm">
              Luxe Prize Draws gives one visionary entrepreneur a turnkey UAE business setup: £100K Cash, 2-Week 5-Star Dubai Luxury Holiday, 3-Year Residency Visa, 100% Foreign-Owned LLC, Full Branding Suite, Custom App & Website with One-Click Book & AI, and Tier-1 VIP Corporate Banking.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Pre-launch &middot; participation controls in development</span>
            </div>
          </div>

          {/* Prize Pillars Links */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">The £220K+ Package</h4>
            <ul className="space-y-2 text-xs font-light">
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">£100,000 Cash Grant</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">2-Week 5-Star Dubai Luxury Holiday</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">3-Year UAE Investor Visa</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">Turnkey UAE LLC Formation</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">App & Web with One-Click Book</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">Autonomous AI Concierge</li>
              <li className="hover:text-[#D4AF37] transition-colors cursor-pointer">VIP GBP Banking</li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Competition Portal</h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <button onClick={onOpenEntry} className="hover:text-[#D4AF37] transition-colors font-medium">
                  Claim Free Entry Ticket
                </button>
              </li>
              <li>
                <button onClick={onOpenWallet} className="hover:text-[#D4AF37] transition-colors font-medium">
                  My Ticket Wallet
                </button>
              </li>
              <li>
                <a href="#dubai-gallery" className="hover:text-[#D4AF37] transition-colors">
                  Dubai Photo Gallery
                </a>
              </li>
              <li>
                <a href="#hall-of-fame" className="hover:text-[#D4AF37] transition-colors text-amber-300 font-medium">
                  Hall of Fame (£100K+ Champions)
                </a>
              </li>
              <li>
                <a href="#draw-verification" className="hover:text-[#D4AF37] transition-colors text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Auditable Draw & Provable Fairness</span>
                </a>
              </li>
              <li>
                <a href="#ai-evaluator" className="hover:text-[#D4AF37] transition-colors">
                  AI Pitch Feasibility Test
                </a>
              </li>
              <li>
                <a href="#one-click-demo" className="hover:text-[#D4AF37] transition-colors">
                  One-Click Book Sandbox
                </a>
              </li>
              <li>
                <a href="#customizer" className="hover:text-[#D4AF37] transition-colors">
                  Package Simulator
                </a>
              </li>
            </ul>
          </div>

          {/* Official Freezones & Trust */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Ecosystem Partners</h4>
            <ul className="space-y-2 text-xs text-white/50 font-light">
              <li>IFZA Dubai & DSO</li>
              <li>DMCC Global Freezone</li>
              <li>Meydan Free Zone</li>
              <li>Emirates NBD & Wio VIP</li>
              <li>Apple Pay & Stripe Rails</li>
              <li>Google Cloud & Gemini AI</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Compliance Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-light">
          <div className="space-y-1 text-center sm:text-left">
            <p>&copy; 2026 Luxe Prize Draws. All rights reserved.</p>
            <p className="text-[10px] text-white/30">
              Pre-launch only. No entries, payments, or prizes are available. Final eligibility and rules will be published for each approved draw.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
