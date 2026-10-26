// Casino — every free-play game (cards, board games, arcade) on one carousel.
import { Crown, Dices, ShieldCheck, Users, type LucideIcon } from "lucide-react";
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
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_55%)] px-4 pb-32 pt-8 text-white">
    <div className="mx-auto max-w-5xl">
      <header className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-amber-200/40 bg-black/40 shadow-[0_0_40px_rgba(232,187,70,.25)]"><Crown className="h-6 w-6 text-amber-200" /></span>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[.24em] text-amber-200">Members' free-play casino</p>
        <h1 className="mt-2 font-serif text-4xl font-black text-amber-100 sm:text-6xl">Luxe Casino</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">Cards, board games and arcade — every game in one place. Win to bank league XP and climb the weekly divisions.</p>
      </header>
      <RollingCardCarousel
        items={CASINO_GAMES}
        getKey={(g) => g.id}
        label="casino game"
        className="mt-8"
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
      <p className="mx-auto mt-8 flex max-w-2xl items-start gap-2 rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/55"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />Free-play only: chips and points have no cash value and can't be bought, sold or withdrawn. Set session reminders any time under Responsible play.</p>
    </div>
  </main>;
}
