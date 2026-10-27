// Server-held chip balances for the card games (blackjack and brag). The server takes the
// stake when a hand is dealt and pays out when it settles, so the browser cannot change its
// balance. Balances are keyed by account, or by anonymous player ID when signed out.
import { withLock } from "./lock";
import type { Store } from "./accounts";

export const STARTING_CHIPS = 1000;
export const DAILY_CHIPS = 200;

type Wallet = { chips: number; dailyDay?: string };
const walletKey = (key: string) => `wallet:${key}`;

async function read(s: Store, key: string): Promise<Wallet> {
  const raw = await s.get(walletKey(key));
  return raw ? (JSON.parse(raw) as Wallet) : { chips: STARTING_CHIPS };
}
async function write(s: Store, key: string, w: Wallet): Promise<void> {
  await s.set(walletKey(key), JSON.stringify(w));
}

export async function balance(s: Store, key: string): Promise<number> {
  return (await read(s, key)).chips;
}

/** Takes chips from the wallet. Refuses if the wallet cannot cover the amount. */
export async function debit(s: Store, key: string, amount: number): Promise<{ ok: true; chips: number } | { ok: false }> {
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false };
  return withLock(s, `wallet:${key}`, async () => {
    const w = await read(s, key);
    if (w.chips < amount) return { ok: false as const };
    w.chips -= amount;
    await write(s, key, w);
    return { ok: true as const, chips: w.chips };
  });
}

/** Pays chips into the wallet, for example a settled hand's return. */
export async function credit(s: Store, key: string, amount: number): Promise<number> {
  const paid = Math.max(0, Math.floor(amount));
  return withLock(s, `wallet:${key}`, async () => {
    const w = await read(s, key);
    w.chips += paid;
    await write(s, key, w);
    return w.chips;
  });
}

/** The daily sign-in chips, once per UTC day. */
export async function claimDaily(s: Store, key: string, now = new Date()): Promise<{ granted: boolean; chips: number }> {
  const day = now.toISOString().slice(0, 10);
  return withLock(s, `wallet:${key}`, async () => {
    const w = await read(s, key);
    if (w.dailyDay === day) return { granted: false, chips: w.chips };
    w.dailyDay = day;
    w.chips += DAILY_CHIPS;
    await write(s, key, w);
    return { granted: true, chips: w.chips };
  });
}
