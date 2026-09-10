/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { CompetitionHub } from "./components/CompetitionHub";
import { FreeDraws } from "./components/FreeDraws";
import { AdminTickets } from "./components/AdminTickets";
import { ComplianceDashboard } from "./components/ComplianceDashboard";
import { WelcomePage } from "./components/WelcomePage";
import { PrizeShowcase } from "./components/PrizeShowcase";
import { CharityImpactSection } from "./components/CharityImpactSection";
import { OneClickBookDemo } from "./components/OneClickBookDemo";
import { GamesArena } from "./components/GamesArena";
import { PredictionMarket } from "./components/PredictionMarket";
import { LuxePokerLeague } from "./components/LuxePokerLeague";
import { AiPitchEvaluator } from "./components/AiPitchEvaluator";
import { PackageCustomizer } from "./components/PackageCustomizer";
import { DrawVerificationSection } from "./components/DrawVerificationSection";
import { DubaiPhotoGallery } from "./components/DubaiPhotoGallery";
import { HallOfFameSection } from "./components/HallOfFameSection";
import { LiveDrawTracker } from "./components/LiveDrawTracker";
import { EntryModal } from "./components/EntryModal";
import { TicketWalletModal } from "./components/TicketWalletModal";
import { AiAdvisorDrawer } from "./components/AiAdvisorDrawer";
import { Footer } from "./components/Footer";
import { LuxeHost } from "./components/LuxeHost";
import { CompetitionTicket, CompetitionStats } from "./types";
import { Sparkles, Ticket, Heart } from "lucide-react";

