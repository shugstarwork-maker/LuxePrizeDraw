import React, { useEffect, useState } from "react";
import { Heart, Mail, RefreshCw, Ticket, Trophy, Users } from "lucide-react";

type TicketRow = { title: string; status: string; maximum_entries: number; entries: number };
type WinnerRow = { draw_id: string; title: string; eligible_entry_count: number; created_at: string; fulfilled_at: string | null };
type BoardData = {
  ticketBoard: TicketRow[];
  winners: WinnerRow[];
  impact: { charityRaisedGBP: number; scholarshipsFunded: number; microGrants: number };
  totalEntries: number;
};

export const CommunityLeaderboards: React.FC = () => {
  const [data, setData] = useState<BoardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/leaderboards")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Leaderboards unavailable"))))
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const ticketRows = data?.ticketBoard ?? [];
  const winnerRows = data?.winners ?? [];

  return (
    <section id="community-records" className="border-y border-white/10 bg-[#0a0a0e] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-amber-200">Public records centre</p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">Rankings with evidence.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
              Live from the draw database. Panels show only verified, recorded activity — never estimates or simulated winners.
            </p>
          </div>
          <button onClick={load} className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> {loading ? "Refreshing" : "Refresh"}
          </button>
        </div>
        {error && <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</p>}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
            <div className="flex items-center gap-2 text-amber-200"><Ticket className="h-4 w-4" /><h3 className="text-xs font-black uppercase tracking-wider">Ticket activity</h3></div>
            <p className="mt-5 text-sm font-black text-white">{data ? `${data.totalEntries.toLocaleString()} total entries` : "Loading…"}</p>
            <ol className="mt-5 space-y-3">
              {ticketRows.length === 0 && <li className="border-t border-white/10 pt-3 text-xs text-white/45">No draws recorded yet</li>}
              {ticketRows.map((r) => (
                <li key={r.title} className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
                  <span className="text-white/55">{r.title}</span>
                  <span className="font-mono text-amber-200">{r.entries}/{r.maximum_entries}</span>
                </li>
              ))}
            </ol>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
            <div className="flex items-center gap-2 text-amber-200"><Trophy className="h-4 w-4" /><h3 className="text-xs font-black uppercase tracking-wider">Winner records</h3></div>
            <p className="mt-5 text-sm font-black text-white">{winnerRows.length ? `${winnerRows.length} settled draw${winnerRows.length > 1 ? "s" : ""}` : "Awaiting first settled draw"}</p>
            <ol className="mt-5 space-y-3">
              {winnerRows.length === 0 && <li className="border-t border-white/10 pt-3 text-xs text-white/45">No settled draws yet</li>}
              {winnerRows.map((w) => (
                <li key={w.draw_id} className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
                  <span className="text-white/55">{w.title}</span>
                  <span className="font-mono text-emerald-300">{w.fulfilled_at ? "Fulfilled" : "Winner verified"}</span>
                </li>
              ))}
            </ol>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
            <div className="flex items-center gap-2 text-amber-200"><Heart className="h-4 w-4" /><h3 className="text-xs font-black uppercase tracking-wider">Community impact</h3></div>
            <p className="mt-5 text-sm font-black text-white">£{(data?.impact.charityRaisedGBP ?? 0).toLocaleString()} raised</p>
            <ol className="mt-5 space-y-3 text-xs">
              <li className="flex items-center justify-between gap-3 border-t border-white/10 pt-3"><span className="text-white/55">Scholarships funded</span><span className="font-mono text-amber-200">{data?.impact.scholarshipsFunded ?? "—"}</span></li>
              <li className="flex items-center justify-between gap-3 border-t border-white/10 pt-3"><span className="text-white/55">Micro-grants awarded</span><span className="font-mono text-amber-200">{data?.impact.microGrants ?? "—"}</span></li>
              <li className="flex items-center justify-between gap-3 border-t border-white/10 pt-3"><span className="text-white/55">Published impact report</span><span className="font-mono text-amber-200">Pending</span></li>
            </ol>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
            <div className="flex items-center gap-2 text-amber-200"><Mail className="h-4 w-4" /><h3 className="text-xs font-black uppercase tracking-wider">Postal-entry route</h3></div>
            <p className="mt-5 text-sm font-black text-white">Awaiting counsel-approved rules</p>
            <ol className="mt-5 space-y-3 text-xs">
              <li className="flex items-center justify-between gap-3 border-t border-white/10 pt-3"><span className="text-white/55">Postal instructions</span><span className="font-mono text-amber-200">Draft</span></li>
              <li className="flex items-center justify-between gap-3 border-t border-white/10 pt-3"><span className="text-white/55">Received entries</span><span className="font-mono text-amber-200">—</span></li>
              <li className="flex items-center justify-between gap-3 border-t border-white/10 pt-3"><span className="text-white/55">Equal-treatment review</span><span className="font-mono text-amber-200">—</span></li>
            </ol>
          </article>
        </div>
        <p className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/40"><Users className="h-3.5 w-3.5" /> Updated live from verified records</p>
      </div>
    </section>
  );
};
