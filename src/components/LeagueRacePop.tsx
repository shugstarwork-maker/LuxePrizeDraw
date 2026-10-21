import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import type { LeagueRow } from "../lib/pokerLeague";

export type RacePop = {
  id: number;
  amount: number;
  before: LeagueRow[];
  after: LeagueRow[];
  tierColour: string;
} | null;

const ROW_H = 34; // must match .race-pop__row height + gap in CSS

/** Duolingo-style XP race pop-up: floats over the table the moment league XP lands,
 *  showing +XP and your row climbing past rivals in real time. */
export function LeagueRacePop({ pop }: { pop: RacePop }) {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    setSettled(false);
    if (!pop) return;
    const t1 = requestAnimationFrame(() => requestAnimationFrame(() => setSettled(true)));
    return () => cancelAnimationFrame(t1);
  }, [pop?.id]);

  const view = useMemo(() => {
    if (!pop) return null;
    const yourIdx = pop.after.findIndex((r) => r.you);
    const prevIdx = pop.before.findIndex((r) => r.you);
    const from = Math.max(0, yourIdx - 2);
    const to = Math.min(pop.after.length, yourIdx + 3);
    const rows = pop.after.slice(from, to).map((row, i) => {
      const newIdx = from + i;
      const oldIdx = pop.before.findIndex((r) => r.name === row.name);
      const dy = oldIdx >= 0 ? (oldIdx - newIdx) * ROW_H : 0;
      return { row, newIdx, dy, passed: row.you && prevIdx > yourIdx };
    });
    return { rows, yourIdx, prevIdx, climbed: prevIdx - yourIdx };
  }, [pop]);

  if (!pop || !view) return null;
  return (
    <div key={pop.id} className="race-pop" aria-live="polite">
      <div className="race-pop__burst" style={{ color: pop.tierColour }}><TrendingUp className="h-4 w-4" />+{pop.amount} XP</div>
      <div className="race-pop__board">
        {view.rows.map(({ row, newIdx, dy }) => (
          <div
            key={row.name}
            className={`race-pop__row ${row.you ? "race-pop__row--you" : ""}`}
            style={{ transform: settled ? "translateY(0)" : `translateY(${dy}px)`, transition: settled ? "transform .6s cubic-bezier(.22,.9,.28,1)" : "none" }}
          >
            <span className="race-pop__rank">#{newIdx + 1}</span>
            <b>{row.you ? "You" : row.name}</b>
            <span className="race-pop__xp">{row.xp} XP</span>
          </div>
        ))}
      </div>
      {view.climbed > 0 && <p className="race-pop__note">You climbed {view.climbed} {view.climbed === 1 ? "spot" : "spots"}!</p>}
    </div>
  );
}
