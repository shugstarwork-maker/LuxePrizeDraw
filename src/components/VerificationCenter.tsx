import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Database, Fingerprint, Lock, MessageSquareText, Network, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { SCHEMA_MAP, WITHDRAWAL_DAILY_CAP_PENCE, WITHDRAWAL_MIN_PENCE, verificationProgress, verificationSteps, type VerificationStep } from "../lib/verification";
import { normaliseUKMobile, requestDemoCode, verifyDemoCode } from "../lib/collusion";
import { demoScenarios } from "../lib/collusionDemo";

const STEP_ICONS: Record<VerificationStep["id"], typeof ShieldCheck> = {
  account: BadgeCheck,
  device: Fingerprint,
  sms: Smartphone,
  kyc: ShieldCheck,
  payout: Wallet,
};

const STATUS_STYLE: Record<VerificationStep["status"], { chip: string; label: string }> = {
  done: { chip: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200", label: "Done" },
  demo: { chip: "border-sky-400/40 bg-sky-500/10 text-sky-200", label: "Live demo" },
  locked: { chip: "border-amber-300/40 bg-amber-400/10 text-amber-200", label: "Provider pending" },
};

const MODULE_LABEL: Record<string, string> = {
  core: "Core",
  A: "Module A · one person, one account",
  B: "Module B · UK age & identity (KYC)",
  C: "Module C · collusion analytics",
  payout: "Payout rails",
  redemption: "Prize redemption",
  anticheat: "Anti-cheat engine",
  D: "Module D · back-office ops",
};

export function VerificationCenter() {  const steps = useMemo(() => verificationSteps(), []);
  const progress = verificationProgress(steps);
  const [openTable, setOpenTable] = useState<string | null>("users");

  return <div className="min-h-screen bg-[#070503] px-4 pb-28 pt-6 text-white sm:px-6" data-testid="verification-center">
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200"><ShieldCheck className="h-3.5 w-3.5" /> Verification &amp; payout compliance</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Trust &amp; safety centre</h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/55">
          The verification layer from the compliance architecture — device fingerprinting (Module A), UK 18+ identity checks (Module B)
          and collusion analytics (Module C). This is a pre-launch simulation: no real identity data is collected and no decisions are enforced yet.
        </p>
      </header>

      {/* Progress */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-5" data-testid="verify-progress">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black">Your verification progress</p>
            <p className="mt-1 text-[11px] text-white/50">Prizes and payouts stay locked until every step clears.</p>
          </div>
          <span className="text-2xl font-black text-amber-200" data-testid="verify-progress-value">{progress}%</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      {/* Steps */}
      <section className="mt-5 grid gap-3 sm:grid-cols-2" data-testid="verify-steps">
        {steps.map((s) => {
          const Icon = STEP_ICONS[s.id];
          const st = STATUS_STYLE[s.status];
          return <article key={s.id} className="rounded-2xl border border-white/10 bg-white/[.04] p-4" data-step={s.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-300/30 bg-amber-400/10"><Icon className="h-5 w-5 text-amber-200" /></span>
                <div>
                  <h2 className="text-sm font-black">{s.label}</h2>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Module {s.module} · {s.table}</p>
                </div>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${st.chip}`}>{st.label}</span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/60">{s.detail}</p>
          </article>;
        })}
      </section>

      {/* Schema map */}
      <section className="mt-8" data-testid="schema-map">
        <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200"><Database className="h-3.5 w-3.5" /> Database schema — how it links</p>
        <h2 className="mt-2 text-xl font-black">Tables &amp; relationships</h2>
        <p className="mt-1 max-w-2xl text-[11px] text-white/50">
          The exact model from <code className="rounded bg-white/10 px-1">db/schema.sql</code>. Tap a table to see its columns and foreign-key links.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SCHEMA_MAP.map((t) => {
            const open = openTable === t.name;
            return <article key={t.name} className={`rounded-2xl border p-4 transition ${open ? "border-amber-300/40 bg-amber-400/[.06]" : "border-white/10 bg-white/[.04]"}`} data-table={t.name}>
              <button type="button" onClick={() => setOpenTable(open ? null : t.name)} className="flex w-full items-center justify-between gap-2 text-left">
                <div>
                  <p className="font-mono text-sm font-black text-amber-100">{t.name}</p>
                  <p className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-white/40">{MODULE_LABEL[t.module]}</p>
                </div>
                <ArrowRight className={`h-4 w-4 text-white/40 transition-transform ${open ? "rotate-90" : ""}`} />
              </button>
              <p className="mt-2 text-[11px] leading-relaxed text-white/60">{t.purpose}</p>
              {open && <div className="mt-3 border-t border-white/10 pt-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Key columns</p>
                <ul className="mt-1 space-y-1">
                  {t.keyColumns.map((c) => <li key={c} className="font-mono text-[11px] text-emerald-200/90">· {c}</li>)}
                </ul>
                {t.links.length > 0 && <>
                  <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-white/40">Links to</p>
                  <ul className="mt-1 space-y-1">
                    {t.links.map((l) => <li key={l.to + l.via} className="text-[11px] text-sky-200/90">→ <span className="font-mono">{l.to}</span> <span className="text-white/45">via {l.via}</span></li>)}
                  </ul>
                </>}
              </div>}
            </article>;
          })}
        </div>
      </section>

      {/* Module C demo — proximity gate scenarios */}
      <section className="mt-8" data-testid="proximity-demo">
        <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200"><Network className="h-3.5 w-3.5" /> Module C · proximity gate</p>
        <h2 className="mt-2 text-xl font-black">Prize-table seating checks</h2>
        <p className="mt-1 max-w-2xl text-[11px] text-white/50">
          Before any prize match, the server refuses to seat players who share an IP address, share a local network, or keep meeting each other in prize rooms. Casual social rooms are never blocked.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {demoScenarios().map((s) => (
            <article key={s.id} className={`rounded-2xl border p-4 ${s.verdict.allowed ? "border-emerald-400/25 bg-emerald-500/[.05]" : "border-red-400/25 bg-red-500/[.05]"}`} data-scenario={s.id}>
              <p className="text-sm font-black">{s.label}</p>
              <p className="mt-1 text-[11px] text-white/55">{s.description}</p>
              <p className={`mt-3 rounded-xl border px-3 py-2 text-[11px] font-bold leading-relaxed ${s.verdict.allowed ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
                {s.verdict.allowed ? "✓ Seating allowed" : `✕ Blocked — ${"detail" in s.verdict ? s.verdict.detail : ""}`}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SMS OTP demo */}
      <SmsOtpDemo />

      {/* Payout policy */}
      <section className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/[.06] p-5" data-testid="payout-policy">
        <p className="inline-flex items-center gap-2 text-sm font-black text-emerald-200"><Wallet className="h-4 w-4" /> Withdrawal policy (enforced in schema)</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
            <p className="text-xl font-black">£{WITHDRAWAL_MIN_PENCE / 100}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-white/50">Minimum withdrawal</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
            <p className="text-xl font-black">£{WITHDRAWAL_DAILY_CAP_PENCE / 100}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-white/50">Daily maximum</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
            <p className="text-xl font-black">18+</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-white/50">KYC before any payout</p>
          </div>
        </div>
      </section>

      <footer className="mt-8 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-[11px] leading-relaxed text-white/50">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
        <p>
          Pre-launch simulation. No identity documents, phone numbers or payout details are collected here. Provider keys
          (Yoti / Veriff / Onfido, Twilio / Firebase) and enforcement switch on only after legal approval.
          See the full SQL model in <code className="rounded bg-white/10 px-1">db/schema.sql</code>.
        </p>
      </footer>

      <p className="mt-6 text-center">
        <a href="/redeem" className="inline-flex items-center gap-2 text-xs font-bold text-amber-200 underline underline-offset-4">
          <MessageSquareText className="h-3.5 w-3.5" /> Preview the Prize Redemption Store
        </a>
      </p>
    </div>
  </div>;
}

/** Demo SMS verification flow — no real SMS is sent; the code is deterministic. */
function SmsOtpDemo() {
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<"enter" | "code" | "done">("enter");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const send = () => {
    const e164 = normaliseUKMobile(phone);
    if (!e164) { setError("Enter a valid UK mobile (07… or +44 7…)."); return; }
    const res = requestDemoCode(e164, "you");
    if (!res.ok) { setError(res.reason!); return; }
    setError("");
    setStage("code");
  };

  const verify = () => {
    const e164 = normaliseUKMobile(phone)!;
    const res = verifyDemoCode(e164, code, "you");
    if (!res.ok) { setError(res.reason!); return; }
    setError("");
    setStage("done");
  };

  return <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.04] p-5" data-testid="sms-demo">
    <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200"><Smartphone className="h-3.5 w-3.5" /> SMS code check · demo</p>
    <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-white/55">
      Try the one-phone-one-account flow. No SMS is actually sent — this demonstrates the Twilio / Firebase path that switches on at launch.
    </p>
    {stage === "enter" && <div className="mt-4 flex flex-wrap items-center gap-2">
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07123 456789" aria-label="Mobile phone number" type="tel" autoComplete="tel" inputMode="tel"
        className="w-56 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/30" data-testid="sms-phone-input" />
      <button onClick={send} className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black" data-testid="sms-send">Send code</button>
    </div>}
    {stage === "code" && <div className="mt-4 flex flex-wrap items-center gap-2">
      <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="4-digit code" inputMode="numeric" maxLength={4}
        className="w-40 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-center font-mono text-lg tracking-[.4em] text-white placeholder:text-white/30" data-testid="sms-code-input" />
      <button onClick={verify} className="rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black" data-testid="sms-verify">Verify</button>
      <p className="w-full text-[10px] text-white/40">Demo build: the code arrives instantly and is always the last 4 digits of the number.</p>
    </div>}
    {stage === "done" && <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200" data-testid="sms-verified">✓ Number verified and locked to this account — no other account can ever use it.</p>}
    {error && <p className="mt-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-[11px] font-bold text-red-200" role="alert">{error}</p>}
  </section>;
}
