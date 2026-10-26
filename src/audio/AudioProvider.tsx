import { playPokerPercussion } from "./pokerActionSound";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { backgroundMusic, licensedAudioEnabled, type SoundEffect } from "./config";
import { playLuxeSound } from "./luxeSynth";

type AudioControls = { enabled: boolean; musicEnabled: boolean; volume: number; setEnabled: (enabled: boolean) => void; setMusicEnabled: (enabled: boolean) => void; setVolume: (volume: number) => void; play: (sound: SoundEffect) => void };
const AudioContext = createContext<AudioControls | null>(null);
const SETTINGS_KEY = "luxe-prize-draw-audio";

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
    // The global tap sound fires on pointerdown and many buttons also call play("button")
    // on click, so taps get a longer de-duplication window.
    if (now - (lastPlayed.current[effect] || 0) < (effect === "button" ? 260 : 130)) return;
    lastPlayed.current[effect] = now;
    if (effect === "chipDrop" || effect === "chipStack") {
      try {
        const clip = new Audio("/audio/poker-chips-0942.mp3");
        clip.volume = settings.volume;
        clip.preload = "auto";
        void clip.play().catch(() => { /* Never substitute the rejected beep or block gameplay. */ });
      } catch { /* Unsupported audio must not block the game. */ }
      return;
    }
    if (effect === "tableKnock") {
      try { playPokerPercussion(getContext(), effect, settings.volume); } catch { /* Audio failure must not block game actions. */ }
      return;
    }
    try { playLuxeSound(getContext(), effect, settings.volume); } catch { /* Audio failure must not block the UI. */ }
  }, [getContext, settings.enabled, settings.volume]);

  // Every button and link gets the tap sound (and a tiny haptic on phones that support
  // it) while sound is on. Add data-no-tap-sound to opt an element out.
  useEffect(() => {
    if (!settings.enabled) return;
    const onDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("button, [role=button], a[href], summary");
      if (!el || el.closest("[data-no-tap-sound]") || (el as HTMLButtonElement).disabled) return;
      play("button");
      try { navigator.vibrate?.(8); } catch { /* not supported */ }
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, [play, settings.enabled]);

  const value = useMemo(() => ({ ...settings, play, setEnabled: (enabled: boolean) => setSettings((value: typeof settings) => ({ ...value, enabled })), setMusicEnabled: (musicEnabled: boolean) => setSettings((value: typeof settings) => ({ ...value, musicEnabled })), setVolume: (volume: number) => setSettings((value: typeof settings) => ({ ...value, volume })) }), [settings, play]);
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() { const context = useContext(AudioContext); if (!context) throw new Error("AudioProvider is missing."); return context; }
