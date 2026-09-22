import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export const ComplianceDashboard: React.FC = () => {
  return <main className="min-h-screen bg-[#050505] px-4 py-12 text-white"><section className="mx-auto max-w-2xl rounded-3xl border border-amber-300/25 bg-white/[0.04] p-6 sm:p-8"><div className="flex gap-3"><ShieldAlert className="mt-1 w-6 h-6 text-amber-300" /><div><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Legal review required</p><h1 className="mt-1 text-2xl font-bold">Compliance dashboard</h1><p className="mt-2 text-sm text-white/60">Jurisdiction and rules administration stays server-side so public client bundles never carry admin credentials or privileged write controls.</p></div></div><div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-white/70"><ShieldCheck className="mr-2 inline w-4 h-4 text-amber-300" />Record qualified counsel approvals and competition settings through an authenticated internal workflow that calls the protected admin APIs from a trusted server environment.</div></section></main>;
};
