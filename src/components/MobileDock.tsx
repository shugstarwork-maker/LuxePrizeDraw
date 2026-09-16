import React from "react";
import { Gamepad2, Heart, Home, Swords, Trophy } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/draws", label: "Draws", icon: Trophy },
  { href: "/lobby", label: "Lobby", icon: Gamepad2 },
  { href: "/duel", label: "Duel", icon: Swords },
  { href: "/community", label: "Community", icon: Heart },
];

export const MobileDock: React.FC = () => {
  const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-[60] flex items-center justify-around rounded-2xl border border-white/15 bg-[#090b16]/95 px-1 py-2 shadow-2xl backdrop-blur-xl sm:hidden">{items.map(({ href, label, icon: Icon }) => <button key={href} onClick={() => navigate(href)} className={`grid min-h-12 min-w-12 place-items-center gap-0.5 rounded-xl px-1 text-[9px] font-black uppercase tracking-tight ${window.location.pathname === href ? "bg-cyan-300 text-[#06101c]" : "text-white/65"}`}><Icon className="h-4 w-4" /><span>{label}</span></button>)}</nav>;
};
