import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { useAudio } from "../audio/AudioProvider";
import { DrawDetailsPanel } from "./DrawDetailsPanel";

type Category = "Women's prizes" | "Men's prizes" | "Cars" | "Luxury holidays" | "Gaming & tech" | "Luxury homes" | "Cash alternative";
type Draw = { name: string; image: string; inclusions: string[] };

type Tier = { entry: string; value: string };
const tiers: Tier[] = [{ entry: "1p", value: "£500" }, { entry: "2p", value: "£750" }, { entry: "5p", value: "£1,250" }, { entry: "10p", value: "£2,500" }, { entry: "20p", value: "£5,000" }, { entry: "50p", value: "£10,000" }, { entry: "£1", value: "£20,000" }, { entry: "£5", value: "£35,000" }, { entry: "£10", value: "£50,000" }];
const targetTickets = [50000, 75000, 125000, 250000, 500000, 1000000, 2000000, 3500000, 5000000];

const images: Record<Category, string[]> = {
  "Women's prizes": [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1585488432456-7a4b563d3c34?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85",
  ],
  "Men's prizes": [
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1587175555288-968d2f4c2a7b?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1559582798-678dfc71ccd8?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1400&q=85",
  ],
  Cars: [
    "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1400&q=85",
  ],
  "Luxury holidays": [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1523409070585-7f2a86b4b9c7?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=1400&q=85",
  ],
  "Gaming & tech": [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1400&q=85",
  ],
  "Luxury homes": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85",
  ],
  "Cash alternative": [
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?auto=format&fit=crop&w=1400&q=85",
  ],
};

const names: Record<Category, string[]> = {
  "Women's prizes": ["Louis Vuitton handbag", "Designer accessory set", "Premium beauty collection", "Designer wardrobe collection", "Fine jewellery package", "Luxury handbag collection", "Private styling experience", "Luxury fashion fund", "Ultimate fashion collection"],
  "Men's prizes": ["Luxury timepiece", "Premium accessories", "Executive travel collection", "Premium golf collection", "Tailored travel wardrobe", "Collector watch", "Luxury driving experience", "Collector watch package", "Ultimate gentlemen's collection"],
  Cars: ["High-end car experience", "Performance driving day", "Premium city-car experience", "Performance coupe", "High-end sports car", "Luxury GT experience", "Sports-car collection", "Supercar experience", "Supercar collection"],
  "Luxury holidays": ["Paris landmark escape", "Dubai city stay", "Monaco Riviera escape", "Maldives villa escape", "New York skyline experience", "Milan fashion escape", "London luxury stay", "Santorini clifftop escape", "Mykonos villa escape"],
  "Gaming & tech": ["Premium home-tech bundle", "Gaming accessory set", "Creator starter kit", "Creator studio setup", "High-end gaming suite", "Home-cinema technology", "Future-tech collection", "Ultimate creator suite", "Smart-home collection"],
  "Luxury homes": ["Contemporary luxury home", "Coastal residence", "Hillside villa", "City penthouse", "Private estate", "Waterfront home", "Architectural villa", "Country retreat", "Signature residence"],
  "Cash alternative": ["£500 cash alternative", "£750 cash alternative", "£1,250 cash alternative", "£2,500 cash alternative", "£5,000 cash alternative", "£10,000 cash alternative", "£20,000 cash alternative", "£35,000 cash alternative", "£50,000 cash alternative"],
};

const categories: Category[] = ["Women's prizes", "Men's prizes", "Cars", "Luxury holidays", "Gaming & tech", "Luxury homes", "Cash alternative"];

const packageInclusions: Record<Category, string[]> = {
  "Women's prizes": ["Premium prize selection", "Luxury presentation", "Insured fulfilment", "Winner concierge"],
  "Men's prizes": ["Premium prize selection", "Luxury presentation", "Insured fulfilment", "Winner concierge"],
  Cars: ["Verified vehicle specification", "Winner concierge", "Secure handover", "Cash alternative"],
  "Luxury holidays": ["Five-star accommodation", "Luxury concierge", "Premium travel planning", "Private transfers"],
  "Gaming & tech": ["Premium device selection", "Protected delivery", "Setup support", "Cash alternative"],
  "Luxury homes": ["Property verification", "Professional viewing", "Winner concierge", "Cash alternative"],
  "Cash alternative": ["Verified prize valuation", "Secure payment process", "Winner concierge", "Approved draw rules"],
};

