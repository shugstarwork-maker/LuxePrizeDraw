import React, { useCallback, useEffect, useState } from "react";
import { CircleCheck, KeyRound, LayoutDashboard, Lock, Plus, RefreshCw, ShieldCheck, Ticket, Trophy } from "lucide-react";

type Overview = { draws: number; openDraws: number; entries: number; accounts: number; freeTickets: number; redeemedTickets: number; settledDraws: number };
type DrawRow = { id: string; title: string; status: string; prize_value_minor: number; ticket_price_minor: number; maximum_entries: number; entries: number; approved: boolean | null; due_at: string | null; drawn_at: string | null; closes_at: string };
type FreeTicket = { email: string; draw_name: string; issued_at: string; redeemed_at: string | null; entry_ticket_id: string | null };

const gbp = (minor: number) => `£${(minor / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const AdminPanel: React.FC = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem("luxe-admin-pw") || "");
  const [authed, setAuthed] = useState(false);
  const [notice, setNotice] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [draws, setDraws] = useState<DrawRow[]>([]);
  const [tickets, setTickets] = useState<FreeTicket[]>([]);
  const [tab, setTab] = useState<"draws" | "tickets" | "new">("draws");
  const [form, setForm] = useState({ id: "", title: "", prizeDescription: "", prizeValue: "", ticketPrice: "10", maximumEntries: "500", closesInDays: "30" });

  const api = useCallback(async (path: string, options: RequestInit = {}) => {
    const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", "x-admin-password": password } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed.");
    return data;
  }, [password]);

  const loadAll = useCallback(async (pw: string) => {
    const res = await fetch("/api/admin/overview", { headers: { "x-admin-password": pw } });
    if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || "Unauthorized"); }
    setOverview(await res.json());
    const d = await (await fetch("/api/admin/draws", { headers: { "x-admin-password": pw } })).json();
    setDraws(d.draws || []);
    const t = await (await fetch("/api/admin/free-tickets", { headers: { "x-admin-password": pw } })).json();
    setTickets(t.tickets || []);
  }, []);

  const login = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setNotice("");
    try {
      await loadAll(password);
      sessionStorage.setItem("luxe-admin-pw", password);
      setAuthed(true);
    } catch (err) { setNotice(err instanceof Error ? err.message : "Login failed."); }
  };
  useEffect(() => { if (password) login(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id: string) => {
    try { await api(`/api/admin/draws/${id}/approve`, { method: "POST" }); await loadAll(password); setNotice(`Draw ${id} approved for auto-draw.`); }
    catch (err) { setNotice(err instanceof Error ? err.message : "Approve failed."); }
  };

  const createDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("");
    try {
      await api("/api/admin/draws", { method: "POST", body: JSON.stringify({
        id: form.id, title: form.title, prizeDescription: form.prizeDescription,
        prizeValueMinor: Math.round(parseFloat(form.prizeValue || "0") * 100),
        ticketPriceMinor: Math.round(parseFloat(form.ticketPrice || "0") * 100),
        maximumEntries: Number(form.maximumEntries), closesInDays: Number(form.closesInDays),
      }) });
      setNotice(`Draw "${form.title}" created and opened.`);
      setForm({ ...form, id: "", title: "", prizeDescription: "", prizeValue: "" });
      await loadAll(password);
      setTab("draws");
    } catch (err) { setNotice(err instanceof Error ? err.message : "Create failed."); }
  };

  if (!authed) return (
    <main className="min-h-screen bg-[#08090f] px-4 py-16 text-white">
      <form onSubmit={login} className="mx-auto max-w-sm rounded-3xl border border-white/10 bg-black/45 p-6 sm:p-8">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-[#D4AF37]/15 p-2.5"><Lock className="h-5 w-5 text-[#D4AF37]" /></div><div><h1 className="text-xl font-bold">Admin panel</h1><p className="text-xs text-white/50">Draws, tickets and platform controls.</p></div></div>
        <label className="mt-6 block text-xs font-bold text-white/70">Admin password
          <input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-white outline-none focus:border-[#D4AF37]" />
        </label>
        <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-wider text-black"><KeyRound className="h-4 w-4" /> Sign in</button>
        {notice && <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200">{notice}</p>}
      </form>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#08090f] px-4 py-8 pb-28 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-[#D4AF37]/15 p-2.5"><LayoutDashboard className="h-5 w-5 text-[#D4AF37]" /></div><div><h1 className="text-2xl font-black sm:text-3xl">Admin panel</h1><p className="text-xs text-white/50">Live platform control — connected to the draw database.</p></div></div>
          <div className="flex gap-2">
            <button onClick={() => loadAll(password)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold"><RefreshCw className="h-3.5 w-3.5" /> Refresh</button>
            <button onClick={() => { sessionStorage.removeItem("luxe-admin-pw"); setAuthed(false); setPassword(""); }} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold">Sign out</button>
          </div>
        </header>

        {overview && <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            ["Draws", overview.draws], ["Open", overview.openDraws], ["Entries", overview.entries],
            ["Accounts", overview.accounts], ["Free tickets", overview.freeTickets], ["Redeemed", overview.redeemedTickets], ["Settled", overview.settledDraws],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-3"><p className="text-[10px] font-black uppercase tracking-wider text-white/45">{label}</p><p className="mt-1 text-xl font-black text-amber-100">{value}</p></div>
          ))}
        </div>}

        <nav className="mt-6 flex gap-2">
          {([["draws", Trophy, "Draws"], ["tickets", Ticket, "Free tickets"], ["new", Plus, "New draw"]] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider ${tab === key ? "bg-[#D4AF37] text-black" : "border border-white/15 bg-white/5 text-white/70"}`}><Icon className="h-3.5 w-3.5" /> {label}</button>
          ))}
        </nav>

        {notice && <p aria-live="polite" className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-[#D4AF37]" />{notice}</p>}

        {tab === "draws" && <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-wider text-white/45"><tr><th className="px-4 py-3">Draw</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Prize</th><th className="px-4 py-3">Ticket</th><th className="px-4 py-3">Entries</th><th className="px-4 py-3">Auto-draw</th><th className="px-4 py-3" /></tr></thead>
            <tbody>
              {draws.map((d) => (
                <tr key={d.id} className="border-t border-white/10">
                  <td className="px-4 py-3"><b className="block text-sm">{d.title}</b><span className="font-mono text-white/40">{d.id}</span></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${d.status === "OPEN" ? "bg-emerald-400/15 text-emerald-300" : d.status === "DRAWN" ? "bg-amber-300/15 text-amber-200" : "bg-white/10 text-white/60"}`}>{d.status}</span></td>
                  <td className="px-4 py-3 font-mono">{gbp(d.prize_value_minor)}</td>
                  <td className="px-4 py-3 font-mono">{gbp(d.ticket_price_minor)}</td>
                  <td className="px-4 py-3 font-mono">{d.entries}/{d.maximum_entries}</td>
                  <td className="px-4 py-3">{d.drawn_at ? <span className="text-amber-200">Drawn</span> : d.approved ? <span className="inline-flex items-center gap-1 text-emerald-300"><CircleCheck className="h-3.5 w-3.5" /> Approved</span> : <span className="text-white/45">Pending</span>}</td>
                  <td className="px-4 py-3">{!d.approved && !d.drawn_at && <button onClick={() => approve(d.id)} className="rounded-lg bg-[#D4AF37] px-3 py-2 text-[10px] font-black uppercase text-black">Approve</button>}</td>
                </tr>
              ))}
              {draws.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-white/40">No draws yet — create one.</td></tr>}
            </tbody>
          </table>
        </div>}

        {tab === "tickets" && <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead className="bg-white/5 text-[10px] font-black uppercase tracking-wider text-white/45"><tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Draw</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ticket ID</th></tr></thead>
            <tbody>
              {tickets.map((t, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="px-4 py-3">{t.email}</td><td className="px-4 py-3">{t.draw_name}</td>
                  <td className="px-4 py-3 font-mono text-white/50">{new Date(t.issued_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{t.redeemed_at ? <span className="text-emerald-300">Redeemed</span> : <span className="text-amber-200">Issued</span>}</td>
                  <td className="px-4 py-3 font-mono text-white/50">{t.entry_ticket_id || "—"}</td>
                </tr>
              ))}
              {tickets.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-white/40">No free tickets issued yet — use the Admin ticket issue form on the free draws section.</td></tr>}
            </tbody>
          </table>
        </div>}

        {tab === "new" && <form onSubmit={createDraw} className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:grid-cols-2">
          {[["Draw ID (lowercase-with-dashes)", "id", "e.g. summer-supercar-draw"], ["Title", "title", "e.g. Summer Supercar Draw"], ["Prize description", "prizeDescription", "What the winner receives"], ["Prize value (£)", "prizeValue", "e.g. 50000"], ["Ticket price (£)", "ticketPrice", "e.g. 10"], ["Maximum entries", "maximumEntries", "e.g. 500"], ["Closes in (days)", "closesInDays", "e.g. 30"]].map(([label, key, ph]) => (
            <label key={key} className="block text-xs font-bold text-white/70">{label}
              <input required={key !== "prizeDescription"} value={(form as Record<string, string>)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-white outline-none focus:border-[#D4AF37]" />
            </label>
          ))}
          <div className="sm:col-span-2"><button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3 text-xs font-black uppercase tracking-wider text-black"><Plus className="h-4 w-4" /> Create and open draw</button></div>
        </form>}
      </div>
    </main>
  );
};
