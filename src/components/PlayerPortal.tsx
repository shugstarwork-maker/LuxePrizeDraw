import React, { useMemo, useState, type ElementType } from "react";
import {
  ArrowRight, CalendarDays, ChartNoAxesCombined, ChevronRight, CirclePlay, Crown, Flame,
  Gamepad2, Gift, Lock, Medal, ShieldCheck, Sparkles, Star, Swords, Target, Trophy, UserRound, Zap,
} from "lucide-react";
import { EntrantLookup } from "./EntrantLookup";
import { TrophyRoom } from "./TrophyRoom";
import { AchievementCabinet } from "./Achievements";
import { HighlightsFeed } from "./HighlightsFeed";
import {
  confirmedXP, currentLeague, loadLedger, playerFlag, provisionalXP, setPlayerFlag, tierByIndex, weeklyBoard, weeklyCutoffs,
  PROMOTE_COUNT, RELEGATE_COUNT,
} from "../lib/pokerLeague";

const FLAG_CHOICES = ["🇬🇧", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "🇮🇪", "🇺🇸", "🇨🇦", "🇦🇺", "🇳🇿", "🇿🇦", "🇦🇪", "🇮🇳", "🇵🇰", "🇳🇬", "🇬🇭", "🇰🇪", "🇯🇲", "🇵🇭", "🇵🇱", "🇷🇴", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇵🇹", "🇳🇱", "🇸🇪", "🇳🇴", "🇩🇰", "🇫🇮", "🇧🇷", "🇦🇷", "🇲🇽", "🇨🇴", "🇯🇵", "🇰🇷", "🇹🇷", "🇪🇬", "🇲🇦"];
import { developmentStats, divisionProgress, getSeason, weekFixtures } from "../lib/pokerSeason";

const navigate = (href: string) => { window.history.pushState({}, "", href); window.dispatchEvent(new PopStateEvent("popstate")); window.scrollTo({ top: 0, behavior: "smooth" }); };

type GameStats = { handsWon: number; biggestPot: number; streak: number; bestStreak: number };
const loadGameStats = (): GameStats => { try { return JSON.parse(localStorage.getItem("luxe-poker-stats") || "") ?? { handsWon: 0, biggestPot: 0, streak: 0, bestStreak: 0 }; } catch { return { handsWon: 0, biggestPot: 0, streak: 0, bestStreak: 0 }; } };

/** Duolingo-style player portal: identity, league position, quests, achievements — all from the real league/season state. */
export function PlayerPortal() {
  const [avatar] = useState(() => localStorage.getItem("luxe-poker-avatar") || "");
  const [flag, setFlag] = useState(() => playerFlag());
  const [flagOpen, setFlagOpen] = useState(false);
  const chips = Number(localStorage.getItem("luxe-poker-chips")) || 5000;
  const stats = useMemo(loadGameStats, []);

  const league = useMemo(() => currentLeague(), []);
  const board = useMemo(() => weeklyBoard(league), [league]);
  const tier = tierByIndex(league.tierIndex);
  const cutoffs = useMemo(() => weeklyCutoffs(board, league.tierIndex), [board, league.tierIndex]);
  const yourRank = board.findIndex((r) => r.you) + 1;
  const weekXP = confirmedXP() + provisionalXP();
  const progress = useMemo(() => divisionProgress(), []);
  const dev = useMemo(() => developmentStats(), []);
  const { info } = useMemo(() => getSeason(), []);
  const fixtures = useMemo(() => weekFixtures(), []);

  const todayXP = useMemo(() => {
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    return loadLedger().filter((e) => e.at >= dayStart.getTime() && e.status !== "voided").reduce((n, e) => n + e.amount, 0);
  }, []);

  const zone = yourRank <= PROMOTE_COUNT ? "promote" : yourRank > board.length - RELEGATE_COUNT ? "demote" : "safe";
  const xpToPromote = Math.max(0, cutoffs.promoteXP - weekXP);
  const promotePct = Math.min(100, Math.round((weekXP / Math.max(1, cutoffs.promoteXP)) * 100));

  const quests = [
    { icon: Zap, title: "Earn your daily bonus", detail: "+5 XP just for playing today", done: todayXP > 0, now: Math.min(todayXP, 5), goal: 5, unit: "XP today" },
    { icon: Target, title: "Reach the promotion cut", detail: `${cutoffs.promoteXP}+ XP this week promotes you`, done: weekXP >= cutoffs.promoteXP, now: Math.min(weekXP, cutoffs.promoteXP), goal: cutoffs.promoteXP, unit: "weekly XP" },
    { icon: Swords, title: "Play this week's fixture", detail: fixtures.find((f) => !f.finished)?.name ?? "All fixtures complete", done: fixtures.some((f) => f.registered), now: fixtures.filter((f) => f.registered).length, goal: Math.max(1, fixtures.filter((f) => !f.finished).length), unit: "entered" },
  ];

  const badges: { icon: string; name: string; detail: string; earned: boolean }[] = [
    { icon: "🃏", name: "First blood", detail: "Win your first hand", earned: stats.handsWon >= 1 },
    { icon: "🔥", name: "On a roll", detail: "Win 3 hands in a row", earned: stats.bestStreak >= 3 },
    { icon: "⚡", name: "Hot streak", detail: "Win 5 hands in a row", earned: stats.bestStreak >= 5 },
    { icon: "💰", name: "Big pot hunter", detail: "Win a pot of 500+", earned: stats.biggestPot >= 500 },
    { icon: "💯", name: "Centurion", detail: "Earn 100 XP in a week", earned: weekXP >= 100 },
    { icon: "🏟️", name: "Tournament debut", detail: "Play a club fixture", earned: dev.tournamentsPlayed >= 1 },
    { icon: "📈", name: "Climber", detail: "Earn a promotion", earned: (dev.tierDelta ?? 0) > 0 },
    { icon: "👑", name: "Season champion", detail: "Win a championship", earned: dev.trophies.some((t) => t.kind === "champion") },
  ];
  const earnedCount = badges.filter((b) => b.earned).length;

  // leaderboard slice: top 3 plus the rows around you
  const aroundYou = board.slice(Math.max(0, yourRank - 2), Math.min(board.length, yourRank + 1)).filter((r) => board.indexOf(r) >= 3);

  return (
    <main className="min-h-screen bg-[#08090f] px-4 py-8 pb-28 text-white sm:px-6 sm:py-12">
      <div className="cine-reveal mx-auto max-w-6xl space-y-6">

        {/* ── Profile hero ── */}
        <header className="rounded-[2rem] border border-amber-200/25 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,.2),transparent_35%),linear-gradient(135deg,#17120a,#0c0d16_55%,#151025)] p-6 shadow-2xl sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatar
                  ? <img src={avatar} alt="Your avatar" className="h-20 w-20 rounded-3xl border-2 border-amber-300/60 object-cover" />
                  : <div className="grid h-20 w-20 place-items-center rounded-3xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-200 to-amber-500 text-2xl font-black text-black">LP</div>}
                <button type="button" onClick={() => setFlagOpen((v) => !v)} title="Pick your country flag" className="absolute -bottom-1.5 -right-1.5 grid h-8 w-8 place-items-center rounded-full border-2 border-[#0c0d16] bg-black/80 text-base shadow-lg transition hover:scale-110">{flag}</button>
                {flagOpen && <div className="absolute left-0 top-full z-20 mt-2 grid w-56 grid-cols-8 gap-1 rounded-2xl border border-white/15 bg-[#0b0c14] p-2 shadow-2xl">
                  {FLAG_CHOICES.map((f) => <button key={f} type="button" onClick={() => { setPlayerFlag(f); setFlag(f); setFlagOpen(false); }} className={`rounded-lg p-1 text-lg transition hover:bg-white/10 ${f === flag ? "bg-amber-300/20 ring-1 ring-amber-300/60" : ""}`}>{f}</button>)}
                </div>}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-200">Player portal</p>
                <h1 className="mt-1 text-3xl font-black sm:text-4xl">Luxe Player</h1>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/55">
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider" style={{ background: `${tier.colour}22`, color: tier.colour, border: `1px solid ${tier.colour}55` }}><Crown className="h-3 w-3" />{tier.name} league</span>
                  Season {info.season} · week {info.weekInSeason}/4
                </p>
              </div>
            </div>
            <button onClick={() => navigate("/poker")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-amber-200"><CirclePlay className="h-4 w-4" /> Play now</button>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Win streak" value={String(stats.streak)} icon={Flame} tone="text-orange-300" sub={`best ${stats.bestStreak}`} />
            <Stat label="Weekly XP" value={String(weekXP)} icon={Zap} tone="text-amber-200" sub={`${xpToPromote} to promotion`} />
            <Stat label="Free-play chips" value={chips.toLocaleString()} icon={Sparkles} tone="text-amber-200" sub="no cash value" />
            <Stat label="League rank" value={`#${yourRank}`} icon={Medal} tone="text-emerald-200" sub={`of ${board.length}`} />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-5">

            {/* ── League positioning ── */}
            <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Your league position</p>
                  <h2 className="mt-1 text-xl font-black" style={{ color: tier.colour }}>{tier.name} League · #{yourRank} of {board.length}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${zone === "promote" ? "bg-emerald-400/15 text-emerald-300" : zone === "demote" ? "bg-rose-400/15 text-rose-300" : "bg-white/10 text-white/60"}`}>
                  {zone === "promote" ? "Promotion zone" : zone === "demote" ? "Relegation zone" : "Safe"}
                </span>
              </div>

              <div className="px-5 pt-4">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/45">
                  <span>Top {PROMOTE_COUNT} promote · bottom {RELEGATE_COUNT} relegated</span>
                  <span>ends in {info.endsIn}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all" style={{ width: `${promotePct}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-white/50">{weekXP} XP — {xpToPromote > 0 ? `${xpToPromote} XP to reach the promotion cut` : "above the promotion cut — keep it up!"}</p>
              </div>

              <ol className="mt-3 divide-y divide-white/5 px-2 pb-2">
                {board.slice(0, 3).map((row, i) => <BoardRow key={row.name} row={row} rank={i + 1} zone="promote" />)}
                {yourRank > 4 && <li className="px-4 py-1.5 text-center text-xs text-white/30">⋮</li>}
                {yourRank > 3 && aroundYou.map((row) => <BoardRow key={row.name} row={row} rank={board.indexOf(row) + 1} zone={board.indexOf(row) + 1 <= PROMOTE_COUNT ? "promote" : board.indexOf(row) + 1 > board.length - RELEGATE_COUNT ? "demote" : "safe"} />)}
              </ol>

              <div className="flex flex-wrap gap-2 border-t border-white/10 px-5 py-4">
                <button onClick={() => navigate("/poker")} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-300 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-black">Play a hand <ArrowRight className="h-3.5 w-3.5" /></button>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-[11px] font-bold text-white/60"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Free-play pride only — no prizes, no cash value</span>
              </div>
            </article>

            {/* ── Daily quests ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Daily quests</p><h2 className="mt-1 text-xl font-black">Keep the streak alive</h2></div>
                <Target className="h-7 w-7 text-amber-200" />
              </div>
              <div className="mt-4 space-y-3">
                {quests.map((q) => {
                  const pct = Math.min(100, Math.round((q.now / Math.max(1, q.goal)) * 100));
                  return (
                    <div key={q.title} className={`flex items-center gap-3 rounded-2xl border p-3.5 ${q.done ? "border-emerald-300/30 bg-emerald-300/5" : "border-white/10 bg-black/25"}`}>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${q.done ? "bg-emerald-300/20 text-emerald-300" : "bg-amber-300/15 text-amber-200"}`}><q.icon className="h-5 w-5" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-black">{q.title}</p><span className="shrink-0 text-[10px] font-bold text-white/45">{q.now}/{q.goal} {q.unit}</span></div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${q.done ? "bg-emerald-300" : "bg-amber-300"}`} style={{ width: `${pct}%` }} /></div>
                        <p className="mt-1 text-[11px] text-white/45">{q.done ? "Complete — nice work!" : q.detail}</p>
                      </div>
                      {q.done && <span className="shrink-0 text-lg">✅</span>}
                    </div>
                  );
                })}
              </div>
            </article>

            {/* ── Achievements ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Achievements</p><h2 className="mt-1 text-xl font-black">{earnedCount} of {badges.length} unlocked</h2></div>
                <Star className="h-7 w-7 text-amber-200" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {badges.map((b) => (
                  <div key={b.name} className={`rounded-2xl border p-3.5 text-center ${b.earned ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-black/25 opacity-55"}`}>
                    <span className={`text-2xl ${b.earned ? "" : "grayscale"}`}>{b.icon}</span>
                    <p className="mt-2 text-xs font-black">{b.name}</p>
                    <p className="mt-1 text-[10px] leading-snug text-white/45">{b.detail}</p>
                    <p className={`mt-1.5 text-[9px] font-black uppercase tracking-wider ${b.earned ? "text-amber-200" : "text-white/35"}`}>{b.earned ? "Unlocked" : <span className="inline-flex items-center gap-1"><Lock className="h-2.5 w-2.5" />Locked</span>}</p>
                  </div>
                ))}
              </div>
            </article>

            {/* ── Trophy room: 3D display case of league honours ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
              <TrophyRoom />
              <AchievementCabinet />
            </article>

            {/* ── Bad beat timeline: auto-clipped highlights ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-6">
              <HighlightsFeed />
            </article>
          </div>

          <div className="space-y-5">
            {/* ── Season progress ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Season {info.season}</p><CalendarDays className="h-4 w-4 text-amber-200" /></div>
              <div className="mt-3 flex items-center gap-1.5">
                {[1, 2, 3, 4].map((w) => <div key={w} className={`h-1.5 flex-1 rounded-full ${w < info.weekInSeason ? "bg-amber-300" : w === info.weekInSeason ? "bg-amber-300/70 animate-pulse" : "bg-white/10"}`} />)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
                <MiniStat label="Season XP" value={String(dev.seasonXP)} />
                <MiniStat label="Rating" value={String(dev.ratingNow)} />
                <MiniStat label="Fixtures played" value={String(dev.tournamentsPlayed)} />
                <MiniStat label="Best finish" value={dev.bestFinish ? `#${dev.bestFinish}` : "—"} />
              </div>
              {fixtures.length > 0 && (
                <div className="mt-4 space-y-2">
                  {fixtures.map((f) => (
                    <div key={f.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs">
                      <span className="font-bold">{f.name}</span>
                      <span className={`font-black uppercase tracking-wider text-[10px] ${f.finished ? "text-white/40" : f.registered ? "text-emerald-300" : "text-amber-200"}`}>{f.finished ? (f.place != null ? `#${f.place}` : "played") : f.registered ? "Registered" : "Open"}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => navigate("/poker")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200/40 bg-amber-300/10 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-amber-100 transition hover:bg-amber-300/20">Open season hub <ChevronRight className="h-4 w-4" /></button>
            </article>

            {/* ── Trophy cabinet ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Trophy cabinet</p><Trophy className="h-4 w-4 text-amber-200" /></div>
              {dev.trophies.length === 0 && dev.honours.length === 0
                ? <p className="mt-3 rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/45">No silverware yet — win a weekly league or the season championship to fill this cabinet.</p>
                : <div className="mt-3 space-y-2">{dev.trophies.map((t) => <div key={t.id} className="flex items-center gap-2.5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2.5 text-xs font-bold"><Trophy className="h-4 w-4 text-amber-300" />{t.label}<span className="ml-auto text-white/40">S{t.season}</span></div>)}{dev.honours.map((h) => <div key={h.id} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs"><Medal className="h-4 w-4 text-slate-300" />{h.label}<span className="ml-auto text-white/40">S{h.season}</span></div>)}</div>}
            </article>

            {/* ── Quick lobbies ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Jump back in</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <LobbyButton title="Poker lounge" detail="League tables, fixtures & multiplayer" icon={Crown} action={() => navigate("/poker")} />
                <LobbyButton title="Luxe arcade" detail="Chess, draughts, brag & more" icon={Gamepad2} action={() => navigate("/arcade")} />
              </div>
            </article>

            {/* ── Player development ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Player development</p><ChartNoAxesCombined className="h-4 w-4 text-amber-200" /></div>
              <div className="mt-3 space-y-2.5">
                {[{ l: "Hands won", v: stats.handsWon }, { l: "Biggest pot", v: stats.biggestPot.toLocaleString() }, { l: "Decisions reviewed", v: dev.decisionsReviewed }, { l: "Consistency", v: `${dev.consistencyWeeks} active week${dev.consistencyWeeks === 1 ? "" : "s"}` }, { l: "Avg weekly XP", v: dev.avgWeeklyXP }].map((row) => (
                  <div key={row.l} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-xs"><span className="text-white/55">{row.l}</span><b>{row.v}</b></div>
                ))}
              </div>
            </article>

            {/* ── Prize entries (gated) ── */}
            <article className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <div className="flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Prize draw entries</p><Gift className="h-4 w-4 text-amber-200" /></div>
              <p className="mt-2 text-[11px] leading-relaxed text-white/50">Entries open once the approved rules are published. Your ticket history will appear here.</p>
              <div className="mt-3"><EntrantLookup /></div>
            </article>

            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-white/40"><UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Your portal data lives on this device. One identity per player keeps the league fair — sign in on the poker page to carry chips across devices.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

const BoardRow: React.FC<{ row: { name: string; xp: number; you: boolean; delta: number; flag: string }; rank: number; zone: "promote" | "safe" | "demote" }> = ({ row, rank, zone }) => {
  const zoneClass = zone === "promote" ? "border-l-2 border-emerald-400/70" : zone === "demote" ? "border-l-2 border-rose-400/70" : "border-l-2 border-transparent";
  return (
    <li className={`flex items-center gap-3 px-4 py-2.5 text-sm ${zoneClass} ${row.you ? "bg-amber-300/10 font-black text-amber-100" : "text-white/75"}`}>
      <span className="w-6 text-center text-xs font-black text-white/40">{rank}</span>
      <span className={`relative grid h-7 w-7 place-items-center rounded-full text-[10px] font-black ${row.you ? "bg-amber-300 text-black" : "bg-white/10 text-white/60"}`}>{row.name.slice(0, 2).toUpperCase()}<span className="absolute -bottom-1 -right-1 text-[10px] leading-none drop-shadow">{row.flag}</span></span>
      <span className="flex-1 truncate">{row.name}{row.you && " — you"} <span className="ml-0.5">{row.flag}</span></span>
      <span className={`text-[10px] font-black ${row.delta > 0 ? "text-emerald-300" : row.delta < 0 ? "text-rose-300" : "text-white/30"}`}>{row.delta > 0 ? `▲${row.delta}` : row.delta < 0 ? `▼${-row.delta}` : "–"}</span>
      <span className="w-14 text-right font-black">{row.xp} <span className="text-[9px] font-bold text-white/40">XP</span></span>
    </li>
  );
};

function Stat({ label, value, icon: Icon, tone, sub }: { label: string; value: string; icon: ElementType; tone: string; sub?: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><Icon className={`h-4 w-4 ${tone}`} /><p className="mt-2 text-[10px] font-black uppercase tracking-wider text-white/45">{label}</p><p className="mt-1 text-lg font-black">{value}</p>{sub && <p className="text-[10px] text-white/40">{sub}</p>}</div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5"><p className="text-sm font-black">{value}</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">{label}</p></div>;
}

function LobbyButton({ title, detail, icon: Icon, action }: { title: string; detail: string; icon: ElementType; action: () => void }) {
  return <button onClick={action} className="group rounded-2xl border border-white/10 bg-black/25 p-4 text-left transition hover:border-amber-200/60 hover:bg-amber-300/10"><Icon className="h-5 w-5 text-amber-200" /><p className="mt-3 text-sm font-black">{title}</p><p className="mt-1 text-[11px] leading-relaxed text-white/55">{detail}</p><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-100">Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" /></span></button>;
}