export default function App() {
  const [tickets, setTickets] = useState<CompetitionTicket[]>(() => {
    try {
      const saved = localStorage.getItem("uae_competition_tickets");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    // Default starter ticket
    return [
      {
        ticketId: "UAE-782914-GLB",
        fullName: "VIP Founder Member",
        email: "founder@emirates-dream.io",
        country: "United Kingdom",
        businessIdea: "Luxury AI Concierge & Instant Booking Ecosystem",
        targetIndustry: "Tech & Innovation",
        entryTimestamp: new Date().toISOString(),
        ticketStatus: "GOLD_BONUS",
        drawDate: "October 31, 2026 at 18:00 GST",
        bonusEntriesAwarded: 1,
        totalTickets: 20,
      },
    ];
  });

  const [stats, setStats] = useState<CompetitionStats>({
    totalEntries: 42890,
    prizePoolValueGBP: 220000,
    cashPrizeGBP: 100000,
    visaYears: 3,
    recentEntrants: [
      { id: "UAE-7829-DXB", name: "Siddharth M.", country: "India", timestamp: "Just now", business: "FinTech Platform" },
      { id: "UAE-7830-LDN", name: "Elena Rostova", country: "United Kingdom", timestamp: "2 mins ago", business: "Luxury AI Concierge" },
      { id: "UAE-7831-SGP", name: "Marcus Tan", country: "Singapore", timestamp: "5 mins ago", business: "Logistics SaaS" },
      { id: "UAE-7832-DUB", name: "Amina Al-Mansoor", country: "Egypt", timestamp: "8 mins ago", business: "Green Packaging" },
    ],
    drawDate: "2026-10-31T18:00:00Z",
    totalCharityRaisedGBP: 34500,
    charityPercentage: 25,
    activeSubscribersCount: 1420,
  });

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const [prefilledIdea, setPrefilledIdea] = useState("");
  const [prefilledIndustry, setPrefilledIndustry] = useState("Tech & Innovation");

  // Sync tickets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("uae_competition_tickets", JSON.stringify(tickets));
    } catch (e) {
      console.error(e);
    }
  }, [tickets]);

  // Fetch live stats on mount
  useEffect(() => {
    fetch("/api/competition/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.totalEntries) {
          setStats(data);
        }
      })
      .catch((err) => console.log("Using local stats:", err));
  }, []);

  const handleTicketGenerated = (newTicket: CompetitionTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalEntries: prev.totalEntries + (newTicket.totalTickets || 1),
      totalCharityRaisedGBP: (prev.totalCharityRaisedGBP || 34500) + ((newTicket.totalTickets && newTicket.totalTickets > 1) ? 2.5 : 0),
      recentEntrants: [
        {
          id: newTicket.ticketId,
          name: newTicket.fullName.split(" ")[0] + " " + (newTicket.fullName.split(" ")[1] ? newTicket.fullName.split(" ")[1][0] + "." : ""),
          country: newTicket.country,
          timestamp: "Just now",
          business: newTicket.businessIdea ? newTicket.businessIdea.slice(0, 20) + "..." : "Luxe Prize Draw Venture",
        },
        ...prev.recentEntrants.slice(0, 5),
      ],
    }));
  };

  const handleApplyIdeaToEntry = (idea: string, industry: string) => {
    setPrefilledIdea(idea);
    setPrefilledIndustry(industry);
    setIsEntryModalOpen(true);
  };

  if (typeof window !== "undefined" && window.location.pathname === "/admin/tickets") {
    return <div className="min-h-screen bg-[#050505] text-white font-sans pt-10"><AdminTickets /></div>;
  }
  if (typeof window !== "undefined" && window.location.pathname === "/admin/compliance") {
    return <ComplianceDashboard />;
  }
  if (typeof window !== "undefined" && window.location.pathname === "/welcome") {
    return <WelcomePage />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D4AF37] selection:text-black relative overflow-x-hidden pt-7">
      {/* Immersive UI ambient radial glow backdrop */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none -z-10"
        style={{
          background: "radial-gradient(circle at 75% 20%, #D4AF37 0%, transparent 45%), radial-gradient(circle at 10% 75%, #1E40AF 0%, transparent 45%), radial-gradient(circle at 50% 120%, #6366F1 0%, transparent 40%)",
          filter: "blur(110px)"
        }}
      />

      {/* Top Navbar */}
      <Navbar
        onOpenEntry={() => {
          setPrefilledIdea("");
          setIsEntryModalOpen(true);
        }}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        ticketCount={tickets.reduce((acc, t) => acc + (t.totalTickets || 1), 0)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Sections */}
      <main>
        <HeroSection
          onOpenEntry={() => {
            setPrefilledIdea("");
            setIsEntryModalOpen(true);
          }}
          onExplorePrizes={() => {
            const el = document.getElementById("prizes");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          onTestOneClick={() => {
            const el = document.getElementById("one-click-demo");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          stats={stats}
        />

        <CompetitionHub />

        <FreeDraws />

        {/* 6 Prize Pillars Detailed Breakdown */}
        <PrizeShowcase
          onOpenEntry={() => setIsEntryModalOpen(true)}
          onTestOneClick={() => {
            const el = document.getElementById("one-click-demo");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* 25% Charity Contribution & Monthly Membership Subscriptions */}
        <CharityImpactSection
          onOpenEntry={() => setIsEntryModalOpen(true)}
        />

        {/* Special Feature #1: One-Click Book & AI Interactive Sandbox */}
        <OneClickBookDemo onOpenEntry={() => setIsEntryModalOpen(true)} />

        <PredictionMarket />

        {/* Demo-only 1v1 games and token challenges */}
        <GamesArena />

        <LuxePokerLeague />

        <LuxeHost />

        {/* Special Feature #2: AI Business Pitch & Feasibility Evaluator (Gemini 3.7) */}
        <AiPitchEvaluator onApplyIdeaToEntry={handleApplyIdeaToEntry} />

        {/* Interactive Prize Customizer / Simulator */}
        <PackageCustomizer onOpenEntry={() => setIsEntryModalOpen(true)} />

        {/* Verifiably Random & Auditable Drawing System (Provably Fair CSPRNG & Certified Physical Blower) */}
        <DrawVerificationSection
          userTickets={tickets}
          totalEntriesCount={stats.totalEntries}
          onOpenEntry={() => setIsEntryModalOpen(true)}
        />

        {/* Dubai Destination & Lifestyle Photo Gallery */}
        <DubaiPhotoGallery onOpenEntry={() => setIsEntryModalOpen(true)} />

        {/* £100K+ Hall of Fame for Verified Winners */}
        <HallOfFameSection onOpenEntry={() => setIsEntryModalOpen(true)} />

        {/* Live Draw Transparency & Countdown */}
        <LiveDrawTracker onOpenEntry={() => setIsEntryModalOpen(true)} />
      </main>

      {/* Floating Bottom Quick Action Trigger Bar */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          id="floating-ai-advisor-btn"
          onClick={() => setIsAiAdvisorOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-3 rounded-full bg-slate-950/90 hover:bg-slate-900 text-amber-300 font-bold text-xs border border-[#D4AF37]/50 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 animate-gold-pulse-ring"
          title="Open AI Business Advisor"
        >
          {/* Subtle ambient radiant glow pill behind the button */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#D4AF37]/30 via-amber-400/20 to-[#D4AF37]/30 blur-sm -z-10 animate-gold-shimmer" />

          {/* Golden AI Sparkle icon with subtle glow and rotate-on-hover */}
          <Sparkles className="w-4 h-4 text-[#D4AF37] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span className="hidden sm:inline bg-gradient-to-r from-amber-200 via-[#D4AF37] to-amber-400 bg-clip-text text-transparent font-extrabold tracking-wide">
            Ask AI Advisor
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
          </span>
        </button>

        <button
          id="floating-claim-ticket-btn"
          onClick={() => {
            setPrefilledIdea("");
            setIsEntryModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-amber-500 to-amber-600 hover:from-amber-300 text-black font-black text-xs shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <Ticket className="w-4 h-4" />
          <span>Claim Tickets & Subscribe</span>
        </button>
      </div>

      {/* Entry Modal */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        initialIdea={prefilledIdea}
        initialIndustry={prefilledIndustry}
        onTicketGenerated={handleTicketGenerated}
      />

      {/* Ticket Wallet Modal */}
      <TicketWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        tickets={tickets}
        onOpenNewEntry={() => {
          setIsWalletModalOpen(false);
          setPrefilledIdea("");
          setIsEntryModalOpen(true);
        }}
      />

      {/* AI Business Advisor Drawer */}
      <AiAdvisorDrawer
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        onOpenEntry={() => {
          setIsAiAdvisorOpen(false);
          setIsEntryModalOpen(true);
        }}
      />

      {/* Footer */}
      <Footer
        onOpenEntry={() => setIsEntryModalOpen(true)}
        onOpenWallet={() => setIsWalletModalOpen(true)}
      />
    </div>
  );
}
