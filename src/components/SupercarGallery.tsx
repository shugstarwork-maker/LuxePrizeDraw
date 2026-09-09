import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Gauge, Maximize2, Trophy } from "lucide-react";

type Supercar = {
  title: string;
  subtitle: string;
  imageUrl: string;
  detail: string;
  tag: string;
};

const SUPERCARS: Supercar[] = [
  {
    title: "Lamborghini Huracán",
    subtitle: "V10 precision in a Dubai night setting",
    imageUrl: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=90",
    detail: "A sharp, naturally aspirated V10 silhouette built for unmistakable supercar theatre.",
    tag: "V10 Icon",
  },
  {
    title: "Ferrari 488",
    subtitle: "Turbocharged Italian performance",
    imageUrl: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1600&q=90",
    detail: "A low-slung mid-engine profile that captures the drama of modern Italian supercars.",
    tag: "Track Heritage",
  },
  {
    title: "Midnight Grand Tourer",
    subtitle: "A grand touring statement for the open road",
    imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=90",
    detail: "Long-distance luxury meets a performance-focused driving experience.",
    tag: "Grand Touring",
  },
  {
    title: "Dubai Supercar Collection",
    subtitle: "A celebration of design, speed, and engineering",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=90",
    detail: "Explore the visual language that makes modern supercars instantly recognisable.",
    tag: "Performance Culture",
  },
];

export const SupercarGallery: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeCar = activeIndex === null ? null : SUPERCARS[activeIndex];
  const selectPrevious = () => setActiveIndex((index) => index === null ? null : (index - 1 + SUPERCARS.length) % SUPERCARS.length);
  const selectNext = () => setActiveIndex((index) => index === null ? null : (index + 1) % SUPERCARS.length);

  return (
    <section id="supercar-gallery" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-br from-[#090909] via-[#17110c] to-[#05070d] py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-red-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-28 bottom-12 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-[150px]" />
      <div className="relative mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f6d46b]">
            <Gauge className="h-3.5 w-3.5" /> Supercar gallery
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-5xl">The <span className="font-bold text-[#D4AF37]">Supercar Collection</span></h2>
          <p className="text-sm leading-relaxed text-white/60 sm:text-base">A visual celebration of elite performance cars, including Lamborghini and Ferrari models. Brand names are used for identification only; this gallery is not affiliated with or endorsed by their owners.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {SUPERCARS.map((car, index) => (
            <button key={car.title} type="button" onClick={() => setActiveIndex(index)} className="group relative min-h-[340px] overflow-hidden rounded-3xl border border-white/10 bg-black text-left shadow-2xl transition hover:border-[#D4AF37]/60">
              <img src={car.imageUrl} alt={car.title} loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="absolute left-5 top-5 rounded-full border border-[#D4AF37]/40 bg-black/55 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f6d46b] backdrop-blur">{car.tag}</div>
              <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur transition group-hover:bg-[#D4AF37] group-hover:text-black"><Maximize2 className="h-4 w-4" /></div>
              <div className="absolute inset-x-0 bottom-0 p-6"><p className="text-xs font-medium text-[#f6d46b]">{car.subtitle}</p><h3 className="mt-2 text-2xl font-bold text-white">{car.title}</h3></div>
            </button>
          ))}
        </div>
      </div>

      {activeCar && activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label={activeCar.title}>
          <button type="button" onClick={() => setActiveIndex(null)} className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">Close</button>
          <button type="button" onClick={selectPrevious} className="absolute left-4 z-10 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-[#D4AF37] hover:text-black sm:left-8" aria-label="Previous car"><ChevronLeft className="h-6 w-6" /></button>
          <button type="button" onClick={selectNext} className="absolute right-4 z-10 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:bg-[#D4AF37] hover:text-black sm:right-8" aria-label="Next car"><ChevronRight className="h-6 w-6" /></button>
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-[#D4AF37]/40 bg-neutral-950 shadow-2xl">
            <img src={activeCar.imageUrl} alt={activeCar.title} referrerPolicy="no-referrer" className="h-[42vh] w-full object-cover sm:h-[58vh]" />
            <div className="space-y-3 p-6 sm:p-8"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37]"><Trophy className="h-4 w-4" /> {activeCar.tag}</div><h3 className="text-2xl font-bold text-white sm:text-3xl">{activeCar.title}</h3><p className="max-w-2xl text-sm leading-relaxed text-white/70">{activeCar.detail}</p></div>
          </div>
        </div>
      )}
    </section>
  );
};
