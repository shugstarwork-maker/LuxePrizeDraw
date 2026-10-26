import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { playLuxeSound } from "../src/audio/luxeSynth.ts";

// Minimal stand-in for Web Audio: records how many sources each sound starts.
function fakeContext() {
  let started = 0;
  const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
  const node = () => ({ connect(n: unknown) { return n; }, gain: param(), frequency: param(), Q: param(), delayTime: param(), type: "", buffer: null as unknown, start() { started++; }, stop() {} });
  const ctx = {
    currentTime: 0, sampleRate: 48000, destination: node(),
    createOscillator: node, createGain: node, createBiquadFilter: node, createBufferSource: node,
    createDelay: () => node(),
    createBuffer: (_c: number, len: number) => ({ getChannelData: () => new Float32Array(len) }),
  };
  return { ctx: ctx as unknown as AudioContext, started: () => started };
}

test("every UI sound plays without throwing and layers more than a single beep", () => {
  for (const effect of ["button", "ticketSelect", "ticketPurchase", "success", "error", "drawStart", "drawSuspense", "winnerReveal", "jackpotReveal", "notification", "levelUp", "coinWin", "cardDeal"] as const) {
    const f = fakeContext();
    playLuxeSound(f.ctx, effect, 0.5);
    assert.ok(f.started() >= 2, `${effect} started ${f.started()} source(s)`);
  }
});

test("buttons site-wide get the tap sound, and it can be opted out", () => {
  const provider = readFileSync(new URL("../src/audio/AudioProvider.tsx", import.meta.url), "utf8");
  assert.match(provider, /addEventListener\("pointerdown"/);
  assert.match(provider, /data-no-tap-sound/);
  assert.ok(!provider.includes("fallbackTone"), "old sine-beep fallback is gone");
});
