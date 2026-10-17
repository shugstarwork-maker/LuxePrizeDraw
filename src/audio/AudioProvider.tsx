import { playPokerPercussion } from "./pokerActionSound";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { backgroundMusic, licensedAudioEnabled, soundEffects, type SoundEffect } from "./config";

type AudioControls = { enabled: boolean; musicEnabled: boolean; volume: number; setEnabled: (enabled: boolean) => void; setMusicEnabled: (enabled: boolean) => void; setVolume: (volume: number) => void; play: (sound: SoundEffect) => void };
const AudioContext = createContext<AudioControls | null>(null);
const SETTINGS_KEY = "luxe-prize-draw-audio";

const tones: Record<SoundEffect, number[]> = { chipDrop: [], tableKnock: [], button: [660], ticketSelect: [523, 659], ticketPurchase: [440, 660, 880], success: [523, 659, 784], error: [220, 185], drawStart: [220, 277, 330], drawSuspense: [196, 208], winnerReveal: [523, 659, 784, 1046], jackpotReveal: [392, 523, 659, 784, 1046], notification: [784, 1046], cardDeal: [392, 523, 659], chipStack: [330, 415, 494], levelUp: [523, 659, 784, 1046, 1318], coinWin: [880, 1046, 1175, 1318] };

function fallbackTone(context: AudioContext, effect: SoundEffect, volume: number) {
  const now = context.currentTime;
  if (effect === "chipStack") {
    for (let index = 0; index < 9; index++) {
      const start = now + index * .035;
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(1100 + (index * 347) % 1800, start);
      oscillator.frequency.exponentialRampToValueAtTime(500, start + .055);
      gain.gain.setValueAtTime(Math.min(.08, volume * .1), start);
      gain.gain.exponentialRampToValueAtTime(.001, start + .065);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start); oscillator.stop(start + .07);
    }
    return;
  }
  tones[effect].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = effect === "error" ? "triangle" : "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now + index * 0.09);
    gain.gain.linearRampToValueAtTime(Math.min(0.11, volume * 0.12), now + index * 0.09 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * 0.09);
    oscillator.stop(now + index * 0.09 + 0.22);
  });
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(() => { try { return { enabled: false, musicEnabled: false, volume: 0.55, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; } catch { return { enabled: false, musicEnabled: false, volume: 0.55 }; } });
  const audioContext = useRef<AudioContext | null>(null);
  const music = useRef<HTMLAudioElement | null>(null);
  const lastPlayed = useRef<Record<string, number>>({});
  const getContext = useCallback(() => { if (!audioContext.current) audioContext.current = new window.AudioContext(); if (audioContext.current.state === "suspended") void audioContext.current.resume(); return audioContext.current; }, []);

  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { if (!licensedAudioEnabled) return; if (!music.current) { music.current = new Audio(backgroundMusic); music.current.loop = true; } const player = music.current; player.volume = settings.volume * 0.35; if (settings.musicEnabled) void player.play().catch(() => setSettings((value: typeof settings) => ({ ...value, musicEnabled: false }))); else player.pause(); return () => player.pause(); }, [settings.musicEnabled, settings.volume]);

  const play = useCallback((effect: SoundEffect) => {
    if (!settings.enabled || document.visibilityState !== "visible") return;
    const now = Date.now();
    if (now - (lastPlayed.current[effect] || 0) < 130) return;
    lastPlayed.current[effect] = now;
    if (effect === "chipDrop" || effect === "tableKnock") {
      try { playPokerPercussion(getContext(), effect, settings.volume); } catch { /* Audio failure must not block game actions. */ }
      return;
    }
    if (!licensedAudioEnabled) { fallbackTone(getContext(), effect, settings.volume); return; }
    const clip = new Audio(soundEffects[effect]);
    clip.volume = settings.volume;
    clip.preload = "auto";
    void clip.play().catch(() => fallbackTone(getContext(), effect, settings.volume));
  }, [getContext, settings.enabled, settings.volume]);

  const value = useMemo(() => ({ ...settings, play, setEnabled: (enabled: boolean) => setSettings((value: typeof settings) => ({ ...value, enabled })), setMusicEnabled: (musicEnabled: boolean) => setSettings((value: typeof settings) => ({ ...value, musicEnabled })), setVolume: (volume: number) => setSettings((value: typeof settings) => ({ ...value, volume })) }), [settings, play]);
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() { const context = useContext(AudioContext); if (!context) throw new Error("AudioProvider is missing."); return context; }
