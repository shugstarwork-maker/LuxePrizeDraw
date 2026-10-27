// Server-run Texas Hold'em table (single table against bots). The server holds the deck and
// every stack, runs the bot seats, and settles each hand. The buy-in leaves the wallet when
// the player sits down and the stack returns when they leave, so chips cannot be created here.
import { applyAction, botAction, createTable, dealHand, type HoldemAction, type HoldemCard, type HoldemState } from "../src/games/holdem";
import * as wallet from "./wallet";
import { SOCIAL_TABLES } from "../src/lib/pokerMonetization";
import type { Store } from "./accounts";

/** Tables, matching the lounge: five league tables and the social tables. */
const LEAGUE_TABLES = [
  { smallBlind: 10, bigBlind: 20, buyIn: 200, bots: 5 },
  { smallBlind: 25, bigBlind: 50, buyIn: 500, bots: 5 },
  { smallBlind: 50, bigBlind: 100, buyIn: 1000, bots: 5 },
  { smallBlind: 75, bigBlind: 150, buyIn: 1500, bots: 5 },
  { smallBlind: 100, bigBlind: 200, buyIn: 2000, bots: 5 },
];

type TableDef = { smallBlind: number; bigBlind: number; buyIn: number; bots: number; botChips: number };

/** Looks up a table by ID: "league:0" to "league:4", or a social table's ID. Null if unknown. */
export function tableDef(id: string): TableDef | null {
  const league = /^league:(\d)$/.exec(id);
  if (league) {
    const t = LEAGUE_TABLES[Number(league[1])];
    return t ? { ...t, botChips: t.buyIn } : null;
  }
  const social = SOCIAL_TABLES.find((t) => t.id === id);
  return social ? { smallBlind: social.smallBlind, bigBlind: social.bigBlind, buyIn: social.buyIn, bots: social.bots, botChips: social.buyIn * 5 } : null;
}

/** A player who sits on their turn this long is folded, so a table cannot hang. */
export const HOLDEM_TURN_TIMEOUT_MS = 3 * 60 * 1000;
const TABLE_TTL_S = 2 * 3600;
const BOT_STEP_LIMIT = 80;
const HIDDEN: HoldemCard = { rank: "A", value: 0, suit: "♠" };

type TableRecord = { state: HoldemState; tableId: string; buyIn: number; turnSince: number };
const tableKey = (key: string) => `holdem:table:${key}`;

export type HoldemView = {
  balance: number;
  tableId: string;
  table: { smallBlind: number; bigBlind: number; buyIn: number };
  state: Omit<HoldemState, "deck">;
};

/** Strips the deck, hides other players' cards until the hand is over, and reports the wallet balance. */
export function viewOf(r: TableRecord, balance: number): HoldemView {
  const { deck: _deck, ...rest } = r.state;
  void _deck;
  const players = rest.players.map((p) => (p.id === "you" || rest.handOver ? p : { ...p, cards: p.cards.map(() => HIDDEN) }));
  const def = tableDef(r.tableId) ?? { smallBlind: 0, bigBlind: 0, buyIn: 0 };
  return { balance, tableId: r.tableId, table: { smallBlind: def.smallBlind, bigBlind: def.bigBlind, buyIn: def.buyIn }, state: { ...rest, players } };
}

async function load(s: Store, key: string): Promise<TableRecord | null> {
  const raw = await s.get(tableKey(key));
  return raw ? (JSON.parse(raw) as TableRecord) : null;
}
async function save(s: Store, key: string, r: TableRecord): Promise<void> {
  await s.set(tableKey(key), JSON.stringify(r), TABLE_TTL_S);
}

