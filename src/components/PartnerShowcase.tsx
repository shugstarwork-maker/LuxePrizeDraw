import { Building2, CarFront, Gift, ShieldCheck, Sparkles } from "lucide-react";

const partners = [
  { name: "Veno Corp Gaming", detail: "Gaming operations", status: "Showcase partner", icon: Building2, tone: "from-violet-400/20 to-fuchsia-400/5" },
  { name: "Luxe Gaming Bundles", detail: "Free-ticket game bundles", status: "Showcase partner", icon: Gift, tone: "from-amber-300/20 to-orange-400/5" },
  { name: "Moss Prestige", detail: "Performance vehicle prizes", status: "Vehicle supply partner", icon: CarFront, tone: "from-rose-400/20 to-amber-300/5" },
  { name: "Selfridges", detail: "Luxury retail prize concepts", status: "Prospective partner", icon: Sparkles, tone: "from-yellow-300/20 to-lime-300/5" },
];

export function PartnerShowcase() {
  return <section id="partners" className="bg-[#090806] py-16 sm:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><ShieldCheck className="h-4 w-4" /> Partner showcase</p>
          <h2 className="mt-3 text-4xl font-black sm:text-5xl">The prize-draw network.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">A demo view of the brands and businesses intended to shape Luxe Prize Draws experiences.</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/[.03] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white/50">Text-only demo marks</span>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {partners.map(({ name, detail, status, icon: Icon, tone }) => <article key={name} className={`rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${tone} p-5`}>
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-black/35 text-amber-200"><Icon className="h-5 w-5" /></span>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-white/45">{status}</p>
          <h3 className="mt-2 text-2xl font-black leading-tight">{name}</h3>
          <p className="mt-3 text-sm text-white/60">{detail}</p>
        </article>)}
      </div>
      <p className="mt-5 text-xs leading-relaxed text-white/40">Demo only. “Prospective partner” identifies an intended relationship, not a confirmed partnership. Official logos, prize offers, terms and partner claims are published only after written approval.</p>
    </div>
  </section>;
}
