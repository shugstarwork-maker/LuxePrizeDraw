// Server-run 3 Card Brag. The server holds the deck and settles every hand, so the browser
// never sees the dealer's cards before the hand is decided. Signed-in hands are recorded to
// the world ranking from the server; anonymous hands are played but not ranked.
import { bragAct, bragAnteUp, createBragTable, type BragAction, type BragCard, type BragState } from "../src/games/brag";
import { recordWorldResult } from "./worldRanking";
import type { Store } from "./accounts";

/** Table limits. Bots per table match the lounge tables. */
export const BRAG_TABLES: Record<number, number> = { 25: 4, 50: 5, 100: 5 };
const TABLE_TTL_S = 2 * 3600;
const HIDDEN: BragCard = { rank: "A", value: 0, suit: "♠" }; // placeholder; the browser draws it face down

const tableKey = (key: string) => `brag:table:${key}`;

export type BragView = {
  phase: BragState["phase"];
  handNumber: number;
  lastAction: string;
  minAnte: number;
  dealerRevealed: boolean;
  dealer: BragCard[];
  seats: { id: string; name: string; initials: string; isBot: boolean; chips: number; ante: number; playBet: number; cards: BragCard[]; folded: boolean; result?: string }[];
  returned?: number; // chips returned to the player when the hand settles
};

/** Hides the dealer's cards until the hand is revealed, strips the deck, and reports the player's payout once settled. */
export function viewOf(s: BragState): BragView {
  const you = s.seats.find((p) => p.id === "you");
  return {
    phase: s.phase,
    handNumber: s.handNumber,
    lastAction: s.lastAction,
    minAnte: s.minAnte,
    dealerRevealed: s.dealerRevealed,
    dealer: s.dealerRevealed ? s.dealer : s.dealer.map(() => HIDDEN),
    seats: s.seats.map((p) => ({ id: p.id, name: p.name, initials: p.initials, isBot: p.isBot, chips: p.id === "you" ? 0 : p.chips, ante: p.ante, playBet: p.playBet, cards: p.cards, folded: p.folded, result: p.result })),
    returned: s.phase === "settled" && you ? you.chips : undefined,
  };
}

async function loadTable(s: Store, key: string): Promise<BragState | null> {
  const raw = await s.get(tableKey(key));
  return raw ? (JSON.parse(raw) as BragState) : null;
}
async function saveTable(s: Store, key: string, state: BragState): Promise<void> {
  await s.set(tableKey(key), JSON.stringify(state), TABLE_TTL_S);
}

async function settle(s: Store, key: string, name: string | null, state: BragState): Promise<void> {
  const you = state.seats.find((p) => p.id === "you");
  if (!name || !you || !you.result) return;
  const outcome = you.result === "win" ? "win" : you.result === "push" ? "draw" : "loss";
  await recordWorldResult(s, key, name, "brag", outcome);
}

export type BragResult = { ok: true; view: BragView } | { ok: false; error: string };

export async function openTable(s: Store, key: string, minAnte: number): Promise<BragResult> {
  const bots = BRAG_TABLES[minAnte];
  if (bots === undefined) return { ok: false, error: "bad_table" };
  const state = createBragTable({ playerChips: 0, botCount: bots, botChips: 1000, minAnte });
  await saveTable(s, key, state);
  return { ok: true, view: viewOf(state) };
}

export async function deal(s: Store, key: string, name: string | null, ante: number): Promise<BragResult> {
  const table = await loadTable(s, key);
  if (!table) return { ok: false, error: "no_table" };
  if (table.phase !== "ante" && table.phase !== "settled") return { ok: false, error: "hand_in_progress" };
  if (!Number.isInteger(ante) || ante < table.minAnte || ante > table.minAnte * 10) return { ok: false, error: "bad_bet" };
  // Reserve the ante plus the matching play bet, as the lounge does on the client.
  const reserved = { ...table, seats: table.seats.map((p) => (p.id === "you" ? { ...p, chips: ante * 2 } : p)) };
  const state = bragAnteUp(reserved, ante);
  await saveTable(s, key, state);
  return { ok: true, view: viewOf(state) };
}

export async function act(s: Store, key: string, name: string | null, action: string): Promise<BragResult> {
  if (action !== "play" && action !== "fold") return { ok: false, error: "bad_action" };
  const table = await loadTable(s, key);
  if (!table) return { ok: false, error: "no_table" };
  if (table.phase !== "decide") return { ok: false, error: "not_your_turn" };
  const state = bragAct(table, "you", action as BragAction);
  if (state.phase === "settled") await settle(s, key, name, state);
  await saveTable(s, key, state);
  return { ok: true, view: viewOf(state) };
}
