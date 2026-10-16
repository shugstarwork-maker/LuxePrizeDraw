import React, { useEffect, useState } from "react";
import { MessageCircleHeart, Sparkles, Volume2 } from "lucide-react";

const JOKES = [
  "Why did the raffle ticket bring a map? It wanted to find its way to the grand prize.",
  "Why did the prize draw go to school? It wanted better odds at a bright future.",
  "What did one ticket say to the other? I hope we both get drawn to the same party.",
  "Why was the leaderboard calm? Everyone knew there was room to rise.",
];

// Callum's voice preference: male Scottish / GB English where the platform
// offers it, then any en-GB voice, then the device default. Callum never
// fails to speak — he just falls back gracefully.
function pickCallumsVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const scottish = voices.find((voice) => /scottish/i.test(`${voice.name} ${voice.lang}`));
  const maleGb = voices.find(
    (voice) => voice.lang.replace("_", "-").startsWith("en-GB") && /male|daniel|george|ryan|brian|thomas/i.test(voice.name),
  );
  const anyGb = voices.find((voice) => voice.lang.replace("_", "-").startsWith("en-GB"));
  return scottish ?? maleGb ?? anyGb ?? null;
}

export const LuxeHost: React.FC = () => {
  const [jokeIndex, setJokeIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Warm the voice list early — many platforms populate it asynchronously.
  useEffect(() => {
    if (!speechSupported) return;
    window.speechSynthesis.getVoices();
    const warm = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", warm);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", warm);
  }, [speechSupported]);

  const nextJoke = () => {
    if (speaking) window.speechSynthesis.cancel();
    setSpeaking(false);
    setIsWaving(true);
    setJokeIndex((index) => (index + 1) % JOKES.length);
    window.setTimeout(() => setIsWaving(false), 500);
  };

  const hearCallum = () => {
    if (!speechSupported) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(JOKES[jokeIndex]);
    utterance.rate = 0.95;
    utterance.pitch = 0.9; // a touch lower — Callum's easy baritone
    const voice = pickCallumsVoice(synth.getVoices());
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#201506] via-[#111217] to-[#08090c] p-6 shadow-[0_20px_70px_rgba(212,175,55,0.12)] sm:flex-row sm:items-center sm:p-8">
        <div className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border border-[#D4AF37]/40 bg-gradient-to-br from-[#f4cf5c] to-[#9c6814] text-5xl shadow-[0_0_32px_rgba(212,175,55,0.35)] ${isWaving ? "animate-bounce" : ""}`} aria-hidden="true">🎩</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#f8d778]"><Sparkles className="h-3 w-3" /> Meet Callum — your Scottish prize host</span><span className="text-xs text-emerald-300">Here for the good vibes</span></div>
          <h2 className="mt-3 text-2xl font-bold text-white">A little fun while you play</h2>
          <p aria-live="polite" className="mt-2 max-w-2xl text-base leading-relaxed text-white/70">“{JOKES[jokeIndex]}”</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={nextJoke} className="inline-flex items-center gap-2 rounded-xl border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#f8d778] transition hover:bg-[#D4AF37] hover:text-black active:scale-95"><MessageCircleHeart className="h-4 w-4" /> Tell me another</button>
            {speechSupported && (
              <button type="button" onClick={hearCallum} aria-pressed={speaking} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition active:scale-95 ${speaking ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-white/15 bg-white/5 text-white/70 hover:border-[#D4AF37]/40 hover:text-[#f8d778]"}`}>
                <Volume2 className="h-4 w-4" /> {speaking ? "Stop Callum" : "Hear Callum"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
