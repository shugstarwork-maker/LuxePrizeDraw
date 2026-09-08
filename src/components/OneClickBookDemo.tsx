import React, { useState } from "react";
import {
  Zap, Smartphone, Sparkles, CheckCircle2, Clock, Calendar,
  CreditCard, ShieldCheck, UserCheck, MessageSquare, ArrowRight,
  BellRing, RefreshCw, Send, Lock
} from "lucide-react";
import confetti from "canvas-confetti";

interface OneClickBookDemoProps {
  onOpenEntry: () => void;
}

export const OneClickBookDemo: React.FC<OneClickBookDemoProps> = ({ onOpenEntry }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("concierge");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"client-app" | "ai-copilot">("client-app");
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: "ai" | "user"; text: string; time: string }>>([
    {
      role: "ai",
      text: "Marhaba! I am the automated AI Copilot built for this UAE app. I handle 24/7 client booking, answer pricing in 12 languages, and route confirmed VIP leads. How can I assist your Dubai booking today?",
      time: "Just now",
    },
  ]);
  const [userChatInput, setUserChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const industryPresets = {
    concierge: {
      name: "Dubai VIP Concierge & Chauffeur",
      service: "Private Chauffeur & Luxury Marina Yacht Experience",
      priceGBP: 525,
      duration: "4 Hours VIP Experience",
      location: "Dubai Marina & Palm Jumeirah",
      avatar: "🛥️",
    },
    advisory: {
      name: "Global Executive Strategy Advisory",
      service: "1-on-1 Dubai Market Expansion & Licensing Masterclass",
      priceGBP: 395,
      duration: "60 Min Private Session",
      location: "DIFC Gate Tower / Remote Video",
      avatar: "👔",
    },
    realestate: {
      name: "Emirates Ultra-Prime Estates",
      service: "Private Helicopter & Villa Tour (Downtown & Emirates Hills)",
      priceGBP: 815,
      duration: "Full Day VIP Inspection",
      location: "Dubai Heliport / Luxury Villa Site",
      avatar: "🏰",
    },
  };

  const currentPreset = industryPresets[selectedIndustry as keyof typeof industryPresets];

  const handleOneClickBooking = () => {
    setIsBooking(true);
    setTimeout(() => {
      setIsBooking(false);
      setBookingSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#d4af37", "#10b981", "#3b82f6"],
      });
    }, 900);
  };

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatInput.trim()) return;

    const newMsg = {
      role: "user" as const,
      text: userChatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAiChatMessages((prev) => [...prev, newMsg]);
    const query = userChatInput;
    setUserChatInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = "Your request has been analyzed by the UAE AI Engine! We have reserved your priority slot and synced your booking with Dubai real-time availability.";
      const lower = query.toLowerCase();
      if (lower.includes("price") || lower.includes("cost") || lower.includes("how much")) {
        reply = `Pricing for this service is £${currentPreset.priceGBP} GBP. With the One-Click feature, your client can pay instantly with Apple Pay or credit card with 0% payment drop-off!`;
      } else if (lower.includes("visa") || lower.includes("license") || lower.includes("tax")) {
        reply = "In the UAE, business profits benefit from zero personal tax, and this app uses transparent GBP pricing for every booking.";
      } else if (lower.includes("one click") || lower.includes("book") || lower.includes("how it works")) {
        reply = "The One-Click Book feature bypasses 5 tedious registration steps. With biometric FaceID or 1-tap Apple Pay, clients confirm appointments in under 2.4 seconds!";
      }

      setAiChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsAiTyping(false);
    }, 1100);
  };

  return (
    <section id="one-click-demo" className="py-24 relative">
      {/* Decorative ambient radial glow */}
      <div className="absolute top-1/3 right-10 w-[600px] h-[400px] bg-[#1E40AF]/15 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Exclusive Tech Prize Feature</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
            One-Click Book & <span className="font-bold text-[#D4AF37]">AI Assistant Demo</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
            Test the exact proprietary software modules that will be custom-built for the winner&apos;s iOS, Android, and Web platforms.
          </p>
        </div>

        {/* Industry Switcher & Mode Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs uppercase tracking-wider text-white/40 font-medium px-2 shrink-0">Prototype Preset:</span>
            <button
              onClick={() => { setSelectedIndustry("concierge"); setBookingSuccess(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                selectedIndustry === "concierge"
                  ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] font-bold"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              🛥️ Luxury Concierge
            </button>
            <button
              onClick={() => { setSelectedIndustry("advisory"); setBookingSuccess(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                selectedIndustry === "advisory"
                  ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] font-bold"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              👔 Executive Advisory
            </button>
            <button
              onClick={() => { setSelectedIndustry("realestate"); setBookingSuccess(false); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                selectedIndustry === "realestate"
                  ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] font-bold"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              🏰 Prime Real Estate
            </button>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab("client-app")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "client-app" ? "bg-[#D4AF37] text-black" : "text-white/50 hover:text-white"
              }`}
            >
              ⚡ One-Click UI
            </button>
            <button
              onClick={() => setActiveTab("ai-copilot")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "ai-copilot" ? "bg-indigo-600 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              🧠 AI Smart Copilot
            </button>
          </div>
        </div>

        {/* Interactive Device Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info explaining the features */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-sm">1</span>
                <h3 className="text-base font-bold uppercase tracking-wider text-white">Why One-Click Booking Wins</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Traditional booking forms lose 68% of customers during multi-step checkout. Your custom app comes equipped with instant 1-touch Apple Pay/Google Pay reservation, eliminating all friction and skyrocketing conversion rates.
              </p>
              <ul className="space-y-2.5 text-xs text-white/70">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant biometric confirmation (FaceID / Fingerprint)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated calendar sync & WhatsApp confirmation alert</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>GBP payment rails</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">2</span>
                <h3 className="text-base font-bold uppercase tracking-wider text-white">Autonomous AI Client Copilot</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Never miss an international lead across any timezone. The built-in AI concierge qualifies high-ticket clients, answers complex questions, and closes bookings 24/7.
              </p>
            </div>

            <button
              onClick={onOpenEntry}
              className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black text-xs font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 transition-all"
            >
              <span>Enter Competition To Win This App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Live Interactive Smartphone Shell */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md rounded-[40px] bg-black p-4 shadow-2xl shadow-black/80 border-2 border-white/15 relative backdrop-blur-2xl">
              {/* Phone Speaker & Dynamic Island */}
              <div className="w-28 h-5 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-black"></div>
              </div>

              {/* Screen Content Container */}
              <div className="rounded-[28px] bg-neutral-950 overflow-hidden border border-white/10 min-h-[480px] flex flex-col justify-between p-4">
                {activeTab === "client-app" ? (
                  /* --- 1-Click Booking View --- */
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* App Mock Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{currentPreset.avatar}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{currentPreset.name}</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Instant Available
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                          Dubai Verified
                        </span>
                      </div>

                      {/* Selected Experience Card */}
                      <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-[#D4AF37] tracking-widest">VIP Experience</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{currentPreset.service}</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
                          <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{currentPreset.duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-lg">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Today (Instant)</span>
                          </div>
                        </div>

                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-xs text-white/40 uppercase tracking-wider">Total:</span>
                          <div className="text-right">
                            <span className="text-base font-bold text-white">£{currentPreset.priceGBP.toLocaleString()} GBP</span>
                          </div>
                        </div>
                      </div>

                      {/* Status / Success Banner */}
                      {bookingSuccess && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs space-y-1 animate-fade-in">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              Booking Confirmed in 0.8s!
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400">#DXB-8839</span>
                          </div>
                          <p className="text-[10px] text-emerald-400/80">
                            Calendar invite & instant VIP WhatsApp concierge alert dispatched.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* One Click Action Button */}
                    <div className="pt-4 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-white/40">
                        <Lock className="w-3 h-3 text-[#D4AF37]" />
                        <span>Biometric 1-Touch Apple Pay & Google Pay</span>
                      </div>

                      <button
                        id="one-click-book-trigger-btn"
                        onClick={handleOneClickBooking}
                        disabled={isBooking}
                        className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2.5 ${
                          isBooking
                            ? "bg-white/10 text-white/40 cursor-not-allowed"
                            : bookingSuccess
                            ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25"
                            : "bg-[#D4AF37] hover:bg-[#e6c352] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transform hover:scale-[1.02] active:scale-95"
                        }`}
                      >
                        {isBooking ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                            <span>Processing One-Click Token...</span>
                          </>
                        ) : bookingSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Booked! Tap to Book Another</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-black" />
                            <span>ONE-CLICK BOOK NOW</span>
                          </>
                        )}
                      </button>

                      <p className="text-[9px] uppercase tracking-wider text-center text-white/30">
                        Simulated live test of proprietary checkout module
                      </p>
                    </div>
                  </div>
                ) : (
                  /* --- AI Copilot Chat View --- */
                  <div className="flex-1 flex flex-col justify-between h-[440px]">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                          AI
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">UAE Business Copilot</p>
                          <p className="text-[10px] text-emerald-400">Online &middot; Active in App</p>
                        </div>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">Gemini Powered</span>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
                      {aiChatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-[#D4AF37] text-black font-semibold rounded-tr-none"
                                : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-white/30 px-1 mt-0.5">{msg.time}</span>
                        </div>
                      ))}
                      {isAiTyping && (
                        <div className="flex items-center gap-1.5 p-2 bg-white/5 border border-white/10 rounded-xl max-w-[100px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce delay-100"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce delay-200"></span>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendAiMessage} className="pt-2 border-t border-white/10 flex gap-2">
                      <input
                        type="text"
                        value={userChatInput}
                        onChange={(e) => setUserChatInput(e.target.value)}
                        placeholder="Ask AI: 'How much is it?' or 'How does booking work?'"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="submit"
                        className="p-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black transition-all shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
