import { DeckCard } from "./DeckCard";
import { CarFront, Gauge, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { useState } from "react";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { EntryTermsDialog, type EntryPrize } from "./EntryTermsDialog";

// Moss Prestige Cars — confirmed West Yorkshire dealership partner.
// Three cars planned for the first motoring draws. Entry is not open yet:
// the Enter button carries the proposed entry price and routes to the draw
// preview until the rules are legally approved.
const vehicles = [
  {
    name: "Audi R8 V10 Plus",
    image: "/prizes/moss-car-1.jpg",
    tone: "from-rose-500/20 via-black to-amber-400/15",
    value: "£120,000",
    entry: "£5 entry",
    specs: ["5.2L V10 · 610 PS", "Quattro · S tronic", "Supplied by Moss Prestige Cars"],
  },
  {
    name: "Nissan GT-R Prestige",
    image: "/prizes/moss-car-2.jpg",
    tone: "from-sky-500/20 via-black to-violet-500/15",
    value: "£85,000",
    entry: "£3 entry",
    specs: ["3.8L twin-turbo V6", "565 PS · AWD", "Supplied by Moss Prestige Cars"],
  },
  {
    name: "Porsche 911 Carrera S",
    image: "/prizes/moss-car-3.jpg",
    tone: "from-emerald-500/20 via-black to-amber-300/15",
    value: "£105,000",
    entry: "£4 entry",
    specs: ["3.0L twin-turbo flat-six", "450 PS · PDK", "Supplied by Moss Prestige Cars"],
  },
];

export function PrestigeCarsDraws() {
  const [entering, setEntering] = useState<EntryPrize | null>(null);
  return <section id="prestige-cars" className="border-y border-amber-200/15 bg-black/35 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><Sparkles className="h-4 w-4" /> Moss Prestige Cars · vehicle partner</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Prestige car prize draws.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Three prestige cars, three draws — each supplied by <a href="https://www.mossprestige.co.uk/" target="_blank" rel="noreferrer" className="font-bold text-amber-200 underline decoration-amber-200/40 underline-offset-4 transition hover:text-amber-100">Moss Prestige Cars</a>, our confirmed West Yorkshire dealership partner. Values and entry prices are proposed; entries open only after the rules are legally approved.</p></div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-amber-100"><ShieldCheck className="h-3.5 w-3.5" /> 3 cars · entries pending approval</span>
      </div>
      <RollingCardCarousel items={vehicles} getKey={item => item.name} label="Moss Prestige Cars prize draws" className="mt-9" compactControls renderItem={(vehicle) => <DeckCard image={vehicle.image} title={vehicle.name}
        facts={vehicle.specs.map((s) => [s, CarFront] as [string, typeof CarFront])}
        stats={[{ value: vehicle.value, label: "Car value" }, { value: vehicle.entry, label: "Entry" }, { value: "Pending", label: "Draw date" }]}
        cta={vehicle.entry} onCta={() => setEntering({ name: vehicle.name, value: vehicle.value, entry: vehicle.entry, partner: "Moss Prestige Cars" })}
        note="Illustrative image · value and entry price proposed pending legal approval" />} />
      {entering && <EntryTermsDialog prize={entering} onClose={() => setEntering(null)} />}
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] text-white/40"><Gauge className="h-3.5 w-3.5" /> Every car is inspected, valeted and hand-over prepared by Moss Prestige Cars before the winner collects.</p>
      <p className="mt-2 flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-wider text-amber-100/70"><Ticket className="h-3.5 w-3.5" /> Free postal entry route available for every draw</p>
    </div>
  </section>;
}
