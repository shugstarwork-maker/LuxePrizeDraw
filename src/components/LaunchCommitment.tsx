import React from "react";
import { BadgePoundSterling, HeartHandshake, ShieldCheck } from "lucide-react";

const commitments = [
  { icon: BadgePoundSterling, title: "Up to £500,000 prize target", detail: "Publication requires competition-specific prize funding evidence, approved rules, and the relevant jurisdiction approval." },
  { icon: ShieldCheck, title: "Safeguarding evidence before claims", detail: "The site will identify the approved safeguarding arrangement only once independently evidenced and recorded." },
  { icon: HeartHandshake, title: "Charity totals backed by reconciliation", detail: "Partner names and donation totals will appear only after written confirmation and reconciled records." },
];

export const LaunchCommitment: React.FC = () => (
  <section className="bg-gradient-to-br from-[#181105] via-[#0d0b10] to-[#08080c] py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Launch commitments</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Big ambition. Evidence before claims.</h2></div><div className="mt-8 grid gap-4 md:grid-cols-3">{commitments.map(({ icon: Icon, title, detail }) => <article key={title} className="rounded-3xl border border-amber-200/20 bg-black/25 p-6"><Icon className="h-7 w-7 text-amber-200" /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-relaxed text-white/60">{detail}</p></article>)}</div></div>
  </section>
);
