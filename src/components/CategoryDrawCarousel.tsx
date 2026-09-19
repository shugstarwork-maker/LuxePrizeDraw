import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { useRef, useState } from "react";
import { useAudio } from "../audio/AudioProvider";

type Category = "Women's prizes" | "Men's prizes" | "Cars" | "Luxury holidays" | "Gaming & tech" | "Cash alternative";
type Draw = { name: string; image: string; details: [string, string][]; cashAlternative: string; inclusions?: string[] };

type Tier = { entry: string; value: string };
const tiers: Tier[] = [{ entry: "1p", value: "£500" }, { entry: "£1", value: "£5,000" }, { entry: "£5", value: "£25,000" }, { entry: "£10", value: "£50,000" }];

const images: Record<Category, string> = {
  "Women's prizes": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=85",
  "Men's prizes": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=85",
  Cars: "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1400&q=85",
  "Luxury holidays": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85",
  "Gaming & tech": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=85",
  "Cash alternative": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85",
};

const names: Record<Category, string[]> = {
  "Women's prizes": ["Louis Vuitton handbag", "Designer wardrobe collection", "Fine jewellery package", "Luxury fashion fund"],
  "Men's prizes": ["Luxury timepiece", "Premium golf collection", "Tailored travel wardrobe", "Collector watch package"],
  Cars: ["High-end car experience", "Performance coupe", "High-end sports car", "Supercar collection"],
  "Luxury holidays": ["Paris landmark escape", "Dubai luxury city stay", "New York skyline experience", "Maldives private-island escape"],
  "Gaming & tech": ["Premium home-tech bundle", "Creator studio setup", "High-end gaming suite", "Future-tech collection"],
  "Cash alternative": ["£500 cash alternative", "£5,000 cash alternative", "£25,000 cash alternative", "£50,000 cash alternative"],
};

const categories: Category[] = ["Women's prizes", "Men's prizes", "Cars", "Luxury holidays", "Gaming & tech", "Cash alternative"];

export function CategoryDrawCarousel({ category, entryBand }: { category: string; entryBand?: string }) {
  const legacyCategories: Record<string, Category> = { Cash: "Cash alternative", Lifestyle: "Women's prizes", "Gaming Bundles": "Gaming & tech" };
  const parsedCategory = categories.includes(category as Category) ? category as Category : legacyCategories[category] || "Women's prizes";
  const tierFromQuery = Number(new URLSearchParams(window.location.search).get("tier"));
  const initialTier = Number.isInteger(tierFromQuery) && tierFromQuery >= 0 && tierFromQuery < tiers.length ? tierFromQuery : Math.max(0, tiers.findIndex((tier) => tier.entry === entryBand));
  const [tierIndex, setTierIndex] = useState(initialTier);
  const startX = useRef<number | null>(null);
  const { play } = useAudio();
  const tier = tiers[tierIndex];
  const holidayInclusions = [["Landmark-view hotel stay", "Dedicated concierge", "Luxury shopping budget"], ["Five-star suite", "Private airport transfers", "Fine-dining allowance"], ["Luxury hotel package", "Personal concierge", "Premium shopping budget"], ["Five-star villa stay", "Private transfers", "Curated experience budget"]];
  const draw: Draw = { name: names[parsedCategory][tierIndex], image: images[parsedCategory], details: [["Proposed entry", tier.entry], ["Prize value", `Up to ${tier.value}`], ["Category", parsedCategory], ["Status", "Entry not open"]], cashAlternative: `Up to ${tier.value}, subject to approved rules and prize verification`, inclusions: parsedCategory === "Luxury holidays" ? holidayInclusions[tierIndex] : undefined };
  const changeTier = (nextTier: number) => { play("ticketSelect"); setTierIndex(nextTier); };
  const next = () => changeTier((tierIndex + 1) % tiers.length);
  const previous = () => changeTier((tierIndex - 1 + tiers.length) % tiers.length);

  return <section className="min-h-screen bg-[#08090f] py-12 sm:py-20"><div className="mx-auto max-w-3xl px-4 sm:px-6"><button onClick={() => { window.history.pushState({}, "", "/draws"); window.dispatchEvent(new PopStateEvent("popstate")); }} className="text-xs font-black uppercase tracking-wider text-amber-200">All prize collections</button><p className="mt-8 text-xs font-black uppercase tracking-[.2em] text-amber-200">{parsedCategory}</p><h1 className="mt-3 text-4xl font-black sm:text-6xl">Choose your entry tier.</h1><p className="mt-3 text-sm text-white/60">Each tier increases the planned prize value in this collection. Browse every prize choice now; entries and payments remain disabled until launch approval.</p><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{tiers.map((item, index) => <button key={item.entry} onClick={() => changeTier(index)} className={`rounded-2xl border p-4 text-left ${tierIndex === index ? "border-amber-200 bg-amber-300/10" : "border-white/10 bg-white/[.03]"}`}><p className="text-xs font-black text-amber-100">{item.entry}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">Up to {item.value}</p></button>)}</div><article onTouchStart={(event) => { startX.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (startX.current === null) return; const movement = event.changedTouches[0].clientX - startX.current; if (movement > 50) previous(); if (movement < -50) next(); startX.current = null; }} className="mt-8 overflow-hidden rounded-[2rem] border border-white/15 bg-black/50 shadow-2xl"><div className="relative h-80 sm:h-96"><img src={draw.image} alt={`${draw.name} prize preview`} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><span className="absolute left-5 top-5 rounded-full bg-black/65 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100">{tier.entry} tier · up to {tier.value}</span></div><div className="p-6 sm:p-8"><h2 className="text-3xl font-black">{draw.name}</h2><div className="mt-6 grid grid-cols-2 gap-3">{draw.details.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-[9px] font-black uppercase tracking-wider text-white/45">{label}</p><p className="mt-1 text-sm font-bold text-white/85">{value}</p></div>)}</div>{draw.inclusions && <div className="mt-5 rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-emerald-200">Package includes</p><ul className="mt-3 space-y-2 text-xs font-bold text-emerald-100">{draw.inclusions.map(item => <li key={item}>✓ {item}</li>)}</ul></div>}<p className="mt-5 rounded-xl border border-amber-200/20 bg-amber-300/10 p-3 text-xs font-bold text-amber-100">Cash alternative: {draw.cashAlternative}</p><div className="mt-6 flex items-center justify-between"><button onClick={previous} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-black"><ChevronLeft className="h-4 w-4" /> Previous tier</button><button onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-xs font-black text-black">Next tier <ChevronRight className="h-4 w-4" /></button></div></div></article><p className="mt-5 text-center text-xs text-white/45"><Gift className="mr-1 inline h-3.5 w-3.5" /> Swipe or use the controls to move between entry tiers.</p></div></section>;
}
