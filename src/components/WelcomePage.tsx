// Cinematic welcome — the trailer plays full-screen behind the brand, then three
// panels lead into draws, the casino and the weekly leagues. On wide screens the
// vertical trailer sits in a framed column over a blurred still, so it isn't cropped.
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Crown, Heart, ShieldCheck, Trophy, Volume2, VolumeX } from "lucide-react";

const go = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

const PANELS = [
  { title: "Prize Draws", line: "Supercars, fine gold and five-star escapes.", image: "/welcome-media/supercar.jpg", href: "/draws", icon: Trophy },
  { title: "Luxe Casino", line: "Hold'em, blackjack, brag, chess and more — free-play.", image: "/welcome-media/gold.jpg", href: "/casino", icon: Crown },
  { title: "Weekly Leagues", line: "Climb ten divisions. Top ten go up every week.", image: "/welcome-media/holiday.jpg", href: "/poker", icon: ShieldCheck },
];

export const WelcomePage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduced(Boolean(m?.matches));
    if (!m?.matches) video.current?.play().catch(() => { /* autoplay blocked — poster stays */ });
  }, []);
  const toggleSound = () => {
    const v = video.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
    if (v.paused) void v.play().catch(() => {});
  };

  return <main className="welcome-cine bg-[#050505] text-white">
    <section className="welcome-cine__hero" aria-label="LuxePrizeDraw trailer">
      <img className="welcome-cine__backdrop" src="/welcome-media/supercar.jpg" alt="" aria-hidden="true" />
      <video ref={video} className="welcome-cine__video" src="/trailer.mp4" poster="/welcome-media/poster.jpg" muted loop playsInline preload="metadata" autoPlay={!reduced} aria-label="LuxePrizeDraw coming-soon trailer: headline supercar, 1kg fine gold, VIP holidays" />
      <div className="welcome-cine__shade" aria-hidden="true" />
      {/* Brand at the top and actions at the bottom, so the trailer's own captions
          (lower middle) play clear. On wide screens both sit left of the video. */}
      <div className="welcome-cine__lead">
        <div className="welcome-cine__copy">
          <span className="welcome-cine__crest"><Crown className="h-5 w-5" /></span>
          <p className="welcome-cine__kicker">Welcome to</p>
          <h1 className="welcome-cine__title">LuxePrizeDraw</h1>
          <p className="welcome-cine__tagline">More than a prize draw.</p>
        </div>
        <div className="welcome-cine__actions">
          <button type="button" onClick={onEnter} className="welcome-cine__enter">Enter the experience <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
      <button type="button" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? "Play trailer with sound" : "Mute trailer"} className="welcome-cine__sound">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}<span>{muted ? "Sound on" : "Sound off"}</span></button>
      <a href="#welcome-ways" className="welcome-cine__scroll" aria-label="Scroll to explore"><ChevronDown className="h-6 w-6" /></a>
    </section>

    <p className="welcome-cine__note">Pre-launch experience. Entries, payments, prize issuance and charity totals stay disabled until independently verified.</p>

    <section id="welcome-ways" className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pb-24">
      <p className="text-center text-[10px] font-black uppercase tracking-[.24em] text-amber-200">Three ways in</p>
      <h2 className="mt-3 text-center font-serif text-3xl font-black text-amber-100 sm:text-5xl">Choose your world</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PANELS.map(({ title, line, image, href, icon: Icon }, i) => <button key={title} type="button" onClick={() => go(href)} className="welcome-cine__panel" style={{ animationDelay: `${i * 120}ms` }}>
          <img src={image} alt="" loading="lazy" decoding="async" />
          <span className="welcome-cine__panel-shade" aria-hidden="true" />
          <span className="welcome-cine__panel-body">
            <Icon className="h-5 w-5 text-amber-200" />
            <b>{title}</b>
            <small>{line}</small>
            <span className="welcome-cine__panel-cta">Explore <ArrowRight className="h-3.5 w-3.5" /></span>
          </span>
        </button>)}
      </div>
    </section>

    <section className="border-t border-white/10 bg-black/40 px-4 py-10">
      <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-rose-200/20 bg-rose-300/5 p-5">
        <Heart className="mt-0.5 h-5 w-5 shrink-0 fill-rose-300 text-rose-200" />
        <p className="text-sm leading-relaxed text-white/70"><b className="text-rose-100">You're not alone. We care.</b> Play should always feel good. Set reminders and limits any time under <button type="button" onClick={() => go("/responsible-play")} className="font-bold text-amber-200 underline underline-offset-2">Responsible play</button>.</p>
      </div>
    </section>
  </main>;
};
