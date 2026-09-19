import { ChevronLeft, ChevronRight, Gift, Ticket } from "lucide-react";
import { useRef, useState } from "react";

type Draw = { name: string; image: string; details: [string, string][]; cashAlternative?: string };

const data: Record<string, { title: string; draws: Draw[] }> = {
  Cars: { title: "Sports car draws", draws: [
    { name: "Ferrari 488 GTB", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85", details: [["Engine", "3.9L twin-turbo V8"], ["Power", "670 PS"], ["0–62 mph", "3.0 sec"], ["Drive", "7-speed dual-clutch"]], cashAlternative: "Published with official draw rules" },
    { name: "Audi R8 V10 Performance", image: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1400&q=85", details: [["Engine", "5.2L V10"], ["Power", "620 PS"], ["0–62 mph", "3.1 sec"], ["Drive", "7-speed S tronic"]], cashAlternative: "Published with official draw rules" },
    { name: "Porsche 911 Carrera S", image: "https://images.unsplash.com/photo-1502489597346-dad15683d4a9?auto=format&fit=crop&w=1400&q=85", details: [["Engine", "3.0L twin-turbo flat-six"], ["Power", "450 PS"], ["0–62 mph", "3.7 sec"], ["Drive", "8-speed PDK"]], cashAlternative: "Published with official draw rules" },
  ] },
  Holidays: { title: "Holiday draws", draws: [
    { name: "Maldives Escape", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85", details: [["Stay", "7 nights"], ["Setting", "Indian Ocean"], ["Travel", "Flights subject to rules"], ["Includes", "Details at launch"]], cashAlternative: "Published with official draw rules" },
    { name: "Dubai City Break", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85", details: [["Stay", "5 nights"], ["Setting", "Dubai"], ["Travel", "Flights subject to rules"], ["Includes", "Details at launch"]], cashAlternative: "Published with official draw rules" },
  ] },
  "Gaming Bundles": { title: "Gaming bundle draws", draws: [
    { name: "Ultimate Gaming Setup", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=85", details: [["Platform", "PC & console"], ["Display", "High-refresh setup"], ["Extras", "Streaming kit"], ["Status", "Preview"]], cashAlternative: "Published with official draw rules" },
    { name: "Creator Battle Station", image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1400&q=85", details: [["Platform", "Desktop setup"], ["Display", "Dual monitor"], ["Extras", "Creator audio"], ["Status", "Preview"]], cashAlternative: "Published with official draw rules" },
  ] },
  Motorhomes: { title: "Motorhome draws", draws: [
    { name: "Adventure Motorhome", image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1400&q=85", details: [["Type", "Touring motorhome"], ["Berths", "To be confirmed"], ["Travel", "Road-ready concept"], ["Status", "Preview"]], cashAlternative: "Published with official draw rules" },
    { name: "Luxury Camper Collection", image: "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=1400&q=85", details: [["Type", "Premium camper"], ["Layout", "To be confirmed"], ["Travel", "Adventure ready"], ["Status", "Preview"]], cashAlternative: "Published with official draw rules" },
  ] },
  Lifestyle: { title: "Lifestyle draws", draws: [
    { name: "Luxury Timepiece", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=85", details: [["Style", "Luxury watch"], ["Finish", "To be confirmed"], ["Documentation", "At launch"], ["Status", "Preview"]], cashAlternative: "Published with official draw rules" },
    { name: "Premium Tech Collection", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=85", details: [["Category", "Consumer tech"], ["Contents", "To be confirmed"], ["Documentation", "At launch"], ["Status", "Preview"]], cashAlternative: "Published with official draw rules" },
  ] },
  Cash: { title: "Cash draws", draws: [
    { name: "1p Cash Draw", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "1p"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "2p Cash Draw", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "2p"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "10p Cash Draw", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "10p"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "20p Cash Draw", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "20p"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "25p Cash Draw", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "25p"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "30p Cash Draw", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "30p"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "50p Cash Draw", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "50p"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "£1 Cash Draw", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "£1"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "£5 Cash Draw", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "£5"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
    { name: "£10 Cash Draw", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=85", details: [["Entry band", "£10"], ["Prize", "Cash"], ["Route", "Official rules"], ["Status", "Preview"]] },
  ] },
};

export function CategoryDrawCarousel({ category, entryBand }: { category: string; entryBand?: string }) {
  const group = data[category] || data.Cash;
  const [current, setCurrent] = useState(() => entryBand ? Math.max(0, group.draws.findIndex((draw) => draw.name.startsWith(entryBand))) : 0);
  const startX = useRef<number | null>(null);
  const next = () => setCurrent((value) => (value + 1) % group.draws.length);
  const previous = () => setCurrent((value) => (value - 1 + group.draws.length) % group.draws.length);
  const draw = group.draws[current];
  return <section className="min-h-screen bg-[#08090f] py-12 sm:py-20"><div className="mx-auto max-w-3xl px-4 sm:px-6"><button onClick={() => { window.history.pushState({}, "", "/draws"); window.dispatchEvent(new PopStateEvent("popstate")); }} className="text-xs font-black uppercase tracking-wider text-amber-200">All categories</button><p className="mt-8 text-xs font-black uppercase tracking-[.2em] text-amber-200">{group.title}</p><h1 className="mt-3 text-4xl font-black sm:text-6xl">Swipe to explore.</h1><p className="mt-3 text-sm text-white/60">Each card is a draw preview. Vehicle or prize availability and official terms are confirmed at launch.</p><article onTouchStart={(event) => { startX.current = event.touches[0].clientX; }} onTouchEnd={(event) => { if (startX.current === null) return; const movement = event.changedTouches[0].clientX - startX.current; if (movement > 50) previous(); if (movement < -50) next(); startX.current = null; }} className="mt-8 overflow-hidden rounded-[2rem] border border-white/15 bg-black/50 shadow-2xl"><div className="relative h-80 sm:h-96"><img src={draw.image} alt={`${draw.name} draw preview`} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><span className="absolute left-5 top-5 rounded-full bg-black/65 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100">Draw preview {current + 1} / {group.draws.length}</span></div><div className="p-6 sm:p-8"><h2 className="text-3xl font-black">{draw.name}</h2><div className="mt-6 grid grid-cols-2 gap-3">{draw.details.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="text-[9px] font-black uppercase tracking-wider text-white/45">{label}</p><p className="mt-1 text-sm font-bold text-white/85">{value}</p></div>)}</div>{draw.cashAlternative && <p className="mt-5 rounded-xl border border-amber-200/20 bg-amber-300/10 p-3 text-xs font-bold text-amber-100">Cash alternative: {draw.cashAlternative}</p>}<div className="mt-6 flex items-center justify-between"><button onClick={previous} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-black"><ChevronLeft className="h-4 w-4" /> Previous</button><button onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-xs font-black text-black">Next <ChevronRight className="h-4 w-4" /></button></div></div></article><p className="mt-5 text-center text-xs text-white/45"><Gift className="mr-1 inline h-3.5 w-3.5" /> Swipe left or right, or use the buttons.</p></div></section>;
}
