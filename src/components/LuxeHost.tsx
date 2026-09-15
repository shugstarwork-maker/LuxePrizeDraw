import React, { useState } from "react";
import { MessageCircleHeart, Sparkles } from "lucide-react";

const JOKES = [
  "Why did the raffle ticket bring a map? It wanted to find its way to the grand prize.",
  "Why did the prize draw go to school? It wanted better odds at a bright future.",
  "What did one ticket say to the other? I hope we both get drawn to the same party.",
  "Why was the leaderboard calm? Everyone knew there was room to rise.",
];

export const LuxeHost: React.FC = () => {
  const [jokeIndex, setJokeIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(false);

  const nextJoke = () => {
    setIsWaving(true);
    setJokeIndex((index) => (index + 1) % JOKES.length);
    window.setTimeout(() => setIsWaving(false), 500);
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#201506] via-[#111217] to-[#08090c] p-6 shadow-[0_20px_70px_rgba(212,175,55,0.12)] sm:flex-row sm:items-center sm:p-8">
        <div className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border border-[#D4AF37]/40 bg-gradient-to-br from-[#f4cf5c] to-[#9c6814] text-5xl shadow-[0_0_32px_rgba(212,175,55,0.35)] ${isWaving ? "animate-bounce" : ""}`} aria-hidden="true">🎩</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f8d778]"><Sparkles className="h-3 w-3" /> Meet the Prize Host</span><span className="text-xs text-emerald-300">Here for the good vibes</span></div>
          <h2 className="mt-3 text-2xl font-bold text-white">A little fun while you play</h2>
          <p aria-live="polite" className="mt-2 max-w-2xl text-base leading-relaxed text-white/70">“{JOKES[jokeIndex]}”</p>
          <button type="button" onClick={nextJoke} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f8d778] transition hover:bg-[#D4AF37] hover:text-black active:scale-95"><MessageCircleHeart className="h-4 w-4" /> Tell me another</button>
        </div>
      </div>
    </section>
  );
};
