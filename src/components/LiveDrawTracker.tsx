import React, { useState, useEffect } from "react";
import {
  Trophy, ShieldCheck, Clock, CheckCircle2, ChevronDown,
  HelpCircle, Star, Quote, Award, Sparkles, ExternalLink
} from "lucide-react";
import { COMPETITION_FAQ, SUCCESS_STORIES } from "../data/prizeDetails";

interface LiveDrawTrackerProps {
  onOpenEntry: () => void;
}

export const LiveDrawTracker: React.FC<LiveDrawTrackerProps> = ({ onOpenEntry }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [timeLeft, setTimeLeft] = useState({ days: 68, hours: 14, mins: 32, secs: 45 });

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

  return (
    <section id="live-draw" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Draw Countdown Banner */}
        <div className="p-8 sm:p-12 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E40AF]/15 rounded-full blur-[130px] pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping"></span>
                <span>Official Live Draw & Global Broadcast</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                Countdown to the <span className="font-bold text-[#D4AF37]">Grand Winner Selection</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed font-light">
                Streamed globally from Dubai on <strong className="text-[#D4AF37] font-semibold">October 31, 2026 at 18:00 GST</strong>. The winner receives the £100,000 cash grant, 2-week 5-star Dubai luxury holiday, 3-year residency visa, registered UAE company, brand suite, and full web/mobile app with One-Click Book & AI.
              </p>
              <div className="flex items-center gap-4 text-xs text-white/50">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Independent Legal Supervision
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Provably Fair Random Draw
                </span>
              </div>
            </div>

            {/* Countdown Numbers Grid */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
                <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl sm:text-4xl font-bold text-[#D4AF37] font-mono">{timeLeft.days}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">Days</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl sm:text-4xl font-bold text-[#D4AF37] font-mono">{timeLeft.hours}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">Hours</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl sm:text-4xl font-bold text-[#D4AF37] font-mono">{timeLeft.mins}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">Minutes</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl sm:text-4xl font-bold text-emerald-400 font-mono">{timeLeft.secs}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">Seconds</p>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={onOpenEntry}
                  className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Get Your Verified Ticket Before Entries Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Previous UAE Founder Success Stories */}
        <div className="mb-16">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em]">Hall of Fame</h3>
            <p className="text-2xl sm:text-3xl font-light text-white">Previous Winners <span className="font-bold">Thriving in Dubai</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SUCCESS_STORIES.map((story, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]/50"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{story.name}</h4>
                    <p className="text-xs text-white/50">{story.origin} &middot; <span className="text-[#D4AF37] font-medium">{story.verifiedDate}</span></p>
                  </div>
                </div>

                <p className="text-xs text-white/70 italic leading-relaxed">
                  &ldquo;{story.quote}&rdquo;
                </p>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                  <span className="font-semibold text-white">{story.company}</span>
                  <span className="text-emerald-400 font-medium">Verified Active Business</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] uppercase tracking-widest font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Transparency & Rules</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-light text-white">Frequently Asked <span className="font-bold text-[#D4AF37]">Questions</span></h3>
          </div>

          <div className="space-y-3">
            {COMPETITION_FAQ.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-white hover:text-[#D4AF37] font-medium text-xs sm:text-sm"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#D4AF37] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-white/60 leading-relaxed border-t border-white/10 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
