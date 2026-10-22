// Realtime multiplayer Luxe Poker — human players seated at shared server tables.
// The server deals from provably-fair committed decks, validates every action, hides each
// player's hole cards from everyone else, and writes every action/result into the same
// append-only hash-chained record as solo tables. Free-play chips only — no cash value.
import crypto from "crypto";
import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { applyAction, botAction, createTable, dealHand, makeHoldemDeck, shuffleHoldem, type BotStyle, type HoldemAction, type HoldemCard, type HoldemState } from "../src/games/holdem";
import { appendRecord } from "./poker";

const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
function mulberry32(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const cardCode = (c: HoldemCard) => `${c.rank}${c.suit}`;
const seedFromSecret = (secret: string) => parseInt(secret.slice(0, 8), 16);
const VALID_ACTIONS: HoldemAction[] = ["fold", "check", "call", "raise"];

export type MpPlayer = { id: string; name: string; seatIndex: number; connected: boolean };
export type MpTable = {
  id: string;
  name: string;
  smallBlind: number;
  bigBlind: number;
  buyIn: number;
  state: HoldemState;
  players: MpPlayer[];          // seat roster (humans)
  handSecrets: Record<number, string>;
  handCommitments: Record<number, string>;
  handDecks: Record<number, string[]>;
  lastActionAt: number;
  createdAt: number;
  pendingSeats?: { playerId: string; name: string }[];
};

const mpTables = new Map<string, MpTable>();
const sockets = new Map<WebSocket, { playerId: string; tableId: string }>();

function publicState(t: MpTable, forPlayerId: string | null) {
  // Hide other players' hole cards and the undealt deck — clients never receive them.
  const revealAll = t.state.handOver && t.state.stage === "showdown";
  return {
    tableId: t.id,
    name: t.name,
    blinds: `${t.smallBlind} / ${t.bigBlind}`,
    buyIn: t.buyIn,
    seats: t.players.map((p) => ({ id: p.id, name: p.name, seatIndex: p.seatIndex, connected: p.connected })),
    handNumber: t.state.handNumber,
    state: {
      ...t.state,
      deck: [],
      players: t.state.players.map((p) => ({
        ...p,
        cards: (p.id === forPlayerId || (revealAll && !p.folded && !p.sittingOut)) ? p.cards : p.cards.map(() => null),
      })),
    },
    commitment: t.handCommitments[t.state.handNumber] ?? null,
    reveal: t.state.handOver && t.handSecrets[t.state.handNumber] ? { hand: t.state.handNumber, secret: t.handSecrets[t.state.handNumber], deck: t.handDecks[t.state.handNumber] } : null,
    yourTurn: !t.state.handOver && t.state.players[t.state.turnIndex]?.id === forPlayerId,
  };
}

function broadcast(t: MpTable) {
  for (const [ws, meta] of sockets) {
    if (meta.tableId !== t.id || ws.readyState !== WebSocket.OPEN) continue;
    ws.send(JSON.stringify({ type: "state", view: publicState(t, meta.playerId) }));
  }
}

function startHand(t: MpTable) {
  const seated = t.players.filter((p) => {
    const sp = t.state.players.find((x) => x.id === p.id);
    return sp && sp.chips > 0;
  });
  if (seated.length < 2) return;
  const nextHand = t.state.handNumber + 1;
  const secret = crypto.randomBytes(16).toString("hex");
  t.handSecrets[nextHand] = secret;
  t.handCommitments[nextHand] = hash(secret);
  t.handDecks[nextHand] = shuffleHoldem(makeHoldemDeck(), mulberry32(seedFromSecret(secret))).map(cardCode);
  t.state = dealHand(t.state, mulberry32(seedFromSecret(secret)));
  t.lastActionAt = Date.now();
  appendRecord("mp-deal", { table: t.id, hand: nextHand, commitment: t.handCommitments[nextHand], players: seated.map((p) => p.id) });
  broadcast(t);
}

function settleIfOver(t: MpTable) {
  if (!t.state.handOver) return;
  for (const pending of t.pendingSeats ?? []) seatHuman(t, pending.playerId, pending.name);
  t.pendingSeats = [];
  const hn = t.state.handNumber;
  appendRecord("mp-hand", {
    table: t.id, hand: hn,
    winners: t.state.winners.map((w) => ({ id: w.id, amount: w.amount, label: w.label })),
    showdown: t.state.board.length === 5,
    reveal: t.handSecrets[hn] ? { secret: t.handSecrets[hn], deck: t.handDecks[hn] } : undefined,
  });
}


// House bots keep a multiplayer table playable even when a human is alone —
// clearly marked, same committed deck, same append-only record as human seats.
const MP_BOT_POOL: { name: string; style: BotStyle }[] = [
  { name: "Amelia K.", style: "tight" },
  { name: "Ruby C.", style: "loose" },
  { name: "Theo M.", style: "balanced" },
];

function ensureBots(t: MpTable) {
  const humans = t.players.filter((p) => !p.id.startsWith("bot-")).length;
  const wanted = Math.min(MP_BOT_POOL.length, Math.max(0, 2 - humans));
  const have = t.players.filter((p) => p.id.startsWith("bot-")).length;
  for (let i = have; i < wanted; i++) {
    const spec = MP_BOT_POOL[i];
    const id = `bot-${t.id}-${i}`;
    if (t.players.some((p) => p.id === id)) continue;
    t.players.push({ id, name: spec.name, seatIndex: t.players.length, connected: true });
    t.state = { ...t.state, players: [...t.state.players, {
      id, name: spec.name, initials: spec.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase(),
      isBot: true, style: spec.style, chips: t.buyIn, bet: 0, handBet: 0, cards: [], folded: false, allIn: false, sittingOut: true, hasActed: false,
    }] };
  }
}

function markReady(t: MpTable) {
  t.state = { ...t.state, players: t.state.players.map((x) => ({ ...x, sittingOut: false })) };
}

function runBotTurns(t: MpTable, depth = 0) {
  // Let house bots act immediately (with realistic pacing done client-side).
  while (!t.state.handOver && depth < 40) {
    const actor = t.state.players[t.state.turnIndex];
    if (!actor || !actor.isBot) break;
    const rng = mulberry32(seedFromSecret(`${t.id}:${t.state.handNumber}:${depth}`));
    const move = botAction(t.state, actor, rng);
    try {
      t.state = applyAction(t.state, actor.id, move.action, move.raiseTo ?? 0);
      t.lastActionAt = Date.now();
      appendRecord("mp-action", { table: t.id, hand: t.state.handNumber, player: actor.id, action: move.action, raiseTo: move.raiseTo, auto: true });
      depth += 1;
    } catch { break; }
  }
  settleIfOver(t);
  broadcast(t);
}

export function listMpTables() {
  return [...mpTables.values()].map((t) => ({
    id: t.id, name: t.name, blinds: `${t.smallBlind} / ${t.bigBlind}`, buyIn: t.buyIn,
    seats: t.players.length, maxSeats: 6,
    playing: !t.state.handOver,
  }));
}

export function createMpTable(name: string, smallBlind = 10, bigBlind = 20, buyIn = 1000): MpTable {
  const id = `MP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const t: MpTable = {
    id, name: name.slice(0, 32) || "Luxe multiplayer table", smallBlind, bigBlind, buyIn,
    state: createTable({ playerName: "_empty_", playerChips: 0, botCount: 5, botChips: 0, smallBlind, bigBlind }),
    players: [], pendingSeats: [], handSecrets: {}, handCommitments: {}, handDecks: {},
    lastActionAt: Date.now(), createdAt: Date.now(),
  };
  // strip the placeholder players — multiplayer tables start empty
  t.state = { ...t.state, players: [], handOver: true, winners: [], lastAction: "Waiting for players…" };
  mpTables.set(id, t);
  appendRecord("mp-table-open", { table: id, name: t.name, blinds: t.bigBlind });
  return t;
}

function seatHuman(t: MpTable, playerId: string, name: string): { ok: boolean; error?: string } {
  const existing = t.players.find((p) => p.id === playerId);
  if (existing) { existing.connected = true; return { ok: true }; }
  if (t.players.length >= 6) return { ok: false, error: "table_full" };
  const seatIndex = t.players.length;
  t.players.push({ id: playerId, name: name.slice(0, 18) || "Player", seatIndex, connected: true });
  t.state = {
    ...t.state,
    players: [...t.state.players, {
      id: playerId, name: name.slice(0, 18) || "Player", initials: (name || "P").split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase(),
      isBot: false, style: "balanced", chips: t.buyIn, bet: 0, handBet: 0, cards: [], folded: false, allIn: false, sittingOut: true, hasActed: false,
    }],
  };
  appendRecord("mp-seat", { table: t.id, player: playerId, name, seatIndex });
  // seat house bots so a lone human still gets a real game, then start
  ensureBots(t);
  markReady(t);
  if (t.state.handOver && t.players.length >= 2) { startHand(t); runBotTurns(t); }
  return { ok: true };
}

function humanAct(t: MpTable, playerId: string, action: string, raiseTo: number): { ok: boolean; error?: string } {
  if (t.state.handOver) return { ok: false, error: "hand_over" };
  if (!VALID_ACTIONS.includes(action as HoldemAction)) return { ok: false, error: "invalid_action" };
  const actor = t.state.players[t.state.turnIndex];
  if (!actor || actor.id !== playerId) return { ok: false, error: "not_your_turn" };
  const before = t.state;
  try { t.state = applyAction(t.state, playerId, action as HoldemAction, raiseTo); } catch { return { ok: false, error: "illegal_move" }; }
  if (t.state === before) return { ok: false, error: "illegal_move" };
  t.lastActionAt = Date.now();
  appendRecord("mp-action", { table: t.id, hand: t.state.handNumber, player: playerId, action, raiseTo });
  settleIfOver(t);
  return { ok: true };
}

export function attachMultiplayerPoker(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws/poker" });
  // Turn timer: if the player to act is offline (or stalls), the table doesn't freeze —
  // after 25s the server checks when possible, otherwise folds them, and continues.
  const TURN_TIMEOUT_MS = 25_000;
  setInterval(() => {
    for (const t of mpTables.values()) {
      if (t.state.handOver) continue;
      if (Date.now() - t.lastActionAt <= TURN_TIMEOUT_MS) continue;
      const actor = t.state.players[t.state.turnIndex];
      if (!actor) continue;
      const roster = t.players.find((p) => p.id === actor.id);
      if (roster?.connected) continue; // online players keep their full thinking time
      const toCall = t.state.currentBet - actor.bet;
      const auto: HoldemAction = toCall > 0 ? "fold" : "check";
      try {
        const before = t.state;
        t.state = applyAction(t.state, actor.id, auto, 0);
        if (t.state !== before) {
          t.lastActionAt = Date.now();
          appendRecord("mp-action", { table: t.id, hand: t.state.handNumber, player: actor.id, action: auto, auto: true });
          settleIfOver(t);
          broadcast(t);
        }
      } catch { /* leave for next tick */ }
    }
  }, 5_000);

  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      let msg: { type?: string; tableId?: string; playerId?: string; name?: string; action?: string; raiseTo?: number; tableName?: string };
      try { msg = JSON.parse(String(raw)); } catch { return; }
      const meta = sockets.get(ws);
      const playerId = String(msg.playerId ?? meta?.playerId ?? "").slice(0, 24);
      if (!playerId) { ws.send(JSON.stringify({ type: "error", error: "missing_player_id" })); return; }

      if (msg.type === "spectate") {
        const t = mpTables.get(String(msg.tableId ?? ""));
        if (!t) { ws.send(JSON.stringify({ type: "error", error: "table_not_found" })); return; }
        sockets.set(ws, { playerId, tableId: t.id });
        ws.send(JSON.stringify({ type: "joined", view: publicState(t, playerId) }));
        return;
      }
      if (msg.type === "join") {
        const t = mpTables.get(String(msg.tableId ?? ""));
        if (!t) { ws.send(JSON.stringify({ type: "error", error: "table_not_found" })); return; }
        if (t.state.handOver) {
          // Between hands: seat immediately so the player is in from the next deal.
          const seated = seatHuman(t, playerId, String(msg.name ?? "Player"));
          if (!seated.ok) { ws.send(JSON.stringify({ type: "error", error: seated.error })); return; }
          sockets.set(ws, { playerId, tableId: t.id });
          ws.send(JSON.stringify({ type: "joined", view: publicState(t, playerId) }));
          broadcast(t);
          return;
        }
        // Mid-hand: entering chips now would be unfair — queue for the next hand.
        t.pendingSeats = (t.pendingSeats ?? []).filter((p) => p.playerId !== playerId);
        t.pendingSeats!.push({ playerId, name: String(msg.name ?? "Player") });
        sockets.set(ws, { playerId, tableId: t.id });
        ws.send(JSON.stringify({ type: "joined", view: publicState(t, playerId) }));
        broadcast(t);
        return;
      }
      if (false) {
        const t = mpTables.get(String(msg.tableId ?? ""));
        if (!t) { ws.send(JSON.stringify({ type: "error", error: "table_not_found" })); return; }
        const seated = seatHuman(t, playerId, String(msg.name ?? "Player"));
        if (!seated.ok) { ws.send(JSON.stringify({ type: "error", error: seated.error })); return; }
        sockets.set(ws, { playerId, tableId: t.id });
        ws.send(JSON.stringify({ type: "joined", view: publicState(t, playerId) }));
        broadcast(t);
        return;
      }
      if (!meta) return;
      const t = mpTables.get(meta.tableId);
      if (!t) return;
      if (msg.type === "action") {
        const r = humanAct(t, meta.playerId, String(msg.action ?? ""), Number(msg.raiseTo ?? 0));
        if (!r.ok) ws.send(JSON.stringify({ type: "error", error: r.error }));
        broadcast(t);
        runBotTurns(t);
      }
      if (msg.type === "next-hand" && t.state.handOver) {
        markReady(t);
        startHand(t);
        runBotTurns(t);
      }
    });
    ws.on("close", () => {
      const meta = sockets.get(ws);
      if (!meta) return;
      sockets.delete(ws);
      const t = mpTables.get(meta.tableId);
      const p = t?.players.find((x) => x.id === meta.playerId);
      if (t && p) {
        p.connected = false;
        // fold them out of the current hand if it is their turn or they're in it
        if (!t.state.handOver) {
          const sp = t.state.players.find((x) => x.id === meta.playerId);
          if (sp && !sp.folded && !sp.sittingOut) {
            try { t.state = applyAction(t.state, meta.playerId, "fold", 0); } catch { /* already out */ }
            settleIfOver(t);
          }
        }
        broadcast(t);
      }
    });
  });
  return wss;
}
