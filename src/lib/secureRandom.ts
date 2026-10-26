// Unbiased random integers from the platform's cryptographic generator, used for
// card shuffles. Falls back to Math.random only where crypto is unavailable.

/** Uniform integer in [0, n). Rejection sampling avoids modulo bias. */
export function secureIndex(n: number): number {
  const c = globalThis.crypto;
  if (!c?.getRandomValues || n <= 1) return Math.floor(Math.random() * Math.max(1, n));
  const limit = Math.floor(0x1_0000_0000 / n) * n;
  const buf = new Uint32Array(1);
  do c.getRandomValues(buf); while (buf[0] >= limit);
  return buf[0] % n;
}

/** Fisher–Yates shuffle in place using secureIndex. */
export function secureShuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) { const j = secureIndex(i + 1); [items[i], items[j]] = [items[j], items[i]]; }
  return items;
}
