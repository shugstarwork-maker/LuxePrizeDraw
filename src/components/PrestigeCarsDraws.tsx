import { DeckCard } from "./DeckCard";
import { CarFront, ShieldCheck, Sparkles } from "lucide-react";
import { RollingCardCarousel } from "./RollingCardCarousel";

const vehicles = [
  { name: "2019 BMW M4 Competition Convertible", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1800&q=90", tone: "from-sky-500/25 via-black to-cyan-300/15", specs: ["3.0L BiTurbo petrol", "450 PS · Automatic DCT", "25,000 miles"], listingUrl: "https://www.mossprestige.co.uk/used-bmw-m4-huddersfield-west-yorkshire-8128976", entryCost: "Pending approval", charityRaised: "Pending reconciliation" },
  { name: "R8", image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1800&q=90", tone: "from-rose-500/20 via-black to-amber-400/15", entryCost: "Pending approval", charityRaised: "Pending reconciliation" },
  { name: "R32", image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1800&q=90", tone: "from-sky-500/20 via-black to-violet-500/15", entryCost: "Pending approval", charityRaised: "Pending reconciliation" },
  { name: "MK4", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1800&q=90", tone: "from-emerald-500/20 via-black to-amber-300/15", entryCost: "Pending approval", charityRaised: "Pending reconciliation" },
];

export function PrestigeCarsDraws() {
  return <section id="prestige-cars" className="border-y border-amber-200/15 bg-black/35 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><Sparkles className="h-4 w-4" /> Moss Prestige vehicle partner</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Performance prize draws.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60"><a href="https://www.mossprestige.co.uk/" target="_blank" rel="noreferrer" className="font-bold text-amber-200 underline decoration-amber-200/40 underline-offset-4 transition hover:text-amber-100">Moss Prestige</a> is the vehicle-supply partner for the R8, R32 and MK4 prize draws. Vehicle specification, draw dates and official terms will be published before any entry opens.</p></div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-amber-100"><ShieldCheck className="h-3.5 w-3.5" /> Partner vehicle preview</span>
      </div>
      <RollingCardCarousel items={vehicles} getKey={item => item.name} label="Moss Prestige vehicle preview" className="mt-9" compactControls renderItem={(vehicle) => <DeckCard image={vehicle.image} title={vehicle.name} terms={{ drawName: vehicle.name, category: "vehicle", prize: vehicle.name, entry: vehicle.entryCost }}
        facts={(vehicle.specs ?? ["Added to the partner vehicle lineup", "Full details confirmed with prize announcement", "Pre-launch preview"]).map((s) => [s, CarFront] as [string, typeof CarFront])}
        stats={[{ value: vehicle.entryCost, label: "Entry" }, { value: "TBC", label: "Prize details" }, { value: "Pending", label: "Charity raised" }]}
        cta={vehicle.listingUrl ? "View listing" : undefined} onCta={vehicle.listingUrl ? () => window.open(vehicle.listingUrl, "_blank", "noreferrer") : undefined}
        note="Illustrative vehicle image · pre-launch preview" />} />
    </div>
  </section>;
}
