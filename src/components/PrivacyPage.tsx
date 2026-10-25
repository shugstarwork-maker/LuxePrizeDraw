// Draft privacy and cookie notice — describes what this pre-launch build actually
// collects. Must be reviewed by counsel before entries or payments open.
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); };

const sections: { title: string; body: string[] }[] = [
  {
    title: "Who we are",
    body: [
      "LuxePrizeDraw Ltd (company number SC888447, registered in Scotland, registered office 40 Donaldson Avenue, Stevenston, KA20 4EJ) is the controller of personal data collected through this site. Contact us about privacy at director@luxeprizedraw.com.",
    ],
  },
  {
    title: "What we collect",
    body: [
      "Free-play account: if you create an account we store your email address, display name, a scrypt hash of your password (never the password itself), your free-play chip balance, and when the account was created and last used. Free-play chips have no cash value.",
      "Sign-in sessions: each sign-in creates a random session token that expires after 30 days. You can end every session at once with “Sign out on all devices”.",
      "Security records: sign-in attempts are counted against the email address for up to 15 minutes to stop password guessing. The count is cleared when you sign in successfully and otherwise deleted automatically.",
      "Messages to our assistants: if you use an AI assistant feature, the text you type is sent to our AI provider through Vercel AI Gateway to generate a reply. Please don't include personal details you don't want processed.",
      "Usage and performance: we use Vercel Web Analytics and Speed Insights to count page views and measure loading speed. These are aggregated and do not use cookies or build a profile of you.",
    ],
  },
  {
    title: "Storage on your device",
    body: [
      "We do not use advertising or tracking cookies. The site uses your browser’s local storage to keep your game progress, settings, free-play balance and sign-in token on your device. This is strictly necessary for the features you choose to use. You can clear it at any time in your browser settings, which signs you out and resets local progress.",
    ],
  },
  {
    title: "Why we use it (lawful basis)",
    body: [
      "To provide your account and keep your progress across devices: performance of our agreement with you.",
      "To keep accounts secure, prevent abuse and keep league play fair: our legitimate interests.",
      "Aggregated analytics to improve the site: our legitimate interests.",
      "We do not sell your data or use it for marketing without your separate consent.",
    ],
  },
  {
    title: "Who we share it with",
    body: [
      "Our service providers process data on our behalf only: hosting (Vercel), account and game storage (Upstash), database hosting (Neon), and AI replies (Vercel AI Gateway and the model provider it routes to). Some providers may process data outside the UK. Where they do, we rely on UK adequacy regulations or approved contractual safeguards.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Account details are kept until you ask us to delete the account. Sessions expire after 30 days and sign-in attempt counters after 15 minutes. Analytics are aggregated and kept according to our provider’s retention period.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Under UK GDPR you can ask for a copy of your data, ask us to correct or delete it, object to or restrict how we use it, and ask for it in a portable format. Email director@luxeprizedraw.com from the address on your account. We will respond within one month.",
      "If you are unhappy with how we handle your data you can complain to the Information Commissioner’s Office (ico.org.uk, 0303 123 1113). We would appreciate the chance to resolve it first.",
    ],
  },
  {
    title: "Prize draws",
    body: [
      "No prize draw is open on this site. Before any draw accepts entries, a separate notice will explain how entry, eligibility, winner and payment information is used, as required by the general draw terms.",
    ],
  },
];

export function PrivacyPage() {
  return <main className="min-h-screen bg-[#090a11] px-4 py-8 text-white sm:py-12"><div className="mx-auto max-w-4xl">
    <button onClick={() => navigate("/")} className="inline-flex min-h-6 items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200"><ArrowLeft className="h-4 w-4" />Home</button>
    <section className="mt-6 rounded-[2rem] border border-amber-200/20 bg-black/35 p-7 sm:p-12">
      <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-200"><Lock className="h-4 w-4" />Privacy and cookies</p>
      <h1 className="mt-4 text-4xl font-black sm:text-6xl">Privacy notice</h1>
      <p className="mt-5 text-sm leading-relaxed text-white/65">Draft, last updated 25 October 2026. This notice covers the free-play site: accounts, games and leagues.</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/70">
        {sections.map((s) => <section key={s.title}><h2 className="font-black text-white">{s.title}</h2>{s.body.map((p) => <p key={p.slice(0, 40)} className="mt-2">{p}</p>)}</section>)}
      </div>
      <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200/20 bg-amber-300/10 p-4 text-xs text-amber-50"><ShieldCheck className="h-5 w-5 shrink-0 text-amber-200" />Draft notice pending legal review before launch.</div>
    </section>
  </div></main>;
}
