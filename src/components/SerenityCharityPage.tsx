import { ArrowLeft, ArrowRight, CheckCircle2, Flower2, HandCoins, Heart, HeartHandshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useState } from "react";

const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

const PILLARS = [
  { icon: Heart, title: "Emotional wellbeing", detail: "Serenity Souls centres calm, dignity and being heard — support built around the person, not the process." },
  { icon: Users, title: "Community connection", detail: "Bringing people together so nobody facing a hard season has to face it alone." },
  { icon: Sparkles, title: "Everyday hope", detail: "Small, practical acts of care that restore confidence and open the door to brighter days." },
];

const COMMITMENTS = [
  { icon: ShieldCheck, title: "Written approval first", detail: "Nothing about Serenity Souls is published as fact until it comes from charity-approved materials." },
  { icon: HandCoins, title: "Reconciled donations only", detail: "The raised total activates only when a documented donation arrangement and reporting process are live." },
  { icon: CheckCircle2, title: "Evidenced impact", detail: "Milestones, reach and beneficiary stories appear only with current, verifiable evidence." },
];

export function SerenityCharityPage() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return <main className="serenity-page min-h-screen px-4 pb-28 py-8 text-white sm:py-12"><div className="mx-auto max-w-5xl">
    <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-100/80 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Home</button>

    <section className="serenity-hero mt-6 overflow-hidden rounded-[2rem] border border-emerald-200/20 p-7 text-center sm:p-12">
      <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200/30 bg-emerald-200/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-emerald-100"><Flower2 className="h-3.5 w-3.5" /> Our charity partner</p>
      <div className="mx-auto mt-6 grid h-24 w-24 place-items-center rounded-full border border-emerald-200/40 bg-[radial-gradient(circle_at_32%_26%,#d9fbe8,#34d399_55%,#065f46)] shadow-[0_0_50px_rgba(52,211,153,.4)]"><Flower2 className="h-12 w-12 text-emerald-950" /></div>
      <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-black leading-[.95] sm:text-7xl">Serenity <span className="text-emerald-200">Souls</span></h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">The charity at the heart of LuxePrizeDraw. A dedicated space for Serenity Souls’ approved story, verified impact and support needs. You’re not alone. We care.</p>
      <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
        <button disabled className="save-serenity-heart relative grid h-32 w-32 shrink-0 place-items-center rounded-[44%] border border-amber-100/70 bg-[radial-gradient(circle_at_30%_24%,#fff5be,#d5a528_58%,#825207)] text-center shadow-[0_0_42px_rgba(212,175,55,.5)] disabled:cursor-not-allowed"><Heart className="absolute h-24 w-24 fill-amber-300/55 text-amber-100" /><span className="relative z-10 -rotate-6 font-serif text-lg font-bold italic text-black">Save<br />Serenity</span></button>
        <div className="text-left"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Donation status</p><p className="mt-2 text-3xl font-black text-amber-100">Awaiting reconciliation</p><p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">The donation button and raised total activate only after Serenity Souls’ written approval, registration details, payment arrangement, and reconciled reporting process are configured.</p></div>
      </div>
    </section>

    <section className="mt-8 grid gap-5 md:grid-cols-3">
      {PILLARS.map((p) => <article key={p.title} className="serenity-card"><p.icon className="h-6 w-6 text-emerald-200" /><h2>{p.title}</h2><p>{p.detail}</p></article>)}
    </section>

    <section className="mt-8 grid gap-5 md:grid-cols-3">
      <article className="serenity-card"><Sparkles className="h-6 w-6 text-emerald-200" /><h2>What Serenity Souls has achieved</h2><p>Verified milestones, service reach and beneficiary stories will appear here once supplied and approved by Serenity Souls.</p></article>
      <article className="serenity-card"><Heart className="h-6 w-6 text-rose-200" /><h2>Why support is needed</h2><p>Funding position and continuity information will be published only with current, charity-approved evidence.</p></article>
      <article className="serenity-card"><CheckCircle2 className="h-6 w-6 text-amber-200" /><h2>How support helps</h2><p>Community-fund impact will be shown with confirmed allocation, timing, and reporting arrangements.</p></article>
    </section>

    <section className="mt-8 rounded-[2rem] border border-emerald-200/20 bg-gradient-to-br from-emerald-950/55 to-black/35 p-7 sm:p-10">
      <button onClick={() => setDetailsOpen((value) => !value)} className="flex w-full items-center justify-between text-left"><span><span className="block text-xs font-black uppercase tracking-[.2em] text-emerald-200">About Serenity Souls</span><span className="mt-2 block text-3xl font-black">A little about the charity</span></span><span className="rounded-full border border-emerald-200/30 px-3 py-2 text-xs font-black text-emerald-100">{detailsOpen ? "Close" : "Read more"}</span></button>
      {detailsOpen && <div className="mt-6 border-t border-emerald-200/15 pt-6 text-sm leading-relaxed text-white/70"><p>Serenity Souls’ mission, charitable registration number, geography served, programmes, and confirmed donation allocation will be published here directly from charity-approved materials.</p><p className="mt-3">This page intentionally does not estimate outcomes or show a simulated raised amount. Once a documented arrangement is live, the counter will display reconciled donations only.</p></div>}
    </section>

    <section className="mt-8 rounded-[2rem] border border-white/10 bg-black/30 p-7 sm:p-10">
      <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-200">Transparency commitment</p>
      <h2 className="mt-3 text-3xl font-black">Support must be evidenced.</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {COMMITMENTS.map((c) => <div key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-4"><c.icon className="h-5 w-5 text-emerald-200" /><b className="mt-2 block text-sm text-white">{c.title}</b><p className="mt-1 text-[11px] leading-relaxed text-white/55">{c.detail}</p></div>)}
      </div>
      <p className="mt-6 max-w-3xl leading-relaxed text-white/65">Before this page presents achievements, financial urgency or donations, LuxePrizeDraw Ltd will obtain Serenity Souls’ written approval, a current impact summary, and a documented donation arrangement. Until then, this is an information page only and does not collect or transfer donations.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <button onClick={() => navigate("/community")} className="rounded-xl bg-emerald-200 px-5 py-3 text-xs font-black uppercase tracking-wider text-emerald-950">Explore community causes</button>
        <button onClick={() => navigate("/draws")} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/30 px-5 py-3 text-xs font-black uppercase tracking-wider text-emerald-100 transition hover:border-emerald-200/60">See prizes that fund the cause <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>
    </section>

    <p className="mt-8 text-center text-[10px] uppercase tracking-[.25em] text-white/35"><HeartHandshake className="mr-1 inline h-3.5 w-3.5 text-emerald-200/70" /> Luxury with purpose · Community first</p>
  </div></main>;
}
