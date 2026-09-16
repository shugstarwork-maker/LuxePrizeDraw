import React, { useState } from "react";
import { BriefcaseBusiness, CarFront, Gem, Plane, Smartphone, Watch } from "lucide-react";
import { PrizePicker } from "./PrizePicker";

const categories = [
  { name: "Watches", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=90", icon: Watch, detail: "Mechanical watches and collector editions" },
  { name: "Cars", image: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=90", icon: CarFront, detail: "Exotic-car details, grand tourers and 4x4s" },
  { name: "Leather Goods", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=90", icon: BriefcaseBusiness, detail: "Premium leather bags and travel pieces" },
  { name: "Holidays", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=90", icon: Plane, detail: "Private villas and five-star escapes" },
  { name: "Phones & Tech", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=90", icon: Smartphone, detail: "Flagship devices and future-tech" },
  { name: "Cash Choice", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=90", icon: Gem, detail: "Cash-equivalent route where approved" },
];

export const CustomDrawGallery: React.FC = () => {
  const [opened, setOpened] = useState(false);
  return <><section className="min-h-[70vh] bg-[#07070b] px-4 py-12 text-white sm:py-20"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.22em] text-amber-200">Custom Draw Gallery</p><h1 className="mt-3 max-w-3xl text-4xl font-black sm:text-6xl">Choose the life-changing prize you want.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Start with a luxury category, then select an item and let the gallery create your value-matched draw preview.</p><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{categories.map(({ name, image, icon: Icon, detail }) => <button key={name} onClick={() => { setOpened(true); window.setTimeout(() => document.getElementById("prize-picker")?.scrollIntoView({ behavior: "smooth" }), 0); }} className="group relative min-h-72 overflow-hidden rounded-[2rem] border border-white/15 bg-white/[.035] text-left"><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"/><div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-6"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-black/45"><Icon className="h-5 w-5 text-amber-200"/></span><h2 className="mt-4 text-2xl font-black">{name}</h2><p className="mt-1 text-sm text-white/70">{detail}</p><span className="mt-4 inline-block text-xs font-black uppercase tracking-wider text-amber-100">Explore collection</span></div></button>)}</div></div></section>{opened && <PrizePicker />}</>;
};
