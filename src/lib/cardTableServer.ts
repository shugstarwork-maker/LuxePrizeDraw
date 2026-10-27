// Client for the server-run card tables (blackjack and 3 card brag). The server deals,
// plays the bots and settles each hand; the browser only shows the state it returns.
import type { BjState } from "../games/blackjack";
import type { BragState } from "../games/brag";
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
