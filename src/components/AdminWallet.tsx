// Staff support lookup: a read-only view of one player's chips and this week's results.
// Needs the staff password. Nothing on this page can change a balance.
import { useState } from "react";

type Result = {
  profile: { id: string; name: string; email: string; createdAt: number };
  chips: number;
  world: { week: string; total: number; perGame: Record<string, { xp: number; games: number; wins: number }> };
};

export function AdminWallet() {
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const search = async () => {
    setBusy(true); setError(""); setResult(null);
    try {
      const res = await fetch(`/api/admin/player?q=${encodeURIComponent(query)}`, { headers: { "x-admin-password": password } });
      const data = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const messages: Record<string, string> = {
          not_found: "This page is not available on this server.",
          wrong_password: "That password is not correct.",
          too_many_attempts: "Too many attempts. Wait 15 minutes and try again.",
          no_such_player: "No player matches that ID or email.",
        };
        setError(messages[String(data.error)] ?? "The lookup could not be completed.");
      } else {
        setResult(data as unknown as Result);
      }
    } catch {
      setError("The lookup could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const [reports, setReports] = useState<{ id: string; authorId: string; text: string; reason: string }[] | null>(null);
  const staffHeaders = { "x-admin-password": password, "content-type": "application/json" };

  const loadReports = async () => {
    const res = await fetch("/api/admin/chat/reports", { headers: { "x-admin-password": password } });
    if (!res.ok) return setError("Chat reports could not be loaded with that password.");
    setReports(((await res.json()) as { reports: { id: string; authorId: string; text: string; reason: string }[] }).reports);
  };
  const act = async (path: string, body: Record<string, unknown>) => {
    await fetch(path, { method: "POST", headers: staffHeaders, body: JSON.stringify(body) });
    await loadReports();
  };

  return <main className="min-h-screen bg-[#07070b] px-4 py-8 text-white">
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-black">Player lookup (read-only)</h1>
      <p className="text-xs text-white/50">For support only. The password is not stored, and nothing here changes a balance.</p>
      <label className="block text-xs font-black uppercase tracking-wider text-white/60">Staff password
        <input type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm" />
      </label>
      <label className="block text-xs font-black uppercase tracking-wider text-white/60">Player ID or email
        <input value={query} onChange={(e) => setQuery(e.target.value)} className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm" />
      </label>
      <button type="button" onClick={() => void search()} disabled={busy || !password || !query} className="rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-wider text-black disabled:opacity-40">Look up</button>
      {error && <p role="alert" className="rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
      <section className="space-y-3 rounded-xl border border-white/15 bg-black/40 p-4 text-sm">
        <h2 className="font-black">Chat reports</h2>
        <button type="button" onClick={() => void loadReports()} disabled={!password} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-wider disabled:opacity-40">Load open reports</button>
        {reports?.length === 0 && <p className="text-white/60">No open reports.</p>}
        {reports?.map((r) => <div key={r.id} className="space-y-2 rounded-lg bg-white/5 p-3">
          <p className="break-words">"{r.text}"</p>
          <p className="text-xs text-white/50">Author ID: {r.authorId}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void act("/api/admin/chat/ban", { accountId: r.authorId, reason: `Upheld report ${r.id}` }).then(() => act("/api/admin/chat/resolve", { reportId: r.id, outcome: "upheld" }))} className="rounded-lg bg-rose-300/20 px-3 py-2 text-xs font-black text-rose-100">Ban author and uphold</button>
            <button type="button" onClick={() => void act("/api/admin/chat/resolve", { reportId: r.id, outcome: "dismissed" })} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black">Dismiss</button>
          </div>
        </div>)}
      </section>
      {result && <section className="space-y-3 rounded-xl border border-white/15 bg-black/40 p-4 text-sm">
        <p><b>{result.profile.name}</b> · {result.profile.id}</p>
        <p className="text-white/60">{result.profile.email} · joined {new Date(result.profile.createdAt).toLocaleDateString("en-GB")}</p>
        <p>Card-game chips: <b>{result.chips.toLocaleString("en-GB")}</b></p>
        <p>This week ({result.world.week}): <b>{result.world.total} XP</b></p>
        <ul className="space-y-1 text-white/70">
          {Object.entries(result.world.perGame as Record<string, { xp: number; games: number; wins: number }>).map(([game, g]) => <li key={game}>{game}: {g.xp} XP · {g.games} games · {g.wins} wins</li>)}
        </ul>
      </section>}
    </div>
  </main>;
}
