import { CarFront, Cpu, HeartHandshake, ShieldCheck, ArrowRight, TreePine } from "lucide-react";
import { RollingCardCarousel } from "./RollingCardCarousel";
import { DeckCard } from "./DeckCard";

const navigate = (path: string) => { window.history.pushState({}, "", path); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

const partners = [
  { name: "Veno Scorp", detail: "UK manufacturer of custom-built gaming PCs — designed, built and tested in-house in Manchester, from entry-level bundles to high-end RTX rigs.", status: "Confirmed tech partner", icon: Cpu, tone: "from-violet-400/20 to-fuchsia-400/5" },
  { name: "Moss Prestige Cars", detail: "Specialist prestige car dealership in West Yorkshire — quality hand-picked vehicles with first-class customer service.", status: "Confirmed motoring partner", icon: CarFront, tone: "from-rose-400/20 to-amber-300/5" },
  { name: "Serenity Soul CIC", detail: "Our community interest company partner — the charity at the heart of LuxePrizeDraw, supporting wellbeing and community care.", status: "Charity partner", icon: HeartHandshake, tone: "from-emerald-300/20 to-teal-400/5", path: "/serenity" },
  { name: "Luxe Garden Summer Houses", image: "/prizes/hero-summerhouse.jpg", detail: "A commercial joinery partnership building bespoke Luxe garden summer houses — premium timber garden rooms, crafted to order.", status: "Confirmed joinery partner", icon: TreePine, tone: "from-lime-300/20 to-emerald-400/5" },
];

export function PartnerShowcase() {
  return <section id="partners" className="bg-[#090806] py-10 sm:py-14">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><ShieldCheck className="h-4 w-4" /> Partner showcase</p>
          <h2 className="mt-3 text-4xl font-black sm:text-5xl">The prize-draw network.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">The confirmed partners shaping LuxePrizeDraw Ltd prizes, offers and community impact.</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/[.03] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white/50">Text-only marks · logos on approval</span>
      </div>
      <RollingCardCarousel items={partners} getKey={item => item.name} label="partner showcase" className="mt-8" renderItem={({ name, image, detail, status, icon: Icon, path }) => <DeckCard title={name} image={image}
        facts={[[status, Icon]]}
        cta={path ? "Visit partner page" : undefined} onCta={path ? () => navigate(path) : undefined}
        note="Confirmed partner · text-only mark pending logo approval"><p className="text-xs leading-relaxed text-white/85">{detail}</p></DeckCard>} />
      <p className="mt-5 text-xs leading-relaxed text-white/40">Partner offers, logos, prize supply terms and partner claims are published individually once each partner approves them in writing.</p>
    </div>
  </section>;
}
