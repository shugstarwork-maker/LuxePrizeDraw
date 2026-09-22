import React from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

export const AdminTickets: React.FC = () => {
  return <section id="admin-tickets" className="py-16 scroll-mt-28"><div className="max-w-xl mx-auto px-4"><div className="rounded-3xl border border-white/10 bg-black/45 p-6 sm:p-8"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#D4AF37]/15 p-2.5"><ShieldCheck className="w-5 h-5 text-[#D4AF37]" /></div><div><h2 className="text-xl font-bold">Admin ticket issue</h2><p className="text-xs text-white/50">Ticket issuance is restricted to authenticated server-side administration.</p></div></div><p className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/75"><KeyRound className="inline w-3.5 h-3.5 mr-1 text-[#D4AF37]" />Public client bundles do not expose admin credential entry or ticket-issuing controls. Use an authenticated internal workflow against the protected server endpoint instead.</p></div></div></section>;
};
