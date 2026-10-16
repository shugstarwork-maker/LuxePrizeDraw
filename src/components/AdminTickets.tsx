import React, { useState } from "react";
import { KeyRound, Send, ShieldCheck } from "lucide-react";

const draws = ["£100K Franchise Package", "Dream Sports Car Experience", "Dream Lads Holiday", "Ladies Shopping Holiday"];

export const AdminTickets: React.FC = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [drawName, setDrawName] = useState(draws[0]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const issueTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/free-draw-tickets", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify({ email, drawName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ticket could not be issued.");
      setNotice(`Issued ${drawName} ticket to ${data.email}. Redemption code: ${data.redemptionCode}`);
      setEmail("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ticket could not be issued.");
    } finally { setLoading(false); }
  };

  return <section id="admin-tickets" className="py-16 scroll-mt-28"><div className="max-w-xl mx-auto px-4"><div className="rounded-3xl border border-white/10 bg-black/45 p-6 sm:p-8"><div className="flex items-center gap-3"><div className="rounded-xl bg-[#D4AF37]/15 p-2.5"><ShieldCheck className="w-5 h-5 text-[#D4AF37]" /></div><div><h2 className="text-xl font-bold">Admin ticket issue</h2><p className="text-xs text-white/50">Issue a one-time Free Draw ticket to an email.</p></div></div><form onSubmit={issueTicket} className="mt-6 space-y-4"><label className="block text-xs font-bold text-white/70">Admin password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-white outline-none focus:border-[#D4AF37]" /></label><label className="block text-xs font-bold text-white/70">Entrant email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-white outline-none focus:border-[#D4AF37]" /></label><label className="block text-xs font-bold text-white/70">Free Draw<select value={drawName} onChange={(event) => setDrawName(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-neutral-900 px-3 py-3 text-white outline-none focus:border-[#D4AF37]">{draws.map((draw) => <option key={draw}>{draw}</option>)}</select></label><button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-wider text-black disabled:opacity-50"><Send className="w-4 h-4" />{loading ? "Issuing" : "Issue ticket"}</button></form>{notice && <p aria-live="polite" className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white/75"><KeyRound className="inline w-3.5 h-3.5 mr-1 text-[#D4AF37]" />{notice}</p>}</div></div></section>;
};
