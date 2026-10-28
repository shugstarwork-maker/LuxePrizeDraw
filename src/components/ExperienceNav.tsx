import React from "react";
import { BadgeCheck, Crown, Gamepad2, Heart, Home, Menu, Sparkles, Trophy } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";

type Link = { href: string; label: string; icon: React.ElementType };
const primaryLinks: Link[] = [
  { href: "/", label: "Discover", icon: Home },
  { href: "/draws", label: "Prize Draws", icon: Trophy },
  { href: "/arcade", label: "Arcade", icon: Gamepad2 },
  { href: "/poker", label: "Poker", icon: Crown },
  { href: "/serenity", label: "Serenity", icon: Heart },
];
const moreLinks: Link[] = [
  { href: "/prizes/luxury-supercar-experience", label: "Partnerships", icon: Sparkles },
  { href: "/credentials", label: "Credentials", icon: BadgeCheck },
];

const navigate = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const ExperienceNav: React.FC = () => {
  const { play } = useAudio();
  const visit = (href: string) => { play("button"); navigate(href); };
  return <nav className="sticky top-0 z-50 border-b border-amber-200/15 bg-[#080705]/90 px-4 py-2.5 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><button onClick={() => visit("/")} className="inline-flex shrink-0 items-center gap-2 font-black text-white"><span className="logo-pound-spin grid h-8 w-8 place-items-center rounded-lg border border-amber-300/70 bg-black text-lg text-amber-300" aria-hidden="true">£</span><span className="hidden sm:inline">LuxePrizeDraw Ltd</span><span className="sr-only">LuxePrizeDraw Ltd</span></button><div className="flex items-center gap-1.5">{primaryLinks.map(({ href, label, icon: Icon }) => <button key={href} onClick={() => visit(href)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/35 bg-black/35 px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100 transition hover:border-amber-200 hover:bg-amber-300 hover:text-black sm:px-3"><Icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{label}</span></button>)}<details className="group relative"><summary aria-label="More pages" className="flex list-none cursor-pointer items-center gap-1.5 rounded-lg border border-amber-200/25 bg-amber-300/10 px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100 marker:content-none sm:px-3"><Menu className="h-3.5 w-3.5" /><span className="hidden sm:inline">More</span></summary><div className="absolute right-0 mt-2 w-48 rounded-xl border border-amber-200/20 bg-[#100d08] p-1.5 shadow-2xl">{moreLinks.map(({ href, label, icon: Icon }) => <button key={href} onClick={() => visit(href)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-amber-100 hover:bg-amber-300 hover:text-black"><Icon className="h-4 w-4" />{label}</button>)}<button onClick={() => visit("/welcome")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-amber-100 hover:bg-amber-300 hover:text-black"><Sparkles className="h-4 w-4" />Welcome</button></div></details></div></div></nav>;
};
