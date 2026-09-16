import React, { useState } from "react";
import { CarFront, Gem, Plane, Smartphone, Watch } from "lucide-react";
import { PrizePicker } from "./PrizePicker";

const categories = [
  { name: "Watches", image: "/prizes/luxury-watch.svg", icon: Watch, detail: "Timepieces and collector editions" },
  { name: "Cars", image: "/prizes/supercar.svg", icon: CarFront, detail: "Supercars, grand tourers and 4x4s" },
  { name: "Holidays", image: "/prizes/island-villa.svg", icon: Plane, detail: "Private villas and five-star escapes" },
  { name: "Phones & Tech", image: "/prizes/luxury-phone.svg", icon: Smartphone, detail: "Flagship devices and future-tech" },
  { name: "Cash Choice", image: "/prizes/pound-notes.svg", icon: Gem, detail: "Cash-equivalent route where approved" },
];

export const CustomDrawGallery: React.FC = () => {
  const [opened, setOpened] = useState(false);
  return <><section className="min-h-[70vh] bg-[#07070b] px-4 py-12 text-white sm:py-20"><div className="mx-auto max-w-7xl"><p className="text-xs font-black uppercase tracking-[.22em] text-amber-200">Custom Draw Gallery</p><h1 className="mt-3 max-w-3xl text-4xl font-black sm:text-6xl">Choose the life-changing prize you want.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Start with a luxury category, then select an item and let the gallery create your value-matched draw preview.</p><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{categories.map(({ name, image, icon: Icon, detail }) => <button key={name} onClick={() => { setOpened(true); window.setTimeout(() => document.getElementById("prize-picker")?.scrollIntoView({ behavior: "smooth" }), 0); }} className="group relative min-h-72 overflow-hidden rounded-[2rem] border border-white/15 bg-white/[.035] text-left"><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"/><div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-6"><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-black/45"><Icon className="h-5 w-5 text-amber-200"/></span><h2 className="mt-4 text-2xl font-black">{name}</h2><p className="mt-1 text-sm text-white/70">{detail}</p><span className="mt-4 inline-block text-xs font-black uppercase tracking-wider text-amber-100">Explore collection</span></div></button>)}</div></div></section>{opened && <PrizePicker />}</>;
};
