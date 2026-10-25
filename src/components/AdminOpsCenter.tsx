import { useState, type FormEvent } from "react";
import { BadgePoundSterling, ClipboardCheck, Coins, FileCheck2, Gauge, MailCheck, ScrollText, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  AMOE_RULES, adminAuditTrail, clearFlag, creditPostalEntry, economyInvariants, flagQueue, issueHardwareBan,
  payoutQueue, approvePayout, rejectPayout, tokenLedger,
} from "../lib/adminOps";
import { VOUCHER_BRANDS } from "../lib/redemptionEngine";
import { formatPence } from "../lib/redemption";

const voucherName = (id: string) => VOUCHER_BRANDS.find((v) => v.id === id)?.brand ?? id;

/**
 * Back-office "god-mode" sections. Pre-launch these run on demo feeds with a
 * real local audit trail; each panel names the server table it maps to from
 * db/schema.sql so the launch swap is drop-in.
 */
export function AdminOpsCenter() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  void tick;

  const flags = flagQueue();
  const payouts = payoutQueue();
  const ledger = tokenLedger();
  const invariants = economyInvariants();
  const audit = adminAuditTrail(12);

  return <section className="mt-10 border-t border-white/10 pt-8" data-testid="admin-ops">
    <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-rose-200"><ShieldAlert className="h-4 w-4" /> Back-office operations</p>
    <h2 className="mt-2 text-2xl font-black">God-mode controls</h2>
    <p className="mt-1 text-xs text-white/50">Demo feeds with a live audit trail pre-launch. Each panel maps to its production table in db/schema.sql.</p>

    {/* 1. Anti-cheat flag queue */}
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5" data-testid="ops-flag-queue">
      <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><ShieldAlert className="h-4 w-4 text-rose-300" /> Anti-cheat flag queue <span className="ml-auto text-[9px] font-bold normal-case text-white/35">integrity_flags</span></h3>
      <div className="mt-4 space-y-3">
        {flags.filter((f) => f.status === "open").length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/45">Queue clear — no open flags.</p>}
        {flags.map((f) => (
          <div key={f.id} className={`rounded-xl border p-4 ${f.status === "open" ? "border-rose-300/30 bg-rose-400/5" : "border-white/10 bg-black/25 opacity-60"}`} data-testid={`flag-${f.id}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black text-white">{f.userId} <span className="font-normal text-white/45">· {f.game} · score {f.riskScore}/100 · {f.tier.replaceAll("_", " ")}</span></p>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${f.status === "open" ? "bg-rose-400/20 text-rose-200" : f.status === "cleared" ? "bg-emerald-400/15 text-emerald-300" : "bg-zinc-500/20 text-zinc-300"}`}>{f.status}</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-amber-100/80">{f.evidence}</p>
            {f.status === "open" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => { clearFlag(f.id, ""); refresh(); }} data-testid={`flag-clear-${f.id}`} className="rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">Clear — false positive</button>
                <button onClick={() => { issueHardwareBan(f.id, ""); refresh(); }} data-testid={`flag-ban-${f.id}`} className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-1.5 text-[10px] font-black text-rose-100">Hardware ban</button>
              </div>
            )}
            {f.reviewedBy && <p className="mt-2 text-[10px] text-white/40">Reviewed by {f.reviewedBy}</p>}
          </div>
        ))}
      </div>
    </div>

    {/* 2. Manual payout approver */}
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5" data-testid="ops-payout-queue">
      <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><BadgePoundSterling className="h-4 w-4 text-amber-200" /> Manual payout approver <span className="ml-auto text-[9px] font-bold normal-case text-white/35">withdrawals · kyc_verifications</span></h3>
      <p className="mt-2 text-[11px] text-white/50">Any redemption over £500 sits in a 24h AML hold until reviewed here. KYC documents (Onfido/Yoti) and match logs attach at launch.</p>
      <div className="mt-4 space-y-3">
        {payouts.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/45">No payouts awaiting review.</p>}
        {payouts.map((row) => (
          <div key={row.order.id} className="rounded-xl border border-amber-300/25 bg-amber-400/5 p-4" data-testid={`payout-${row.order.id}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black text-white">{row.userId} <span className="font-normal text-white/45">· {voucherName(row.order.voucherId)} · {formatPence(row.order.valuePence)}</span></p>
              <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[9px] font-black uppercase text-amber-200">AML hold</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4">
              <span className="rounded-lg bg-black/30 px-2 py-1.5 text-white/60">KYC: <b className={row.kycStatus === "approved" ? "text-emerald-300" : "text-amber-200"}>{row.kycStatus}</b>{row.kycProvider ? ` (${row.kycProvider})` : ""}</span>
              <span className="rounded-lg bg-black/30 px-2 py-1.5 text-white/60">Name match: <b className={row.holderNameMatch ? "text-emerald-300" : "text-amber-200"}>{row.holderNameMatch ? "yes" : "pending"}</b></span>
              <span className="rounded-lg bg-black/30 px-2 py-1.5 text-white/60">Match logs: <b className="text-white">{row.recentMatches}</b></span>
              <span className="rounded-lg bg-black/30 px-2 py-1.5 text-white/60">Open flags: <b className={row.cleanFlags ? "text-rose-300" : "text-emerald-300"}>{row.cleanFlags}</b></span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { approvePayout(row.order.id); refresh(); }} data-testid={`payout-approve-${row.order.id}`} className="rounded-lg bg-emerald-400 px-3 py-1.5 text-[10px] font-black text-black">Approve payout</button>
              <button onClick={() => { rejectPayout(row.order.id, ""); refresh(); }} className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-3 py-1.5 text-[10px] font-black text-rose-100">Reject + refund</button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 3. Live token ledger audit */}
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5" data-testid="ops-token-ledger">
      <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><Coins className="h-4 w-4 text-amber-200" /> Token ledger audit <span className="ml-auto text-[9px] font-bold normal-case text-white/35">token_ledger_audit</span></h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-[9px] font-black uppercase tracking-wider text-white/40">Gold Coins sold</p><p className="mt-1 font-mono text-lg font-black text-amber-100" data-testid="ledger-coins-sold">{ledger.goldCoinsSold.toLocaleString()}</p></div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-[9px] font-black uppercase tracking-wider text-white/40">Free tickets out</p><p className="mt-1 font-mono text-lg font-black text-violet-100" data-testid="ledger-tickets-out">{ledger.sweepTicketsDistributed.toLocaleString()}</p></div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-[9px] font-black uppercase tracking-wider text-white/40">Tickets spent</p><p className="mt-1 font-mono text-lg font-black text-white/80">{ledger.sweepTicketsSpent.toLocaleString()}</p></div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-[9px] font-black uppercase tracking-wider text-white/40">Vouchers redeemed</p><p className="mt-1 font-mono text-lg font-black text-emerald-100">{ledger.vouchersRedeemedCount} · {formatPence(ledger.vouchersRedeemedPence)}</p></div>
      </div>
      <div className="mt-4 space-y-1.5" data-testid="ledger-invariants">
        {invariants.map((inv) => (
          <p key={inv.name} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] ${inv.ok ? "border-emerald-300/20 bg-emerald-400/5 text-emerald-100/80" : "border-rose-300/30 bg-rose-400/10 text-rose-100"}`}>
            {inv.ok ? <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" /> : <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />}
            <span><b>{inv.name}</b> — {inv.detail}</span>
          </p>
        ))}
      </div>
    </div>

    {/* 4. Postal AMOE credit tool */}
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5" data-testid="ops-postal-amoe">
      <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><MailCheck className="h-4 w-4 text-sky-300" /> Postal AMOE credit tool <span className="ml-auto text-[9px] font-bold normal-case text-white/35">postal_amoe_grants</span></h3>
      <p className="mt-2 text-[11px] text-white/50">When physical letters arrive, staff credit the account ID here. The audit row links the letter reference to the grant — the paper trail regulators expect.</p>
      <PostalCreditForm onDone={refresh} />
      <ul className="mt-3 space-y-1.5 text-[10px] text-white/45">
        {AMOE_RULES.map((r) => <li key={r} className="flex items-start gap-2"><FileCheck2 className="mt-0.5 h-3 w-3 shrink-0 text-sky-300" />{r}</li>)}
      </ul>
    </div>

    {/* Audit trail */}
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5" data-testid="ops-audit-trail">
      <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><ScrollText className="h-4 w-4 text-white/60" /> Admin audit trail</h3>
      {audit.length === 0
        ? <p className="mt-3 rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/45">No admin actions yet — every clear, ban, approval and AMOE credit lands here.</p>
        : <ul className="mt-3 space-y-1.5">
            {audit.map((ev) => (
              <li key={ev.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-[11px]">
                <span><b className="text-amber-100">{ev.action}</b> <span className="text-white/50">→ {ev.subject}</span> <span className="block text-white/40">{ev.detail}</span></span>
                <span className="font-mono text-[9px] text-white/35">{new Date(ev.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>}
    </div>

    <p className="mt-4 flex items-center gap-2 text-[10px] text-white/40"><ClipboardCheck className="h-3.5 w-3.5" /><Gauge className="h-3.5 w-3.5" /> All admin actions are append-only and cannot be edited or deleted from the UI.</p>
  </section>;
}

function PostalCreditForm({ onDone }: { onDone: () => void }) {
  const [userId, setUserId] = useState("");
  const [letterRef, setLetterRef] = useState("");
  const [msg, setMsg] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const res = creditPostalEntry(userId, letterRef);
    if ("reason" in res) { setMsg(res.reason); return; }
    setMsg(`Credited +${res.grant.tickets} Sweep Tickets to ${res.grant.userId} (letter ${res.grant.letterRef}).`);
    setUserId(""); setLetterRef("");
    onDone();
  };
  return <form onSubmit={submit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
    <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Account ID (usr_…)" data-testid="amoe-userid" className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-sky-300" />
    <input value={letterRef} onChange={(e) => setLetterRef(e.target.value)} placeholder="Letter reference (e.g. BAG-2026-04-17)" data-testid="amoe-letterref" className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-sky-300" />
    <button className="rounded-xl bg-sky-400 px-4 py-2.5 text-[11px] font-black uppercase text-black" data-testid="amoe-submit">Credit tickets</button>
    {msg && <p role="status" data-testid="amoe-msg" className="text-[11px] text-sky-100 sm:col-span-3">{msg}</p>}
  </form>;
}
