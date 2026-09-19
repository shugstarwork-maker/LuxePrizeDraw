import React from "react";
import { FileText, Gamepad2, Gem, Heart, Home, Sparkles, Swords, Trophy, Video } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";

type Link = { href: string; label: string; icon: React.ElementType; tone: string };
const links: Link[] = [
  { href: "/", label: "Discover", icon: Home, tone: "border-sky-300/45 bg-sky-300/10 text-sky-100 hover:bg-sky-300 hover:text-slate-950" },
  { href: "/draws", label: "Prize draws", icon: Trophy, tone: "border-amber-200/50 bg-amber-300/10 text-amber-100 hover:bg-amber-300 hover:text-black" },
  { href: "/custom-draw", label: "Custom Draw", icon: Gem, tone: "border-violet-300/45 bg-violet-300/10 text-violet-100 hover:bg-violet-300 hover:text-slate-950" },
  { href: "/community", label: "Community", icon: Heart, tone: "border-rose-300/45 bg-rose-300/10 text-rose-100 hover:bg-rose-300 hover:text-slate-950" },
  { href: "/serenity", label: "Serenity", icon: Heart, tone: "border-emerald-300/45 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300 hover:text-slate-950" },
  { href: "/cash-giveaways", label: "Cash Giveaways", icon: Video, tone: "border-lime-300/45 bg-lime-300/10 text-lime-100 hover:bg-lime-300 hover:text-slate-950" },
  { href: "/terms", label: "Terms", icon: FileText, tone: "border-stone-300/40 bg-stone-300/10 text-stone-100 hover:bg-stone-200 hover:text-stone-950" },
  { href: "/play", label: "Play", icon: Gamepad2, tone: "border-fuchsia-300/45 bg-fuchsia-300/10 text-fuchsia-100 hover:bg-fuchsia-300 hover:text-slate-950" },
  { href: "/duel", label: "1v1 Duel", icon: Swords, tone: "border-red-300/45 bg-red-300/10 text-red-100 hover:bg-red-300 hover:text-slate-950" },
  { href: "/lobby", label: "Game Lobby", icon: Sparkles, tone: "border-cyan-300/45 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300 hover:text-slate-950" },
];

const navigate = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const ExperienceNav: React.FC = () => {
  const { play } = useAudio();
  return <nav className="sticky top-0 z-50 border-b border-amber-200/15 bg-[#080705]/90 px-4 py-3 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
      <button onClick={() => { play("button"); navigate("/"); }} className="inline-flex items-center gap-2 font-black text-white"><span className="logo-pound-spin grid h-9 w-9 place-items-center rounded-lg border border-amber-300/70 bg-black text-xl text-amber-300" aria-hidden="true">£</span><span className="sr-only">Luxe Prize Draws</span><span className="hidden sm:inline">LUXE PRIZE DRAWS</span></button>
      <div className="flex items-center gap-1.5">{links.map(({ href, label, icon: Icon, tone }) => <button key={href} onClick={() => { play("button"); navigate(href); }} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[10px] font-black uppercase tracking-wider shadow-[inset_0_0_12px_rgba(255,255,255,.06)] transition hover:-translate-y-0.5 hover:shadow-lg sm:px-3 ${tone}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
      <button onClick={() => { play("button"); navigate("/welcome"); }} className="hidden items-center gap-1.5 rounded-lg border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100 sm:inline-flex"><Sparkles className="h-3.5 w-3.5" /> Welcome</button>
    </div>
  </nav>;
};
