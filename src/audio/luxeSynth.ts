// Luxe UI sound engine — every interface sound is synthesised with Web Audio, so
// nothing needs licensing or downloading. Each sound layers a transient (the "tap")
// with tuned bell partials and a short shimmer echo, which reads as crisp and
// expensive rather than the bare sine beep it replaces.
import type { SoundEffect } from "./config";

type Ctx = AudioContext;

/** A bell-like tone: fundamental plus inharmonic partials, fast attack, exponential decay. */
function bell(ctx: Ctx, out: AudioNode, freq: number, at: number, dur: number, level: number) {
  const partials: [number, number][] = [[1, 1], [2.01, 0.42], [3.02, 0.22], [4.17, 0.1]];
  for (const [mult, amp] of partials) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * mult, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(level * amp, at + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur / mult ** 0.5);
    osc.connect(g).connect(out);
    osc.start(at); osc.stop(at + dur + 0.05);
  }
}

/** A short filtered noise burst — the physical "tick" of a premium switch. */
function click(ctx: Ctx, out: AudioNode, at: number, level: number, tone = 3200) {
  const len = Math.floor(ctx.sampleRate * 0.018);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf; bp.type = "bandpass"; bp.frequency.value = tone; bp.Q.value = 1.4;
  g.gain.value = level;
  src.connect(bp).connect(g).connect(out);
  src.start(at);
}

/** A soft pitched thump for low, warm feedback. */
function thump(ctx: Ctx, out: AudioNode, freq: number, at: number, level: number) {
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * 1.8, at);
  osc.frequency.exponentialRampToValueAtTime(freq, at + 0.05);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(level, at + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
  osc.connect(g).connect(out);
  osc.start(at); osc.stop(at + 0.2);
}

/** Output bus with a gentle shimmer echo so sounds sit in a "room". */
function bus(ctx: Ctx, volume: number) {
  const master = ctx.createGain(); master.gain.value = Math.max(0, Math.min(1, volume));
  const delay = ctx.createDelay(0.5), fb = ctx.createGain(), wet = ctx.createGain(), hp = ctx.createBiquadFilter();
  delay.delayTime.value = 0.085; fb.gain.value = 0.28; wet.gain.value = 0.22; hp.type = "highpass"; hp.frequency.value = 900;
  master.connect(ctx.destination);
  master.connect(hp).connect(delay); delay.connect(fb).connect(delay); delay.connect(wet).connect(ctx.destination);
  return master;
}

const NOTE = (semitonesFromA4: number) => 440 * 2 ** (semitonesFromA4 / 12);
const C6 = NOTE(15), E6 = NOTE(19), G6 = NOTE(22), C7 = NOTE(27), E7 = NOTE(31), G5 = NOTE(10), C5 = NOTE(3);

export function playLuxeSound(ctx: Ctx, effect: SoundEffect, volume: number) {
  const out = bus(ctx, volume);
  const t = ctx.currentTime + 0.005;
  switch (effect) {
    case "button":
      click(ctx, out, t, 0.35);
      bell(ctx, out, E7, t + 0.004, 0.16, 0.09);
      thump(ctx, out, 180, t, 0.18);
      return;
    case "ticketSelect":
    case "success":
      click(ctx, out, t, 0.25);
      [C6, E6, G6].forEach((f, i) => bell(ctx, out, f, t + i * 0.07, 0.6, 0.16));
      return;
    case "ticketPurchase":
    case "coinWin":
      for (let i = 0; i < 7; i++) bell(ctx, out, [C7, G6, E7, C7, G6, E7, C7][i], t + i * 0.045, 0.35, 0.09);
      return;
    case "levelUp":
      [C6, E6, G6, C7].forEach((f, i) => bell(ctx, out, f, t + i * 0.085, 0.8, 0.15));
      for (let i = 0; i < 5; i++) bell(ctx, out, E7 * (1 + i * 0.12), t + 0.36 + i * 0.04, 0.3, 0.05);
      return;
    case "notification":
      bell(ctx, out, G6, t, 0.5, 0.14); bell(ctx, out, C7, t + 0.12, 0.7, 0.14);
      return;
    case "error":
      thump(ctx, out, 110, t, 0.35); thump(ctx, out, 92, t + 0.12, 0.3);
      return;
    case "drawStart":
    case "drawSuspense":
      [C5, G5, C6].forEach((f, i) => bell(ctx, out, f, t + i * 0.16, 0.9, 0.12));
      return;
    case "winnerReveal":
    case "jackpotReveal": {
      thump(ctx, out, 70, t, 0.4);
      [C6, E6, G6, C7, E7].forEach((f, i) => bell(ctx, out, f, t + i * 0.09, 1.1, 0.16));
      const sparkle = effect === "jackpotReveal" ? 12 : 6;
      for (let i = 0; i < sparkle; i++) bell(ctx, out, C7 * (1 + ((i * 7) % 11) / 10), t + 0.45 + i * 0.05, 0.25, 0.05);
      return;
    }
    case "cardDeal": // slide then snap, like a card flicked onto felt
      click(ctx, out, t, 0.22, 1600);
      click(ctx, out, t + 0.035, 0.42, 3600);
      return;
    default:
      click(ctx, out, t, 0.3);
  }
}
