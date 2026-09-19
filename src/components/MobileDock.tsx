import React from "react";
import { FileText, Heart, HandHeart, Home, Trophy, UserRound, Video, Crown } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/draws", label: "Draws", icon: Trophy },
  { href: "/arcade", label: "Arcade", icon: Trophy },
  { href: "/poker", label: "Poker", icon: Crown },
  { href: "/portal", label: "Portal", icon: UserRound },
  { href: "/community", label: "Community", icon: Heart },
  { href: "/serenity", label: "Serenity", icon: HandHeart },
  { href: "/cash-giveaways", label: "Giveaways", icon: Video },
  { href: "/terms", label: "Terms", icon: FileText },
];

export const MobileDock: React.FC = () => {
  const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <nav aria-label="Quick navigation" className="fixed inset-x-3 bottom-3 z-[60] overflow-x-auto rounded-2xl border border-white/15 bg-[#090b16]/95 p-2 shadow-2xl backdrop-blur-xl"><div className="mx-auto flex min-w-max items-center justify-center gap-1">{items.map(({ href, label, icon: Icon }) => <button key={href} onClick={() => navigate(href)} className={`grid min-h-12 min-w-[4.5rem] place-items-center gap-0.5 rounded-xl px-2 text-[9px] font-black uppercase tracking-tight transition ${window.location.pathname === href ? "bg-amber-300 text-black" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon className="h-4 w-4" /><span>{label}</span></button>)}</div></nav>;
};
