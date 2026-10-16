export function ticketTarget(targetGBP: number, entryGBP: number) {
  const target = Math.round(targetGBP * 100), price = Math.round(entryGBP * 100);
  return Number.isSafeInteger(target) && target > 0 && Number.isSafeInteger(price) && price > 0 ? Math.ceil(target / price) : null;
}
export function ticketProgress(tickets: number | null, target: number | null) {
  if (!Number.isSafeInteger(tickets) || tickets === null || tickets < 0 || !Number.isSafeInteger(target) || target === null || target <= 0) return null;
  return Math.min(100, tickets / target * 100);
}
export function countdownSeconds(dueAt: string, now: number) {
  const due = Date.parse(dueAt);
  return Number.isFinite(due) && Number.isFinite(now) ? Math.max(0, Math.min(10, Math.ceil((due - now) / 1000))) : null;
}
