import { useMemo, useState } from "react";
import { Flame, HeartCrack, VenetianMask, Share2, CirclePlay } from "lucide-react";
import { loadHighlights, highlightCaption, type Highlight, type HighlightType } from "../lib/pokerHighlights";

const TYPE_META: Record<HighlightType, { label: string; colour: string; Icon: typeof Flame }> = {
  "big-win": { label: "Big win", colour: "#7be3a8", Icon: Flame },
  "bad-beat": { label: "Bad beat", colour: "#ff7d7d", Icon: HeartCrack },
  "bluff": { label: "Bluff", colour: "#9db4ff", Icon: VenetianMask },
};

const timeAgo = (at: number) => {
  const mins = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

/**
 * Bad Beat Timeline — the automated highlights feed. Notable hands are clipped
 * as they settle at the tables; every clip can be shared straight to social
 * (Web Share API) or copied as a caption for TikTok/Instagram with one tap.
 */
export function HighlightsFeed() {
  const [clips, setClips] = useState<Highlight[]>(() => loadHighlights());
  const [copied, setCopied] = useState<string | null>(null);
  useMemo(() => setClips(loadHighlights()), []);

  const share = async (h: Highlight) => {
    const text = highlightCaption(h);
    if (navigator.share) {
      try { await navigator.share({ title: "Luxe Poker League highlight", text }); return; } catch { /* cancelled — fall through to copy */ }
    }
    try { await navigator.clipboard.writeText(text); setCopied(h.id); window.setTimeout(() => setCopied(null), 1800); } catch { /* clipboard blocked */ }
  };

  return (
    <section className="highlights-feed" aria-label="Your highlights">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.2em] text-amber-200"><CirclePlay className="h-3.5 w-3.5" /> Bad beat timeline</p>
      <h3 className="mt-2 text-xl font-black text-amber-50">Your highlights</h3>
      <p className="mt-1 text-xs text-white/55">Biggest wins, worst beats and craziest bluffs — clipped automatically as hands settle. Tap share to post the caption to TikTok or Instagram.</p>

      {clips.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-white/15 bg-black/30 p-4 text-center text-xs text-white/45">No clips yet — play a few hands at your league table and your highlights will appear here.</p>
      ) : (
        <ol className="mt-4 space-y-2.5">
          {clips.map((h) => {
            const meta = TYPE_META[h.type];
            return (
              <li key={h.id} className="highlight-clip rounded-2xl border border-white/10 bg-black/35 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider" style={{ background: `${meta.colour}1e`, color: meta.colour, border: `1px solid ${meta.colour}55` }}>
                    <meta.Icon className="h-3 w-3" /> {meta.label}
                  </span>
                  <span className="text-[9px] font-bold text-white/40">Hand #{h.handNumber} · {timeAgo(h.at)}</span>
                </div>
                <p className="mt-2 text-xs font-bold leading-relaxed text-white/80">{h.note}</p>
                {(h.yourCards.length > 0 || h.board.length > 0) && (
                  <p className="mt-1.5 font-mono text-[10px] text-amber-100/80">
                    {h.yourCards.length > 0 && <span>{h.yourCards.join(" ")}</span>}
                    {h.board.length > 0 && <span className="text-white/45"> · board {h.board.join(" ")}</span>}
                  </p>
                )}
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[9px] text-white/35">{h.table} · Season {h.season}</span>
                  <button type="button" onClick={() => void share(h)} className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-1.5 text-[10px] font-black text-amber-100 transition active:scale-95">
                    <Share2 className="h-3 w-3" /> {copied === h.id ? "Caption copied!" : "Share clip"}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <p className="mt-2 text-center text-[9px] text-white/35">Clips are saved on this device · free-play league · no cash value.</p>
    </section>
  );
}
