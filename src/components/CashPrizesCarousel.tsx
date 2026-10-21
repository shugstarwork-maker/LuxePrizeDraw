import { RollingCardCarousel } from "./RollingCardCarousel";
import { Banknote, CircleAlert, Ticket } from "lucide-react";
import { DeckCard, deckGo } from "./DeckCard";

// Proposed display catalogue only; this does not create competitions or change entry gates.
export const CASH_DRAW_PROPOSALS = [
  { id: "cash-preview-1p", entryPence: 1, valueGBP: 1000, title: "£1,000 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-2p", entryPence: 2, valueGBP: 1250, title: "£1,250 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-3p", entryPence: 3, valueGBP: 1500, title: "£1,500 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-5p", entryPence: 5, valueGBP: 2000, title: "£2,000 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-8p", entryPence: 8, valueGBP: 2500, title: "£2,500 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-10p", entryPence: 10, valueGBP: 3000, title: "£3,000 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-15p", entryPence: 15, valueGBP: 3500, title: "£3,500 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-20p", entryPence: 20, valueGBP: 4000, title: "£4,000 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-30p", entryPence: 30, valueGBP: 5000, title: "£5,000 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-35p", entryPence: 35, valueGBP: 6000, title: "£6,000 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-50p", entryPence: 50, valueGBP: 7500, title: "£7,500 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-55p", entryPence: 55, valueGBP: 10000, title: "£10,000 Cash Prize", image: "/prizes/lower-cash-notes.jpg" },
  { id: "cash-preview-80p", entryPence: 80, valueGBP: 12500, title: "£12,500 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-100p", entryPence: 100, valueGBP: 15000, title: "£15,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-120p", entryPence: 120, valueGBP: 20000, title: "£20,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-165p", entryPence: 165, valueGBP: 25000, title: "£25,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-210p", entryPence: 210, valueGBP: 35000, title: "£35,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-290p", entryPence: 290, valueGBP: 50000, title: "£50,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-360p", entryPence: 360, valueGBP: 75000, title: "£75,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-460p", entryPence: 460, valueGBP: 100000, title: "£100,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-725p", entryPence: 725, valueGBP: 150000, title: "£150,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
  { id: "cash-preview-1000p", entryPence: 1000, valueGBP: 250000, title: "£250,000 Cash Prize", image: "/prizes/higher-cash-notes.jpg" },
 ];

const formatGBP = (v: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export const formatCashEntry = (pence: number) => pence < 100 ? `${pence}p` : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: pence % 100 === 0 ? 0 : 2 }).format(pence / 100);

export function CashPrizesCarousel() {
  return <section className="relative overflow-hidden border-y border-emerald-200/15 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,.15),transparent_32%),rgba(1,12,8,.72)] py-14 sm:py-20"><div className="mx-auto max-w-5xl px-4 sm:px-6"><div className="cash-banner" aria-hidden="true"><div className="cash-banner__track"><span>CASH PRIZES · CASH PRIZES · CASH PRIZES · CASH PRIZES · CASH PRIZES ·&nbsp;</span><span>CASH PRIZES · CASH PRIZES · CASH PRIZES · CASH PRIZES · CASH PRIZES ·&nbsp;</span></div></div><header className="max-w-3xl"><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.22em] text-emerald-200"><Banknote className="h-4 w-4" /> Cash prizes</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Cash, presented clearly.</h2><p className="mt-5 text-sm leading-relaxed text-white/65 sm:text-base">Explore 22 proposed cash draws with entries from 1p to £10. Approval pending — entries and payments remain disabled. Prize values and prices are proposals, subject to approved rules and funding.</p></header><RollingCardCarousel items={CASH_DRAW_PROPOSALS} getKey={item => item.id} label="cash prize" className="mt-7" renderItem={(prize) => <DeckCard image={prize.image} title={prize.title}
      facts={[[`${formatCashEntry(prize.entryPence)} proposed entry`, Ticket], ["Cash prize proposal", Banknote], ["Approval pending", CircleAlert]]}
      stats={[{ value: formatGBP(prize.valueGBP), label: "Proposed prize" }, { value: formatCashEntry(prize.entryPence), label: "Entry" }, { value: "Pending", label: "Status" }]}
      cta="View preview" onCta={() => deckGo("/launch-build")}
      note="Preview only · entries & payments disabled" />} /></div></section>;
}
