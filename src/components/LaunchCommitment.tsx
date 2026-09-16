import React from "react";
import { HeartHandshake, Landmark, Sprout } from "lucide-react";

const commitments = [
  { icon: Sprout, title: "As Scotland thrives, we thrive.", detail: "A Scotland-first ambition: direct verified community investment toward the needs that help people, places, and opportunity grow." },
  { icon: HeartHandshake, title: "Aim to become Scotland’s biggest national supporter.", detail: "A long-term commitment to back communities at scale—only through approved partners, transparent criteria, and reconciled public records." },
  { icon: Landmark, title: "One country. One Revnevotion Project Fund.", detail: "For every country we launch in, build a locally governed fund designed to support that nation’s priorities. One ticket at a time." },
];

export const LaunchCommitment: React.FC = () => (
  <section className="bg-gradient-to-br from-[#181105] via-[#0d0b10] to-[#08080c] py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">The Revnevotion vision</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Change the world.<br />One ticket at a time.</h2><p className="mt-4 text-sm leading-relaxed text-white/60">The vision is bold. Any fund, donation, partner, or impact total is published only after independent evidence and reconciliation.</p></div><div className="mt-8 grid gap-4 md:grid-cols-3">{commitments.map(({ icon: Icon, title, detail }) => <article key={title} className="rounded-3xl border border-amber-200/20 bg-black/25 p-6"><Icon className="h-7 w-7 text-amber-200" /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-relaxed text-white/60">{detail}</p></article>)}</div></div>
  </section>
);
