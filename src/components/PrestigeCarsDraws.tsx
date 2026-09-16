import { CarFront, ShieldCheck, Sparkles } from "lucide-react";

const vehicles = [
  { name: "R8", image: "/prizes/supercar.svg", tone: "from-rose-500/20 via-black to-amber-400/15" },
  { name: "R32", image: "/prizes/velocity.svg", tone: "from-sky-500/20 via-black to-violet-500/15" },
  { name: "MK4", image: "/prizes/all-terrain.svg", tone: "from-emerald-500/20 via-black to-amber-300/15" },
];

export function PrestigeCarsDraws() {
  return <section id="prestige-cars" className="border-y border-amber-200/15 bg-black/35 py-20 sm:py-28">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><Sparkles className="h-4 w-4" /> Prestige Cars partnership</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Performance prize draws.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Prestige Cars has made the R8, R32 and MK4 available for upcoming prize-draw consideration. Vehicle specification, draw dates and official terms will be published before any entry opens.</p></div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-amber-100"><ShieldCheck className="h-4 w-4" /> Partner vehicle preview</span>
      </div>
      <div className="mt-9 grid gap-5 md:grid-cols-3">{vehicles.map((vehicle) => <article key={vehicle.name} className={`group overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br ${vehicle.tone} p-3 shadow-2xl`}><div className="relative h-52 overflow-hidden rounded-[1.5rem]"><img src={vehicle.image} alt={`${vehicle.name} vehicle prize preview`} className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" /><span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-xs font-black text-amber-100"><CarFront className="h-4 w-4" /> {vehicle.name}</span></div><div className="p-4"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Prestige Cars vehicle</p><h3 className="mt-2 text-2xl font-black">{vehicle.name} prize draw</h3><p className="mt-2 text-sm leading-relaxed text-white/60">Added to the upcoming partner vehicle lineup. Full vehicle details are confirmed with the prize announcement.</p></div></article>)}</div>
    </div>
  </section>;
}
