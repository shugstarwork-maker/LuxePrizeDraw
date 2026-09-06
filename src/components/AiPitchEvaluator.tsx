import React, { useState } from "react";
import { Sparkles, Brain, CheckCircle2, TrendingUp, DollarSign, MapPin, Compass, ArrowRight, RefreshCw, Layers, Award, Lightbulb } from "lucide-react";
import { AiPitchEvaluation } from "../types";
import { triggerGoldConfetti } from "../utils/confetti";

interface AiPitchEvaluatorProps {
  onApplyIdeaToEntry: (idea: string, industry: string) => void;
}

export const AiPitchEvaluator: React.FC<AiPitchEvaluatorProps> = ({ onApplyIdeaToEntry }) => {
  const [businessIdea, setBusinessIdea] = useState("");
  const [industry, setIndustry] = useState("Technology & AI Services");
  const [targetMarket, setTargetMarket] = useState("UAE, GCC & Global");
  const [dreamFeatures, setDreamFeatures] = useState("One-Click Booking and AI Concierge");
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<AiPitchEvaluation | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const sampleIdeas = [
    "AI-powered luxury yacht & desert safari booking platform in Dubai with instant crypto & Apple Pay",
    "High-ticket B2B legal & tax consultancy portal with automated one-click corporate compliance audits",
    "Bespoke private wellness & longevity concierge delivering IV drips and bio-hacking directly to Dubai villas",
    "Next-gen cross-border invoice financing hub for GCC e-commerce brands with instant automated settlement",
  ];

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessIdea.trim()) {
      setErrorMsg("Please enter your business idea or click one of the quick suggestions below.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/pitch-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessIdea,
          industry,
          targetMarket,
          dreamFeatures,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate pitch");
      }

      const data = await response.json();
      setEvaluation(data);
      // Trigger celebratory confetti upon AI evaluation completion
      triggerGoldConfetti();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Unable to evaluate pitch with AI. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-evaluator" className="py-24 relative">
      {/* Decorative ambient radial light */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] bg-[#1E40AF]/15 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
            <Brain className="w-3.5 h-3.5" />
            <span>Powered by Gemini 2.5 AI & UAE Commercial Database</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
            AI UAE Business <span className="font-bold text-[#D4AF37]">Launch Evaluator</span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
            Test your venture idea before the draw. Get instant UAE market feasibility, free zone suggestions, 1-Click booking integration, and custom £100K budget allocation.
          </p>
        </div>

        {/* Input Form Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-6">
            <form onSubmit={handleEvaluate} className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">
                  Describe Your Business Idea or Concept
                </label>
                <textarea
                  rows={3}
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="e.g. A digital platform for luxury concierge services in Dubai with instant One-Click reservations and an AI business assistant for international VIP clients..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] transition-all"
                />
              </div>

              {/* Sample Ideas */}
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-white/50 flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Quick Inspiration:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBusinessIdea(idea)}
                      className="text-[10px] text-left px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-[#D4AF37]/50 transition-all"
                    >
                      {idea.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/60 mb-1.5">
                    Target Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option>Technology & AI Services</option>
                    <option>Luxury Concierge & Tourism</option>
                    <option>E-Commerce & High-Ticket Retail</option>
                    <option>FinTech & Digital Payments</option>
                    <option>Real Estate Advisory & PropTech</option>
                    <option>Consulting & Legal/Tax Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/60 mb-1.5">
                    Desired Tech Modules
                  </label>
                  <select
                    value={dreamFeatures}
                    onChange={(e) => setDreamFeatures(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option>One-Click Booking & AI Assistant</option>
                    <option>1-Tap VIP Concierge & WhatsApp Bot</option>
                    <option>Instant Multi-Currency Checkout</option>
                    <option>AI Lead Qualifier & Automated Scheduling</option>
                  </select>
                </div>
              </div>

              {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}

              <button
                type="submit"
                disabled={isLoading}
                id="ai-evaluate-submit-btn"
                className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black text-xs sm:text-sm font-bold uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Analyzing UAE Market with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Generate Instant Feasibility Report</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: AI Output or Placeholders */}
          <div className="lg:col-span-6">
            {evaluation ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-[#D4AF37]/40 shadow-2xl backdrop-blur-xl space-y-6 animate-fade-in">
                {/* Feasibility Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">AI Feasibility Score</span>
                    <p className="text-2xl font-bold text-white flex items-center gap-2">
                      <span>{evaluation.feasibilityScore}/100</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        High Growth
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Recommended Zone</span>
                    <p className="text-xs font-bold text-[#D4AF37]">{evaluation.recommendedFreezone}</p>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Strategic UAE Market Advantage</span>
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                    {evaluation.executiveSummary}
                  </p>
                </div>

                {/* Feature Customization Strategy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider flex items-center gap-1">
                      ⚡ One-Click Book Strategy
                    </p>
                    <p className="text-xs text-white/70 leading-normal">
                      {evaluation.appOneClickFeatureConcept}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                      🧠 AI Copilot Workflow
                    </p>
                    <p className="text-xs text-white/70 leading-normal">
                      {evaluation.aiCopilotIntegration}
                    </p>
                  </div>
                </div>

                {/* £100K Budget Allocation */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
                    <span>£100K Seed Grant Strategic Allocation</span>
                    <span className="text-emerald-400 font-mono text-[11px]">£100,000 Total</span>
                  </span>
                  <div className="space-y-1.5">
                    {evaluation.budgetAllocation100k.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-white">{item.category}</p>
                          <p className="text-[10px] text-white/40">{item.description}</p>
                        </div>
                        <span className="font-mono font-bold text-[#D4AF37] shrink-0">
                          £{(item.amountGBP || item.amountUSD).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Brand Names */}
                {evaluation.suggestedBrandNames && (
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-white/40 uppercase tracking-wider text-[10px] font-medium">Proposed Brand Names:</span>
                    <div className="flex gap-1.5">
                      {evaluation.suggestedBrandNames.map((name, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] font-semibold border border-[#D4AF37]/30 text-[11px]">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct CTA: Apply Idea to Entry */}
                <button
                  id="apply-idea-to-entry-btn"
                  onClick={() => onApplyIdeaToEntry(businessIdea, industry)}
                  className="w-full py-4 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Lock in This Idea & Claim Free Tickets (+3 Bonus Entries)</span>
                </button>
              </div>
            ) : (
              <div className="h-full min-h-[420px] p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37]">
                  <Brain className="w-7 h-7" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Enter Your Concept On The Left</h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Our AI Advisor will generate a complete UAE commercial blueprint including Free Zone licensing recommendations, 1-Click booking customization, and optimal £100K seed money distribution.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evaluates in under 2 seconds</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
