import React from "react";
import { X, Ticket, Trophy, ShieldCheck, Sparkles, Plus, Copy, CheckCircle2, ArrowRight, Heart, Star, Zap } from "lucide-react";
import { CompetitionTicket } from "../types";

interface TicketWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: CompetitionTicket[];
  onOpenNewEntry: () => void;
}

export const TicketWalletModal: React.FC<TicketWalletModalProps> = ({
  isOpen,
  onClose,
  tickets,
  onOpenNewEntry,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const copyTicket = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalEntriesCount = tickets.reduce((acc, t) => acc + (t.totalTickets || 1), 0);
  const hasVipPass = tickets.some((t) => t.ticketStatus === "GOLD_BONUS");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-950 rounded-2xl border border-white/15 shadow-2xl shadow-black/90 p-6 sm:p-8 space-y-6 backdrop-blur-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-2xl font-light text-white">Your Official <span className="font-bold text-[#D4AF37]">Ticket Wallet</span></h3>
          </div>
          <p className="text-xs text-white/50 font-light">
            All active entries are verified and included in the October 31, 2026 Grand Draw.
          </p>
        </div>

        {/* Ticket Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Total Tickets</p>
            <p className="text-xl font-bold text-[#D4AF37] mt-0.5">{totalEntriesCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Club Status</p>
            <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${hasVipPass ? "text-amber-400" : "text-emerald-400"}`}>
              {hasVipPass ? "VIP Multiplier" : "Verified"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Charity Impact</p>
            <p className="text-xs font-bold text-rose-400 mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 fill-rose-400" />
              <span>25% Partner</span>
            </p>
          </div>
        </div>

        {/* Membership Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-white/5 to-rose-500/10 border border-[#D4AF37]/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Star className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Monthly Entry Club & Charity Support</p>
              <p className="text-[11px] text-white/60">
                {hasVipPass
                  ? "Your entries auto-rollover every month with 2x winning multiplier boost!"
                  : "Subscribe for £9.99/mo to get 20 recurring tickets/mo & donate £2.50 to charity."}
              </p>
            </div>
          </div>
          {!hasVipPass && (
            <button
              onClick={() => {
                onClose();
                onOpenNewEntry();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-bold text-[10px] uppercase tracking-wider shrink-0 hover:bg-[#e6c352]"
            >
              Join Club
            </button>
          )}
        </div>

        {/* Tickets List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {tickets.length > 0 ? (
            tickets.map((ticket, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white/5 border border-[#D4AF37]/30 flex items-center justify-between gap-3 backdrop-blur-xl"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#D4AF37]">{ticket.ticketId}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wider">
                      {ticket.totalTickets && ticket.totalTickets > 1 ? `${ticket.totalTickets} TICKETS` : "ACTIVE"}
                    </span>
                    {ticket.ticketStatus === "GOLD_BONUS" && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase tracking-wider">
                        VIP 2X
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white font-medium">{ticket.fullName}</p>
                  <p className="text-[10px] text-white/50 truncate max-w-xs">{ticket.businessIdea || "Luxe Prize Draw Entry"}</p>
                </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        const el = document.getElementById("draw-verification");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 border border-emerald-500/30 transition-all"
                      title="Verify SHA-256 and Merkle Proof"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>Audit</span>
                    </button>
                    <button
                      onClick={() => copyTicket(ticket.ticketId)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-all"
                    >
                      {copiedId === ticket.ticketId ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10 space-y-2">
              <Ticket className="w-8 h-8 text-white/30 mx-auto" />
              <p className="text-xs text-white font-medium">No active tickets yet</p>
              <p className="text-[11px] text-white/40">Claim your free official ticket or subscribe to the Monthly Club now.</p>
            </div>
          )}
        </div>

        {/* Claim Another Ticket / Subscribe Button */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenNewEntry();
            }}
            className="flex-1 py-4 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-bold text-xs uppercase tracking-widest shadow-[0_10px_30px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Monthly Passes or Extra Tickets</span>
          </button>
        </div>
      </div>
    </div>
  );
};
