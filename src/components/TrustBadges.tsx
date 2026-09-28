import { CheckCircle2, CircleAlert, Landmark, LockKeyhole, ScrollText, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

type Readiness = { requiredEvidence: Record<string, boolean>; launchReady: boolean };
const badges = [
  { key: "officialRules", label: "Official rules", icon: ScrollText },
  { key: "prizeFunding", label: "Prize funding", icon: Landmark },
  { key: "safeguarding", label: "Fund safeguards", icon: ShieldCheck },
  { key: "paymentProvider", label: "Payment controls", icon: LockKeyhole },
];

export function TrustBadges() {
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  useEffect(() => { fetch("/api/launch-readiness", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject()).then(setReadiness).catch(() => setReadiness(null)); }, []);
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="rounded-[2rem] border border-amber-200/20 bg-black/35 p-6 backdrop-blur sm:p-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Trust and safeguards</p><h2 className="mt-2 text-2xl font-black">Evidence-led launch controls</h2></div><p className="max-w-lg text-xs leading-relaxed text-white/50">A badge becomes verified only when the corresponding evidence is recorded in launch controls.</p></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{badges.map(({ key, label, icon: Icon }) => { const verified = Boolean(readiness?.requiredEvidence[key]); return <article key={key} className={`rounded-2xl border p-4 ${verified ? "border-emerald-300/35 bg-emerald-300/10" : "border-amber-200/20 bg-white/[.025]"}`}><Icon className={`h-5 w-5 ${verified ? "text-emerald-200" : "text-amber-200"}`} /><p className="mt-4 text-sm font-black">{label}</p><p className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/55">{verified ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" /> : <CircleAlert className="h-3.5 w-3.5 text-amber-200" />}{verified ? "Verified record" : "Pending verification"}</p></article>; })}</div><p className="mt-5 text-xs text-white/45">“Ring-fenced” or guaranteed-fund claims are not displayed until independently evidenced and included in the approved official rules.</p></div></section>;
}
