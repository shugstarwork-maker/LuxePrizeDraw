import { useEffect, useState } from "react";
import { AlarmClock, ArrowLeft, ExternalLink, HeartHandshake, ShieldAlert, ShieldCheck, Timer, Wallet } from "lucide-react";
import {
  EXCLUSION_PERIODS, RESPONSIBLE_PLAY_NOTE, SESSION_REMINDER_OPTIONS_MINUTES, SUPPORT_LINKS,
  activeExclusion, exclusionTimeLeft, reminderMinutes, sessionMinutes, setExclusion, setReminderMinutes,
  type ExclusionKind,
} from "../lib/responsiblePlay";
import { CARD_MONTHLY_CAP_PENCE, cardSpendThisMonthPence, customMonthlyCapPence, effectiveMonthlyCapPence, setCustomMonthlyCapPence } from "../lib/currencies";
import { formatPence } from "../lib/redemption";
import { MobileDock } from "./MobileDock";

const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo(0, 0); };

export function ResponsiblePlayPage() {
  const [, setTick] = useState(0);
  const [reminder, setReminder] = useState(() => reminderMinutes());
  const [confirming, setConfirming] = useState<ExclusionKind | null>(null);
  const exclusion = activeExclusion();

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const spent = cardSpendThisMonthPence();
  const mins = sessionMinutes();
  const effectiveCap = effectiveMonthlyCapPence();
  const customCap = customMonthlyCapPence();

  return <main className="min-h-screen bg-[#090a11] px-4 pb-28 pt-8 text-white sm:pt-12" data-testid="responsible-play">
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200"><ArrowLeft className="h-4 w-4" />Home</button>

      <header className="mt-6">
        <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-emerald-200"><HeartHandshake className="h-4 w-4" />Responsible Play Centre</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Play stays fun. You stay in control.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">{RESPONSIBLE_PLAY_NOTE}</p>
      </header>

      {/* Active exclusion banner */}
      {exclusion && (
        <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-5" role="alert" data-testid="exclusion-banner">
          <p className="flex items-center gap-2 text-sm font-black text-rose-100"><ShieldAlert className="h-4 w-4" /> {EXCLUSION_PERIODS[exclusion.kind].label} is active</p>
          <p className="mt-1 text-xs text-rose-100/70">Play surfaces and checkout are locked on this device for <b>{exclusionTimeLeft(exclusion)}</b>. It cannot be lifted early.</p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Session clock */}
        <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5" data-testid="session-clock">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><Timer className="h-4 w-4 text-amber-200" />Session clock</h2>
          <p className="mt-3 font-mono text-3xl font-black text-amber-100" data-testid="session-minutes">{mins} min</p>
          <p className="mt-1 text-xs text-white/50">Time on site this session. Resets after 6 hours away.</p>
        </section>

        {/* Reality check */}
        <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5" data-testid="reality-check">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><AlarmClock className="h-4 w-4 text-amber-200" />Reality-check reminder</h2>
          <p className="mt-2 text-xs text-white/50">A pop-up reminds you how long you've been playing, every:</p>
          <div className="mt-3 flex gap-2">
            {SESSION_REMINDER_OPTIONS_MINUTES.map((m) => (
              <button key={m} onClick={() => { setReminderMinutes(m); setReminder(m); }} data-testid={`reminder-${m}`}
                className={`rounded-xl border px-4 py-2 text-xs font-black transition ${reminder === m ? "border-amber-300 bg-amber-400/15 text-amber-100" : "border-white/15 bg-black/25 text-white/55"}`}>
                {m} min
              </button>
            ))}
          </div>
        </section>

        {/* Spend cap visibility */}
        <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5" data-testid="spend-cap-panel">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><Wallet className="h-4 w-4 text-amber-200" />Monthly spend cap</h2>
          <p className="mt-3 font-mono text-3xl font-black text-amber-100" data-testid="spend-cap-figure">{formatPence(spent)} <span className="text-sm text-white/50">/ {formatPence(effectiveCap)}</span></p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-300" style={{ width: `${Math.min(100, (spent / effectiveCap) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/50">Card purchases are hard-capped at £250 per calendar month by the UK prize-draw code. Free postal entry never counts against it.</p>
          <div className="mt-4 border-t border-white/10 pt-4" data-testid="custom-cap">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/60">Your own monthly limit {customCap !== null && <span className="ml-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] text-emerald-200">active: {formatPence(customCap)}</span>}</p>
            <p className="mt-1 text-[10px] text-white/45">Set a personal cap below the legal £250 ceiling — it overrides everything.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[25, 50, 100].map((gbp) => (
                <button key={gbp} onClick={() => { setCustomMonthlyCapPence(gbp * 100); setTick((n) => n + 1); }} data-testid={`custom-cap-${gbp}`}
                  className={`rounded-xl border px-3 py-1.5 text-[11px] font-black transition ${customCap === gbp * 100 ? "border-emerald-300 bg-emerald-400/15 text-emerald-100" : "border-white/15 bg-black/25 text-white/55"}`}>£{gbp}</button>
              ))}
              {customCap !== null && <button onClick={() => { setCustomMonthlyCapPence(null); setTick((n) => n + 1); }} data-testid="custom-cap-clear" className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-black text-white/60">Reset to £250</button>}
            </div>
          </div>
        </section>

        {/* Cooling-off / self-exclusion */}
        <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5" data-testid="exclusion-panel">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-white/85"><ShieldCheck className="h-4 w-4 text-amber-200" />Take a break</h2>
          <div className="mt-3 space-y-2">
            {(Object.keys(EXCLUSION_PERIODS) as ExclusionKind[]).map((kind) => {
              const p = EXCLUSION_PERIODS[kind];
              return <div key={kind} className="rounded-xl border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between gap-3">
                  <b className="text-xs text-white">{p.label}</b>
                  {confirming === kind
                    ? <span className="flex gap-1.5">
                        <button onClick={() => { setExclusion(kind); setConfirming(null); setTick((n) => n + 1); }} data-testid={`confirm-${kind}`} className="rounded-lg bg-rose-500 px-3 py-1.5 text-[10px] font-black text-white">Confirm</button>
                        <button onClick={() => setConfirming(null)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[10px] font-black text-white/60">Cancel</button>
                      </span>
                    : <button onClick={() => setConfirming(kind)} disabled={Boolean(exclusion)} data-testid={`set-${kind}`} className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-black text-white/70 transition hover:border-rose-300/40 disabled:opacity-40">Set</button>}
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-white/45">{p.blurb}</p>
              </div>;
            })}
          </div>
        </section>
      </div>

      {/* Support links */}
      <section className="mt-8 rounded-2xl border border-emerald-200/20 bg-emerald-300/5 p-6" data-testid="support-links">
        <h2 className="text-sm font-black uppercase tracking-wider text-emerald-100">Free, confidential support</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SUPPORT_LINKS.map((s) => (
            <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/25 p-4 transition hover:border-emerald-300/40">
              <span><b className="text-sm text-white">{s.name}</b><span className="mt-1 block text-[11px] leading-relaxed text-white/55">{s.note}</span></span>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
            </a>
          ))}
        </div>
      </section>

      <p className="mt-6 text-center text-[10px] text-white/40">Also read our <button onClick={() => navigate("/standards")} className="font-bold text-amber-200 underline underline-offset-4">participation standards</button> and <button onClick={() => navigate("/terms")} className="font-bold text-amber-200 underline underline-offset-4">terms &amp; rules</button>.</p>
    </div>
    <MobileDock />
  </main>;
}
