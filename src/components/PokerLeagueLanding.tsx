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
      <header className="relative overflow-hidden border-b border-amber-200/15 bg-[radial-gradient(circle_at_top,#3a2a08,#0a0805_60%)] px-6 pb-16 pt-14 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/35 bg-amber-300/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[.2em] text-amber-200">
            <span className="h-2 w-2 animate-ping rounded-full bg-amber-300" /> 100% free-play league ecosystem
          </p>
          <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            The members' <span className="bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">poker league</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            Live-dealer presentation, Smart HUD reads on every seat, weekly division races and a trophy room for your career. Virtual chips only — pure skill and bragging rights.
          </p>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => go("/portal")} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-8 py-4 text-sm font-black text-black shadow-lg transition active:scale-[.98]">
              Create your free profile
            </button>
            <button type="button" onClick={() => go("/poker")} className="rounded-xl border border-amber-200/30 bg-white/5 px-8 py-4 text-sm font-black text-amber-100 transition hover:border-amber-200/60">
              Explore the lounges
            </button>
          </div>
        </div>
      </header>

      {/* Live league ticker */}
      <div className="overflow-hidden border-b border-amber-200/15 bg-black/40 py-3">
        <div className="league-marquee flex w-max gap-12 whitespace-nowrap text-[10px] font-black uppercase tracking-[.18em] text-amber-100/60">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2"><Zap className="h-3 w-3 text-amber-300" />{item}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl">Engineered for serious players</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/55">No microtransactions, no financial barriers — a competitive free-play league with real progression.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-2xl border border-white/10 bg-white/[.04] p-6 transition hover:border-amber-200/40">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-amber-200/30 bg-amber-300/10 text-amber-200"><f.Icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-base font-black text-amber-50">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Lounges */}
      <section className="border-y border-amber-200/15 bg-black/35 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">The repertoire lounges</h2>
              <p className="mt-2 max-w-lg text-sm text-white/55">Jump between the sporting poker lounge, the classic felt and the pub classic — one shared free-play wallet and weekly league.</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[.18em] text-amber-200">Multiplayer tables run live over WebSockets</span>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {LOUNGES.map((l) => (
              <button key={l.title} type="button" onClick={() => go(l.href)} className="group rounded-2xl border border-white/10 bg-white/[.04] p-6 text-left transition hover:border-amber-200/50 hover:shadow-[0_0_40px_rgba(212,175,55,.12)] active:scale-[.99]">
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-200">{l.tag}</p>
                <h3 className="mt-2 flex items-center gap-2 text-xl font-black text-amber-50"><l.Icon className="h-5 w-5 text-amber-300" />{l.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/55">{l.body}</p>
                <span className="mt-4 inline-block text-[11px] font-black tracking-wider text-amber-100 transition group-hover:text-amber-300">Enter the lounge →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Claim stack */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Claim your starting stack</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/55">Your player profile starts with 1,000 free-play chips, a 200-chip daily sign-in, and a seat in the Bronze weekly division.</p>
        <button type="button" onClick={() => go("/portal")} className="mt-7 rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-10 py-4 text-sm font-black text-black shadow-lg transition active:scale-[.98]">
          Launch your league dashboard
        </button>
        <p className="mx-auto mt-6 max-w-md text-[10px] leading-relaxed text-white/40">
          LuxePrizeDraw poker is a 100% free-play social league — no deposits, no wagering, no cash-out, and virtual chips carry no monetary value.
        </p>
      </section>
    </div>
  );
}
