import React from "react";
import { Plane, ShoppingBag, Sparkles, Users } from "lucide-react";

const packages = [
  {
    title: "Eight-Person Luxury Escape",
    label: "Group holiday package",
    icon: Users,
    accent: "from-sky-400 via-blue-500 to-indigo-700",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=90",
    description: "A two-week five-star escape designed for a group of up to eight guests, with return flights and a £50,000 shared spending allowance.",
    highlights: ["Up to 8 guests", "Return flights included", "14 nights, five-star accommodation", "£50,000 shared spending allowance"],
  },
  {
    title: "Two-Week Shopping Escape",
    label: "Luxury city-break package",
    icon: ShoppingBag,
    accent: "from-rose-400 via-fuchsia-500 to-violet-700",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=90",
    description: "A two-week five-star overseas shopping escape with return flights and a £50,000 shopping budget for the winner and invited guests.",
    highlights: ["Return flights included", "14 nights, five-star accommodation", "£50,000 shopping budget", "Curated luxury itinerary"],
  },
];

export const ExperiencePrizes: React.FC = () => (
  <section id="experience-prizes" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-br from-[#11101a] via-[#241321] to-[#080d1c] py-20 sm:py-28">
    <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[140px]" />
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="interactive-badge inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f6d46b]"><Sparkles className="h-3.5 w-3.5" /> Lifestyle prize experiences</div>
        <h2 className="mt-4 text-3xl font-light tracking-tight text-white sm:text-5xl">Choose your <span className="font-bold text-[#D4AF37]">dream escape</span></h2>
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">Two luxury travel packages designed around the experience you want to share. Final eligibility, destination, and prize terms are subject to the published competition rules.</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {packages.map((item) => {
          const Icon = item.icon;
          return <article key={item.title} className="group overflow-hidden rounded-3xl border border-white/10 bg-black/35 shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/55">
            <div className="relative h-72 overflow-hidden"><img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className={`absolute inset-0 bg-gradient-to-t ${item.accent} opacity-45 mix-blend-color`} /><div className="absolute left-5 top-5"><span className="interactive-badge inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur"><Icon className="h-3.5 w-3.5 text-[#f6d46b]" /> {item.label}</span></div></div>
            <div className="p-6 sm:p-7"><h3 className="text-2xl font-bold text-white">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-white/65">{item.description}</p><ul className="mt-6 grid gap-3 sm:grid-cols-2">{item.highlights.map((highlight) => <li key={highlight} className="flex items-center gap-2 text-xs font-semibold text-white/80"><Plane className="h-3.5 w-3.5 text-[#D4AF37]" />{highlight}</li>)}</ul></div>
          </article>;
        })}
      </div>
    </div>
  </section>
);
