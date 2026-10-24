import test from "node:test";
import assert from "node:assert/strict";

// localStorage stub (same pattern as leagueEcosystem tests)
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};
const listeners = new Map<string, Set<() => void>>();
(globalThis as any).window = {
  addEventListener: (t: string, cb: () => void) => { (listeners.get(t) ?? listeners.set(t, new Set()).get(t)!).add(cb); },
  removeEventListener: (t: string, cb: () => void) => { listeners.get(t)?.delete(cb); },
  dispatchEvent: () => true,
};

const mod = await import("../src/lib/studioBroadcast.ts");

test("broadcast defaults to off-air empty state", () => {
  store.clear();
  const b = mod.loadBroadcast();
  assert.equal(b.live, false);
  assert.equal(b.reads.length, 0);
  assert.equal(b.chat.length, 0);
});

test("save/load round-trips broadcast state", () => {
  store.clear();
  mod.saveBroadcast({ live: true, camera: "Dealer cam", startedAt: 123, reads: [], chat: [], note: "on air" });
  const b = mod.loadBroadcast();
  assert.equal(b.live, true);
  assert.equal(b.camera, "Dealer cam");
  assert.equal(b.startedAt, 123);
});

test("pushOcrRead prepends reads, caps at 12, no duplicate card back-to-back", () => {
  store.clear();
  let b = mod.loadBroadcast();
  for (let i = 0; i < 15; i++) b = mod.pushOcrRead(b);
  assert.equal(b.reads.length, 12);
  assert.ok(b.reads[0].confidence >= 96 && b.reads[0].confidence <= 100);
  assert.ok(b.note.includes("Shoe cam read"));
});

test("drawShoeCard never returns an excluded card", () => {
  const exclude = ["A♠", "K♥", "Q♦"];
  for (let i = 0; i < 100; i++) assert.ok(!exclude.includes(mod.drawShoeCard(exclude)));
});

test("pushChat prepends messages and caps at 20", () => {
  store.clear();
  let b = mod.loadBroadcast();
  for (let i = 0; i < 25; i++) b = mod.pushChat(b, "Studio", `line ${i}`);
  assert.equal(b.chat.length, 20);
  assert.equal(b.chat[0].text, "line 24");
  assert.equal(b.chat[0].from, "Studio");
});

test("resetBroadcast clears state back to off-air", () => {
  store.clear();
  mod.saveBroadcast({ live: true, camera: "Shoe cam", startedAt: 1, reads: [], chat: [], note: "x" });
  const b = mod.resetBroadcast();
  assert.equal(b.live, false);
  assert.equal(mod.loadBroadcast().live, false);
});
