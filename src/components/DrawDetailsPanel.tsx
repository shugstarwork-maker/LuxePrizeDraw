const drawDetails = [
  ["Entry fee", "Pending approved rules"],
  ["Free postal route", "Published before any draw opens"],
  ["Cash alternative", "Pending verified prize valuation"],
  ["Charity contribution", "Pending approved charity terms"],
] as const;

export function DrawDetailsPanel({ className = "" }: { className?: string }) {
  return <div className={`grid grid-cols-2 gap-2 rounded-2xl border border-amber-100/20 bg-black/55 p-3 backdrop-blur-md sm:grid-cols-4 ${className}`}>{drawDetails.map(([label, value]) => <div key={label} className="min-w-0 rounded-xl border border-white/10 bg-white/[.045] px-3 py-2.5"><p className="text-[9px] font-black uppercase tracking-[.12em] text-amber-100">{label}</p><p className="mt-1 text-[10px] font-bold leading-snug text-white/75 sm:text-[11px]">{value}</p></div>)}</div>;
}
