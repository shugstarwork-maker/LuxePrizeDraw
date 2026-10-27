// A short lock built on the store's atomic counter. It stops two requests from changing the
// same record at once, for example two players joining the same queue together.
import type { Store } from "./accounts";

const LOCK_TTL_S = 5;
const RETRY_MS = 25;
const MAX_TRIES = 200;

export async function withLock<T>(s: Store, name: string, fn: () => Promise<T>): Promise<T> {
  const key = `lock:${name}`;
  for (let i = 0; i < MAX_TRIES; i++) {
    if ((await s.incr(key, LOCK_TTL_S)) === 1) {
      try {
        return await fn();
      } finally {
        await s.take(key);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
  }
  throw new Error(`could not take lock ${name}`);
}
