import { useMemo, useState } from "react";
import { BadgePoundSterling, Gift, Lock, MailCheck, ShieldCheck, Store } from "lucide-react";
import { REDEMPTION_CATEGORIES, REDEMPTION_ITEMS, STORE_RULES, formatPence, type RedemptionCategory } from "../lib/redemption";
import { AML_REVIEW_HOURS, AML_REVIEW_THRESHOLD_PENCE, POINTS_PER_POUND, VOUCHER_BRANDS, pointsCost, prizePoints } from "../lib/redemptionEngine";
import { WITHDRAWAL_DAILY_CAP_PENCE, WITHDRAWAL_MIN_PENCE } from "../lib/verification";

export function RedemptionStore() {
  const [cat, setCat] = useState<RedemptionCategory | "all">("all");
  const items = useMemo(() => (cat === "all" ? REDEMPTION_ITEMS : REDEMPTION_ITEMS.filter((i) => i.category === cat)), [cat]);

  return <div className="min-h-screen bg-[#070503] px-4 pb-28 pt-6 text-white sm:px-6" data-testid="redemption-store">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200"><Store className="h-3.5 w-3.5" /> Prize Redemption Store</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Where wins become prizes</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/55">
            A visual preview of the post-launch store. Every shelf is locked until launch day, KYC providers are live and legal sign-off lands —
            nothing on this page can be claimed yet.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-amber-200" data-testid="store-locked-badge">
          <Lock className="h-3.5 w-3.5" /> Preview — opens after launch
        </span>
      </header>

      {/* Compliance rules — always visible */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3" data-testid="store-rules">
        {STORE_RULES.map((rule, i) => (
          <div key={i} className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[.06] p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <p className="text-[11px] font-semibold leading-relaxed text-emerald-100/90">{rule}</p>
          </div>
        ))}
      </section>

      {/* Category filter */}
      <nav className="mt-6 flex flex-wrap gap-2" data-testid="store-filters">
        {REDEMPTION_CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => setCat(c.id)}
            className={`rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition ${cat === c.id ? "border-amber-300/60 bg-amber-400/15 text-amber-100" : "border-white/15 bg-white/5 text-white/55 hover:text-white"}`}>
            {c.label}
          </button>
        ))}
      </nav>

      {/* Catalogue grid */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="store-grid">
        {items.map((item) => (
          <article key={item.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[.06] to-white/[.02] p-5" data-item={item.id}>
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/25 bg-amber-400/10 text-3xl">{item.icon}</span>
              <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white/50">Preview</span>
            </div>
            <h2 className="mt-4 text-base font-black">{item.name}</h2>
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">{item.blurb}</p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="inline-flex items-center gap-1.5 text-lg font-black text-amber-200">
                <BadgePoundSterling className="h-4 w-4" />{formatPence(item.costPence)} <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">credit</span>
              </p>
              <button type="button" disabled title="Opens after launch and an approved 18+ ID check"
                className="cursor-not-allowed rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white/40"
                data-testid={`redeem-btn-${item.id}`}>
                <Lock className="mr-1 inline h-3 w-3" /> Locked
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* Instant digital voucher payouts (Tango Card / Giftbit) */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.04] p-5" data-testid="voucher-rail">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm font-black text-amber-100"><MailCheck className="h-4 w-4" /> Instant digital vouchers</p>
          <span className="rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-1 font-mono text-xs font-black text-emerald-100">★ {prizePoints().toLocaleString()} Prize Points</span>
        </div>
        <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-white/55">
          At launch, redemptions call a B2B gift-card API (Tango Card / Giftbit) that buys the voucher and emails the code automatically —
          no manual transfers, no physical shipping. Rate: {POINTS_PER_POUND.toLocaleString()} points = £1.
          Anything over {formatPence(AML_REVIEW_THRESHOLD_PENCE)} holds {AML_REVIEW_HOURS}h for an anti-cheat review before release (AML ceiling).
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          {VOUCHER_BRANDS.map((v) => (
            <div key={v.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-center" data-voucher={v.id}>
              <p className="text-sm font-black">{v.brand}</p>
              <p className="mt-0.5 text-lg font-black text-amber-200">{formatPence(v.valuePence)}</p>
              <p className="text-[10px] text-white/45">★ {pointsCost(v.valuePence).toLocaleString()} pts</p>
              <button type="button" disabled title="Locked until launch — Prize Points are only ever won in Sweep Ticket matches" className="mt-2 w-full cursor-not-allowed rounded-lg border border-white/15 bg-white/5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/40">Locked</button>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.04] p-5" data-testid="store-how-it-works">
        <p className="inline-flex items-center gap-2 text-sm font-black text-amber-100"><Gift className="h-4 w-4" /> How redemption will work</p>
        <ol className="mt-3 grid gap-3 sm:grid-cols-4">
          {[
            ["Win", "Win verified winnings credit in prize draws — never by spending chips."],
            ["Verify", "Pass the 18+ ID check (Yoti / Veriff / Onfido) and match a payout method."],
            ["Redeem", "Pick a prize or cash credit — £" + WITHDRAWAL_MIN_PENCE / 100 + " minimum, £" + WITHDRAWAL_DAILY_CAP_PENCE / 100 + " daily max on payouts."],
            ["Receive", "Cash pays to the name on your ID; physical prizes ship tracked to you."],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Step {i + 1} · {title}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-center">
        <a href="/verify" className="text-xs font-bold text-amber-200 underline underline-offset-4">See the verification layer that protects this store</a>
      </p>
    </div>
  </div>;
}
