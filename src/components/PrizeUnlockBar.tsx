import { formatGBP, prizeUnlock } from '../lib/prizeUnlock';

/** Revenue must come from reconciled paid sales, not demo ticket counts. */
export function PrizeUnlockBar({ valueGBP, revenueGBP, label = 'Prize', estimated = true }: { valueGBP?: number; revenueGBP?: number; label?: string; estimated?: boolean }) {
  const state = valueGBP === undefined ? null : prizeUnlock(valueGBP, revenueGBP);
  const known = state?.progress !== undefined;
  return <section className="mt-4 rounded-xl border border-amber-200/25 bg-black/60 p-3 text-left">
    <div className="flex flex-wrap justify-between gap-2 text-[10px] font-black uppercase tracking-wider"><span className="text-white/65">Draw unlock progress</span><span className="text-amber-100">{state ? `Grade ${state.grade} · ${state.multiplier}×` : 'Valuation pending'}</span></div>
    <div role="progressbar" aria-label={`${label} draw unlock progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={known ? state.progress : undefined} aria-valuetext={known ? `${state.progress!.toFixed(1)}% of revenue target` : 'Sales data unavailable'} className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300" style={{ width: `${state?.progress ?? 0}%` }} /></div>
    <p className="mt-2 text-xs font-bold text-amber-100">{state ? `${estimated ? 'Planned target' : 'Revenue target'}: ${formatGBP(state.targetGBP)}${known ? ` · ${state.progress!.toFixed(1)}%` : ''}` : 'Target awaits confirmed GBP prize value.'}</p>
    <p className="mt-1 text-[10px] text-white/55">{known ? state.unlocked ? 'Revenue target reached; draw remains subject to approved rules.' : 'Draw locked until the revenue target is reached.' : 'Sales data unavailable · pre-launch draw locked.'}</p>
  </section>;
}
