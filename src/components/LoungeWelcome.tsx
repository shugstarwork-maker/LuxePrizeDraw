// Cinematic welcome gate for each lounge — opens when you tap the lounge's UI button,
// with the lounge's own bottom tab bar (Play / League / Profile / Rewards).
import React from "react";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { LoungeTabBar, type LoungeTab } from "./LoungeTabBar";

const nav = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

export const LoungeWelcome: React.FC<{
  brand: string;
  tagline: string;
  art: string;
  icon: string;
  chipsLabel?: string;
  tab: LoungeTab;
  onTab: (tab: LoungeTab) => void;
  onEnter: () => void;
}> = ({ brand, tagline, art, icon, chipsLabel, tab, onTab, onEnter }) => (
  <section className="gate-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_55%)] px-6 pb-40 text-center text-white">
    <div className="cine-beam" />
    <div className="cine-dust"><span /><span /><span /><span /><span /><span /></div>
    <button type="button" onClick={() => nav("/")} className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-black"><ChevronLeft className="h-4 w-4" />Home</button>
    <div className="gate-page__crest cine-reveal grid h-24 w-24 place-items-center rounded-3xl border border-amber-200/50 bg-black/50 text-5xl shadow-[0_0_60px_rgba(246,201,69,.35)]">{icon}</div>
    <p className="mt-8 text-[10px] font-black uppercase tracking-[.3em] text-amber-200">Welcome to</p>
    <h1 className="cine-title mt-2 text-4xl font-black sm:text-5xl">{brand}</h1>
    <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">{tagline}</p>
    {chipsLabel && <p className="mt-4 rounded-full border border-amber-200/35 bg-amber-300/10 px-4 py-1.5 font-mono text-sm font-black text-amber-100">{chipsLabel}</p>}
    <div className="cine-letterbox cine-img cine-reveal cine-reveal-2 mt-8 w-full max-w-md overflow-hidden rounded-3xl border border-amber-200/25 shadow-2xl"><img src={art} alt="" className="w-full object-cover" /></div>
    <button type="button" onClick={onEnter} className="gate-page__enter cine-reveal cine-reveal-3 mt-8 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-14 py-4 text-base font-black uppercase tracking-[.2em] text-black shadow-[0_8px_40px_rgba(246,201,69,.45)] transition active:scale-95">Enter</button>
    <p className="mt-6 flex items-center gap-1.5 text-[10px] text-white/40"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />Free-play only · no deposits, no cash wagering, no cash-out</p>
    <LoungeTabBar tab={tab} onTab={onTab} />
  </section>
);
