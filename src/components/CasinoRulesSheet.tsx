// Rules & fair-play sheet for the card lounge games. Every rule stated here is what
// src/games/blackjack.ts and src/games/brag.ts actually implement.
import { createPortal } from "react-dom";
import { ShieldCheck, X } from "lucide-react";

type Section = { title: string; items: string[] };

export const CASINO_RULES: Record<"blackjack" | "brag", { title: string; sections: Section[] }> = {
  blackjack: {
    title: "Luxe Blackjack",
    sections: [
      { title: "Aim", items: ["Finish closer to 21 than the dealer without going over.", "Number cards count their value, picture cards count 10, and an ace counts 11 or 1 — whichever helps."] },
      { title: "Play", items: [
        "Place your bet, then you and the dealer get two cards each. One of the dealer's cards stays face down.",
        "Hit to take a card, Stand to keep your total, or Double on your first two cards: your bet doubles and you take exactly one more card.",
        "Go over 21 and you bust — the bet is lost whatever the dealer does.",
      ] },
      { title: "Dealer", items: ["The dealer draws until 17 or more and stands on all 17s, soft or hard.", "Cards come from a four-deck shoe, reshuffled when about one deck is left."] },
      { title: "Payouts", items: ["Win: 1 to 1.", "Blackjack (an ace and a ten-value card in your first two): 3 to 2.", "Tie with the dealer: push — your bet is returned.", "Your blackjack against a dealer blackjack is a push; a dealer blackjack beats any other hand."] },
    ],
  },
  brag: {
    title: "3-Card Brag",
    sections: [
      { title: "Aim", items: ["Beat the dealer's three-card hand."] },
      { title: "Play", items: [
        "Place your ante. You and the dealer each get three cards; the dealer's stay face down.",
        "Look at your hand, then Play (add a bet equal to your ante) or Fold (lose your ante).",
      ] },
      { title: "Hand rankings, best first", items: [
        "Prial — three of a kind. Three 3s is the best prial of all.",
        "Running flush — three cards in sequence, same suit.",
        "Run — three cards in sequence.",
        "Flush — three cards of the same suit.",
        "Pair — two cards of the same rank.",
        "High card — the highest card decides.",
      ] },
      { title: "Dealer and payouts", items: [
        "The dealer must hold Queen-high or better to qualify.",
        "Dealer doesn't qualify: your ante wins 1 to 1 and your play bet is returned.",
        "Dealer qualifies and you win: ante and play bet both pay 1 to 1. Equal hands push.",
        "Ante bonus when you win: prial +4×, running flush +3×, run +1× your ante.",
        "Every hand is dealt from a freshly shuffled 52-card deck.",
      ] },
    ],
  },
};

export const FAIR_PLAY: string[] = [
  "Free-play only. Chips have no cash value and can't be bought, sold, transferred or withdrawn.",
  "Every shuffle uses your device's cryptographic random generator — the same process for every player, every hand.",
  "The table bots decide only from their own cards. They never see yours or the cards still to come.",
  "Each table has a maximum bet of ten times its minimum, so stakes stay sensible.",
  "Over 18s only. Take a break any time — set reminders or a cool-off under Responsible play.",
];

const go = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); };

export function CasinoRulesSheet({ game, onClose }: { game: "blackjack" | "brag"; onClose: () => void }) {
  const rules = CASINO_RULES[game];
  if (typeof document === "undefined") return null;
  return createPortal(<div className="draw-terms" role="dialog" aria-modal="true" aria-labelledby="casino-rules-title" onClick={onClose}>
    <div className="draw-terms__sheet" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-200">How to play</p>
          <h2 id="casino-rules-title" className="mt-1 text-xl font-black text-white">{rules.title} rules</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close rules" className="rounded-lg bg-white/10 p-2"><X className="h-4 w-4" /></button>
      </div>
      {rules.sections.map((s) => <section key={s.title} className="mt-4">
        <h3 className="text-sm font-black text-amber-100">{s.title}</h3>
        <ul className="mt-1.5 space-y-1.5">{s.items.map((i) => <li key={i} className="text-xs leading-relaxed text-white/70">· {i}</li>)}</ul>
      </section>)}
      <section className="mt-5 rounded-xl border border-emerald-300/25 bg-emerald-400/5 p-3">
        <h3 className="flex items-center gap-1.5 text-sm font-black text-emerald-100"><ShieldCheck className="h-4 w-4" />Fair play & protections</h3>
        <ul className="mt-1.5 space-y-1.5">{FAIR_PLAY.map((i) => <li key={i} className="text-xs leading-relaxed text-white/70">· {i}</li>)}</ul>
        <button type="button" onClick={() => { onClose(); go("/responsible-play"); }} className="mt-2 text-[11px] font-bold text-amber-200 underline underline-offset-2">Responsible play settings</button>
      </section>
    </div>
  </div>, document.body);
}
