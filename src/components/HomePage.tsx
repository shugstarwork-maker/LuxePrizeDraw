// LuxePrizeDraw homepage — built to the Homepage Strategy & Build Specification.
// Mobile-first, luxury black & gold. Pre-launch honest state: prizes are the
// proposed catalogue ("entries opening soon"), deals launch with approved partners
// only, community figures show £0 until real distributions exist. Nothing invented.
import React from "react";
import { ArrowRight, BadgeCheck, CarFront, Coins, Cpu, Crown, Gamepad2, Handshake, Heart, Palmtree, Scale, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";

const go = (path: string) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

const LIVE_PRIZES = [
  {
    title: "£100,000 Sterling Cash Grant",
    tag: "Headline prize",
    image: "/prizes/hero-cash.jpg",
    blurb: "Direct seed capital in GBP — 0% personal tax, zero equity taken, wired to your new UK company account.",
    value: "£100,000",
  },
  {
    title: "2-Week VIP UK Holiday for Two",
    tag: "5-star experience",
    image: "/prizes/hero-holiday.jpg",
    blurb: "Business-class flights, 5-star suites, 24/7 private chauffeur and a £4,000 Michelin dining credit.",
    value: "£20,000",
  },
  {
    title: "12 Luxury Drops — A Year of Experiences",
    tag: "Monthly drops",
    image: "/prizes/hero-experiences.jpg",
    blurb: "A curated luxury experience landing every month for a year — getaways, hospitality and signature days out.",
    value: "£120,000",
  },
  {
    title: "1kg Fine Gold Bar",
    tag: "Solid gold",
    image: "/prizes/hero-goldbar.jpg",
    blurb: "A full kilogram of 999.9 fine gold, sourced from an accredited refinery with certificate of authenticity and insured delivery.",
    value: "£85,000+",
  },
  {
    title: "Bitcoin Crown — Crypto Windfall",
    tag: "Crypto prize",
    image: "/prizes/hero-bitcoin.jpg",
    blurb: "A headline Bitcoin prize transferred to your verified wallet, with the option to take the full sterling cash equivalent instead.",
    value: "£100,000",
  },
];

const DEAL_CATEGORIES = [
  { icon: CarFront, name: "Luxe Motoring · Moss Prestige Cars", detail: "Prestige vehicle offers and featured stock from our confirmed West Yorkshire dealership partner." },
  { icon: Crown, name: "Luxe Watches & Lifestyle", detail: "Watches, jewellery, gift cards and luxury retail offers." },
  { icon: Cpu, name: "Luxe Tech · Veno Scorp", detail: "Custom gaming PCs and bundles from our confirmed Manchester manufacturer partner." },
  { icon: Palmtree, name: "Luxe Experiences", detail: "Getaways, hospitality and dining where supplier offers are secured." },
];

const PROMISES = [
  { icon: BadgeCheck, title: "Genuine prizes, clear rules", detail: "Every draw publishes its prize details, closing date, entry route and winner-selection method before entries open." },
  { icon: Scale, title: "Transparent prize funding", detail: "Clear cancellation and target rules — what happens if a draw doesn't reach its stated target is published up front." },
  { icon: Heart, title: "Visible community impact", detail: "Committed and actually-distributed amounts are reported separately, with recipients, dates and evidence." },
  { icon: Users, title: "Verified winners & real support", detail: "Winner announcements only with consent, plus accessible customer support and a clear complaints route." },
];

const GAMES = [
  { name: "Luxe Poker League", href: "/poker", icon: "♠", detail: "Free-play weekly leagues, cinematic tables, live multiplayer." },
  { name: "Luxe Challenge League", href: "/challenge", icon: "⚔", detail: "Cinematic chess, Connect Four and draughts in the same weekly league." },
  { name: "Player Portal", href: "/portal", icon: "🏆", detail: "League position, quests, achievements and trophies." },
];

export const HomePage: React.FC = () => (
  <main className="bg-[#0a0805] pb-28 text-white">

    {/* ── A. Hero ── */}
    <section className="relative overflow-hidden px-5 pb-10 pt-12 text-center sm:pt-16">
      <div className="cine-beam" />
      <div className="cine-dust"><span /><span /><span /><span /><span /><span /></div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,.22),transparent_55%)]" />
      <p className="relative text-[10px] font-black uppercase tracking-[.32em] text-amber-200">Luxury · Opportunity · Community</p>
      <h1 className="cine-title relative mx-auto mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">More than a prize draw.</h1>
      <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/65">
        Discover luxury prizes, exclusive partner offers and a new way to support community projects.
      </p>
      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => go("/draws")} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-7 py-3.5 text-sm font-black text-black shadow-[0_8px_36px_rgba(246,201,69,.4)] transition active:scale-95">
          Explore live prizes <ArrowRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => go("/challenge")} className="rounded-full border border-amber-200/40 bg-black/40 px-6 py-3.5 text-sm font-black text-amber-100 transition hover:border-amber-200/80 active:scale-95">Play free games</button>
      </div>
      <p className="relative mx-auto mt-6 max-w-md text-[10px] leading-relaxed text-white/40">
        Clear competition rules · Transparent prize information · Community impact · Pre-launch preview — entries and payments open only after rules are legally approved.
      </p>
      <div className="cine-letterbox cine-img cine-reveal cine-reveal-3 relative mx-auto mt-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-200/25 bg-black/30 shadow-[0_30px_80px_rgba(212,175,55,.22)]"><img src="/prizes/hero-supercar.jpg" alt="Proposed headline prestige car prize" className="w-full" /></div>
    </section>

    {/* ── C. Featured live prizes (proposed catalogue, pre-launch) ── */}
    <section className="cine-reveal cine-reveal-1 px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.25em] text-amber-200">Featured prizes</p>
            <h2 className="mt-2 text-2xl font-black">The launch catalogue</h2>
          </div>
          <button type="button" onClick={() => go("/draws")} className="text-xs font-black text-amber-200 underline underline-offset-4">All draws →</button>
        </div>
        <p className="mt-2 text-xs text-white/50">Entries are not open yet — each draw below shows its confirmed prize detail. Entry price, closing date and entry limits publish with the approved rules before launch.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {LIVE_PRIZES.map((p) => (
            <button key={p.title} type="button" onClick={() => go("/draws")} className="cine-card group overflow-hidden rounded-2xl border border-amber-200/20 bg-gradient-to-b from-[#171106] to-[#0b0704] text-left transition hover:border-amber-200/50 active:scale-[.98]">
              <div className="cine-img relative h-44 overflow-hidden bg-black/40">
                <img src={p.image} alt="" className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-200">{p.tag}</span>
                <span className="absolute bottom-2 right-2 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black text-black">{p.value}</span>
              </div>
              <div className="p-4">
                <b className="block text-sm text-amber-100">{p.title}</b>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">{p.blurb}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-200">View prize <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>

    {/* ── D. Luxe Deals ── */}
    <section className="cine-reveal cine-reveal-2 px-5 py-8">
      <div className="cine-card mx-auto max-w-4xl rounded-[1.75rem] border border-amber-200/25 bg-[linear-gradient(145deg,#1c150b,#0d0904_70%)] p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.25em] text-amber-200"><Handshake className="mr-1 inline h-4 w-4" />Luxe Deals</p>
        <h2 className="mt-2 text-2xl font-black">Partner offers worth visiting for alone</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Genuine offers from participating commercial partners — value even if you never enter a draw.
          Deals go live only once approved by the supplier, with normal price, offer price, expiry and redemption route shown.
          We're finalising our first partner agreements now; nothing is listed until it's approved.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {DEAL_CATEGORIES.map((d) => (
            <div key={d.name} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="flex items-center gap-2 text-sm font-black text-amber-100"><d.icon className="h-4 w-4 text-amber-200" />{d.name}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">{d.detail}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/35">First approved offers coming soon</p>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => go("/credentials")} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-200/40 bg-amber-300/10 px-5 py-3 text-xs font-black text-amber-100 transition hover:border-amber-200/70 active:scale-95">
          Partner with us <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>

    {/* ── E. Community Fund ── */}
    <section className="cine-reveal cine-reveal-3 px-5 py-8">
      <div className="cine-card mx-auto max-w-4xl rounded-[1.75rem] border border-emerald-200/20 bg-[linear-gradient(145deg,#06240f,#0a1206_70%)] p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.25em] text-emerald-200"><Heart className="mr-1 inline h-4 w-4" />Community Fund</p>
        <h2 className="mt-2 text-2xl font-black">Built to give back — transparently</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          A share of future ticket and membership revenue is earmarked for charities, CICs and start-ups.
          We'll always show <b className="text-white/85">committed</b> and <b className="text-white/85">actually distributed</b> amounts separately, with recipients, dates and evidence.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Committed so far", value: "£0" },
            { label: "Distributed so far", value: "£0" },
            { label: "Recipients named", value: "0" },
            { label: "Evidence published", value: "—" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-white/10 bg-black/30 p-3.5 text-center">
              <p className="text-lg font-black text-emerald-100">{m.value}</p>
              <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-white/40">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-white/45">
          £0 today is the honest number — the platform is pre-launch and no ticket revenue exists yet.
          The moment the first distribution is made, it appears here with the recipient and proof.
        </p>
        <button type="button" onClick={() => go("/serenity")} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-5 py-3 text-xs font-black text-emerald-100 transition hover:border-emerald-300/70 active:scale-95">
          See the community programme <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>

    {/* ── F. The Luxe Promise ── */}
    <section className="cine-reveal cine-reveal-4 px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-[10px] font-black uppercase tracking-[.25em] text-amber-200"><ShieldCheck className="mr-1 inline h-4 w-4" />The Luxe Promise</p>
        <h2 className="mt-2 text-center text-2xl font-black">Trust you can check</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {PROMISES.map((t) => (
            <div key={t.title} className="rounded-2xl border border-amber-200/20 bg-gradient-to-b from-[#171106] to-[#0b0704] p-5">
              <t.icon className="h-5 w-5 text-amber-200" />
              <b className="mt-3 block text-sm text-amber-100">{t.title}</b>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">{t.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── G. Games & leagues (secondary) ── */}
    <section className="cine-reveal cine-reveal-5 px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-[10px] font-black uppercase tracking-[.25em] text-amber-200"><Trophy className="mr-1 inline h-4 w-4" />Free to play</p>
        <h2 className="mt-2 text-2xl font-black">Games &amp; weekly leagues</h2>
        <p className="mt-2 text-xs text-white/50">Free-to-play entertainment — virtual chips and league pride only. Separate from any competition or prize-bearing mode.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {GAMES.map((g) => (
            <button key={g.name} type="button" onClick={() => go(g.href)} className="rounded-2xl border border-white/12 bg-white/[.04] p-4 text-left transition hover:border-amber-200/50 active:scale-[.98]">
              <span className="text-2xl">{g.icon}</span>
              <b className="mt-2 block text-sm text-amber-100">{g.name}</b>
              <p className="mt-1 text-[11px] leading-relaxed text-white/55">{g.detail}</p>
            </button>
          ))}
        </div>
      </div>
    </section>

    {/* ── H. Footer links ── */}
    <section className="border-t border-white/10 px-5 py-8">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-6 gap-y-2.5 text-xs font-bold text-white/60 sm:grid-cols-4">
        <button type="button" onClick={() => go("/launch-build")} className="text-left hover:text-amber-200">How it works</button>
        <button type="button" onClick={() => go("/draws")} className="text-left hover:text-amber-200">Prize draws</button>
        <button type="button" onClick={() => go("/serenity")} className="text-left hover:text-amber-200">Community Fund</button>
        <button type="button" onClick={() => go("/credentials")} className="text-left hover:text-amber-200">Partner with us</button>
        <button type="button" onClick={() => go("/standards")} className="text-left hover:text-amber-200">Responsible play</button>
        <button type="button" onClick={() => go("/terms")} className="text-left hover:text-amber-200">Terms &amp; rules</button>
        <button type="button" onClick={() => go("/community")} className="text-left hover:text-amber-200">Community</button>
        <button type="button" onClick={() => go("/economics")} className="text-left hover:text-amber-200">Draw economics</button>
      </div>
      <p className="mx-auto mt-6 flex max-w-4xl items-center gap-1.5 text-[10px] text-white/35"><Coins className="h-3.5 w-3.5 text-amber-200/60" />LuxePrizeDraw Ltd · pre-launch preview · draft rules require UK legal approval before entries open.</p>
    </section>
  </main>
);
