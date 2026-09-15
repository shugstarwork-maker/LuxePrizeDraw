import React from "react";
import { Heart, Mail, Ticket, Trophy, Users } from "lucide-react";

const boards = [
  { title: "Ticket activity", icon: Ticket, metric: "Awaiting verified entries", rows: ["Verified purchase entries", "Free-entry route", "Competition total"] },
  { title: "Winner records", icon: Trophy, metric: "Awaiting first settled draw", rows: ["Verified winner", "Prize fulfilment", "Draw audit"] },
  { title: "Community impact", icon: Heart, metric: "Awaiting reconciled donations", rows: ["Approved charity partner", "Donation reconciliation", "Published impact report"] },
  { title: "Postal-entry route", icon: Mail, metric: "Awaiting counsel-approved rules", rows: ["Postal instructions", "Received entries", "Equal-treatment review"] },
];

export const CommunityLeaderboards: React.FC = () => (
  <section id="community-records" className="border-y border-white/10 bg-[#0a0a0e] py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.22em] text-amber-200">Public records centre</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Rankings with evidence.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">These panels are deliberately empty until verified activity is recorded. They will not show estimates, simulated winners, or unverified charity totals.</p></div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100"><Users className="h-4 w-4" /> Pre-launch status</span>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{boards.map(({ title, icon: Icon, metric, rows }) => <article key={title} className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center gap-2 text-amber-200"><Icon className="h-4 w-4" /><h3 className="text-xs font-black uppercase tracking-wider">{title}</h3></div><p className="mt-5 text-sm font-black text-white">{metric}</p><ol className="mt-5 space-y-3">{rows.map((row, index) => <li key={row} className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs"><span className="text-white/55">{row}</span><span className="font-mono text-amber-200">—</span></li>)}</ol></article>)}</div>
    </div>
  </section>
);
