import { DeckCard, deckGo } from "./DeckCard";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { Check, CircleAlert, Plane, Sparkles } from "lucide-react";
import { DrawDetailsPanel } from "./DrawDetailsPanel";
import { DrawValueHighlights } from "./DrawValueHighlights";

const destinations = [
  { name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=90" },
  { name: "Monaco", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1800&q=90" },
  { name: "Maldives", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=90" },
  { name: "New York", image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1800&q=90" },
  { name: "Milan", image: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1800&q=90" },
  { name: "London", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1800&q=90" },
  { name: "Ibiza", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=90" },
  { name: "Santorini", image: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1800&q=90" },
  { name: "Mykonos", image: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=1800&q=90" },
];

export const HOLIDAY_PACKAGE = { proposedValueGBP: 50000, spendingMoneyGBP: 25000,
  inclusions: ["£25,000 spending money", "Five-star hotel", "Limousine transfers", "Business-class flights"] };

export function LuxuryHolidaysSection() {
  return <section className="luxury-holidays relative overflow-hidden border-y border-amber-200/15 py-14 sm:py-20"><div className="luxury-holidays__light luxury-holidays__light--one" /><div className="luxury-holidays__light luxury-holidays__light--two" /><div className="luxury-note luxury-note--one" aria-hidden="true">£50</div><div className="luxury-note luxury-note--two" aria-hidden="true">£50</div><div className="relative mx-auto max-w-5xl px-4 sm:px-6"><header className="max-w-3xl"><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-amber-200"><Plane className="h-4 w-4" /> Luxury Holidays</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Luxe Holiday Package of Your Choice</h2><p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">Explore example destinations for one proposed £50,000 holiday package, including £25,000 spending money. Destination choice, travel availability and final inclusions require approval; these are not separate prizes and are not independently verified.</p></header><DrawValueHighlights entry="Pending approval" prize="£50,000" prizeLabel="Proposed total package value" /><div className="holiday-ticket-target"><span>Ticket target</span><strong>Pending approval</strong><small>Confirmed ticket quantity will appear here once approved rules are published.</small></div><div className="mt-7"><RollingCardCarousel items={destinations} getKey={item => item.name} label="holiday destination" className="mt-7" renderItem={(destination) => <DeckCard image={destination.image} title={destination.name}
      facts={HOLIDAY_PACKAGE.inclusions.map((item) => [item, Check] as [string, typeof Check])}
      stats={[{ value: "£50,000", label: "Package value" }, { value: "£25,000", label: "Spending money" }, { value: "Pending", label: "Status" }]}
      cta="View package" onCta={() => deckGo("/draws")}
      note="Example destination · approval pending" />} /></div><p className="mt-8 flex gap-2 rounded-2xl border border-amber-200/20 bg-black/35 p-4 text-xs leading-relaxed text-amber-50"><CircleAlert className="h-4 w-4 shrink-0 text-amber-200" />Images show illustrative destination examples for a single proposed holiday package of your choice. All inclusions and the £50,000 total valuation are approval pending, not confirmed bookings or independently verified prices. No booking, entry, entitlement, price, cash alternative, or charity contribution is created here until final approved rules are published.</p></div></section>;
}
