import React from "react";
import { ArrowLeft, BadgeCheck, CircleAlert, FileText, Handshake, ShieldCheck, Sparkles } from "lucide-react";

const navigate = (href: string) => {
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Publishing statuses shared with the company-records API (api/company-records).
// CONFIRMED requires a recorded evidence reference before anything may display publicly.
type Status = "CONFIRMED" | "OPPORTUNITY";

const demoRecords: { name: string; category: string; status: Status; note: string }[] = [
  { name: "Northern Supercar Hire", category: "Automotive experiences", status: "OPPORTUNITY", note: "Intended relationship under discussion. No logos, prize offers or partner claims are published until written approval." },
  { name: "Luxe Gaming Bundles", category: "Gaming Packages", status: "OPPORTUNITY", note: "Prospective supplier concept. Terms, availability and imagery remain unpublished pending evidence and approval." },
  { name: "Moss Prestige", category: "Prestige vehicles", status: "OPPORTUNITY", note: "Listing reference only. Vehicle specifications are illustrative until confirmed in approved rules." },
];

export function CredentialsPartnershipsPage() {
  return (
    <main className="min-h-screen bg-[#090a11] px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200">
          <ArrowLeft className="h-4 w-4" />Home
        </button>

        <section className="mt-6 rounded-[2rem] border border-amber-200/20 bg-black/35 p-7 sm:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200">
            <ShieldCheck className="h-4 w-4" />Credentials &amp; partnerships
          </p>
          <h1 className="mt-4 text-4xl font-black sm:text-6xl">Who we work with — and how we prove it</h1>
          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/65">
            Luxe Prize Draws is pre-launch. This page explains the confirmed-versus-opportunity publishing framework
            that governs every company name, logo, prize offer and partnership claim on this site. Nothing here is a
            contract, an entry route, or a promise of a prize.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-emerald-300/25 bg-emerald-400/5 p-5">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-emerald-300">
                <BadgeCheck className="h-4 w-4" />Confirmed
              </p>
              <h2 className="mt-3 font-black text-white">Evidenced before display</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/60">
                <li>A signed agreement or written approval is held on record.</li>
                <li>An evidence reference is recorded in the secured company-records register.</li>
                <li>Official names, logos and claims appear only after both checks pass.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-amber-200/25 bg-amber-300/5 p-5">
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-amber-200">
                <Handshake className="h-4 w-4" />Opportunity
              </p>
              <h2 className="mt-3 font-black text-white">Intended, not confirmed</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-white/60">
                <li>Describes a relationship under discussion — never a confirmed partnership.</li>
                <li>No logos, prize offers, partner claims or charity totals may be published.</li>
                <li>Re-labelled as Confirmed only when evidence is recorded and approved.</li>
              </ul>
            </article>
          </div>

          <h2 className="mt-12 text-2xl font-black text-white">Publishing checks</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Evidence on record", text: "Every Confirmed item carries an evidence reference from the secured company-records API introduced with this page." },
              { title: "Approval in writing", text: "Names, marks and prize claims are published only with written approval from the company concerned." },
              { title: "Rules alignment", text: "Any prize offer must match the approved official rules before a draw opens; otherwise it stays an opportunity." },
              { title: "Right to withdraw", text: "A partner can withdraw approval at any time; the corresponding claims are removed when the register updates." },
            ].map((card) => (
              <article key={card.title} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
                <h3 className="font-black text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{card.text}</p>
              </article>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-black text-white">Register preview</h2>
          <p className="mt-2 text-sm text-white/55">Demo entries shown with their current publishing status. No confirmed partnerships are published yet.</p>
          <div className="mt-5 space-y-3">
            {demoRecords.map((record) => (
              <article key={record.name} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-white">{record.name}</h3>
                  <p className="text-xs uppercase tracking-wider text-white/40">{record.category}</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{record.note}</p>
                </div>
                <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${record.status === "CONFIRMED" ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-300" : "border-amber-200/40 bg-amber-300/10 text-amber-200"}`}>
                  <BadgeCheck className="h-3.5 w-3.5" />{record.status === "CONFIRMED" ? "Confirmed" : "Opportunity"}
                </span>
              </article>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-black text-white">Promotional media</h2>
          <p className="mt-2 text-sm text-white/55">Reserved placements for approved partner media. Slots stay empty until evidence is recorded.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {["Partner spotlight", "Experience film", "Joint announcement"].map((slot) => (
              <div key={slot} className="grid aspect-video place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-4 text-center">
                <div>
                  <Sparkles className="mx-auto h-5 w-5 text-white/25" />
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/40">{slot}</p>
                  <p className="mt-1 text-[10px] text-white/30">Pending approval</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-amber-200/20 bg-amber-300/10 p-5 text-sm text-amber-50">
            <CircleAlert className="mr-2 inline h-5 w-5 text-amber-200" />
            Pre-launch page. “Prospective partner” identifies an intended relationship, not a confirmed partnership. Do not rely on prize, supplier or partner claims unless they appear in approved rules for an open draw.
          </div>

          <button onClick={() => navigate("/terms")} className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200">
            <FileText className="h-4 w-4" />View pre-launch terms
          </button>
        </section>
      </div>
    </main>
  );
}
