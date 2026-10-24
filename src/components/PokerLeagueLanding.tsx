import { Eye, Hand, Crown, Spade, Club, Diamond, Zap } from "lucide-react";

const go = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); };

const TICKER_ITEMS = [
  "New season starts soon — check the season hub",
  "Weekly league: 40-player divisions, top 10 promoted",
  "Hold'em lounge: daily free chips at sign-in",
  "3-Card Brag lounge live in the games arena",
  "Smart HUD: tap any seat for VPIP / PFR reads — same read for everyone",
  "Bad Beat Timeline: your biggest hands clip automatically",
];

const FEATURES = [
  {
    Icon: Eye, title: "Smart HUD intelligence",
    body: "Tap any player's avatar at the table for instant VPIP, PFR and showdown reads. Third-party trackers are banned — everyone gets the same built-in read.",
  },
  {
    Icon: Hand, title: "One-thumb ergonomics",
    body: "Built for phones: landscape tables with a fixed action dock — fold, check/call and a raise slider within one thumb's reach, plus a persistent HUD frame.",
  },
  {
    Icon: Crown, title: "Trophy room & career",
    body: "Climb 10 league divisions, unlock season-engraved trophies and bracelets in your 3D trophy case, and relive your biggest hands on the Bad Beat Timeline.",
  },
];

const LOUNGES = [
  {
    tag: "Tournament & league", title: "Texas Hold'em", href: "/poker", Icon: Spade,
    body: "Six-seat league tables with the weekly division race, Smart HUD reads, tournament ticker and the League Impact debrief after every session.",
  },
  {
    tag: "Classic casino felt", title: "Luxe Blackjack", href: "/blackjack", Icon: Club,
    body: "Beat-the-dealer tables in the classic green-felt lounge — hit, stand, double and split with the same persistent HUD frame as poker.",
  },
  {
    tag: "Pub classic", title: "3-Card Brag", href: "/brag", Icon: Diamond,
    body: "The British classic in the underground lounge — ante and play, blind raises and the fastest three-card reads in the house.",
  },
];

/**
 * Poker league landing page — the free-play league shop window. All routes lead
 * to real screens; every chip figure is free-play with no cash value.
 */
export function PokerLeagueLanding() {
  return (
    <div className="min-h-screen bg-[#08090f] pb-28 text-white">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-amber-200/15 bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_60%)] px-6 pb-20 pt-16 text-center sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/35 bg-amber-300/10 px-5 py-2 text-[11px] font-black uppercase tracking-[.22em] text-amber-200 sm:text-xs">
            <span className="h-2 w-2 animate-ping rounded-full bg-amber-300" /> 100% free-play league ecosystem
          </p>
          <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
            The members' <span className="bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">poker league</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg lg:text-xl">
            Live-dealer presentation, Smart HUD reads on every seat, weekly division races and a trophy room for your career. Virtual chips only — pure skill and bragging rights.
          </p>
          <div className="mx-auto mt-10 flex max-w-xl flex-col gap-4 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => go("/portal")} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-10 py-4 text-base font-black text-black shadow-lg transition active:scale-[.98] sm:text-lg">
              Create your free profile
            </button>
            <button type="button" onClick={() => go("/poker")} className="rounded-xl border border-amber-200/30 bg-white/5 px-10 py-4 text-base font-black text-amber-100 transition hover:border-amber-200/60 sm:text-lg">
              Explore the lounges
            </button>
          </div>
        </div>
      </header>

      {/* Live league ticker */}
      <div className="overflow-hidden border-b border-amber-200/15 bg-black/40 py-3.5">
        <div className="league-marquee flex w-max gap-12 whitespace-nowrap text-[11px] font-black uppercase tracking-[.18em] text-amber-100/60 sm:text-xs">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-amber-300" />{item}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <h2 className="text-center text-3xl font-black tracking-tight sm:text-5xl">Engineered for serious players</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-white/55 sm:text-lg">No microtransactions, no financial barriers — a competitive free-play league with real progression.</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-3xl border border-white/10 bg-white/[.04] p-8 transition hover:border-amber-200/40">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-200/30 bg-amber-300/10 text-amber-200"><f.Icon className="h-7 w-7" /></span>
              <h3 className="mt-5 text-xl font-black text-amber-50 sm:text-2xl">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-base">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Lounges */}
      <section className="border-y border-amber-200/15 bg-black/35 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">The repertoire lounges</h2>
              <p className="mt-3 max-w-2xl text-base text-white/55 sm:text-lg">Jump between the sporting poker lounge, the classic felt and the pub classic — one shared free-play wallet and weekly league.</p>
            </div>
            <span className="text-[11px] font-black uppercase tracking-[.18em] text-amber-200 sm:text-xs">Multiplayer tables run live over WebSockets</span>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {LOUNGES.map((l) => (
              <button key={l.title} type="button" onClick={() => go(l.href)} className="group rounded-3xl border border-white/10 bg-white/[.04] p-8 text-left transition hover:border-amber-200/50 hover:shadow-[0_0_40px_rgba(212,175,55,.12)] active:scale-[.99]">
                <p className="text-[11px] font-black uppercase tracking-[.18em] text-amber-200 sm:text-xs">{l.tag}</p>
                <h3 className="mt-3 flex items-center gap-2.5 text-2xl font-black text-amber-50 sm:text-3xl"><l.Icon className="h-6 w-6 text-amber-300 sm:h-7 sm:w-7" />{l.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-base">{l.body}</p>
                <span className="mt-5 inline-block text-sm font-black tracking-wider text-amber-100 transition group-hover:text-amber-300">Enter the lounge →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Claim stack */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-24">
        <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Claim your starting stack</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/55 sm:text-lg">Your player profile starts with 1,000 free-play chips, a 200-chip daily sign-in, and a seat in the Bronze weekly division.</p>
        <button type="button" onClick={() => go("/portal")} className="mt-8 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-12 py-5 text-base font-black text-black shadow-lg transition active:scale-[.98] sm:text-lg">
          Launch your league dashboard
        </button>
        <p className="mx-auto mt-7 max-w-lg text-xs leading-relaxed text-white/40 sm:text-sm">
          LuxePrizeDraw poker is a 100% free-play social league — no deposits, no wagering, no cash-out, and virtual chips carry no monetary value.
        </p>
      </section>
    </div>
  );
}
