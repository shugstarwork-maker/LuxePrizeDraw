import React, { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Gamepad2, Gem, House, Plane, Trophy, WalletCards } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";

const categories = [
  { label: "Cash Prizes", icon: WalletCards, path: "/category?name=Cash%20alternative", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=900&q=85" },
  { label: "Sports Cars", icon: Trophy, path: "/sports-cars", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85" },
  { label: "Holidays", icon: Plane, path: "/category?name=Luxury%20holidays", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85" },
  { label: "Gaming Bundles", icon: Gamepad2, path: "/category?name=Gaming%20Bundles", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85" },
  { label: "Luxury Homes", icon: House, path: "/category?name=Luxury%20homes", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85" },
  { label: "Lifestyle", icon: Gem, path: "/category?name=Lifestyle", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85" },
];


export const PrizePlatform: React.FC = () => {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const { play } = useAudio();
  return <div className="min-h-screen bg-[#060606]/55 text-white">
    <main>
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Prize collections</p><h2 className="mt-2 text-3xl font-black">Choose a category, then browse the cards.</h2></div><div className="flex gap-2"><button aria-label="Previous prize category" onClick={() => setCategoryIndex((categoryIndex - 1 + categories.length) % categories.length)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next prize category" onClick={() => setCategoryIndex((categoryIndex + 1) % categories.length)} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35"><ChevronRight className="h-4 w-4" /></button></div></div><div className="mt-5 overflow-hidden"><div className="flex gap-4 transition-transform duration-300" style={{ transform: `translateX(-${categoryIndex * 80}%)` }}>{categories.map(({ label, icon: Icon, path, image }) => <button key={label} onClick={() => { play("button"); window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }} className="group relative min-h-64 min-w-[80%] overflow-hidden rounded-[1.75rem] border border-amber-200/25 text-left shadow-[0_10px_26px_rgba(0,0,0,.28)] transition hover:border-amber-200 sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.75rem)]"><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-110 group-hover:opacity-90" /><span className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" /><span className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-2"><span><span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-200/40 bg-black/55 text-amber-200"><Icon className="h-5 w-5" /></span><span className="mt-3 block text-2xl font-black leading-tight">{label}</span><span className="mt-1 block text-xs font-bold text-white/65">Browse collection</span></span><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-300 text-black shadow-lg"><ArrowRight className="h-4 w-4" /></span></span></button>)}</div></div><div className="mt-4 flex justify-center gap-2">{categories.map(({ label }, index) => <button key={label} aria-label={`Show ${label}`} onClick={() => setCategoryIndex(index)} className={`h-2 rounded-full transition ${categoryIndex === index ? "w-7 bg-amber-200" : "w-2 bg-white/35"}`} />)}</div></section>
</main>
  </div>;
};
