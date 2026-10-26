// Server-run blackjack. The server holds the deck, plays the bot seats and settles every
// hand, so the browser never sees the hole card or the cards still to come. Signed-in
// hands are recorded to the world ranking from the server; anonymous hands are not ranked.
import { bjAct, bjBotAction, createBjTable, placeBets, type BjAction, type BjCard, type BjState } from "../src/games/blackjack";
import { recordWorldResult } from "./worldRanking";
import type { Store } from "./accounts";

/** Table limits. Bots per table match the lounge tables. */
export const BJ_TABLES: Record<number, number> = { 25: 4, 50: 5, 100: 5 };
const TABLE_TTL_S = 2 * 3600;
const BOT_STEP_LIMIT = 60;
const HIDDEN: BjCard = { rank: "A", value: 0, suit: "♠" }; // placeholder; the browser draws it face down

const tableKey = (accountId: string) => `bj:table:${accountId}`;

export type BjView = {
  phase: BjState["phase"];
  handNumber: number;
  lastAction: string;
  minBet: number;
  turnSeat: number;
  dealerHoleHidden: boolean;
  dealer: BjCard[];
  seats: { id: string; name: string; initials: string; isBot: boolean; chips: number; bet: number; cards: BjCard[]; done: boolean; bust: boolean; blackjack: boolean; doubled: boolean; result?: string }[];
  returned?: number; // chips returned to the player when the hand settles
};

/** Strips the deck, hides the dealer's hole card until the dealer plays, and reports the player's payout once settled. */
export function viewOf(s: BjState): BjView {
  const you = s.seats.find((p) => p.id === "you");
  return {
    phase: s.phase,
    handNumber: s.handNumber,
    lastAction: s.lastAction,
    minBet: s.minBet,
    turnSeat: s.turnSeat,
    dealerHoleHidden: s.dealerHoleHidden,
    dealer: s.dealerHoleHidden && s.dealer.length > 1 ? [s.dealer[0], HIDDEN] : s.dealer,
    seats: s.seats.map((p) => ({ id: p.id, name: p.name, initials: p.initials, isBot: p.isBot, chips: p.id === "you" ? 0 : p.chips, bet: p.bet, cards: p.cards, done: p.done, bust: p.bust, blackjack: p.blackjack, doubled: p.doubled, result: p.result })),
    returned: s.phase === "settled" && you ? you.chips : undefined,
  };
}

async function loadTable(s: Store, accountId: string): Promise<BjState | null> {
  const raw = await s.get(tableKey(accountId));
  return raw ? (JSON.parse(raw) as BjState) : null;
}
async function saveTable(s: Store, accountId: string, state: BjState): Promise<void> {
  await s.set(tableKey(accountId), JSON.stringify(state), TABLE_TTL_S);
}

/** Bot seats play their hands on the server, one step at a time, until it is the player's turn or the hand settles. */
function runBots(state: BjState): BjState {
  let s = state;
  for (let step = 0; step < BOT_STEP_LIMIT && s.phase === "playing" && s.turnSeat >= 0; step++) {
    const seat = s.seats[s.turnSeat];
    if (!seat.isBot) break;
    s = bjAct(s, seat.id, bjBotAction(s, seat));
  }
  return s;
}

/** Only signed-in players (a name is given) are recorded in the world ranking. */
async function settle(s: Store, accountId: string, name: string | null, state: BjState): Promise<void> {
  const you = state.seats.find((p) => p.id === "you");
  if (!name || !you || !you.result) return;
  const outcome = you.result === "win" || you.result === "blackjack" ? "win" : you.result === "push" ? "draw" : "loss";
  await recordWorldResult(s, accountId, name, "blackjack", outcome);
}

export type BjResult = { ok: true; view: BjView } | { ok: false; error: string };

export async function openTable(s: Store, accountId: string, minBet: number): Promise<BjResult> {
  const bots = BJ_TABLES[minBet];
  if (bots === undefined) return { ok: false, error: "bad_table" };
  const state = createBjTable({ playerChips: 0, botCount: bots, botChips: 1000, minBet });
  await saveTable(s, accountId, state);
  return { ok: true, view: viewOf(state) };
}

export async function deal(s: Store, accountId: string, name: string | null, bet: number): Promise<BjResult> {
  const table = await loadTable(s, accountId);
  if (!table) return { ok: false, error: "no_table" };
  if (table.phase !== "betting" && table.phase !== "settled") return { ok: false, error: "hand_in_progress" };
  if (!Number.isInteger(bet) || bet < table.minBet || bet > table.minBet * 10) return { ok: false, error: "bad_bet" };
  // Reserve the most the hand can need (double down), as the lounge does on the client.
  const reserved = { ...table, seats: table.seats.map((p) => (p.id === "you" ? { ...p, chips: bet * 2 } : p)) };
  let state = placeBets(reserved, bet);
  state = runBots(state);
  if (state.phase === "settled") await settle(s, accountId, name, state);
  await saveTable(s, accountId, state);
  return { ok: true, view: viewOf(state) };
}

export async function act(s: Store, accountId: string, name: string | null, action: string): Promise<BjResult> {
  if (action !== "hit" && action !== "stand" && action !== "double") return { ok: false, error: "bad_action" };
  const table = await loadTable(s, accountId);
  if (!table) return { ok: false, error: "no_table" };
  const you = table.seats.findIndex((p) => p.id === "you");
  if (table.phase !== "playing" || table.turnSeat !== you) return { ok: false, error: "not_your_turn" };
  let state = bjAct(table, "you", action as BjAction);
  state = runBots(state);
  if (state.phase === "settled") await settle(s, accountId, name, state);
  await saveTable(s, accountId, state);
  return { ok: true, view: viewOf(state) };
}
