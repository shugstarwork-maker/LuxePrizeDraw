import React, { useState } from "react";
import { BadgeCheck, MailSearch, Ticket } from "lucide-react";

type LookupResult = {
  email: string;
  account: { status: string; since: string } | null;
  tickets: { drawName: string; issuedAt: string; redeemed: boolean; ticketId: string | null }[];
  entries: { id: string; route: string; status: string; created_at: string; draw_title: string; draw_id: string }[];
  drawCount: number;
};

export function EntrantLookup() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setNotice(""); setResult(null);
    try {
      const res = await fetch(`/api/portal/lookup?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed.");
      setResult(data);
      if (!data.tickets.length && !data.entries.length) setNotice("No tickets or entries found for that email yet.");
    } catch (err) { setNotice(err instanceof Error ? err.message : "Lookup failed."); }
    finally { setLoading(false); }
  };

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Entrant records</p>
          <h2 className="mt-2 text-2xl font-black">Find your tickets &amp; entries</h2>
        </div>
        <MailSearch className="h-7 w-7 text-amber-200" />
      </div>
      <form onSubmit={lookup} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="The email you entered with"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-amber-300" />
        <button disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-black disabled:opacity-50">
          {loading ? "Searching" : "Look up"}
        </button>
      </form>
      {notice && <p aria-live="polite" className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">{notice}</p>}
      {result && (
        <div className="mt-5 space-y-3">
          {result.account && <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-xs text-emerald-200"><BadgeCheck className="mr-1 inline h-3.5 w-3.5" /> Verified account · status {result.account.status}</p>}
          {result.tickets.map((t, i) => (
            <div key={`t${i}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs">
              <span className="flex items-center gap-2"><Ticket className="h-4 w-4 text-amber-200" /><b>{t.drawName}</b></span>
              <span className="text-right text-white/55">{t.redeemed ? <>Redeemed · <span className="font-mono text-emerald-300">{t.ticketId}</span></> : "Issued — awaiting redemption"}</span>
            </div>
          ))}
          {result.entries.map((en) => (
            <div key={en.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs">
              <span className="flex items-center gap-2"><Ticket className="h-4 w-4 text-cyan-200" /><b>{en.draw_title}</b></span>
              <span className="text-right text-white/55">{en.route} entry · <span className={en.status === "WINNER" ? "font-black text-amber-200" : "text-emerald-300"}>{en.status}</span></span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
