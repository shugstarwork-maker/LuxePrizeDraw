import React from "react";
import { Gamepad2, Gem, Heart, Home, Sparkles, Swords, Trophy } from "lucide-react";

type Link = { href: string; label: string; icon: React.ElementType };
const links: Link[] = [
  { href: "/", label: "Discover", icon: Home },
  { href: "/draws", label: "Prize draws", icon: Trophy },
  { href: "/custom-draw", label: "Custom Draw", icon: Gem },
  { href: "/community", label: "Community", icon: Heart },
  { href: "/serenity", label: "Serenity", icon: Heart },
  { href: "/play", label: "Play", icon: Gamepad2 },
  { href: "/duel", label: "1v1 Duel", icon: Swords },
  { href: "/lobby", label: "Game Lobby", icon: Sparkles },
];

const navigate = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const ExperienceNav: React.FC = () => (
  <nav className="sticky top-0 z-50 border-b border-amber-200/15 bg-[#080705]/90 px-4 py-3 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
      <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 font-black text-white"><span className="grid h-9 w-9 place-items-center rounded-lg border border-amber-300/70 bg-black/80"><img src="/luxe-l-mark.svg" alt="" aria-hidden="true" className="h-8 w-8" /></span><span className="sr-only">Luxe Prize Draws</span><span className="hidden sm:inline">LUXE PRIZE DRAWS</span></button>
      <div className="flex items-center gap-1">{links.map(({ href, label, icon: Icon }) => <button key={href} onClick={() => navigate(href)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-white/65 transition hover:bg-white/10 hover:text-amber-100 sm:px-3"><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
      <button onClick={() => navigate("/welcome")} className="hidden items-center gap-1.5 rounded-lg border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100 sm:inline-flex"><Sparkles className="h-3.5 w-3.5" /> Welcome</button>
    </div>
  </nav>
);
