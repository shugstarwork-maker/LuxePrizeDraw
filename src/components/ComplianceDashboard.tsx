import React, { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export const ComplianceDashboard: React.FC = () => {
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [subdivision, setSubdivision] = useState("");
  const [reference, setReference] = useState("");
  const [notice, setNotice] = useState("All jurisdictions remain not reviewed until counsel approval is recorded.");

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin/compliance/jurisdictions", {
      method: "PUT", headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ country, subdivision: subdivision || null, status: "ALLOWED", legalApprovalReference: reference, registrationsEnabled: true, entriesEnabled: true, prizesEnabled: true, minimumAge: 18 }),
    });
    const data = await response.json();
    setNotice(response.ok ? `${data.country}${data.subdivision ? ` / ${data.subdivision}` : ""} is configured. Confirm the full approved feature matrix before enabling any sensitive feature.` : data.error || "Could not save jurisdiction.");
  };

  return <main className="min-h-screen bg-[#050505] px-4 py-12 text-white"><section className="mx-auto max-w-2xl rounded-3xl border border-amber-300/25 bg-white/[0.04] p-6 sm:p-8"><div className="flex gap-3"><ShieldAlert className="mt-1 w-6 h-6 text-amber-300" /><div><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Legal review required</p><h1 className="mt-1 text-2xl font-bold">Compliance dashboard</h1><p className="mt-2 text-sm text-white/60">This control stores jurisdiction settings. It does not determine legal eligibility; record qualified counsel’s approval reference before changing a jurisdiction from not reviewed.</p></div></div><form onSubmit={save} className="mt-7 grid gap-4"><label className="text-xs font-bold text-white/70">Admin password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 outline-none focus:border-amber-300" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-white/70">Country code<input required maxLength={2} placeholder="GB" value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 uppercase outline-none focus:border-amber-300" /></label><label className="text-xs font-bold text-white/70">State / province (optional)<input maxLength={8} placeholder="ENG" value={subdivision} onChange={(e) => setSubdivision(e.target.value.toUpperCase())} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 uppercase outline-none focus:border-amber-300" /></label></div><label className="text-xs font-bold text-white/70">Counsel approval reference<input required value={reference} onChange={(e) => setReference(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 outline-none focus:border-amber-300" /></label><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-xs font-black uppercase tracking-wider text-black"><ShieldCheck className="w-4 h-4" /> Record reviewed jurisdiction</button></form><p aria-live="polite" className="mt-5 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">{notice}</p></section></main>;
};
