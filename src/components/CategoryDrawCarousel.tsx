import { DeckCard } from "./DeckCard";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { CircleAlert, Gift, Ticket } from "lucide-react";
import { useState } from "react";
import { useAudio } from "../audio/AudioProvider";

type Category = "Cars" | "Luxe Holidays" | "Cash" | "Bitcoin" | "Gaming Packages" | "Luxe Summer Houses" | "Gold Bullion";

type Tier = { entry: string; value: string };
const tiers: Tier[] = [{ entry: "1p", value: "£500" }, { entry: "2p", value: "£750" }, { entry: "5p", value: "£1,250" }, { entry: "10p", value: "£2,500" }, { entry: "20p", value: "£5,000" }, { entry: "50p", value: "£10,000" }, { entry: "£1", value: "£20,000" }, { entry: "£5", value: "£35,000" }, { entry: "£10", value: "£50,000" }];


const images: Record<Category, string[]> = {
  Cars: [
    "https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1400&q=85",
  ],
  "Luxe Holidays": [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=1400&q=85",
  ],
  "Gaming Packages": [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1400&q=85",
  ],
  "Luxe Summer Houses": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=85",
  ],
  "Cash": [
    "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1400&q=85"
  ],
  "Bitcoin": [
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1621504450181-5d356f61d307?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1400&q=85", "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1400&q=85"
  ],
  "Gold Bullion": [
    "/games/gold-bar.png", "/games/gold-bar.png", "/games/gold-bar.png", "/games/gold-bar.png", "/games/gold-bar.png", "/games/gold-bar.png", "/games/gold-bar.png", "/games/gold-bar.png", "/games/gold-bar.png"
  ]
};

const names: Record<Category, string[]> = {
  Cars: ["High-end car experience", "Performance driving day", "Premium city-car experience", "Performance coupe", "High-end sports car", "Luxury GT experience", "Sports-car collection", "Supercar experience", "Supercar collection"],
  "Luxe Holidays": ["Paris landmark escape", "London city stay", "Monaco Riviera escape", "Maldives villa escape", "New York skyline experience", "Milan fashion escape", "London luxury stay", "Santorini clifftop escape", "Mykonos villa escape"],
  "Gaming Packages": ["Premium home-tech bundle", "Gaming accessory set", "Creator starter kit", "Creator studio setup", "High-end gaming suite", "Home-cinema technology", "Future-tech collection", "Ultimate creator suite", "Smart-home collection"],
  "Luxe Summer Houses": ["Contemporary luxury home", "Coastal residence", "Hillside villa", "City penthouse", "Private estate", "Waterfront home", "Architectural villa", "Country retreat", "Signature residence"],
  "Cash": ["£500 cash prize", "£750 cash prize", "£1,250 cash prize", "£2,500 cash prize", "£5,000 cash prize", "£10,000 cash prize", "£20,000 cash jackpot", "£35,000 cash jackpot", "£50,000 cash jackpot"],
  "Bitcoin": ["£500 of Bitcoin", "£750 of Bitcoin", "£1,250 of Bitcoin", "£2,500 of Bitcoin", "£5,000 of Bitcoin", "£10,000 of Bitcoin", "£20,000 of Bitcoin", "£35,000 of Bitcoin", "£50,000 of Bitcoin"],
  "Gold Bullion": ["10g gold bar", "20g gold bar", "50g gold bar", "100g gold bar", "250g gold bar", "500g gold bar", "1kg solid gold bar", "1kg gold bar & display case", "2kg gold bullion collection"]
};

const categories: Category[] = ["Cars", "Luxe Holidays", "Cash", "Bitcoin", "Gold Bullion", "Gaming Packages", "Luxe Summer Houses"];

export function CategoryDrawCarousel({ category, entryBand }: { category: string; entryBand?: string }) {
  const legacyCategories: Record<string, Category> = {
    Cash: "Cash", Lifestyle: "Luxe Holidays", "Gaming Bundles": "Gaming Packages",
    "Women's prizes": "Luxe Holidays", "Men's prizes": "Cars", "Luxury holidays": "Luxe Holidays",
    "Gaming & tech": "Gaming Packages", "Luxury homes": "Luxe Summer Houses", "Cash alternative": "Cash",
  };
  const parsedCategory = categories.includes(category as Category) ? category as Category : legacyCategories[category] || "Cars";
  const tierFromQuery = Number(new URLSearchParams(window.location.search).get("tier"));
  const initialTier = Number.isInteger(tierFromQuery) && tierFromQuery >= 0 && tierFromQuery < tiers.length ? tierFromQuery : Math.max(0, tiers.findIndex((tier) => tier.entry === entryBand));
  const [tierIndex, setTierIndex] = useState(initialTier);
  const { play } = useAudio();
  
  return <section className="min-h-screen bg-[#08090f] py-8 sm:py-12"><div className="mx-auto max-w-3xl px-4 sm:px-6"><button onClick={() => { window.history.pushState({}, "", "/draws"); window.dispatchEvent(new PopStateEvent("popstate")); }} className="text-xs font-black uppercase tracking-wider text-amber-200">All prize collections</button><p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-amber-200">{parsedCategory}</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Choose your entry tier.</h1><p className="mt-2 text-sm text-white/60">Each tier increases the planned prize value in this collection. Browse every prize choice now; entries and payments remain disabled until launch approval.</p><RollingCardCarousel items={tiers} getKey={item => item.entry} label="entry tier" activeIndex={tierIndex} onActiveChange={setTierIndex} renderItem={(tier, tierIndex) => <DeckCard image={images[parsedCategory][tierIndex]} title={names[parsedCategory][tierIndex]}
    facts={[[parsedCategory, Gift], [`${tier.entry} proposed entry`, Ticket], ["Entry not open", CircleAlert]]}
    stats={[{ value: `Up to ${tier.value}`, label: "Prize value" }, { value: tier.entry, label: "Entry" }, { value: "Pending", label: "Status" }]}
    note="Subject to approved rules & prize verification" />
} /></div></section>;
}
