// Full-screen league climb celebration — Duolingo-style. After an XP gain that
// moves you up the weekly table, the league goes full screen and your row glides
// from your old position up to your new one.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { PROMOTE_COUNT, weekEndsIn, type LeagueRow } from "../lib/pokerLeague";

const ROW_H = 64; // px — must match the rendered row height below

export type GlideEvent = {
  id: number;
  amount: number;
  before: LeagueRow[];
  after: LeagueRow[];
  tierName: string;
  tierColour: string;
};

export const LeagueGlideOverlay: React.FC<{ event: GlideEvent; onDone: () => void }> = ({ event, onDone }) => {
  const { before, after, tierName, tierColour, amount } = event;
  const oldRank = before.findIndex((r) => r.you) + 1 || before.length;
  const newRank = after.findIndex((r) => r.you) + 1 || 1;
  const climbed = Math.max(0, oldRank - newRank);

  // Window of rows centred on your new position (Duolingo shows ~5–6 rows).
  const { rows, start } = useMemo(() => {
    const len = after.length;
    const from = Math.max(0, Math.min(newRank - 3, len - 6));
    const to = Math.min(len, from + 6);
    return { rows: after.slice(from, to), start: from };
  }, [after, newRank]);

  const startOffset = Math.min(climbed, 5) * ROW_H; // glide distance from old rank (capped so it lands in view)

  const [settled, setSettled] = useState(false);
  const [xpPop, setXpPop] = useState(false);
  const raf = useRef(0);
  useEffect(() => {
    // two frames so the initial transform paints before the transition begins
    raf.current = requestAnimationFrame(() => { raf.current = requestAnimationFrame(() => setSettled(true)); });
    const t = window.setTimeout(() => setXpPop(true), 900);
    return () => { cancelAnimationFrame(raf.current); window.clearTimeout(t); };
  }, []);

  const inPromoteZone = newRank <= PROMOTE_COUNT;
  const title = newRank === 1
    ? `You're top of the ${tierName} League!`
    : inPromoteZone
      ? `You moved into the top ${PROMOTE_COUNT} in the ${tierName} League!`
      : `You climbed to #${newRank} in the ${tierName} League!`;

  return <div className="league-glide" role="dialog" aria-label="League climb">
    <div className="league-glide__gem" style={{ background: `radial-gradient(circle at 35% 30%, #ffffffcc, ${tierColour} 45%, #0009 130%)`, boxShadow: `0 18px 60px ${tierColour}88, 0 0 0 10px #ffffff10` }}>
      <span className="league-glide__gem-shine" />
    </div>

    <h2 className="mt-8 px-6 text-center text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h2>
    <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 text-sm font-black text-amber-300">
      <Timer className="h-4 w-4" />{weekEndsIn()}
    </p>

    <div className="league-glide__board mt-7 w-full max-w-md px-4">
      <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/[.06] shadow-2xl backdrop-blur-md">
        {rows.map((row, i) => {
          const rank = start + i + 1;
          const isYou = row.you;
          const zone = rank <= PROMOTE_COUNT ? "promote" : "";
          return <div key={row.name}
            className={`flex items-center gap-3 border-b border-white/5 px-4 ${isYou ? "bg-emerald-300/25" : zone === "promote" ? "bg-emerald-300/5" : ""}`}
            style={{
              height: ROW_H,
              ...(isYou ? {
                transform: settled ? "translateY(0)" : `translateY(${startOffset}px)`,
                transition: "transform 1.35s cubic-bezier(.22,1.4,.36,1)",
                position: "relative",
                zIndex: 2,
              } : { opacity: settled || !isYou ? 1 : 1 }),
            }}>
            <span className={`w-6 text-center font-mono text-sm font-black ${isYou ? "text-emerald-200" : zone === "promote" ? "text-emerald-300" : "text-white/45"}`}>{rank}</span>
            <span className={`relative flex h-10 w-10 items-center justify-center rounded-full border text-xs font-black ${isYou ? "border-emerald-300/70 bg-emerald-400/20 text-emerald-100" : "border-white/20 bg-black/40 text-white/60"}`}>
              {row.you ? "YOU" : row.name.slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-1 -right-1 text-xs leading-none drop-shadow">{row.flag}</span>
            </span>
            <b className={`flex-1 truncate text-base ${isYou ? "text-white" : "text-white/75"}`}>{row.name}{row.you ? " — you" : ""} <span className="ml-0.5 text-sm">{row.flag}</span></b>
            <span className={`relative font-mono text-sm font-black ${isYou ? "text-emerald-200" : "text-white/55"}`}>
              {row.xp} XP
              {isYou && xpPop && <span className="league-glide__xp-pop">+{amount} XP</span>}
            </span>
          </div>;
        })}
      </div>
      {climbed > 0 && <p className="mt-3 text-center text-xs font-bold uppercase tracking-[.2em] text-emerald-200/80">▲ up {climbed} place{climbed > 1 ? "s" : ""} · from #{oldRank} to #{newRank}</p>}
    </div>

    <button type="button" onClick={onDone}
      className="mt-9 w-full max-w-md rounded-2xl bg-gradient-to-b from-sky-400 to-sky-600 px-6 py-4 text-base font-black uppercase tracking-[.18em] text-white shadow-[0_6px_0_#075985,0_14px_40px_#0ea5e955] transition active:translate-y-1 active:shadow-[0_2px_0_#075985]">
      Continue
    </button>
  </div>;
};