/** Bots act on the server until it is the player's turn or the hand is over. */
function runBots(state: HoldemState, rng: () => number = Math.random): HoldemState {
  let s = state;
  for (let step = 0; step < BOT_STEP_LIMIT && !s.handOver; step++) {
    const seat = s.players[s.turnIndex];
    if (!seat || !seat.isBot) break;
    const decision = botAction(s, seat, rng);
    s = applyAction(s, seat.id, decision.action as HoldemAction, decision.raiseTo ?? 0);
  }
  return s;
}

/** The current table for the player, with a timed-out turn folded first. */
export async function current(s: Store, key: string, now = Date.now()): Promise<HoldemResult | null> {
  const timedOut = await enforceTurnTimeout(s, key, now);
  if (timedOut) return timedOut;
  const r = await load(s, key);
  if (!r) return null;
  return { ok: true, view: viewOf(r, await wallet.balance(s, key)) };
}

export type HoldemResult = { ok: true; view: HoldemView } | { ok: false; error: string };

export async function openTable(s: Store, key: string, tableId: string): Promise<HoldemResult> {
  const def = tableDef(tableId);
  if (!def) return { ok: false, error: "bad_table" };
  if (await load(s, key)) return { ok: false, error: "already_seated" };
  const taken = await wallet.debit(s, key, def.buyIn);
  if (!taken.ok) return { ok: false, error: "insufficient_chips" };
  const state = createTable({ playerName: "You", playerChips: def.buyIn, botCount: def.bots, botChips: def.botChips, smallBlind: def.smallBlind, bigBlind: def.bigBlind });
  const r: TableRecord = { state: { ...state, handOver: true }, tableId, buyIn: def.buyIn, turnSince: 0 };
  await save(s, key, r);
  return { ok: true, view: viewOf(r, taken.chips) };
}

export async function deal(s: Store, key: string): Promise<HoldemResult> {
  const r = await load(s, key);
  if (!r) return { ok: false, error: "no_table" };
  if (!r.state.handOver) return { ok: false, error: "hand_in_progress" };
  const next = dealHand(r.state);
  r.state = runBots(next);
  r.turnSince = Date.now();
  await save(s, key, r);
  return { ok: true, view: viewOf(r, await wallet.balance(s, key)) };
}

export async function act(s: Store, key: string, action: string, raiseTo: number, now = Date.now()): Promise<HoldemResult> {
  if (action !== "fold" && action !== "check" && action !== "call" && action !== "raise") return { ok: false, error: "bad_action" };
  const r = await load(s, key);
  if (!r) return { ok: false, error: "no_table" };
  if (r.state.handOver) return { ok: false, error: "hand_over" };
  if (r.state.players[r.state.turnIndex]?.id !== "you") return { ok: false, error: "not_your_turn" };
  r.state = runBots(applyAction(r.state, "you", action as HoldemAction, Number.isFinite(raiseTo) ? raiseTo : 0));
  r.turnSince = now;
  await save(s, key, r);
  return { ok: true, view: viewOf(r, await wallet.balance(s, key)) };
}

/** Folds the player if they have sat on their turn past the timeout. */
export async function enforceTurnTimeout(s: Store, key: string, now = Date.now()): Promise<HoldemResult | null> {
  const r = await load(s, key);
  if (!r || r.state.handOver || r.state.players[r.state.turnIndex]?.id !== "you") return null;
  if (now - r.turnSince <= HOLDEM_TURN_TIMEOUT_MS) return null;
  return act(s, key, "fold", 0, now);
}

/** Stands up: the stack goes back to the wallet and the table closes. */
export async function leave(s: Store, key: string): Promise<{ ok: true; balance: number } | { ok: false; error: string }> {
  const r = await load(s, key);
  if (!r) return { ok: false, error: "no_table" };
  if (!r.state.handOver) return { ok: false, error: "hand_in_progress" };
  const you = r.state.players.find((p) => p.id === "you");
  const stack = you ? you.chips : 0;
  await wallet.credit(s, key, stack);
  await s.set(tableKey(key), "", 1);
  return { ok: true, balance: await wallet.balance(s, key) };
}
