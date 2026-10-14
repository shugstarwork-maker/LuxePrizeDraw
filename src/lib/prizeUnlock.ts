/** GBP revenue targets; exact band ceilings belong to the lower grade. */
export function prizeUnlock(valueGBP: number, revenueGBP?: number) {
  if (!Number.isFinite(valueGBP) || valueGBP <= 0) return null;
  const grade = valueGBP <= 50_000 ? 1 : valueGBP <= 75_000 ? 2 : valueGBP <= 100_000 ? 3 : valueGBP <= 150_000 ? 4 : 5;
  const multiplier = grade + 5;
  const targetGBP = Math.round(valueGBP * 100) * multiplier / 100;
  const revenue = revenueGBP !== undefined && Number.isFinite(revenueGBP) && revenueGBP >= 0 ? revenueGBP : undefined;
  return { grade, multiplier, targetGBP, progress: revenue === undefined ? undefined : Math.min(100, revenue / targetGBP * 100), unlocked: revenue !== undefined && revenue >= targetGBP };
}
export const formatGBP = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(value);
