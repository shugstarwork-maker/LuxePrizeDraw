import React, { useEffect, useState } from "react";
import { MessageCircle, Volume2, X } from "lucide-react";

type SpeechWindow = Window & { speechSynthesis?: SpeechSynthesis };

export const ScottishHost: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState(false);
  const message = "Awright, welcome in. Have a wee look through the prize collections, pick something that catches your eye, or head over to the game lobby for a bit of free play. We’re still building things properly, so every prize and entry you see is just a preview for now.";

  useEffect(() => { setSupported("speechSynthesis" in window && "SpeechSynthesisUtterance" in window); }, []);
  const speak = () => {
    if (!supported) return;
    const synthesis = (window as SpeechWindow).speechSynthesis!;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    const voices = synthesis.getVoices();
    const voice = voices.find(item => /scottish|scotland|fiona|moira/i.test(item.name)) || voices.find(item => item.lang === "en-GB");
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || "en-GB";
    utterance.rate = .9;
    utterance.pitch = 1.04;
    synthesis.speak(utterance);
  };

  return <aside className="fixed bottom-24 right-4 z-[65] sm:bottom-6 sm:right-6"><div className="flex items-end gap-3">{open && <div className="max-w-[18rem] rounded-3xl border border-amber-200/30 bg-[#13100c]/95 p-4 shadow-2xl backdrop-blur-xl"><button onClick={() => setOpen(false)} className="float-right text-white/45"><X className="h-4 w-4" /></button><p className="pr-5 text-[10px] font-black uppercase tracking-[.16em] text-amber-200">Callum from Scotland</p><p className="mt-2 text-sm leading-relaxed text-white/75">{message}</p><button onClick={speak} disabled={!supported} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-xs font-black text-black disabled:opacity-50"><Volume2 className="h-4 w-4" /> {supported ? "Hear Callum" : "Voice unavailable"}</button><p className="mt-2 text-[10px] text-white/40">Callum uses a voice installed on your device when one is available. No voice, face, or biometric data is collected.</p></div>}<button onClick={() => setOpen(value => !value)} aria-label="Open Callum, your Scottish host" className="group grid h-16 w-16 place-items-center rounded-full border-2 border-amber-200/50 bg-[radial-gradient(circle_at_35%_30%,#f5d7b2,#9d5e31_45%,#3a1c13)] shadow-[0_0_30px_rgba(251,191,36,.35)] transition hover:scale-105"><span className="relative grid h-12 w-12 place-items-center rounded-full bg-[#1e1511] text-lg font-black text-amber-100">C<MessageCircle className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-300 p-1 text-black" /></span></button></div></aside>;
};
