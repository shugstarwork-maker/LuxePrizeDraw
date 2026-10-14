import { useState } from "react";
import { Heart, Sparkles, UserRound } from "lucide-react";

export function CreatorCampaignDemo() {
  const [imageFailed, setImageFailed] = useState(false);
  return <section aria-labelledby="creator-campaign-title" className="mx-auto max-w-6xl px-4 py-12 text-white">
    <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-200">Creator charity campaigns · design demo</p>
    <h1 id="creator-campaign-title" className="mt-3 text-3xl font-black sm:text-5xl">A little glamour. A greater purpose.</h1>
    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">Preview concept only. No live partnership, charity collection or token offer is represented here.</p>
    <article className="luxe-wallet-card mt-8 grid max-w-4xl sm:grid-cols-2">
      <div className="relative min-h-96 bg-gradient-to-br from-purple-950 via-black to-amber-950">
        {imageFailed ? <div className="grid h-96 place-items-center text-amber-200"><UserRound size={100} aria-hidden="true" /><span className="sr-only">Demo portrait unavailable</span></div> : <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85" alt="Stock portrait used for layout demonstration; not the campaign partner" onError={() => setImageFailed(true)} className="h-full min-h-96 w-full object-cover" />}
        <span className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/85 p-3 text-xs text-white">Stock photo · person pictured is not affiliated with this campaign.</span>
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-9">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200"><Sparkles size={16} /> Fictional creator · demo only</span>
        <h2 className="mt-4 text-4xl font-black text-amber-100">Amber Vale</h2>
        <p className="mt-2 text-xs text-white/65">Fictional placeholder name—not a reference to a real person.</p>
        <p className="mt-6 text-lg font-bold">Discover our creator charity category.</p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">Your approved creator photo, nominated charity and free-token campaign details will appear here once confirmed.</p>
        <div className="mt-6 rounded-xl border border-amber-200/25 bg-black/40 p-4"><Heart className="text-amber-200" size={20} /><p className="mt-2 text-sm font-bold">Charity partner: to be confirmed</p><p className="mt-2 text-xs leading-relaxed text-white/65">Token amount, eligibility, use and charity benefit are not yet specified. No donation or token claiming is available in this demo.</p></div>
        <button disabled className="mt-6 rounded-xl border border-amber-200/40 bg-amber-300/10 px-5 py-3 text-sm font-bold text-amber-100 opacity-60">Free tokens · coming soon</button>
      </div>
    </article>
  </section>;
}
