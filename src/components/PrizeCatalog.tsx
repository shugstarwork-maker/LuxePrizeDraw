import React, { useMemo, useState } from "react";
import { CarFront, ChevronDown, Gamepad2, Plane, Sparkles, Trophy, UserRound, WalletCards } from "lucide-react";

type Category = "Women's prizes" | "Men's prizes" | "Cars" | "Luxury holidays" | "Gaming & tech" | "Cash alternative";
type Tier = { entry: string; value: string; label: string };

const tiers: Tier[] = [
  { entry: "1p", value: "£500", label: "Everyday luxe" },
  { entry: "£1", value: "£5,000", label: "Signature" },
  { entry: "£5", value: "£25,000", label: "Premier" },
  { entry: "£10", value: "£50,000", label: "Elite" },
];

const categories: { name: Category; icon: React.ElementType }[] = [
  { name: "Women's prizes", icon: Sparkles },
  { name: "Men's prizes", icon: UserRound },
  { name: "Cars", icon: CarFront },
  { name: "Luxury holidays", icon: Plane },
  { name: "Gaming & tech", icon: Gamepad2 },
  { name: "Cash alternative", icon: WalletCards },
];

const concepts: Record<Category, string[]> = {
  "Women's prizes": ["Louis Vuitton handbag", "Designer wardrobe collection", "Fine jewellery package", "Luxury fashion fund"],
  "Men's prizes": ["Luxury timepiece", "Premium golf collection", "Tailored travel wardrobe", "Collector watch package"],
  Cars: ["High-end car experience", "Performance coupe", "High-end sports car", "Supercar collection"],
  "Luxury holidays": ["Paris landmark escape", "Dubai luxury city stay", "New York skyline experience", "Maldives private-island escape"],
  "Gaming & tech": ["Premium home-tech bundle", "Creator studio setup", "High-end gaming suite", "Future-tech collection"],
  "Cash alternative": ["£500 cash alternative", "£5,000 cash alternative", "£25,000 cash alternative", "£50,000 cash alternative"],
};

const images: Record<Category, string> = {
  "Women's prizes": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=85",
  "Men's prizes": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=85",
  Cars: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1400&q=85",
  "Luxury holidays": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85",
  "Gaming & tech": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=85",
  "Cash alternative": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85",
};

export function PrizeCatalog() {
  const [tierIndex, setTierIndex] = useState(0);
  const [open, setOpen] = useState(true);
  const tier = tiers[tierIndex];
  const cards = useMemo(() => categories.map(({ name }) => ({ category: name, title: concepts[name][tierIndex], image: images[name] })), [tierIndex]);
  const browse = (name: Category) => {
    window.history.pushState({}, "", `/category?name=${encodeURIComponent(name)}&tier=${tierIndex}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return <section id="prize-catalog" className="bg-[#08090f] py-16 sm:py-24"><div className="mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 lg:grid-cols-[17rem_1fr]">
    <aside className="h-fit rounded-[2rem] border border-amber-200/20 bg-black/45 p-4 shadow-2xl lg:sticky lg:top-24"><p className="px-2 text-[10px] font-black uppercase tracking-[.2em] text-amber-200">Prize categories</p><button onClick={() => setOpen(value => !value)} className="mt-3 flex w-full items-center justify-between rounded-xl bg-amber-300 px-4 py-3 text-left text-xs font-black text-black">Browse collections <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} /></button>{open && <div className="mt-2 space-y-1">{categories.map(({ name, icon: Icon }) => <button key={name} onClick={() => browse(name)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-black text-white/60 transition hover:bg-white/5 hover:text-white"><Icon className="h-4 w-4" />{name}</button>)}</div>}</aside>
    <div><div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[.07] to-white/[.015] p-6 sm:p-9"><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><Trophy className="h-4 w-4" /> Open prize catalogue</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Choose the value, then your prize.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Each entry tier has a choice across every category. Browse women’s, men’s, cars, holidays, tech and cash-alternative prize concepts, then swipe through that category’s value ladder.</p></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{tiers.map((item, index) => <button key={item.entry} onClick={() => setTierIndex(index)} className={`rounded-2xl border p-4 text-left transition ${tierIndex === index ? "border-amber-200 bg-amber-300/10 shadow-[0_0_24px_rgba(212,175,55,.12)]" : "border-white/10 bg-white/[.03] hover:border-white/30"}`}><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/45">Entry price</p><p className="mt-1 text-2xl font-black text-amber-100">{item.entry}</p><p className="mt-3 text-xs font-bold text-white">Up to {item.value} value</p><p className="mt-1 text-xs text-white/50">{item.label} tier</p></button>)}</div>
      <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">{tier.entry} entry tier</p><h3 className="mt-2 text-3xl font-black">Prize choices up to {tier.value}.</h3></div><span className="rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100">Preview only</span></div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{cards.map(({ category: cardCategory, title, image }) => <button key={cardCategory} onClick={() => browse(cardCategory)} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 text-left transition hover:-translate-y-1 hover:border-amber-200/60"><div className="relative h-44 overflow-hidden"><img src={image} alt="" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-amber-200/30 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100">{tier.entry} · up to {tier.value}</span></div><div className="p-5"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/40">{cardCategory}</p><h4 className="mt-2 text-xl font-black">{title}</h4><p className="mt-2 text-sm text-white/55">Browse this category’s full step-up prize ladder.</p><span className="mt-4 inline-block text-xs font-black uppercase tracking-wider text-amber-100">Open collection</span></div></button>)}</div>
      <p className="mt-7 rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4 text-xs leading-relaxed text-amber-50">All prize names, values, entry prices, cash alternatives, availability and official terms are proposed previews. No entry, payment, prize entitlement or order is created until launch approval and independently verified rules are in place.</p>
    </div>
  </div></section>;
}
