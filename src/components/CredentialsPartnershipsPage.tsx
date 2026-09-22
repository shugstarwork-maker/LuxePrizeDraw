import { BadgeCheck, Building2, Camera, ExternalLink, FileCheck2, Handshake, Play, ShieldCheck, Video } from "lucide-react";

type MediaItem = {
  title: string;
  description: string;
  type: "image" | "video";
  src: string;
  alt: string;
};

// Replace these demo assets only after the rights holder has approved their use.
const media: MediaItem[] = [
  {
    title: "Campaign photography",
    description: "Add approved launch imagery, partner activations and prize experiences.",
    type: "image",
    src: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1400&q=85",
    alt: "Luxury vehicle shown as a placeholder for approved campaign photography",
  },
  {
    title: "Partner story video",
    description: "Embed an approved partner introduction, testimonial or campaign film here.",
    type: "video",
    src: "",
    alt: "Video placeholder",
  },
  {
    title: "Behind the experience",
    description: "Share approved footage that shows how a prize experience is delivered.",
    type: "image",
    src: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1400&q=85",
    alt: "Luxury car interior shown as a placeholder for experience media",
  },
];

const credentials = [
  ["Written partner approval", "A named contact confirms the relationship, campaign wording, brand assets and publish date before anything is marked live."],
  ["Campaign terms published", "Prize description, eligibility, draw dates, entry mechanics and any limitations are linked before entries open."],
  ["Asset rights checked", "Photos, video, logos and testimonials are used only with documented permission from their owner."],
  ["Status stays accurate", "Opportunities remain clearly labelled until an agreement and campaign configuration are approved."],
];

export function CredentialsPartnershipsPage() {
  return <div className="min-h-screen bg-[#060707] pb-24 text-white sm:pb-10">
    <section className="border-b border-amber-200/15 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,.2),transparent_30%),linear-gradient(135deg,#151009,#060707_65%)]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-[10px] font-black uppercase tracking-[.2em] text-amber-100"><BadgeCheck className="h-4 w-4" /> Credentials & partnerships</p>
        <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.9] tracking-tight sm:text-7xl">SHOW THE WORK. <span className="text-amber-200">PROTECT THE TRUST.</span></h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-xl">A media-ready home for approved partnership stories, credentials and campaign content — with clear status labels that keep promotional claims accurate.</p>
        <div className="mt-8 flex flex-wrap gap-3"><a href="#media" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-black"><Camera className="h-4 w-4" /> View media space</a><a href="#validation" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 bg-black/30 px-5 py-3 text-xs font-black uppercase tracking-wider text-white"><ShieldCheck className="h-4 w-4" /> Our validation standard</a></div>
      </div>
    </section>

    <main>
      <section id="media" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Promotional media library</p><h2 className="mt-3 text-4xl font-black sm:text-6xl">CAMPAIGNS, IN MOTION.</h2></div><p className="max-w-sm text-sm leading-relaxed text-white/55">Use this space for verified photos and videos only. Demo images are clearly presented as placeholders until replaced with licensed campaign assets.</p></div>
        <div className="mt-9 grid gap-5 lg:grid-cols-3">{media.map((item) => <article key={item.title} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[.035]"><div className="relative aspect-[4/3] bg-black/40">{item.type === "image" ? <img src={item.src} alt={item.alt} className="h-full w-full object-cover opacity-80" loading="lazy" decoding="async" /> : <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle,rgba(251,191,36,.18),transparent_45%),#100e0a] px-8 text-center"><span className="grid h-14 w-14 place-items-center rounded-full border border-amber-200/40 bg-amber-300/10 text-amber-200"><Play className="h-6 w-6 fill-current" /></span><p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-amber-100">Video embed slot</p></div>}<span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-white/80">{item.type === "image" ? <Camera className="h-3 w-3" /> : <Video className="h-3 w-3" />}{item.type}</span></div><div className="p-5"><h3 className="text-2xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-white/60">{item.description}</p></div></article>)}</div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025] py-20 sm:py-28"><div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Partner status</p><h2 className="mt-3 text-4xl font-black sm:text-6xl">CLEAR, NEVER OVERSTATED.</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60">A partnership is only shown as confirmed after written approval and an approved campaign record. Until then, we use “opportunity” or “prospective” language.</p></div><div className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-emerald-200/20 bg-emerald-300/[.06] p-6"><Handshake className="h-6 w-6 text-emerald-200" /><p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-emerald-100">Confirmed</p><p className="mt-2 text-lg font-black">Written approval and an active campaign configuration are on file.</p></article><article className="rounded-2xl border border-amber-200/20 bg-amber-300/[.06] p-6"><Building2 className="h-6 w-6 text-amber-200" /><p className="mt-6 text-[10px] font-black uppercase tracking-[.18em] text-amber-100">Opportunity</p><p className="mt-2 text-lg font-black">A potential collaboration only — not an endorsement or confirmed partnership.</p></article></div></div></section>

      <section id="validation" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28"><p className="text-xs font-black uppercase tracking-[.2em] text-amber-200">Validity framework</p><h2 className="mt-3 text-4xl font-black sm:text-6xl">WHAT MAKES A CLAIM READY TO PUBLISH?</h2><div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{credentials.map(([title, detail], index) => <article key={title} className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[.06] to-transparent p-6"><FileCheck2 className="h-5 w-5 text-amber-200" /><p className="mt-7 text-3xl font-black text-amber-200">0{index + 1}</p><h3 className="mt-3 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-relaxed text-white/60">{detail}</p></article>)}</div>
        <div className="mt-8 rounded-[1.75rem] border border-amber-200/20 bg-amber-300/[.06] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8"><div><p className="text-lg font-black">Want to discuss a verified partnership?</p><p className="mt-2 text-sm text-white/60">We’ll review the proposal, permissions and campaign terms before public promotion.</p></div><a href="/prizes/northern-supercar-hire" className="mt-5 inline-flex shrink-0 items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200 sm:mt-0">View partnership opportunity <ExternalLink className="h-4 w-4" /></a></div>
      </section>
    </main>
  </div>;
}
