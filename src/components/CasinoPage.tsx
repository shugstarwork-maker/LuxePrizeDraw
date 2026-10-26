// Casino — a cinematic welcome gate, then every free-play game on one carousel.
import { useState } from "react";
import { Crown, Dices, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import { DeckCard } from "./DeckCard";
import { RollingCardCarousel } from "./RollingCardCarousel";

const go = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

type CasinoGame = { id: string; title: string; kind: string; image: string; href: string; detail: string; players: string };

export const CASINO_GAMES: readonly CasinoGame[] = [
  { id: "holdem", title: "Texas Hold'em", kind: "Cards", image: "/games/holdem-card.png", href: "/poker", detail: "League tables, rising blinds and weekly divisions", players: "2–6 players" },
  { id: "blackjack", title: "Blackjack", kind: "Cards", image: "/games/blackjack-card.png", href: "/blackjack", detail: "Beat the dealer to 21 — dealer stands on 17", players: "You vs the dealer" },
  { id: "brag", title: "3-Card Brag", kind: "Cards", image: "/games/brag-card.png", href: "/brag", detail: "The classic British card game — prial beats all", players: "You vs the table" },
  { id: "chess", title: "Chess", kind: "Board", image: "/games/chess.svg", href: "/chess", detail: "Full legal rules with a 10-minute clock", players: "1v1" },
  { id: "connect4", title: "Connect Four", kind: "Board", image: "/games/connect-four.svg", href: "/challenge?game=connect4", detail: "Drop discs, line up four — private online rooms", players: "1v1" },
  { id: "draughts", title: "Draughts", kind: "Board", image: "/games/draughts.svg", href: "/challenge?game=draughts", detail: "Mandatory captures and crowned kings", players: "1v1" },
  { id: "duel", title: "Head-to-Head Duel", kind: "Arcade", image: "/games/duel-neon.svg", href: "/duel", detail: "Quick-fire skill rounds against another player", players: "1v1" },
  { id: "arena", title: "Skill Games Arena", kind: "Arcade", image: "/games/arena-panorama.svg", href: "/arena", detail: "Short skill games that bank league XP", players: "Solo" },
];

const KIND_LABEL: Record<string, string> = { Cards: "Card game", Board: "Board game", Arcade: "Arcade" };

/** Paths that belong to the casino, so navigation can highlight it. */
export const CASINO_PATHS = ["/casino", "/poker", "/blackjack", "/brag", "/chess", "/challenge", "/duel", "/arena", "/arcade", "/lobby", "/league"];

export function CasinoPage() {
  const [entered, setEntered] = useState(false);
  if (!entered) return <main className="casino-welcome min-h-screen bg-[#070605] px-3 py-4 pb-40 text-white">
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-amber-200/30 bg-gradient-to-b from-[#0d0a06] via-[#070605] to-[#050403] shadow-[0_0_60px_rgba(232,187,70,.18)]">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <span className="flex items-center gap-2 rounded-xl border border-amber-200/35 bg-black/60 px-2.5 py-2 text-[11px] font-black uppercase tracking-wide text-amber-100"><span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-b from-amber-200 to-amber-500 text-[11px] text-black">£</span>Luxe Casino</span>
        <span className="rounded-full border border-amber-200/35 bg-black/60 px-3 py-2 font-mono text-xs font-black text-amber-100">1,000 chips</span>
        <span className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-3 py-2 text-[11px] font-black uppercase text-black">Bonus</span>
      </div>

      <div className="px-4 pb-3 pt-2 text-center">
        <div className="text-2xl text-amber-200">♛</div>
        <p className="font-serif text-[15px] font-black uppercase tracking-[.2em] text-amber-200">Welcome to</p>
        <h1 className="cine-title font-serif text-[2.6rem] font-black uppercase leading-[0.95] tracking-tight" style={{ background: "linear-gradient(180deg,#fff3b0 0%,#f5c542 45%,#b8860b 75%,#f9e07a 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 18px rgba(232,187,70,.35))" }}>Luxe<br />Casino</h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[.38em] text-amber-200/75">Play · Win · Get rewarded</p>
      </div>

      <div className="mx-3 overflow-hidden rounded-2xl border border-amber-200/40 bg-gradient-to-b from-[#16100a] to-black">
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] font-black uppercase tracking-wide text-amber-100"><span>Featured table</span><span>8 games</span></div>
        <div className="relative pb-4 pt-2">
          <div className="flex items-end justify-center gap-1.5">
            {[["A","♠","#f5f5f5"],["A","♥","#e0473a"],["A","♦","#e0473a"],["A","♣","#f5f5f5"]].map(([r, suit, c], i) => <span key={i} className="grid h-20 w-14 -rotate-[8deg] place-items-start rounded-lg border border-amber-200/60 bg-gradient-to-b from-[#1b1b1b] to-black p-1 text-left font-serif text-sm font-black shadow-[0_4px_14px_rgba(0,0,0,.7)]" style={{ color: c, transform: `rotate(${(i - 1.5) * 9}deg) translateY(${Math.abs(i - 1.5) * 4}px)` }}>{r}<span className="text-base leading-none">{suit}</span></span>)}
          </div>
          <div className="relative mx-auto mt-2 h-40 w-[92%]">
            <span className="absolute -left-3 top-3 h-11 w-11 rounded-full border-[5px] border-amber-300/80 bg-[radial-gradient(circle,#2a2a2a,#0b0b0b)] shadow-[0_0_14px_rgba(232,187,70,.5)]" />
            <span className="absolute -right-3 top-3 h-11 w-11 rounded-full border-[5px] border-amber-300/80 bg-[radial-gradient(circle,#2a2a2a,#0b0b0b)] shadow-[0_0_14px_rgba(232,187,70,.5)]" />
            <div className="absolute inset-0 rounded-[50%] border-[3px] border-amber-300/80 bg-[radial-gradient(ellipse_at_center,#222,#070707_70%)] shadow-[0_0_40px_rgba(232,187,70,.4),inset_0_0_30px_rgba(0,0,0,.9)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="rounded-full border border-amber-200/70 bg-black/70 px-4 py-1.5 text-[11px] font-black uppercase tracking-wide text-amber-100">Free-play chips</span>
              <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-amber-200/80 bg-black text-xl text-amber-200">♠</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-5 text-center">
        <p className="font-serif text-xl font-black uppercase tracking-wide text-amber-100">Luxe Casino</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[.3em] text-amber-200/75">The ultimate casino experience</p>
        <button type="button" onClick={() => setEntered(true)} className="mt-4 w-full rounded-2xl bg-gradient-to-b from-amber-200 to-amber-500 py-4 text-sm font-black uppercase tracking-[.2em] text-black shadow-[0_8px_40px_rgba(232,187,70,.45)] transition hover:scale-[1.02]">▶ Enter</button>
        <div className="mt-4 flex justify-center gap-2"><span className="h-1.5 w-8 rounded-full bg-amber-300" /><span className="h-1.5 w-1.5 rounded-full bg-white/30" /><span className="h-1.5 w-1.5 rounded-full bg-white/30" /></div>
      </div>
    </div>
    <p className="mx-auto mt-4 max-w-sm text-center text-[11px] leading-relaxed text-white/55">Free-play only · chips have no cash value</p>
  </main>;
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_55%)] px-4 pb-32 pt-10 text-white">
    <div className="mx-auto max-w-5xl">
      <RollingCardCarousel
        items={CASINO_GAMES}
        getKey={(g) => g.id}
        label="casino game"
        className="mt-4"
        interval={6000}
        renderItem={(g) => <DeckCard
          className="coverflow-draw"
          image={g.image}
          title={g.title}
          facts={[[g.players, Users], [KIND_LABEL[g.kind], Dices]] as [string, LucideIcon][]}
          note={g.detail}
          cta={`Play ${g.title}`}
          onCta={() => go(g.href)}
        />}
      />
    </div>
  </main>;
}
