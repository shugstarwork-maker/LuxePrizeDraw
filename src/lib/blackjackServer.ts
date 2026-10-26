// Client for the server-run blackjack table. The server deals, plays the bots and settles
// each hand; the browser only shows the state it returns.
import type { BjState } from "../games/blackjack";
import { playerId } from "./pokerLeague";
import { accountToken } from "./useAccount";

type Reply = { state: BjState } | { error: string };

async function call(path: string, body: Record<string, unknown>): Promise<Reply> {
  const token = accountToken();
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", "x-player-id": playerId(), ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { error: String(data.error ?? "server_error") };
    // The server strips the deck, so it is always empty on the client.
    return { state: { ...(data as unknown as Omit<BjState, "deck">), deck: [] } as BjState };
  } catch {
    return { error: "unreachable" };
  }
}

export const bjOpenTable = (minBet: number) => call("/api/bj/table", { minBet });
export const bjDeal = (bet: number) => call("/api/bj/deal", { bet });
export const bjAct = (action: "hit" | "stand" | "double") => call("/api/bj/act", { action });
