import React from "react";
import { Crown, Flower2, Home, Trophy, UserRound } from "lucide-react";
import { CASINO_PATHS } from "./CasinoPage";

const primaryItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/draws", label: "Draws", icon: Trophy },
  { href: "/casino", label: "Casino", icon: Crown },
  { href: "/serenity", label: "Serenity", icon: Flower2 },
  { href: "/portal", label: "Portal", icon: UserRound },
];

export const MobileDock: React.FC = () => {
  const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const buttonClass = (href: string) => `grid min-h-11 min-w-0 flex-1 place-items-center gap-0.5 rounded-xl px-1 text-[8.5px] font-black uppercase tracking-tight transition ${window.location.pathname === href || (href === "/casino" && CASINO_PATHS.includes(window.location.pathname)) ? "bg-amber-300 text-black" : "text-white/65 hover:bg-white/10 hover:text-white"}`;
  return <nav aria-label="Quick navigation" className="fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-white/15 bg-[#090b16]/95 p-1.5 shadow-2xl backdrop-blur-xl"><div className="mx-auto flex items-center justify-center gap-0.5">{primaryItems.map(({ href, label, icon: Icon }) => <button key={href} onClick={() => navigate(href)} className={buttonClass(href)}><Icon className="h-4 w-4" /><span className="truncate">{label}</span></button>)}</div></nav>;
};
