const drawDetails = [
  ["Entry", "Set in approved rules"],
  ["Cash equivalent", "Verified before the draw opens"],
  ["Charity from this draw", "Allocated under approved terms"],
] as const;

const navGo = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); };
export function DrawDetailsPanel({ className = "" }: { className?: string }) {
  return <section className={`grid grid-cols-3 gap-2 rounded-2xl border border-amber-100/25 bg-black/60 p-2.5 shadow-[0_12px_28px_rgba(0,0,0,.32)] backdrop-blur-md ${className}`}><a href="/terms" onClick={(e) => { e.preventDefault(); navGo("/terms"); }} className="col-span-3 text-center text-xs font-bold text-amber-200 underline underline-offset-4">General draw terms · free-entry requirements</a>{drawDetails.map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border border-amber-100/15 bg-[linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025))] px-2.5 py-2.5 shadow-[inset_0_1px_rgba(255,255,255,.09)]"><p className="text-[8px] font-black uppercase tracking-[.1em] text-amber-100 sm:text-[9px]">{label}</p><p className="mt-1 text-[10px] font-bold leading-snug text-white/80 sm:text-[11px]">{value}</p></div>)}</section>;
}
