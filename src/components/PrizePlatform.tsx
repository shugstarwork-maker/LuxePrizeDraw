import React, { useState } from "react";
import { ArrowUpRight, ChevronDown, Gamepad2, Gem, Heart, House, Plane, PlayCircle, ShieldCheck, Trophy, WalletCards } from "lucide-react";
import { useAudio } from "../audio/AudioProvider";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { DeckCard } from "./DeckCard";

const categories = [
  { label: "Cash", icon: WalletCards, path: "/category?name=Cash", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=900&q=85", video: "/draw-art/cash-100p.mp4" },
  { label: "Sports Cars", icon: Trophy, path: "/sports-cars", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85", video: "/draw-art/supercar-promo.mp4" },
  { label: "Holidays", icon: Plane, path: "/category?name=Holidays", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85", video: "/draw-art/holiday-promo.mp4" },
  { label: "Gaming Bundles", icon: Gamepad2, path: "/category?name=Gaming%20Bundles", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=85", video: "/draw-art/gaming-pc.mp4" },
  { label: "Luxury Homes", icon: House, path: "/category?name=Luxury%20homes", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85", video: "/draw-art/summerhouse-promo.mp4" },
  { label: "Lifestyle", icon: Gem, path: "/category?name=Lifestyle", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85", video: "/draw-art/luxe-diamonds.mp4" },
];

const platformCards = [
  { title: "Draw archive", detail: "Past live-draw recordings and independently verifiable winner records appear here when available.", status: "No archive published yet", icon: PlayCircle },
  { title: "Charity transparency", detail: "Registration numbers, distribution method, evidence and reconciled reporting will be shown per approved partner.", status: "Awaiting partner confirmation", icon: ShieldCheck },
  { title: "My impact hub", detail: "Active entries, order history and personal impact statements are prepared for launch after the required controls are live.", status: "Pre-launch feature", icon: Trophy },
];


export const PrizePlatform: React.FC = () => {
  const [postalOpen, setPostalOpen] = useState(false);
  const { play } = useAudio();
  return <div className="min-h-screen bg-[#060606]/55 text-white">
    <header className="border-b border-amber-200/20 bg-black/90"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"><span className="inline-flex items-center gap-2 font-black"><span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-300 text-black">£</span>LuxePrizeDraw Ltd</span><span className="text-[10px] font-black uppercase tracking-wider text-amber-100">Pre-launch catalogue</span></div></header>
    <main><section className="border-b border-amber-200/15 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,.2),transparent_35%)]"><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-[1.35rem] border border-amber-200/70 bg-[radial-gradient(circle_at_28%_24%,#fff3bf,#d4af37_45%,#76510d)] text-3xl font-black text-black shadow-[0_0_30px_rgba(212,175,55,.4)]">L</span><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Prize draws with a collective purpose</p></div><h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Welcome to<br /><span className="text-white">LuxePrizeDraw</span></h1><p className="mt-2 text-xl font-black tracking-[.18em] text-amber-200 sm:text-3xl">LPD</p><p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">A clear, pre-launch view of prize-draw bundles, transparent controls and the national-grant ambition. No payment or entry is created in this demo.</p></div></section>
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10"><div className="flex items-center justify-between gap-4"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Browse prize categories</p><span className="text-[10px] font-bold uppercase tracking-wider text-white/45">Auto-rotating showcase</span></div><RollingCardCarousel items={categories} getKey={item => item.label} label="prize category" className="mt-4" variant="three-card-auto" interval={4200} renderItem={({ label, icon: Icon, path, image, video }) => <DeckCard className="deck-card--banner" image={image} video={video} title={label}
      facts={[[label, Icon], ["Pre-launch catalogue", ShieldCheck]]}
      cta="View prizes" onCta={() => { play("button"); window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }}
      note="Entries & payments disabled" />} /></section>
    <section className="border-y border-white/10 bg-white/[.025] py-10 sm:py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6"><RollingCardCarousel items={platformCards} getKey={item => item.title} label="platform information" enableArrivalEffects={false} renderItem={({ title, detail, status, icon: Icon }) => <DeckCard title={title}
      facts={[["Platform information", Icon]]}
      stats={[{ value: status, label: "Status" }]}><p className="text-xs leading-relaxed text-white/85">{detail}</p></DeckCard>} /></div></section>
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10"><button onClick={() => setPostalOpen(!postalOpen)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] p-5 text-left"><span><b className="block">Free postal entry route</b><span className="mt-1 block text-sm text-white/55">Availability, address and full instructions publish with the official rules.</span></span><ChevronDown className={`h-5 w-5 transition ${postalOpen ? "rotate-180" : ""}`} /></button>{postalOpen && <p className="border-x border-b border-white/10 px-5 py-4 text-sm leading-relaxed text-white/60">Postal entry details are intentionally unavailable until legal review, eligibility rules, postal address and handling process are approved. This demo does not accept postal entries.</p>}</section></main>
  </div>;
};
