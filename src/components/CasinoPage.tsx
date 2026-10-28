// Casino — a cinematic welcome gate, then every free-play game on one carousel.
import { useState } from "react";
import { Coins, Crown, Dices, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react";
import { DeckCard } from "./DeckCard";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { OnlineMatch, type OnlineGame } from "./OnlineMatch";
import { gameLeagueState, type LeagueGame } from "../lib/gameLeagues";

const go = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

type CasinoGame = { id: string; title: string; kind: string; image: string; href: string; detail: string; players: string; league?: LeagueGame };

export const CASINO_GAMES: readonly CasinoGame[] = [
  { id: "holdem", title: "Texas Hold'em", kind: "Cards", image: "/games/holdem-card.png", href: "/poker", detail: "League tables, rising blinds and weekly divisions", players: "2–6 players" },
  { id: "blackjack", league: "blackjack", title: "Blackjack", kind: "Cards", image: "/games/blackjack-card.png", href: "/blackjack", detail: "Beat the dealer to 21 — dealer stands on 17", players: "You vs the dealer" },
  { id: "brag", league: "brag", title: "3-Card Brag", kind: "Cards", image: "/games/brag-card.png", href: "/brag", detail: "The classic British card game — prial beats all", players: "You vs the table" },
  { id: "chess", league: "chess", title: "Chess", kind: "Board", image: "/games/chess.svg", href: "/chess", detail: "Full legal rules with a 10-minute clock", players: "1v1" },
  { id: "connect4", league: "connect4", title: "Connect Four", kind: "Board", image: "/games/connect-four.svg", href: "/challenge?game=connect4", detail: "Drop discs, line up four — private online rooms", players: "1v1" },
  { id: "draughts", league: "draughts", title: "Draughts", kind: "Board", image: "/games/draughts.svg", href: "/challenge?game=draughts", detail: "Mandatory captures and crowned kings", players: "1v1" },
  { id: "duel", league: "duel", title: "Head-to-Head Duel", kind: "Arcade", image: "/games/duel-neon.svg", href: "/duel", detail: "Quick-fire skill rounds against another player", players: "1v1" },
  { id: "arena", league: "arena", title: "Skill Games Arena", kind: "Arcade", image: "/games/arena-panorama.svg", href: "/arena", detail: "Short skill games that bank league XP", players: "Solo" },
];

const KIND_LABEL: Record<string, string> = { Cards: "Card game", Board: "Board game", Arcade: "Arcade" };

/** Paths that belong to the casino, so navigation can highlight it. */
export const CASINO_PATHS = ["/casino", "/poker", "/blackjack", "/brag", "/chess", "/challenge", "/duel", "/arena", "/arcade", "/lobby", "/league"];

const ONLINE_GAMES: { id: OnlineGame; title: string }[] = [{ id: "chess", title: "Chess" }, { id: "connect4", title: "Connect Four" }, { id: "draughts", title: "Draughts" }];

export function CasinoPage() {
  const [entered, setEntered] = useState(false);
  const [onlineGame, setOnlineGame] = useState<OnlineGame | null>(null);
  if (!entered) return <main className="casino-welcome min-h-screen px-3 py-4 pb-40 text-white">
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-amber-200/40 bg-gradient-to-b from-[#17110a] via-[#0a0805] to-[#050403] shadow-[0_0_70px_rgba(232,187,70,.28)]">
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/15 bg-black/60 px-3 py-3">
        <span className="flex items-center gap-2 rounded-full border border-amber-200/50 bg-[#0d0a06] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-amber-100 shadow-[inset_0_1px_0_rgba(255,230,150,.15)]"><span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-b from-amber-200 to-amber-500 text-[12px] font-black text-black shadow">£</span>Luxe Casino</span>
        <span className="flex items-center gap-1.5 rounded-full border border-amber-200/50 bg-[#0d0a06] px-3 py-2 font-mono text-xs font-black text-amber-100"><Coins className="h-3.5 w-3.5 text-amber-300" />1,000</span>
        <span className="rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 px-4 py-2 text-[11px] font-black uppercase tracking-wide text-black shadow-[0_4px_16px_rgba(232,187,70,.45)]">Bonus</span>
      </div>

      <div className="casino-welcome-rays relative px-4 pb-4 pt-5 text-center">
        <Crown className="mx-auto h-7 w-7 text-amber-300 drop-shadow-[0_2px_10px_rgba(232,187,70,.6)]" />
        <p className="mt-1 font-serif text-[14px] font-black uppercase tracking-[.24em] text-amber-200">Welcome to</p>
        <div className="mt-1 flex items-center justify-center gap-3">
          <span className="casino-welcome-rule" aria-hidden="true" />
          <h1 className="cine-title font-serif text-[2.7rem] font-black uppercase leading-[0.95] tracking-tight" style={{ background: "linear-gradient(180deg,#fff6c4 0%,#f7d768 30%,#d4a017 58%,#8a6308 76%,#f9e07a 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 3px 4px rgba(0,0,0,.8)) drop-shadow(0 6px 22px rgba(232,187,70,.4))" }}>Luxe<br />Casino</h1>
          <span className="casino-welcome-rule" aria-hidden="true" />
        </div>
        <p className="mt-1 text-sm leading-none text-amber-300 drop-shadow-[0_2px_8px_rgba(232,187,70,.6)]">♠</p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[.38em] text-amber-200/80">Play · Win · Get rewarded</p>
      </div>

      <div className="relative mx-3 aspect-[10/12] overflow-hidden rounded-2xl border-2 border-amber-300/60 shadow-[0_0_40px_rgba(232,187,70,.3),inset_0_0_0_1px_rgba(0,0,0,.6)]">
        <img src="/games/casino-welcome-hero.jpg" alt="Gold chips and four aces on a Luxe casino table" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/85" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-2.5 text-[11px] font-black uppercase tracking-wide text-amber-100" style={{ textShadow: "0 1px 3px #000" }}><span>Featured table</span><span>8 games</span></div>
        <div className="absolute inset-x-0 top-[34%] flex flex-col items-center gap-2">
          <span className="rounded-full border border-amber-200/70 bg-black/75 px-4 py-1.5 text-[11px] font-black uppercase tracking-wide text-amber-100 shadow-[0_0_18px_rgba(0,0,0,.7)]">Free-play chips</span>
          <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-amber-200/90 bg-black text-xl text-amber-200 shadow-[0_0_20px_rgba(232,187,70,.5)]">♠</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10 text-center">
          <p className="font-serif text-[1.35rem] font-black uppercase leading-tight tracking-wide text-amber-100" style={{ textShadow: "0 2px 6px #000, 0 0 24px rgba(232,187,70,.5)" }}>Luxe Casino</p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[.3em] text-amber-200/85" style={{ textShadow: "0 1px 3px #000" }}>— The ultimate casino experience —</p>
          <button type="button" onClick={() => setEntered(true)} className="mx-auto mt-3 block w-full max-w-[15rem] rounded-full bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 py-3.5 text-sm font-black uppercase tracking-[.2em] text-black shadow-[0_8px_40px_rgba(232,187,70,.55),inset_0_1px_0_rgba(255,255,255,.6)] transition hover:scale-[1.02] active:scale-[.98]">▶ Enter</button>
        </div>
        <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full border-2 border-amber-200/80 bg-black/80 text-amber-300 shadow-[0_0_16px_rgba(232,187,70,.4)]" aria-hidden="true"><Coins className="h-4.5 w-4.5" /></span>
      </div>

      <div className="flex justify-center gap-2 pb-4 pt-4"><span className="h-1.5 w-8 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(232,187,70,.8)]" /><span className="h-1.5 w-1.5 rounded-full bg-white/30" /><span className="h-1.5 w-1.5 rounded-full bg-white/30" /></div>
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
          facts={[...(g.league ? [[`${gameLeagueState(g.league).tier.name} League`, Crown]] : []), [g.players, Users], [KIND_LABEL[g.kind], Dices]] as [string, LucideIcon][]}
          note={g.detail}
          cta={`Play ${g.title}`}
          onCta={() => go(g.href)}
        />}
      />
      <section className="mt-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-200">Ranked online · two players</p>
        {onlineGame ? <div className="mx-auto mt-4 max-w-md"><OnlineMatch game={onlineGame} onClose={() => setOnlineGame(null)} /></div> : <div className="mt-3 grid gap-2 sm:grid-cols-3">{ONLINE_GAMES.map((g) => <button key={g.id} type="button" onClick={() => setOnlineGame(g.id)} className="rounded-xl border border-amber-200/40 bg-black/40 px-3 py-3 text-xs font-black uppercase tracking-wider text-amber-100 transition hover:border-amber-200">{g.title}</button>)}</div>}
        <p className="mt-3 text-[10px] text-white/40">Ranked games are played against another signed-in player. The free-play boards above are on this device only and are not ranked.</p>
      </section>
    </div>
  </main>;
}
