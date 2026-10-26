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
  if (!entered) return <main className="casino-welcome relative min-h-screen overflow-hidden bg-black text-white">
    <img src="/prizes/original-poker-lounge.png" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
    <div className="relative flex min-h-screen flex-col items-center justify-end px-6 pb-44 text-center">
      <h1 className="cine-title mx-auto mb-8 max-w-xl text-4xl font-black leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,.9)] sm:text-5xl">Welcome to Luxe Casino</h1>
      <button type="button" onClick={() => setEntered(true)} className="rounded-full border border-amber-200/60 bg-gradient-to-b from-amber-200 to-amber-500 px-12 py-4 text-sm font-black uppercase tracking-[.2em] text-black shadow-[0_0_60px_rgba(232,187,70,.45)] transition hover:scale-[1.03]">Enter</button>
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
