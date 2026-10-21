import React, { useState } from "react";
import {
  Sparkles, Camera, MapPin, Eye, Maximize2,
  ChevronLeft, ChevronRight, Compass, ShieldCheck
} from "lucide-react";
import dubaiSkylineNight from "../assets/images/dubai_skyline_night_1787855491978.jpg";

export interface ExperienceGalleryPhoto {
  id: string;
  title: string;
  subtitle: string;
  category: "Skyline" | "Lifestyle" | "Architecture" | "Venture & Tech";
  location: string;
  imageUrl: string;
  description: string;
  tag: string;
}

export const EXPERIENCE_GALLERY_ITEMS: ExperienceGalleryPhoto[] = [
  {
    id: "city-1",
    title: "City Lights Skyline",
    subtitle: "A glittering downtown skyline after dark",
    category: "Skyline",
    location: "City Financial District",
    imageUrl: dubaiSkylineNight,
    description: "Towering lights and evening energy — an aspirational glimpse of the city lifestyle that frames the Luxe experience. Preview imagery only.",
    tag: "Iconic Views",
  },
  {
    id: "city-2",
    title: "London & The Thames",
    subtitle: "Historic landmarks, five-star Mayfair & West End nights",
    category: "Lifestyle",
    location: "London, United Kingdom",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85",
    description: "River views, royal parks, Michelin dining and private members clubs in the heart of the UK capital.",
    tag: "Capital Living",
  },
  {
    id: "city-3",
    title: "Paris Landmark Escape",
    subtitle: "Architecture, art and haute cuisine",
    category: "Architecture",
    location: "Paris, France",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=85",
    description: "Candlelit bistros, world-famous galleries and five-star hospitality along the Seine.",
    tag: "Classic Luxury",
  },
  {
    id: "city-4",
    title: "Monaco Riviera Harbour",
    subtitle: "Superyachts, casinos and Grand Prix glamour",
    category: "Venture & Tech",
    location: "Monte Carlo, Monaco",
    imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=85",
    description: "The playground of the Riviera — harbour-front suites, private terraces and Mediterranean sunsets.",
    tag: "Riviera Glamour",
  },
  {
    id: "city-5",
    title: "Maldives Private Villas",
    subtitle: "Over-water villas and crystal lagoons",
    category: "Lifestyle",
    location: "Baa Atoll, Maldives",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    description: "Barefoot luxury with private plunge pools, seaplane arrivals and world-class diving.",
    tag: "Island Luxury",
  },
  {
    id: "city-6",
    title: "New York Skyline Nights",
    subtitle: "Manhattan rooftops and Broadway lights",
    category: "Skyline",
    location: "New York, USA",
    imageUrl: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=85",
    description: "The city that never sleeps — skyline suites, private shopping and skyline dining.",
    tag: "Skyline Living",
  },
];

export const ExperiencePhotoGallery: React.FC<{ onOpenEntry?: () => void }> = ({ onOpenEntry }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activePhoto, setActivePhoto] = useState<ExperienceGalleryPhoto | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const filteredPhotos = selectedCategory === "ALL"
    ? EXPERIENCE_GALLERY_ITEMS
    : EXPERIENCE_GALLERY_ITEMS.filter((p) => p.category === selectedCategory);

  const handleOpenLightBox = (photo: ExperienceGalleryPhoto, index: number) => {
    setActivePhoto(photo);
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setCurrentIndex(nextIdx);
    setActivePhoto(filteredPhotos[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % filteredPhotos.length;
    setCurrentIndex(nextIdx);
    setActivePhoto(filteredPhotos[nextIdx]);
  };

  return (
    <section id="experience-gallery" className="py-20 sm:py-28 relative overflow-hidden bg-neutral-950/80 border-t border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] sm:text-xs uppercase tracking-widest font-bold">
            <Camera className="w-3.5 h-3.5" />
            <span>Discover Your Future Home</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
            The Luxe <span className="font-extrabold text-[#D4AF37]">Experience Gallery</span>
          </h2>

          <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
            From glittering city skylines and five-star escapes to private island villas — glimpse the experiences waiting for our next winner.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
          {["ALL", "Skyline", "Lifestyle", "Architecture", "Venture & Tech"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shrink-0 active:scale-95 ${
                selectedCategory === category
                  ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              {category === "ALL" ? "All Highlights" : category}
            </button>
          ))}
        </div>

        {/* Dynamic Responsive Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => handleOpenLightBox(photo, idx)}
              className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 hover:border-[#D4AF37]/60 shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-[380px] sm:h-[420px]"
            >
              {/* Image with zoom on hover */}
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
                    {photo.tag}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Content overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 space-y-2 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{photo.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-amber-200 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-white/70 line-clamp-2 font-light">
                    {photo.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gallery Footer Note with Entry CTA */}
        <div className="text-center pt-4">
          <p className="text-xs text-white/40 mb-3">
            Winner receives the headline £100,000 prize — Bitcoin or cash — subject to approved rules
          </p>
          <button
            onClick={onOpenEntry}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all hover:border-[#D4AF37]"
          >
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>Claim Your Entry to the £100K Draw</span>
          </button>
        </div>
      </div>

      {/* Interactive Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          {/* Close button */}
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition-all z-50"
          >
            &times;
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-[#D4AF37] hover:text-black border border-white/20 text-white flex items-center justify-center transition-all z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-[#D4AF37] hover:text-black border border-white/20 text-white flex items-center justify-center transition-all z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Modal Container */}
          <div className="max-w-4xl w-full bg-neutral-900 border border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-2xl space-y-0 relative">
            <div className="relative h-72 sm:h-96 md:h-[450px] w-full overflow-hidden bg-black">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/70 text-[#D4AF37] border border-[#D4AF37]/30">
                {activePhoto.tag}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{activePhoto.title}</h3>
                  <p className="text-xs text-[#D4AF37] flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activePhoto.location}</span>
                  </p>
                </div>
                <span className="text-xs text-white/50 font-mono">
                  {currentIndex + 1} / {filteredPhotos.length} Highlights
                </span>
              </div>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light">
                {activePhoto.description}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setActivePhoto(null);
                    if (onOpenEntry) onOpenEntry();
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#e6c352] text-black font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg"
                >
                  Enter To Win This Lifestyle (&pound;220K Package)
                </button>
                <button
                  onClick={() => setActivePhoto(null)}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
