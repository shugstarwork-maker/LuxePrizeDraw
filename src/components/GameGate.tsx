import { useEffect, useState, type ElementType } from "react";
import { ArrowRight, ChevronRight, Crown, Dice5, Layers, Medal, ShieldCheck, Spade, Swords, Trophy } from "lucide-react";

const navigate = (href: string, hash?: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (hash) window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  else window.scrollTo({ top: 0, behavior: "smooth" });
};

type GateGame = { name: string; detail: string; icon: ElementType };

/** Cinematic gateway page: full-screen doors with a single Enter button that opens the game carousel. */
function GameGate({ kind }: { kind: "challenge" | "cards" }) {
  const isCards = kind === "cards";
  const [ready, setReady] = useState(false);
  useEffect(() => { const id = window.setTimeout(() => setReady(true), 60); return () => clearTimeout(id); }, []);

  const title = isCards ? <>The Card<br />Room</> : <>The Challenge<br />Hall</>;
  const kicker = isCards ? "Card games · free-play" : "Challenge games · free-play";
  const blurb = isCards
    ? "Poker, 3 Card Brag and Luxe Blackjack — every table dealt from a committed, provably fair deck."
    : "Chess, Connect Four and Draughts — real rules engines, cinematic boards, bragging rights only.";
  const crest = isCards ? <Spade className="gate-crest-icon" /> : <Swords className="gate-crest-icon" />;
  const games: GateGame[] = isCards
    ? [{ name: "Texas Hold'em", detail: "Weekly league tables", icon: Crown }, { name: "3 Card Brag", detail: "The British classic", icon: Layers }, { name: "Luxe Blackjack", detail: "Beat the dealer, 3:2", icon: Spade }]
    : [{ name: "Chess", detail: "Full rules · 10-min clock", icon: Medal }, { name: "Connect Four", detail: "Disc drops & win glow", icon: Dice5 }, { name: "Draughts", detail: "Mandatory captures", icon: Trophy }];
  const enter = () => navigate(isCards ? "/poker" : "/play", isCards ? undefined : "games");

  return (
    <main className={`gate-page${ready ? " gate-page--ready" : ""}`}>
      <div className="gate-page__halo" aria-hidden="true" />
      <section className="gate-page__panel">
        <div className="gate-page__crest">{crest}</div>
        <p className="gate-page__kicker">{kicker}</p>
        <h1 className="gate-page__title">{title}</h1>
        <p className="gate-page__blurb">{blurb}</p>

        <ul className="gate-page__games">
          {games.map((g) => (
            <li key={g.name} className="gate-page__game"><g.icon className="h-4 w-4 text-amber-200" /><span><b>{g.name}</b><small>{g.detail}</small></span><ChevronRight className="ml-auto h-4 w-4 text-white/30" /></li>
          ))}
        </ul>

        <button type="button" onClick={enter} className="gate-page__enter">
          Enter <ArrowRight className="h-5 w-5" />
        </button>
        <p className="gate-page__note"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Free-play only · No deposits, cash wagering or cash-out</p>
      </section>
    </main>
  );
}

export function ChallengeGamesGate() { return <GameGate kind="challenge" />; }
export function CardGamesGate() { return <GameGate kind="cards" />; }