export function CategoryDrawCarousel({ category, entryBand }: { category: string; entryBand?: string }) {
  const legacyCategories: Record<string, Category> = { Cash: "Cash alternative", Lifestyle: "Women's prizes", "Gaming Bundles": "Gaming & tech" };
  const parsedCategory = categories.includes(category as Category) ? category as Category : legacyCategories[category] || "Women's prizes";
  const tierFromQuery = Number(new URLSearchParams(window.location.search).get("tier"));
  const initialTier = Number.isInteger(tierFromQuery) && tierFromQuery >= 0 && tierFromQuery < tiers.length ? tierFromQuery : Math.max(0, tiers.findIndex((tier) => tier.entry === entryBand));
  const [tierIndex, setTierIndex] = useState(initialTier);
  const startX = useRef<number | null>(null);
  const { play } = useAudio();
  const tier = tiers[tierIndex];
  const draw: Draw = {
    name: names[parsedCategory][tierIndex],
    image: images[parsedCategory][tierIndex],
    inclusions: packageInclusions[parsedCategory],
  };
  const changeTier = (nextTier: number) => { play("ticketSelect"); setTierIndex(nextTier); };
  const next = () => changeTier((tierIndex + 1) % tiers.length);
  const previous = () => changeTier((tierIndex - 1 + tiers.length) % tiers.length);

  return <section className="min-h-screen bg-[#08090f] py-8 sm:py-16"><div className="mx-auto max-w-3xl px-4 sm:px-6">
    <button onClick={() => { window.history.pushState({}, "", "/draws"); window.dispatchEvent(new PopStateEvent("popstate")); }} className="text-xs font-black uppercase tracking-wider text-amber-200">All prize collections</button>
    <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">{tiers.map((item, index) => <button key={item.entry} onClick={() => changeTier(index)} aria-label={`Show ${item.entry} tier`} className={`rounded-xl border px-2 py-2 text-center transition ${tierIndex === index ? "border-amber-200 bg-amber-300 text-black" : "border-white/10 bg-white/[.03] text-white/65"}`}><p className="text-xs font-black">{item.entry}</p><p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide">{item.value}</p></button>)}</div>
    <article onTouchStart={(event) => { startX.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (startX.current === null) return; const movement = event.changedTouches[0].clientX - startX.current; if (movement > 50) previous(); if (movement < -50) next(); startX.current = null; }} className="group relative mt-5 min-h-[40rem] overflow-hidden rounded-[2rem] border border-amber-100/20 bg-black shadow-2xl sm:min-h-[42rem]">
      <img key={draw.image} src={draw.image} alt={`${draw.name} prize preview`} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-black/45 to-black/10" />
      <div className="relative flex min-h-[40rem] flex-col justify-end p-5 sm:min-h-[42rem] sm:p-9">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-100">{parsedCategory} · {tier.entry} tier</p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-none tracking-[.08em] text-white sm:text-6xl">{draw.name}</h1>
        <ul className="mt-6 grid gap-2 text-sm font-bold leading-relaxed text-emerald-100 sm:grid-cols-2">{draw.inclusions.map(item => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-300" />{item}</li>)}</ul>
        <DrawDetailsPanel className="mt-6" />
      </div>
    </article>
    <div className="mt-5 flex items-center justify-between gap-3"><button onClick={previous} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-xs font-black text-white"><ChevronLeft className="h-4 w-4" /> Previous</button><div className="flex gap-1.5">{tiers.map((item, index) => <button key={item.entry} aria-label={`Show ${item.entry} tier`} onClick={() => changeTier(index)} className={`h-2.5 rounded-full transition ${tierIndex === index ? "w-7 bg-amber-200" : "w-2.5 bg-white/45"}`} />)}</div><button onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-xs font-black text-black">Next <ChevronRight className="h-4 w-4" /></button></div>
    <p className="mt-6 rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4 text-xs leading-relaxed text-amber-50">Prize imagery, package details, values, cash alternatives and entry terms are aspirational previews only. Nothing is available until final approved rules are published.</p>
  </div></section>;
}
