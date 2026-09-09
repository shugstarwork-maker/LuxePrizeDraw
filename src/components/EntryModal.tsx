import React, { useState } from "react";
import {
  X, Sparkles, CheckCircle2, Ticket, ShieldCheck,
  ArrowRight, Download, Share2, Copy, Trophy, Globe, RefreshCw,
  Heart, Zap, Star, CreditCard, Lock, Check
} from "lucide-react";
import confetti from "canvas-confetti";
import { triggerGoldConfetti } from "../utils/confetti";
import { CompetitionTicket, SubscriptionPlan, TicketBundle } from "../types";
import { SUBSCRIPTION_PLANS, TICKET_BUNDLES } from "../data/prizeDetails";

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdea?: string;
  initialIndustry?: string;
  onTicketGenerated: (ticket: CompetitionTicket) => void;
}

type EntryMode = "subscription" | "bundle" | "free";

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  initialIdea = "",
  initialIndustry = "Tech & Innovation",
  onTicketGenerated,
}) => {
  const [entryMode, setEntryMode] = useState<EntryMode>("bundle");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [selectedBundle, setSelectedBundle] = useState<TicketBundle>(TICKET_BUNDLES[0]);
  const [selectedCategory, setSelectedCategory] = useState<TicketBundle["category"]>("Cash Challenges");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [phone, setPhone] = useState("");
  const [businessIdea, setBusinessIdea] = useState(initialIdea);
  const [targetIndustry, setTargetIndustry] = useState(initialIndustry);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<CompetitionTicket | null>(null);
  const [generatedBatchCount, setGeneratedBatchCount] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  // Compute total tickets & charity allocation for currently selected tier
  let ticketsToMint = 1;
  let currentPrice = 0;
  let charityDonation = 0;

  if (entryMode === "subscription") {
    ticketsToMint = selectedPlan.recurringTicketsPerMonth;
    currentPrice = selectedPlan.priceGBP;
    charityDonation = selectedPlan.charityDonationGBP;
  } else if (entryMode === "bundle") {
    ticketsToMint = selectedBundle.tickets;
    currentPrice = selectedBundle.priceGBP;
    charityDonation = selectedBundle.charityDonationGBP;
  } else {
    ticketsToMint = 1;
    currentPrice = 0;
    charityDonation = 0;
  }

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg("Please provide your name and email address.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/competition/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          country,
          phone,
          businessIdea,
          targetIndustry,
          entryType: entryMode === "subscription" ? "SUBSCRIBER_VIP" : (entryMode === "bundle" ? "POWER_BUNDLE" : "FREE"),
          planId: entryMode === "subscription" ? selectedPlan.id : (entryMode === "bundle" ? selectedBundle.id : "free"),
          ticketsCount: ticketsToMint,
          charityAmount: charityDonation,
          demo: true,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to register entry.");
      }

      const data = await res.json();
      const ticket: CompetitionTicket = {
        ticketId: data.ticketId,
        fullName: data.fullName,
        email: data.email,
        country: data.country,
        phone: data.phone,
        businessIdea: data.businessIdea,
        targetIndustry: data.targetIndustry,
        entryTimestamp: data.entryTimestamp,
        ticketStatus: "PREVIEW_ONLY",
        drawDate: data.drawDate,
        bonusEntriesAwarded: ticketsToMint > 1 ? ticketsToMint - 1 : 1,
        totalTickets: ticketsToMint,
      };

      setGeneratedTicket(ticket);
      setGeneratedBatchCount(ticketsToMint);
      onTicketGenerated(ticket);

      // Trigger grand celebratory confetti explosion
      triggerGoldConfetti();
    } catch (err: any) {
      console.error(err);
      // Fallback ticket creation
      const fallbackTicket: CompetitionTicket = {
        ticketId: `UAE-${Math.floor(100000 + Math.random() * 900000)}-${country.slice(0, 3).toUpperCase()}`,
        fullName,
        email,
        country,
        phone,
        businessIdea,
        targetIndustry,
        entryTimestamp: new Date().toISOString(),
        ticketStatus: "PREVIEW_ONLY",
        drawDate: "October 31, 2026 at 18:00 GST",
        bonusEntriesAwarded: ticketsToMint > 1 ? ticketsToMint - 1 : 1,
        totalTickets: ticketsToMint,
      };
      setGeneratedTicket(fallbackTicket);
      setGeneratedBatchCount(ticketsToMint);
      onTicketGenerated(fallbackTicket);
      triggerGoldConfetti();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReferral = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/draw?ref=${generatedTicket?.ticketId || "UAE-7729"}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 rounded-3xl border border-white/15 shadow-2xl shadow-black/95 overflow-hidden my-6 backdrop-blur-2xl">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {!generatedTicket ? (
          /* --- ENTRY REGISTRATION & SUBSCRIPTION FORM --- */
          <div className="p-5 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold">
                  <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>GBP Demo Prize Categories</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] uppercase tracking-widest font-bold">
                  <Heart className="w-3 h-3 fill-rose-400/40" />
                  <span>Community causes: prototype</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                Explore <span className="font-bold text-[#D4AF37]">Demo Prize Categories</span>
              </h3>
              <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                This preview uses smaller, GBP-only demo prize categories and illustrative entry amounts. No payment is processed and no prize can be claimed.
              </p>
            </div>

            {/* Entry Mode Switcher Tabs */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-white/5 border border-white/10 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setEntryMode("subscription")}
                className={`py-2.5 px-2 rounded-xl font-bold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                  entryMode === "subscription"
                    ? "bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Demo Memberships</span>
                <span className="text-[9px] px-1 rounded bg-black/20 text-black font-extrabold hidden sm:inline">Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setEntryMode("bundle")}
                className={`py-2.5 px-2 rounded-xl font-bold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                  entryMode === "bundle"
                    ? "bg-white text-black shadow-lg"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Demo Categories</span>
              </button>

              <button
                type="button"
                onClick={() => setEntryMode("free")}
                className={`py-2.5 px-2 rounded-xl font-bold uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                  entryMode === "free"
                    ? "bg-white/20 text-white border border-white/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Free Preview</span>
              </button>
            </div>

            {/* Tier / Plan Selector Cards */}
            {entryMode === "subscription" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Explore Demo Membership Options</span>
                  </span>
                  <span className="text-emerald-400 font-semibold text-[11px]">Illustrative only</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                          isSelected
                            ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                            : "bg-white/5 border-white/10 hover:border-white/30"
                        }`}
                      >
                        {plan.popular && (
                          <span className="interactive-badge absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#D4AF37] text-black font-extrabold text-[8px] uppercase tracking-widest">
                            {plan.badge}
                          </span>
                        )}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{plan.name}</span>
                          <span className="text-[10px] font-bold text-amber-400 font-mono">{plan.multiplier}</span>
                        </div>
                        <div className="text-lg font-extrabold text-white">
                          £{plan.priceGBP.toFixed(2)}
                          <span className="text-[10px] font-normal text-white/50"> demo</span>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                          {plan.recurringTicketsPerMonth} Demo entries
                        </p>
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-rose-300">
                          <span>Preview:</span>
                          <span className="font-bold">No payment taken</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {entryMode === "bundle" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2" role="tablist" aria-label="Demo prize categories">
                  {(["Cash Challenges", "Tech & Gaming", "Travel & Lifestyle", "Instant Wins"] as const).map((category) => (
                    <button key={category} type="button" onClick={() => { setSelectedCategory(category); const first = TICKET_BUNDLES.find((bundle) => bundle.category === category && bundle.priceGBP > 0); if (first) setSelectedBundle(first); }} className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${selectedCategory === category ? "bg-[#D4AF37] border-[#D4AF37] text-black" : "bg-white/5 border-white/10 text-white/60 hover:text-white"}`}>{category}</button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-white text-xs uppercase tracking-wider">{selectedCategory} demo options</span>
                  <span className="text-[10px] text-amber-300">Prototype only · no payment taken</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TICKET_BUNDLES.filter((bundle) => bundle.category === selectedCategory && bundle.priceGBP > 0).map((bundle) => {
                    const isSelected = selectedBundle.id === bundle.id;
                    return (
                      <button type="button" key={bundle.id} onClick={() => setSelectedBundle(bundle)} className={`p-3 rounded-2xl border transition-all text-left ${isSelected ? "bg-white/20 border-white shadow-lg" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                        <span className="text-[9px] uppercase font-bold text-[#D4AF37] block">{bundle.badge}</span>
                        <div className="text-base font-bold text-white mt-1">{bundle.name}</div>
                        <div className="mt-2 flex items-center justify-between"><span className="text-xs text-white/60">£{bundle.prizeValueGBP} demo prize</span><span className="text-sm font-bold text-emerald-400">£{bundle.priceGBP.toFixed(2)} demo</span></div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {entryMode === "free" && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Free Demo Entry (1 Preview Ticket)</span>
                  </span>
                  <p className="text-[11px] text-white/50">No payment or real entry is created in this preview.</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-white/10 text-white font-mono font-bold">£0.00</span>
              </div>
            )}

            {/* Charity Live Impact Callout Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-neutral-900 border border-rose-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-rose-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    Prototype notice
                  </p>
                  <p className="text-[11px] text-white/60">
<span>Prices, prizes, entries, and charity contributions are illustrative only until the app is reviewed and launched.</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-rose-400 shrink-0 hidden sm:inline">
                "DEMO ONLY"
              </span>
            </div>

            {/* Entry Form Fields */}
            <form onSubmit={handleSubmitEntry} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Henderson"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1">
                    Country of Residence
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>United Arab Emirates</option>
                    <option>Canada</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>Australia</option>
                    <option>Saudi Arabia</option>
                    <option>Singapore</option>
                    <option>India</option>
                    <option>South Africa</option>
                    <option>Other / International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1">
                    WhatsApp / Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900000"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/70 mb-1">
                  What type of prize challenge interests you?
                </label>
                <textarea
                  rows={2}
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="e.g. AI-powered luxury concierge, high-ticket consulting portal, or cross-border e-commerce brand..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="entry-submit-btn"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-[#e6c352] hover:to-amber-400 text-black font-bold text-xs sm:text-sm uppercase tracking-widest shadow-[0_10px_35px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>Creating demo preview...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>
                        {entryMode === "subscription"
                          ? `Preview membership (£${currentPrice.toFixed(2)} demo)`
                          : (entryMode === "bundle"
                              ? `Preview ${selectedBundle.name} (£${currentPrice.toFixed(2)} demo)`
                              : "Create free demo preview")}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40 pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Demo preview &middot; no payment processed</span>
                </span>
                <span className="text-rose-400/80">
                  "DEMO ONLY"
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* --- GOLDEN TICKET DIGITAL PASS --- */
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {generatedBatchCount > 1
                  ? `${generatedBatchCount} Demo Tickets Previewed`
                  : "Demo Ticket Preview Created"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-light text-white">
                Your <span className="font-bold text-[#D4AF37]">Demo Pass</span>
              </h3>
              <p className="text-xs text-white/50">This is a prototype preview only. No entry, payment, or prize claim has been created.</p>
            </div>

            {/* Luxurious Golden Ticket Pass */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-amber-600 to-yellow-800 text-black shadow-2xl relative overflow-hidden border border-[#D4AF37]">
              {/* Dubai Skyline Badge Overlay */}
              <div className="flex items-center justify-between pb-4 border-b border-black/20">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-black text-[#D4AF37] font-bold flex items-center justify-center text-sm shadow-md">
                    UAE
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-black/70">Prototype Challenge Preview</p>
                    <p className="text-xs font-bold tracking-wider text-black">DEMO PRIZE CATEGORY PASS</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[8px] uppercase font-bold text-black/70">Status</span>
                  <p className="text-xs font-bold text-black px-2 py-0.5 rounded-full bg-black/15 border border-black/30">
                    {generatedTicket.ticketStatus}
                  </p>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-black/70 uppercase tracking-wider">Ticket ID</p>
                  <p className="font-mono text-sm sm:text-base font-bold text-black tracking-wider">
                    {generatedTicket.ticketId}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-black/70 uppercase tracking-wider">Participant</p>
                  <p className="font-bold text-black truncate">{generatedTicket.fullName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-black/70 uppercase tracking-wider">Demo Entries</p>
                  <p className="font-bold text-black font-mono text-sm sm:text-base">{generatedBatchCount} Preview Tickets</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-black/70 uppercase tracking-wider">Prize Value</p>
                  <p className="font-bold text-black">Selected demo category</p>
                </div>
              </div>

              {/* Barcode & Holographic Strip */}
              <div className="pt-3 border-t border-black/20 flex items-center justify-between">
                <div className="font-mono text-[9px] tracking-widest text-black font-bold">
                  ||| | |||| || ||||| ||| |||| | ||| ||||| |||
                </div>
                <div className="text-[10px] font-bold text-black">
                  Non-redeemable preview
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3">
              <Heart className="w-5 h-5 text-indigo-300 shrink-0" />
              <p className="text-white/60 text-[11px]">This preview is for product design review only. No money, charity donation, entry, or prize entitlement is created.</p>
            </div>

            {/* Share to Get +3 Bonus Entries */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Multiply Your Odds (+3 Bonus Tickets)</p>
                <p className="text-[11px] text-white/50">Share your referral link with fellow founders to earn 3 bonus tickets per signup.</p>
              </div>
              <button
                onClick={handleCopyReferral}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Referral Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Close / Done CTA */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Return to Showcase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
