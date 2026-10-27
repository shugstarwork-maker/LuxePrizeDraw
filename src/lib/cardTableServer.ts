// Client for the server-run card tables (blackjack and 3 card brag). The server deals,
// plays the bots and settles each hand; the browser only shows the state it returns.
import type { BjState } from "../games/blackjack";
import type { BragState } from "../games/brag";
import type { HoldemState } from "../games/holdem";
import { playerId } from "./pokerLeague";
import { accountToken } from "./useAccount";

type Reply<T> = { state: T; balance: number } | { error: string };

async function call<T>(path: string, body: Record<string, unknown>): Promise<Reply<T>> {
  const token = accountToken();
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", "x-player-id": playerId(), ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { error: String(data.error ?? "server_error") };
    // The server strips the deck, so it is always empty on the client. The balance is the wallet the server holds.
    return { state: { ...data, deck: [] } as unknown as T, balance: Number(data.balance ?? 0) };
  } catch {
    return { error: "unreachable" };
  }
}

export const bjOpenTable = (minBet: number) => call<BjState>("/api/bj/table", { minBet });
export const bjDeal = (bet: number) => call<BjState>("/api/bj/deal", { bet });
export const bjAct = (action: "hit" | "stand" | "double") => call<BjState>("/api/bj/act", { action });

export const bragOpenTable = (minAnte: number) => call<BragState>("/api/brag/table", { minAnte });
export const bragDeal = (ante: number) => call<BragState>("/api/brag/deal", { ante });
export const bragAct = (action: "play" | "fold") => call<BragState>("/api/brag/act", { action });

/** The player's chip balance, as the server holds it. */
export async function fetchBalance(): Promise<number | null> {
  const token = accountToken();
  try {
    const res = await fetch("/api/wallet", { headers: { "x-player-id": playerId(), ...(token ? { authorization: `Bearer ${token}` } : {}) } });
    if (!res.ok) return null;
    return ((await res.json()) as { chips: number }).chips;
  } catch {
    return null;
  }
}

/** Claims the daily sign-in chips, once per day, on the server. */
export async function claimDailyChips(): Promise<{ granted: boolean; chips: number } | null> {
  const token = accountToken();
  try {
    const res = await fetch("/api/wallet/daily", { method: "POST", headers: { "x-player-id": playerId(), ...(token ? { authorization: `Bearer ${token}` } : {}) } });
    if (!res.ok) return null;
    return (await res.json()) as { granted: boolean; chips: number };
  } catch {
    return null;
  }
}

// Texas Hold'em at the server-run table: the server deals, plays the bots and holds the stacks.
export type HoldemView = {
  balance: number;
  tableId: string;
  table: { smallBlind: number; bigBlind: number; buyIn: number };
  state: Omit<HoldemState, "deck">;
};
export type HoldemReply = { ok: true; view: HoldemView } | { ok: false; error: string };

/** The hand state the lounge renders. The server never sends the deck, so it is empty here. */
export const holdemState = (view: HoldemView): HoldemState => ({ ...view.state, deck: [] }) as HoldemState;

async function holdemCall(path: string, body?: Record<string, unknown>): Promise<HoldemReply> {
  const token = accountToken();
  try {
    const res = await fetch(path, {
      method: body ? "POST" : "GET",
      headers: { ...(body ? { "content-type": "application/json" } : {}), "x-player-id": playerId(), ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { ok: false, error: String(data.error ?? "server_error") };
    return { ok: true, view: data as unknown as HoldemView };
  } catch {
    return { ok: false, error: "unreachable" };
  }
}

export const holdemOpen = (table: string) => holdemCall("/api/holdem/table", { table });
export const holdemDeal = () => holdemCall("/api/holdem/deal", {});
export const holdemAct = (action: "fold" | "check" | "call" | "raise", raiseTo = 0) => holdemCall("/api/holdem/act", { action, raiseTo });
export const holdemCurrent = () => holdemCall("/api/holdem/state");

/** Stands up and returns the stack to the wallet. Returns the balance. */
export async function holdemLeave(): Promise<{ ok: true; balance: number } | { ok: false; error: string }> {
  const token = accountToken();
  try {
    const res = await fetch("/api/holdem/leave", { method: "POST", headers: { "x-player-id": playerId(), ...(token ? { authorization: `Bearer ${token}` } : {}) } });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { ok: false, error: String(data.error ?? "server_error") };
    return { ok: true, balance: Number(data.balance ?? 0) };
  } catch {
    return { ok: false, error: "unreachable" };
  }
}

/** Spends chips from the wallet on the server (for example a gift). Returns the new balance. */
export async function spendChips(amount: number): Promise<{ ok: true; chips: number } | { ok: false; error: string }> {
  const token = accountToken();
  try {
    const res = await fetch("/api/wallet/spend", { method: "POST", headers: { "content-type": "application/json", "x-player-id": playerId(), ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ amount }) });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { ok: false, error: String(data.error ?? "server_error") };
    return { ok: true, chips: Number(data.chips ?? 0) };
  } catch {
    return { ok: false, error: "unreachable" };
  }
}
