import React from "react";
import { Crown, Gamepad2, Heart, Home, Menu, Trophy, UserRound } from "lucide-react";

const primaryItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/draws", label: "Draws", icon: Trophy },
  { href: "/challenge", label: "Games", icon: Gamepad2 },
  { href: "/portal", label: "Portal", icon: UserRound },
];
const moreItems = [
  { href: "/poker", label: "Poker", icon: Crown },
  { href: "/arcade", label: "Arcade", icon: Gamepad2 },
  { href: "/community", label: "Community", icon: Heart },
];

export const MobileDock: React.FC = () => {
  const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const buttonClass = (href: string) => `grid min-h-11 min-w-[3.9rem] place-items-center gap-0.5 rounded-xl px-2 text-[9px] font-black uppercase tracking-tight transition ${window.location.pathname === href ? "bg-amber-300 text-black" : "text-white/65 hover:bg-white/10 hover:text-white"}`;
  return <nav aria-label="Quick navigation" className="fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-white/15 bg-[#090b16]/95 p-1.5 shadow-2xl backdrop-blur-xl"><div className="mx-auto flex items-center justify-center gap-1">{primaryItems.map(({ href, label, icon: Icon }) => <button key={href} onClick={() => navigate(href)} className={buttonClass(href)}><Icon className="h-4 w-4" /><span>{label}</span></button>)}<details className="group relative"><summary aria-label="More pages" className="grid min-h-11 min-w-[3.9rem] list-none cursor-pointer place-items-center gap-0.5 rounded-xl px-2 text-[9px] font-black uppercase tracking-tight text-white/65 hover:bg-white/10 hover:text-white marker:content-none"><Menu className="h-4 w-4" /><span>More</span></summary><div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border border-white/15 bg-[#090b16] p-1.5 shadow-2xl">{moreItems.map(({ href, label, icon: Icon }) => <button key={href} onClick={() => navigate(href)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-white/75 hover:bg-white/10 hover:text-white"><Icon className="h-4 w-4" />{label}</button>)}</div></details></div></nav>;
};
