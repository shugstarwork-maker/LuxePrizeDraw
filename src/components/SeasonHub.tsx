import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Crown, Medal, Sparkles, TrendingUp, Trophy, Users } from "lucide-react";
import {
  championship, developmentStats, divisionProgress, enterChampionship, getSeason,
  recordChampionshipResult, recordEventResult, registerForEvent, weekFixtures,
  type ClubEvent,
} from "../lib/pokerSeason";

const TROPHY_STYLE: Record<string, { icon: string; ring: string; label: string }> = {
  champion: { icon: "text-amber-300", ring: "border-amber-300/60 bg-amber-300/10", label: "Champion" },
  "runner-up": { icon: "text-slate-200", ring: "border-slate-300/50 bg-slate-300/10", label: "Runner-up" },
  third: { icon: "text-orange-300", ring: "border-orange-300/50 bg-orange-300/10", label: "Third place" },
  finalist: { icon: "text-sky-200", ring: "border-sky-300/40 bg-sky-300/10", label: "Finalist" },
};

/** Season Hub: weekly leaderboards + club fixtures + 4-week championships + development stats. */
export function SeasonHub({ onPlayEvent }: { onPlayEvent: (label: string) => void }) {
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const [open, setOpen] = useState(true);

  const { info } = getSeason();
  const progress = useMemo(() => divisionProgress(), []);
  const fixtures = useMemo(() => weekFixtures(), []);
  const champ = info.phase === "championship" ? championship() : null;
  const stats = useMemo(() => developmentStats(), []);
  const [champBusy, setChampBusy] = useState(false);

  const phaseLabel = info.phase === "qualification" ? `Qualification · week ${info.weekInSeason} of 3` : "Championship week";
  const nextEvent: ClubEvent | undefined = fixtures.find((e) => !e.finished);

  const playEvent = (ev: ClubEvent) => {
    registerForEvent(ev.id);
    onPlayEvent(ev.name); // seats the player at their league table; the result maps back via reportEventFinish
    refresh();
  };

  // Championship: entering seats the player; the simulated final settles with a deterministic-ish result
  const playChampionship = () => {
    setChampBusy(true);
    enterChampionship();
    onPlayEvent(`Season ${info.season} Championship Final`);
    window.setTimeout(() => {
      // The final table settles around the player's season form: higher season XP → better expected finish
      const seed = stats.seasonXP + info.season * 97 + Date.now() % 997;
      const form = Math.min(0.85, 0.25 + stats.seasonXP / 2000);
      const roll = ((seed * 9301 + 49297) % 233280) / 233280;
      const place = roll < form * 0.25 ? 1 : roll < form * 0.55 ? 2 : roll < form * 0.85 ? 3 : 4 + Math.floor(roll * 5) % 5;
      recordChampionshipResult(place);
      setChampBusy(false);
      refresh();
    }, 4000);
    refresh();
  };

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-amber-200/25 bg-black/40">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="inline-flex items-center gap-2 font-black text-amber-100"><Trophy className="h-5 w-5 text-amber-300" />Season {info.season} · {phaseLabel}</span>
        {open ? <ChevronUp className="h-4 w-4 text-white/50" /> : <ChevronDown className="h-4 w-4 text-white/50" />}
      </button>

      {open && (
        <div className="space-y-5 px-4 pb-5">
          {/* Season timeline */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((w) => (
              <div key={w} className={`h-1.5 flex-1 rounded-full ${w < info.weekInSeason ? "bg-amber-300" : w === info.weekInSeason ? "bg-amber-300/70 animate-pulse" : "bg-white/10"}`} />
            ))}
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-white/45">week {info.weekInSeason}/4 · ends in {info.endsIn}</span>
          </div>

          {/* Division progress */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black" style={{ color: progress.tierColour }}>{progress.tierName} division · rank #{progress.yourRank}</span>
              <span className={progress.onTrack === "promote" ? "text-emerald-300" : progress.onTrack === "demote" ? "text-rose-300" : "text-white/55"}>
                {progress.onTrack === "promote" ? "Promotion zone" : progress.onTrack === "demote" ? "Relegation zone" : "Safe"}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all" style={{ width: `${Math.round(progress.promotionProgress * 100)}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-white/50">
              {progress.toPromotionXP > 0 ? `${progress.toPromotionXP} XP to reach the promotion cut` : "Above the promotion cut — hold the position to Sunday"}
            </p>
          </div>

          {/* Scheduled club tournaments */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/60"><CalendarDays className="h-4 w-4 text-sky-300" />This week's club tournaments</h3>
            <div className="mt-2 space-y-2">
              {fixtures.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-black text-white">{ev.name}</p>
                    <p className="text-[11px] text-white/50">{ev.dayLabel} {ev.timeLabel} · blinds {ev.blinds} · buy-in {ev.buyIn} · {ev.fieldSize} seats</p>
                    {ev.place != null && <p className="mt-0.5 text-[11px] font-bold text-amber-200">Finished #{ev.place} · +{ev.points} pts</p>}
                  </div>
                  {ev.finished && ev.place == null ? (
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase text-white/40">Missed</span>
                  ) : ev.place != null ? (
                    <span className="rounded-full bg-emerald-300/15 px-3 py-1.5 text-[10px] font-black uppercase text-emerald-300">Played</span>
                  ) : (
                    <button onClick={() => playEvent(ev)} className={`rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider ${ev.registered ? "bg-sky-300/15 text-sky-200 border border-sky-300/40" : "bg-gradient-to-b from-amber-300 to-amber-500 text-black"}`}>
                      {ev.registered ? "Play now" : "Register"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {nextEvent && <p className="mt-1.5 text-[11px] text-white/40">Next up: {nextEvent.name} · {nextEvent.dayLabel} {nextEvent.timeLabel}</p>}
          </div>

          {/* Championship */}
          <div className="rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/5 p-3">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-fuchsia-200"><Crown className="h-4 w-4" />Season {info.season} Championship</h3>
            {info.phase === "qualification" ? (
              <p className="mt-2 text-[12px] text-white/60">
                Qualification standings freeze at the end of week 3. The top 8 season-points earners are published as finalists
                and play the championship final in week 4 — digital trophies and profile honours on the line.
                Your season points so far: <b className="text-amber-200">{stats.seasonXP}</b>.
              </p>
            ) : champ && (
              <div className="mt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">Qualification frozen · finalists published</p>
                <ol className="mt-2 space-y-1">
                  {champ.finalists.map((f, i) => (
                    <li key={f.name} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${f.you ? "border border-amber-300/40 bg-amber-300/10 font-black text-amber-100" : "bg-white/5 text-white/70"}`}>
                      <span>#{i + 1} {f.you ? "You" : f.name}</span><span className="font-mono">{f.xp} pts</span>
                    </li>
                  ))}
                </ol>
                {champ.result ? (
                  <div className={`mt-3 flex items-center gap-3 rounded-xl border p-3 ${TROPHY_STYLE[champ.result.trophy].ring}`}>
                    <Medal className={`h-7 w-7 ${TROPHY_STYLE[champ.result.trophy].icon}`} />
                    <div>
                      <p className="text-sm font-black text-white">{TROPHY_STYLE[champ.result.trophy].label} — final place #{champ.result.place}</p>
                      <p className="text-[11px] text-white/55">Trophy added to your profile honours.</p>
                    </div>
                  </div>
                ) : champ.entered ? (
                  <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs text-white/70">{champBusy ? "Final table in play — settling the result…" : "You're entered. Run the final when ready."}</p>
                ) : champ.finalists.some((f) => f.you) ? (
                  <button onClick={playChampionship} disabled={champBusy} className="mt-3 w-full rounded-xl bg-gradient-to-b from-fuchsia-300 to-fuchsia-500 py-2.5 text-sm font-black text-black disabled:opacity-50">
                    {champBusy ? "Seating you at the final…" : "Play the Championship Final"}
                  </button>
                ) : (
                  <p className="mt-3 text-[12px] text-white/50">You didn't qualify this season — the top 8 made the final. Next season starts Monday.</p>
                )}
              </div>
            )}
          </div>

          {/* Long-term development */}
          <div>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/60"><TrendingUp className="h-4 w-4 text-emerald-300" />Player development</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Tournament finishes" value={String(stats.tournamentsPlayed)} sub={stats.bestFinish ? `best #${stats.bestFinish} · avg #${stats.avgFinish}` : "no finishes yet"} />
              <Stat label="Decisions reviewed" value={String(stats.decisionsReviewed)} sub="results through the review queue" />
              <Stat label="Consistency" value={`${stats.consistencyWeeks} wk`} sub={`avg ${stats.avgWeeklyXP} XP/week`} />
              <Stat label="Season XP" value={String(stats.seasonXP)} sub={stats.xpChangePct != null ? `${stats.xpChangePct >= 0 ? "+" : ""}${stats.xpChangePct}% vs last season` : "first recorded season"} trend={stats.xpChangePct} />
              <Stat label="Division" value={stats.tierNow} sub={stats.tierDelta != null && stats.tierDelta !== 0 ? `${stats.tierDelta > 0 ? "up" : "down"} ${Math.abs(stats.tierDelta)} since season start` : "holding since season start"} />
              <Stat label="Rating" value={String(stats.ratingNow)} sub={`${stats.ratingDelta >= 0 ? "+" : ""}${stats.ratingDelta} this season`} trend={stats.ratingDelta} />
            </div>
          </div>

          {/* Trophy cabinet + honours */}
          <div className="rounded-xl border border-amber-200/20 bg-amber-300/5 p-3">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-200"><Sparkles className="h-4 w-4" />Trophy cabinet & honours</h3>
            {stats.trophies.length === 0 && stats.honours.length === 0 ? (
              <p className="mt-2 text-[12px] text-white/50">No silverware yet — qualify for a championship or win a club event to start the collection.</p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {stats.trophies.map((t) => (
                  <div key={t.id} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 ${TROPHY_STYLE[t.kind].ring}`}>
                    <Trophy className={`h-4 w-4 ${TROPHY_STYLE[t.kind].icon}`} />
                    <span className="text-xs font-black text-white">{t.label}</span>
                  </div>
                ))}
                {stats.honours.map((h) => (
                  <div key={h.id} className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <Medal className="h-4 w-4 text-white/60" />
                    <div><p className="text-xs font-black text-white">{h.label}</p><p className="text-[10px] text-white/45">{h.detail}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-[10px] text-white/35"><Users className="h-3 w-3" />Free-play competition — no cash value. Standings use verified, confirmed points only.</p>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, sub, trend }: { label: string; value: string; sub: string; trend?: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-white/45">{label}</p>
      <p className={`mt-1 text-lg font-black ${trend != null ? (trend >= 0 ? "text-emerald-300" : "text-rose-300") : "text-white"}`}>{value}</p>
      <p className="text-[10px] text-white/45">{sub}</p>
    </div>
  );
}
