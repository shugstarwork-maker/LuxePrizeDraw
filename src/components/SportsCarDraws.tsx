import { ArrowLeft, CarFront, Gauge, Sparkles, Ticket, Timer } from "lucide-react";

const draws = [
  { name: "Ferrari 488 GTB", image: "/prizes/supercar.svg", engine: "3.9L twin-turbo V8", power: "670 PS", acceleration: "0–62 mph in 3.0 sec", drive: "7-speed dual-clutch", tone: "from-red-500/25 via-black to-amber-300/10" },
  { name: "Audi R8 V10 Performance", image: "/prizes/velocity.svg", engine: "5.2L naturally aspirated V10", power: "620 PS", acceleration: "0–62 mph in 3.1 sec", drive: "7-speed S tronic", tone: "from-sky-500/25 via-black to-violet-400/10" },
  { name: "Porsche 911 Carrera S", image: "/prizes/all-terrain.svg", engine: "3.0L twin-turbo flat-six", power: "450 PS", acceleration: "0–62 mph in 3.7 sec", drive: "8-speed PDK", tone: "from-yellow-300/25 via-black to-orange-400/10" },
];

export function SportsCarDraws() {
  return <section className="min-h-screen bg-[#08090f] py-12 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <button onClick={() => { window.history.pushState({}, "", "/draws"); window.dispatchEvent(new PopStateEvent("popstate")); }} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/60 transition hover:text-amber-100"><ArrowLeft className="h-4 w-4" /> All prize draws</button>
      <header className="mt-8 rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-amber-300/15 via-black to-red-500/10 p-7 sm:p-10">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><CarFront className="h-4 w-4" /> Sports car draw collection</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Choose your dream drive.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">Explore the current sports-car draw concepts, vehicle specifications and prize imagery. Vehicle availability, draw dates, entry routes and official rules are confirmed only when a draw opens.</p>
      </header>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">{draws.map((draw) => <article key={draw.name} className={`overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br ${draw.tone} shadow-2xl`}>
        <div className="relative h-60 overflow-hidden"><img src={draw.image} alt={`${draw.name} prize draw concept`} className="h-full w-full object-cover opacity-85" /><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-amber-200/35 bg-black/60 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-100">Draw preview</span></div>
        <div className="p-6"><h2 className="text-2xl font-black">{draw.name}</h2><div className="mt-5 grid grid-cols-2 gap-3 text-xs"><Spec label="Engine" value={draw.engine} /><Spec label="Power" value={draw.power} /><Spec label="Performance" value={draw.acceleration} /><Spec label="Transmission" value={draw.drive} /></div><div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-black uppercase tracking-wider text-white/45"><span className="inline-flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-amber-200" /> Details pending</span><span className="inline-flex items-center gap-1.5"><Ticket className="h-3.5 w-3.5 text-amber-200" /> Entry not open</span></div></div>
      </article>)}</div>
      <p className="mt-6 text-xs leading-relaxed text-white/40"><Sparkles className="mr-1 inline h-3.5 w-3.5" /> Demo catalogue only. Specifications are indicative vehicle information and do not constitute a prize offer, partnership claim or confirmed availability.</p>
    </div>
  </section>;
}

function Spec({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/40"><Gauge className="h-3 w-3" /> {label}</p><p className="mt-1.5 font-bold leading-snug text-white/80">{value}</p></div>;
}
