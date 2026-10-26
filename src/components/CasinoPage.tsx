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
  if (!entered) return <main className="casino-welcome min-h-screen bg-[#070605] px-4 py-6 text-white">
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-xl border border-amber-200/35 bg-black/60 px-3 py-2 text-xs font-black uppercase tracking-wide text-amber-100">£ Luxe Casino</span>
        <span className="rounded-full border border-amber-200/35 bg-black/60 px-4 py-2 font-mono text-sm font-black text-amber-100">1,000 chips</span>
      </div>

      <div className="pt-2 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center text-3xl text-amber-200">♛</div>
        <p className="mt-1 text-[11px] font-black uppercase tracking-[.35em] text-amber-200/80">Welcome to</p>
        <h1 className="cine-title mt-1 font-serif text-4xl font-black leading-none text-amber-100 drop-shadow-[0_4px_24px_rgba(232,187,70,.35)] sm:text-5xl">Luxe Casino</h1>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[.4em] text-amber-200/70">Play · Win · Get rewarded</p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-amber-200/45 bg-gradient-to-b from-[#1a1206] to-black shadow-[0_0_60px_rgba(232,187,70,.2)]">
        <div className="flex items-center justify-between border-b border-amber-200/20 px-5 py-3 text-xs font-black uppercase tracking-wider text-amber-100">
          <span>Featured games</span><span>8 games</span>
        </div>
        <div className="px-6 pb-6 pt-8">
          <div className="relative mx-auto flex h-44 items-center justify-center rounded-[50%] border-2 border-amber-300/70 bg-[radial-gradient(ellipse_at_center,#2a2a2a,#0b0b0b_70%)] shadow-[0_0_40px_rgba(232,187,70,.35),inset_0_0_30px_rgba(0,0,0,.8)]">
            <div className="flex flex-col items-center gap-3">
              <span className="rounded-full border border-amber-200/60 bg-black/50 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-amber-100">Free-play chips</span>
              <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-amber-200/70 bg-black text-2xl text-amber-200">♠</span>
            </div>
          </div>
          <p className="mt-6 text-center font-serif text-2xl font-black uppercase tracking-wide text-amber-100">Cards · Board · Arcade</p>
          <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-[.3em] text-amber-200/70">The ultimate casino experience</p>
          <button type="button" onClick={() => setEntered(true)} className="mx-auto mt-6 block w-full rounded-2xl bg-gradient-to-b from-amber-200 to-amber-500 py-4 text-base font-black uppercase tracking-[.2em] text-black shadow-[0_8px_40px_rgba(232,187,70,.45)] transition hover:scale-[1.02]">Enter</button>
        </div>
      </div>

      <div className="flex justify-center gap-2 pt-1"><span className="h-1.5 w-10 rounded-full bg-amber-300" /><span className="h-1.5 w-1.5 rounded-full bg-white/30" /><span className="h-1.5 w-1.5 rounded-full bg-white/30" /></div>
      <p className="text-center text-[11px] leading-relaxed text-white/55">Free-play only · chips have no cash value</p>
    </div>
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
