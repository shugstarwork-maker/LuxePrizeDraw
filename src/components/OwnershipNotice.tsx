import { Copyright, ShieldCheck } from "lucide-react";

export function OwnershipNotice() {
  return <aside className="border-b border-amber-200/20 bg-black/70 px-4 py-2 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[10px] font-bold uppercase tracking-[.12em] text-amber-100/85"><span className="inline-flex items-center gap-1.5"><img src="/icons/icon-32.png" alt="LuxePrizeDraw crown logo" className="h-4 w-4 rounded" /><Copyright className="h-3.5 w-3.5" /> © 2026 LuxePrizeDraw Ltd · Proprietary product</span><span className="inline-flex items-center gap-1.5 text-white/50"><ShieldCheck className="h-3.5 w-3.5 text-amber-200" /> Copyright, source and visual assets protected</span></div></aside>;
}
