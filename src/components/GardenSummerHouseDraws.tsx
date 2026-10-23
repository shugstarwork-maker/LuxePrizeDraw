import { DeckCard } from "./DeckCard";
import { Hammer, ShieldCheck, Sparkles, Ticket, TreePine } from "lucide-react";
import { useState } from "react";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { EntryTermsDialog, type EntryPrize } from "./EntryTermsDialog";

// Luxe Garden Summer Houses — confirmed joinery partnership.
// Three bespoke builds at three price points. Entry is not open yet: the
// entry-fee button opens the draw terms first, and the final Enter button
// routes to the draw preview until the rules are legally approved.
const houses = [
  {
    name: "The Contempora",
    image: "/prizes/summerhouse-1.jpg",
    value: "£15,000",
    entry: "£2 entry",
    specs: ["Contemporary glass-fronted garden room", "Approx. 4m × 3m bespoke build", "Built for you by our joinery partner"],
  },
  {
    name: "The Pavilion",
    image: "/prizes/summerhouse-2.jpg",
    value: "£25,000",
    entry: "£3 entry",
    specs: ["Panoramic windows + wraparound deck", "Approx. 5m × 4m bespoke build", "Built for you by our joinery partner"],
  },
  {
    name: "The Grand Retreat",
    image: "/prizes/summerhouse-3.jpg",
    value: "£40,000",
    entry: "£5 entry",
    specs: ["Bifold doors, terrace & fire pit", "Approx. 6m × 5m flagship build", "Built for you by our joinery partner"],
  },
];

export function GardenSummerHouseDraws() {
  const [entering, setEntering] = useState<EntryPrize | null>(null);
  return <section id="summer-houses" className="border-y border-amber-200/15 bg-black/35 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><TreePine className="h-4 w-4" /> Luxe Garden Summer Houses · joinery partner</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Bespoke summer house draws.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Three bespoke garden summer houses at three price points — each designed and built for the winner through our confirmed commercial joinery partnership. Values and entry prices are proposed; entries open only after the rules are legally approved.</p></div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-amber-100"><ShieldCheck className="h-3.5 w-3.5" /> 3 builds · entries pending approval</span>
      </div>
      <RollingCardCarousel items={houses} getKey={item => item.name} label="Luxe garden summer house draws" className="mt-9" compactControls renderItem={(house) => <DeckCard image={house.image} title={house.name}
        facts={house.specs.map((s) => [s, TreePine] as [string, typeof TreePine])}
        stats={[{ value: house.value, label: "Build value" }, { value: house.entry, label: "Entry" }, { value: "Pending", label: "Draw date" }]}
        cta={house.entry} onCta={() => setEntering({ name: house.name, value: house.value, entry: house.entry, partner: "Luxe Garden Summer Houses" })}
        note="Illustrative design · value and entry price proposed pending legal approval" />} />
      {entering && <EntryTermsDialog prize={entering} onClose={() => setEntering(null)} />}
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] text-white/40"><Hammer className="h-3.5 w-3.5" /> Each summer house is surveyed, built and finished on the winner's site by the joinery partner.</p>
      <p className="mt-2 flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-wider text-amber-100/70"><Ticket className="h-3.5 w-3.5" /> Free postal entry route available for every draw</p>
    </div>
  </section>;
}
