import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const draws = [
  { title: "Ferrari 488 GTB", category: "Sports car", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=85", path: "/sports-cars" },
  { title: "£10,000 Cash Draw", category: "Cash prize", image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&w=1400&q=85", path: "/category?name=Cash" },
  { title: "Maldives Escape", category: "Holiday", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85", path: "/category?name=Holidays" },
  { title: "Luxury Timepiece", category: "Lifestyle", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1400&q=85", path: "/category?name=Lifestyle" },
];

function navigate(path: string) { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }

export function FeaturedDraws() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive((value) => (value + 1) % draws.length), 5000); return () => window.clearInterval(timer); }, []);
  const draw = draws[active];
  const move = (offset: number) => setActive((value) => (value + offset + draws.length) % draws.length);
  return <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6"><div className="flex items-end justify-between gap-4"><div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><Sparkles className="h-4 w-4" /> Featured draws</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Top prize previews</h2></div><span className="text-xs text-white/45">Auto-rotates every 5 seconds</span></div><article className="relative mt-5 min-h-[25rem] overflow-hidden rounded-[2rem] border border-amber-200/20 bg-black/55"><img src={draw.image} alt={`${draw.title} draw preview`} className="absolute inset-0 h-full w-full object-cover opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/15" /><div className="relative flex min-h-[25rem] flex-col justify-end p-6 sm:p-10"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">{draw.category} · pre-launch preview</p><h3 className="mt-3 text-4xl font-black sm:text-6xl">{draw.title}</h3><p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">Prize availability, cash alternatives, entry routes and official rules are published when the draw opens.</p><button onClick={() => navigate(draw.path)} className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-black">Explore draw <ArrowRight className="h-4 w-4" /></button></div><button aria-label="Previous featured draw" onClick={() => move(-1)} className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55"><ChevronLeft className="h-5 w-5" /></button><button aria-label="Next featured draw" onClick={() => move(1)} className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/55"><ChevronRight className="h-5 w-5" /></button><div className="absolute bottom-5 right-6 flex gap-2">{draws.map((item, index) => <button key={item.title} aria-label={`Show ${item.title}`} onClick={() => setActive(index)} className={`h-2.5 rounded-full transition ${active === index ? "w-7 bg-amber-200" : "w-2.5 bg-white/45"}`} />)}</div></article></section>;
}
