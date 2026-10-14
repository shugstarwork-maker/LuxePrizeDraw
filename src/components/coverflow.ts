/** Signed shortest distance around the ring; stable item keys animate between slots. */
export function coverflowOffset(index: number, active: number, count: number): number {
  return ((index - active + count + Math.floor(count / 2)) % count) - Math.floor(count / 2);
}
