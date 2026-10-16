import React, { useEffect, useState } from "react";

export type LaunchDraw = { id: string; cat: string; title: string; grade: string; price: number; target: number; paused: boolean };
type State = { draws: LaunchDraw[]; proofNotes: { proof_key: string; reviewed: boolean; note: string }[] };
const proofKeys = ["officialRules", "prizeFunding", "fundSafeguards", "paymentControls", "counselSignoff"];
const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

export function LaunchDrawCard({ draw }: { draw: LaunchDraw }) {
  return <article className="rounded-2xl border border-white/15 bg-black/40 p-5">
    <p className="text-xs text-amber-200">{draw.cat} · Proposed · {draw.paused ? "Paused" : "Not open"}</p>
    <h2 className="mt-3 text-2xl font-black">{draw.title}</h2>
    <p className="mt-4 text-sm text-white/70">Proposed entry price: {money(draw.price)}</p>
    <p className="mt-2 text-xs text-white/50">Uploaded proposal: {draw.grade} · Revenue target {money(draw.target)}</p>
    <p className="mt-3 text-xs text-white/50">Verified sales unavailable. No winner selected.</p>
  </article>;
}

export function LaunchBuildPage() {
  const [draws, setDraws] = useState<LaunchDraw[]>([]);
  const [message, setMessage] = useState("Loading catalogue…");
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [key, setKey] = useState(proofKeys[0]);
  const [note, setNote] = useState("");
  const [reviewed, setReviewed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/launch-build?action=draws", { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      setDraws(data.draws); setMessage("");
    }).catch(() => { if (!controller.signal.aborted) setMessage("Catalogue unavailable. Entries remain locked."); });
    return () => controller.abort();
  }, []);
  const adminRequest = async (action: string, body?: object) => {
    const response = await fetch(`/api/launch-build?action=${encodeURIComponent(action)}`, {
      method: body ? "POST" : "GET", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(response.status === 401 ? "Admin access denied." : "Control store unavailable or request rejected. Check database setup.");
    return response.json();
  };
  const run = async (action?: string, body?: object) => {
    setBusy(true); setMessage("");
    try {
      if (action) await adminRequest(action, body);
      const data = await adminRequest("admin/state");
      setAdmin(data); setDraws(data.draws); setMessage(action ? "Review control saved. Entries and payments remain locked." : "Admin controls loaded.");
    } catch (error) { setAdmin(null); setMessage((error as Error).message); }
    finally { setBusy(false); }
  };
  return <main className="min-h-screen bg-[#090a11] px-4 py-10 text-white"><div className="mx-auto max-w-5xl">
    <a href="/" className="text-sm text-amber-200 underline">Back to home</a>
    <h1 className="mt-6 text-4xl font-black">Launch catalogue & controls</h1>
    <p className="mt-4 rounded-xl border border-amber-200/30 bg-amber-300/10 p-4 text-sm text-amber-100">Pre-launch proposals from the uploaded build. No entries, payments or prize entitlements are created. Prices, grades and targets require reconciliation with approved rules; they do not replace the existing economics model. Proposed per-person limit: 10 per draw.</p>
    <p role="status" className="my-5 text-sm text-amber-100">{message}</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{draws.map(draw => <div key={draw.id}><LaunchDrawCard draw={draw} /></div>)}</div>
    <section className="mt-10 rounded-2xl border border-white/15 bg-black/40 p-6">
      <h2 className="text-2xl font-black">Protected review controls</h2>
      <p className="mt-3 text-sm text-white/60">Review notes cannot enable launch. Postal slips continue through the <a href="/postal-intake" className="text-amber-200 underline">existing postal intake</a>. Tokens are held only in this page’s memory.</p>
      <form className="mt-4 flex flex-wrap gap-3" onSubmit={event => { event.preventDefault(); void run(); }}>
        <label className="text-sm">Admin token<input type="password" autoComplete="off" value={token} onChange={event => { setToken(event.target.value); setAdmin(null); }} className="ml-3 rounded bg-white/10 p-2" /></label>
        <button disabled={busy || !token} className="rounded bg-amber-300 px-4 py-2 text-black disabled:opacity-40">Load controls</button>
        <button type="button" onClick={() => { setToken(""); setAdmin(null); setNote(""); setMessage("Admin session cleared."); }} className="rounded border border-white/20 px-4 py-2">Clear session</button>
      </form>
      {admin && <div className="mt-6 space-y-5">
        <form className="space-y-3" onSubmit={event => { event.preventDefault(); void run("admin/proofs", { key, ok: reviewed, note }); }}>
          <label className="block text-sm">Evidence category<select value={key} onChange={event => setKey(event.target.value)} className="ml-3 rounded bg-[#191919] p-2">{proofKeys.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className="block text-sm">Review note<input maxLength={300} value={note} onChange={event => setNote(event.target.value)} className="ml-3 rounded bg-white/10 p-2" /></label>
          <label className="block text-sm"><input type="checkbox" checked={reviewed} onChange={event => setReviewed(event.target.checked)} /> Reviewed (not launch approval)</label>
          <button disabled={busy} className="rounded bg-amber-300 px-4 py-2 text-black disabled:opacity-40">Save review note</button>
        </form>
        <ul className="space-y-2 text-sm text-white/70">{admin.proofNotes.map(proof => <li key={proof.proof_key}>{proof.proof_key}: {proof.reviewed ? "Reviewed" : "Pending"} — {proof.note}</li>)}</ul>
        <div className="grid gap-2 sm:grid-cols-2">{admin.draws.map(draw => <button key={draw.id} disabled={busy} onClick={() => void run(`admin/draws/${draw.id}/${draw.paused ? "resume" : "pause"}`, {})} className="rounded border border-white/20 p-3 text-left text-sm disabled:opacity-40">{draw.paused ? "Resume review" : "Pause"}: {draw.title}</button>)}</div>
      </div>}
    </section>
  </div></main>;
}
