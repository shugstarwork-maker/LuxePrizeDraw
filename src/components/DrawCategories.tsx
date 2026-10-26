// Draws page categories: vehicles, cash, luxe prizes and quick cash draws. Every
// card uses the shared DeckCard + RollingCardCarousel. Nothing here takes entries
// or payments; "Enter now" opens the full terms page only.
import { DeckCard, deckGo } from "./DeckCard";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { CASH_DRAW_PROPOSALS, formatCashEntry } from "./CashPrizesCarousel";
import { Banknote, CarFront, Gem, ShieldCheck, Sparkles, Ticket, Trophy } from "lucide-react";

const vehicles = [
  { name: "2019 BMW M4 Competition Convertible", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1800&q=90", specs: ["3.0L BiTurbo petrol", "450 PS · Automatic DCT", "25,000 miles"] },
  { name: "Audi R8", image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1800&q=90", specs: ["V10 mid-engine", "Quattro all-wheel drive", "Moss Prestige preview"] },
  { name: "Volkswagen Golf R32", image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1800&q=90", specs: ["Classic performance coupé", "Manual or DSG", "Moss Prestige preview"] },
  { name: "Volkswagen Golf MK4", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1800&q=90", specs: ["Iconic hot hatch", "Turbocharged", "Moss Prestige preview"] },
  { name: "Luxe Concept GT", image: "/prizes/hero-supercar.jpg", specs: ["Concept styling", "Placeholder image", "Moss Prestige preview"] },
];

const luxePrizes = [
  { title: "1kg Fine Gold Bar", image: "/prizes/hero-goldbar.jpg", facts: ["999.9 fine gold", "Or cash equivalent", "Tracked fulfilment"], value: "1kg gold", equivalent: "Cash equivalent on request" },
  { title: "Diamond Collection", image: undefined, facts: ["Certified stones", "Or cash equivalent", "Insured delivery"], value: "Diamonds", equivalent: "Cash equivalent on request" },
];

// Short quick draws: prize is paid out when the pool fills. Fees are shown, not charged.
const quickDraws = [
  { id: "quick-10p", entry: "10p", prize: 250, minTickets: 10 },
  { id: "quick-25p", entry: "25p", prize: 500, minTickets: 10 },
  { id: "quick-50p", entry: "50p", prize: 750, minTickets: 5 },
];

const money = (v: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

// Same moving banner as the cash section; winners are only shown once draws have completed.
function WinnersBanner({ category }: { category: string }) {
  const line = `LATEST WINNERS · ${category.toUpperCase()} · NO COMPLETED DRAWS YET · `;
  return <div className="cash-banner" aria-label={`Latest winners for ${category}: none published yet`}>
    <div className="cash-banner__track"><span>{line.repeat(3)}</span><span>{line.repeat(3)}</span></div>
  </div>;
}

function CategoryHeader({ eyebrow, title, intro, icon: Icon }: { eyebrow: string; title: string; intro: string; icon: typeof Sparkles }) {
  return <header className="max-w-3xl">
    <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><Icon className="h-4 w-4" aria-hidden="true" /> {eyebrow}</p>
    <h2 className="mt-3 text-4xl font-black sm:text-5xl">{title}</h2>
    <p className="mt-4 text-sm leading-relaxed text-white/60">{intro}</p>
  </header>;
}

const terms = () => deckGo("/terms");

export function VehicleCategory() {
  return <section id="moss-prestige-cars" className="border-y border-amber-200/15 bg-black/35 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <WinnersBanner category="Moss Prestige Cars" />
      <div className="mt-9"><CategoryHeader eyebrow="Moss Prestige Cars" title="Prestige vehicle draws." intro="Top-end sports cars for the Moss Prestige vehicle draws. Photos are stand-ins until real vehicle photography is supplied." icon={CarFront} /></div>
      <RollingCardCarousel items={vehicles} getKey={(v) => v.name} label="Moss Prestige Cars" className="mt-9" compactControls
        renderItem={(v) => <DeckCard image={v.image} title={v.name}
          facts={v.specs.map((s) => [s, CarFront] as [string, typeof CarFront])}
          stats={[{ value: "Cash only", label: "Entry" }, { value: "TBC", label: "Prize" }, { value: "Preview", label: "Status" }]}
          cta="Enter now" onCta={terms}
          note="Cash only · entries not yet open · terms apply" />} />
    </div>
  </section>;
}

export function CashCategory() {
  return <section id="cash-draws" className="border-y border-emerald-200/15 bg-[#010c08]/70 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <WinnersBanner category="Cash" />
      <div className="mt-9"><CategoryHeader eyebrow="Cash only" title="Cash prize draws." intro="Cash prizes only. Every draw shows its entry fee and prize; prize amounts are shown in full before entry." icon={Banknote} /></div>
      <RollingCardCarousel items={CASH_DRAW_PROPOSALS} getKey={(p) => p.id} label="Cash prize draws" className="mt-9" compactControls
        renderItem={(p, index) => <DeckCard title={p.title} image={p.image}
          facts={[[`Entry ${formatCashEntry(p.entryPence)}`, Ticket], ["CASH ONLY", Banknote], [`Draw ${index + 1} of ${CASH_DRAW_PROPOSALS.length}`, Trophy]]}
          stats={[{ value: money(p.valueGBP), label: "Prize" }, { value: formatCashEntry(p.entryPence), label: "Entry" }, { value: "Preview", label: "Status" }]}
          cta="Enter now" onCta={terms}
          note="Cash only · preview · entries disabled until licensed" />} />
    </div>
  </section>;
}

export function LuxePrizesCategory() {
  return <section id="luxe-prizes" className="border-y border-amber-200/15 bg-black/35 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <WinnersBanner category="Luxe Prizes" />
      <div className="mt-9"><CategoryHeader eyebrow="Luxe prizes" title="Gold and diamonds." intro="Each prize shows its cash equivalent. Winners may take the item or its cash equivalent." icon={Gem} /></div>
      <RollingCardCarousel items={luxePrizes} getKey={(p) => p.title} label="Luxe prizes" className="mt-9" compactControls
        renderItem={(p) => <DeckCard image={p.image} title={p.title}
          facts={p.facts.map((s) => [s, ShieldCheck] as [string, typeof ShieldCheck])}
          stats={[{ value: p.value, label: "Prize" }, { value: p.equivalent, label: "Cash equivalent" }, { value: "Preview", label: "Status" }]}
          cta="Enter now" onCta={terms}
          note={p.image ? "Preview · entries not yet open" : "Image to be supplied · preview"} />} />
    </div>
  </section>;
}

export function QuickDrawsCategory() {
  return <section id="quick-draws" className="border-y border-emerald-200/15 bg-[#010c08]/70 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <WinnersBanner category="Quick Draws" />
      <div className="mt-9"><CategoryHeader eyebrow="Quick cash draws" title="Up to £750, fast draws." intro="Cash only. Each draw closes when enough tickets are sold; administration and processing fees come out of the pool before the prize. Minimum purchase applies." icon={Trophy} /></div>
      <RollingCardCarousel items={quickDraws} getKey={(d) => d.id} label="Quick cash draws" className="mt-9" compactControls
        renderItem={(d) => <DeckCard title={`${money(d.prize)} Quick Draw`}
          facts={[[`Entry ${d.entry}`, Ticket], [`Min ${d.minTickets} tickets`, Ticket], ["CASH ONLY", Banknote]]}
          stats={[{ value: money(d.prize), label: "Prize" }, { value: d.entry, label: "Entry" }, { value: `${d.minTickets}+`, label: "Min tickets" }]}
          cta="Enter now" onCta={terms}
          note="Preview · buy now unavailable until licensed" />} />
    </div>
  </section>;
}
