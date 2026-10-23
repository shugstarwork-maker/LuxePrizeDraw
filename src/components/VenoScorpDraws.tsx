import { DeckCard } from "./DeckCard";
import { Cpu, MonitorSmartphone, ShieldCheck, Sparkles, Ticket } from "lucide-react";
import { useState } from "react";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { EntryTermsDialog, type EntryPrize } from "./EntryTermsDialog";

// Veno Scorp — confirmed Manchester gaming-PC manufacturer partner.
// Three bundles at three price points. Entry is not open yet: the entry-fee
// button opens the draw terms first, and the final Enter button routes to the
// draw preview until the rules are legally approved.
const bundles = [
  {
    name: "Starter Rig Bundle",
    image: "/prizes/veno-bundle-1.jpg",
    value: "£1,200",
    entry: "£1 entry",
    specs: ["Custom gaming PC · RTX-class graphics", "Gaming keyboard, mouse & headset", "Designed, built & tested by Veno Scorp"],
  },
  {
    name: "Pro Battlestation Bundle",
    image: "/prizes/veno-bundle-2.jpg",
    value: "£2,800",
    entry: "£2 entry",
    specs: ["High-end PC + ultrawide curved monitor", "Full RGB peripheral set included", "Designed, built & tested by Veno Scorp"],
  },
  {
    name: "Ultimate Creator Suite",
    image: "/prizes/veno-bundle-3.jpg",
    value: "£5,500",
    entry: "£3 entry",
    specs: ["Flagship PC, dual monitors & studio mic", "Streaming deck, chair & headset", "Designed, built & tested by Veno Scorp"],
  },
];

export function VenoScorpDraws() {
  const [entering, setEntering] = useState<EntryPrize | null>(null);
  return <section id="veno-scorp" className="border-y border-amber-200/15 bg-black/35 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><Cpu className="h-4 w-4" /> Veno Scorp · tech partner</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Gaming bundle draws.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Three gaming bundles at three price points — every PC designed, built and tested in-house in Manchester by <a href="https://veno-scorp.co.uk/" target="_blank" rel="noreferrer" className="font-bold text-amber-200 underline decoration-amber-200/40 underline-offset-4 transition hover:text-amber-100">Veno Scorp</a>, our confirmed tech partner. Values and entry prices are proposed; entries open only after the rules are legally approved.</p></div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300/10 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-amber-100"><ShieldCheck className="h-3.5 w-3.5" /> 3 bundles · entries pending approval</span>
      </div>
      <RollingCardCarousel items={bundles} getKey={item => item.name} label="Veno Scorp gaming bundle draws" className="mt-9" compactControls renderItem={(bundle) => <DeckCard image={bundle.image} title={bundle.name}
        facts={bundle.specs.map((s) => [s, Cpu] as [string, typeof Cpu])}
        stats={[{ value: bundle.value, label: "Bundle value" }, { value: bundle.entry, label: "Entry" }, { value: "Pending", label: "Draw date" }]}
        cta={bundle.entry} onCta={() => setEntering({ name: bundle.name, value: bundle.value, entry: bundle.entry, partner: "Veno Scorp" })}
        note="Illustrative bundle · value and entry price proposed pending legal approval" />} />
      {entering && <EntryTermsDialog prize={entering} onClose={() => setEntering(null)} />}
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] text-white/40"><MonitorSmartphone className="h-3.5 w-3.5" /> Every bundle ships tested and ready to play, with warranty from Veno Scorp.</p>
      <p className="mt-2 flex items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-wider text-amber-100/70"><Ticket className="h-3.5 w-3.5" /> Free postal entry route available for every draw</p>
    </div>
  </section>;
}
