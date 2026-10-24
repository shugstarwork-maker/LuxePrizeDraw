// Demo broadcast channel for the studio panel.
// Simulates a live-dealer broadcast pipeline (stream on/off, OCR card reads,
// chat) using storage events so the studio dashboard and the poker table stay
// in sync across tabs. Purely a pre-launch demo — no real video, no real
// dealing, no real players.

export type OcrRead = { card: string; confidence: number; at: number };
export type StudioChatMsg = { from: string; text: string; at: number };

export type StudioBroadcast = {
  live: boolean;
  camera: string;
  startedAt: number | null;
  reads: OcrRead[];
  chat: StudioChatMsg[];
  note: string;
};

export const STUDIO_KEY = "luxe-studio-broadcast-v1";
const CHANNEL = "luxe-studio-broadcast";

export const STUDIO_CAMERAS = ["Table cam", "Dealer cam", "Shoe cam"] as const;

const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
const SUITS = ["♠", "♥", "♦", "♣"] as const;

export function drawShoeCard(exclude: string[] = []): string {
  for (let i = 0; i < 60; i++) {
    const c = `${RANKS[Math.floor(Math.random() * RANKS.length)]}${SUITS[Math.floor(Math.random() * SUITS.length)]}`;
    if (!exclude.includes(c)) return c;
  }
  return `${RANKS[0]}${SUITS[0]}`;
}

const empty: StudioBroadcast = { live: false, camera: STUDIO_CAMERAS[0], startedAt: null, reads: [], chat: [], note: "Studio idle — stream off air." };

export function loadBroadcast(): StudioBroadcast {
  try {
    const raw = localStorage.getItem(STUDIO_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<StudioBroadcast>;
    return { ...empty, ...parsed, reads: Array.isArray(parsed.reads) ? parsed.reads.slice(0, 12) : [], chat: Array.isArray(parsed.chat) ? parsed.chat.slice(0, 20) : [] };
  } catch {
    return empty;
  }
}

export function saveBroadcast(state: StudioBroadcast) {
  try { localStorage.setItem(STUDIO_KEY, JSON.stringify(state)); } catch { /* storage full — demo only */ }
  notifyBroadcast();
}

export function resetBroadcast(): StudioBroadcast {
  saveBroadcast(empty);
  return empty;
}

export function notifyBroadcast() {
  // storage events don't fire in the writing tab — ping listeners directly.
  window.dispatchEvent(new Event(CHANNEL));
}

export function onBroadcastChange(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => { if (e.key === STUDIO_KEY) cb(); };
  window.addEventListener(CHANNEL, cb);
  window.addEventListener("storage", onStorage);
  return () => { window.removeEventListener(CHANNEL, cb); window.removeEventListener("storage", onStorage); };
}

export function pushOcrRead(state: StudioBroadcast, card?: string): StudioBroadcast {
  const read: OcrRead = { card: card ?? drawShoeCard(state.reads.map((r) => r.card)), confidence: Math.round((96 + Math.random() * 3.9) * 10) / 10, at: Date.now() };
  return { ...state, reads: [read, ...state.reads].slice(0, 12), note: `Shoe cam read ${read.card} at ${read.confidence}% confidence.` };
}

export function pushChat(state: StudioBroadcast, from: string, text: string): StudioBroadcast {
  const msg: StudioChatMsg = { from, text, at: Date.now() };
  return { ...state, chat: [msg, ...state.chat].slice(0, 20) };
}
