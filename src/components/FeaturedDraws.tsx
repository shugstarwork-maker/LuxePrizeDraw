import { HeadlinePrizeChoice } from "./HeadlinePrizeChoice";
import { ticketsSold } from "../lib/drawProgress";
import { BitcoinCoinRain } from "./BitcoinCoinRain";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { ArrowRight, CircleAlert, ShieldCheck, Sparkles } from "lucide-react";
import { DeckCard } from "./DeckCard";
import { categoryFor } from "./DrawTermsSheet";
import { useAudio } from "../audio/AudioProvider";

type Draw = { title: string; category: string; image: string; video: string; path: string; prizeValue: string; entryCost: string };
const draws: Draw[] = [
  { title: "Luxury Supercar Experience", category: "Featured partnership", image: "/draw-art/car-luxe-gt.jpg", video: "/draw-art/car-luxe-gt-cine.mp4", path: "/prizes/luxury-supercar-experience", prizeValue: "Campaign details pending", entryCost: "Pending approval" },
  { title: "£100K Bitcoin Prize or £100K Cash", category: "Headline prize choice", image: "/prizes/hero-bitcoin.jpg", video: "/draw-art/featured-bitcoin-cine.mp4", path: "/terms", prizeValue: "£100,000 BTC or cash", entryCost: "Pre-launch" },
  { title: "Ferrari 488 GTB", category: "Sports car", image: "/draw-art/car-audi-r8.jpg", video: "/draw-art/featured-ferrari-cine.mp4", path: "/sports-cars", prizeValue: "Pending verified valuation", entryCost: "Pending approval" },
  { title: "1kg Solid Gold Bar", category: "Bullion prize", image: "/draw-art/luxe-gold-bar.jpg", video: "/draw-art/featured-gold-cine.mp4", path: "/draws", prizeValue: "24ct investment gold · valuation pending", entryCost: "Pending approval" },
];

export function HeadlineLuxeCard() {
  const { play } = useAudio();
  return <>
    <div className="headline-luxe-deck"><BitcoinCoinRain /><DeckCard className="headline-luxe-card cinematic" image="/prizes/hero-bitcoin.jpg" title="Win £100K · Bitcoin or Cash" progress={{ sold: ticketsSold("headline-bitcoin") }} summary={{ entry: "Pending approval", prize: "£100,000", cash: "£100,000" }} terms={{ drawName: "£100K Bitcoin or Cash", category: "bitcoin", prize: "£100,000 of Bitcoin or a £100,000 cash alternative — the winner chooses", entry: "to be confirmed" }}
      cta="Enter" ctaLabel="Enter — opens the approval-pending launch catalogue. This does not submit an entry or take a payment." onCta={() => { play("button"); navigate("/launch-build"); }}
      note="Approval pending · Entries and payments disabled · Preview only, no prize entitlement">
      <p className="headline-deck__eyebrow"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Headline prize preview</p>
      <h1 className="headline-deck__headline">WIN <b>£100K</b> WORTH OF BITCOIN <i>or</i> £100K CASH</h1>
      <HeadlinePrizeChoice compact /></DeckCard></div>
  </>;
}

function navigate(path: string) { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); }

export function FeaturedDraws() {
  const { play } = useAudio();
  return <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
    <div className="mt-10 flex items-end justify-between gap-4"><div><p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-amber-200 sm:text-xs sm:tracking-[.2em]"><Sparkles className="h-4 w-4" /> Featured Top Prizes</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Top prize previews</h2></div><span className="text-xs text-white/45">Auto-rotates every 5 seconds</span></div>
    <RollingCardCarousel items={draws} getKey={item => item.title} label="featured draw" className="mt-7" renderItem={(draw) => <DeckCard image={draw.image} video={draw.video} title={draw.title} progress={{ sold: ticketsSold(draw.title) }} terms={{ drawName: draw.title, category: categoryFor(`${draw.title} ${draw.category}`), prize: `${draw.title} (${draw.prizeValue})`, entry: draw.entryCost }}
      facts={[[draw.category, Sparkles], ["Pre-launch preview", ShieldCheck], ["Approval pending", CircleAlert]]}
      stats={[{ value: draw.prizeValue, label: "Prize value" }, { value: draw.entryCost, label: "Entry" }, { value: "Pending", label: "Status" }]}
      cta="Explore draw" onCta={() => { play("button"); navigate(draw.path); }}
      note="Approval pending · entries and payments disabled" />} />
  </section>;
}
