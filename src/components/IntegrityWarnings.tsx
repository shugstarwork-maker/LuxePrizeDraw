import { AlertTriangle, Hourglass, ShieldAlert, ShieldX, WifiOff } from "lucide-react";
import { FORFEIT_GRACE_SECONDS } from "../lib/skillGames";

// Anti-cheat & integrity GUI warnings. Pre-launch demo: these fire from local
// simulation only; at launch the server drives them mid-match.

export type IntegrityWarning =
  | { kind: "disconnect"; secondsLeft: number }
  | { kind: "stall"; secondsLeft: number }
  | { kind: "integrity_pause"; reasons: string[] }
  | { kind: "match_kill"; reasons: string[] }
  | { kind: "hardware_lock" };

/** Full-screen disconnect grace countdown — reconnect before the forfeit. */
export function DisconnectWarning({ secondsLeft, onReconnected }: { secondsLeft: number; onReconnected: () => void }) {
  const urgent = secondsLeft <= 15;
  return <div className="fixed inset-0 z-[1700] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" role="alertdialog" aria-label="Connection lost" data-testid="warn-disconnect">
    <div className={`w-full max-w-md rounded-3xl border p-6 text-center ${urgent ? "border-red-400/60 bg-[#1c0705]" : "border-amber-300/40 bg-[#14100a]"}`}>
      <WifiOff className={`mx-auto h-10 w-10 ${urgent ? "animate-pulse text-red-300" : "text-amber-200"}`} />
      <h2 className="mt-3 text-2xl font-black">Connection lost</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Reconnect within the grace window or the match is forfeited and your entry passes to your opponent.
      </p>
      <p className={`mt-4 font-mono text-5xl font-black ${urgent ? "text-red-300" : "text-amber-200"}`} data-testid="disconnect-countdown">{secondsLeft}s</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/40">of {FORFEIT_GRACE_SECONDS}s grace</p>
      <button onClick={onReconnected} className="mt-5 w-full rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-500 px-4 py-3 text-sm font-black text-black shadow-lg transition active:scale-95">
        I'm back — resume match
      </button>
    </div>
  </div>;
}

/** Stall warning — the server clock never stops ticking. */
export function StallWarning({ secondsLeft }: { secondsLeft: number }) {
  return <div className="pointer-events-none fixed inset-x-0 top-4 z-[1600] flex justify-center px-4" role="alert" data-testid="warn-stall">
    <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-amber-300/50 bg-[#1a1206]/95 px-5 py-3 shadow-2xl">
      <Hourglass className="h-5 w-5 animate-pulse text-amber-200" />
      <div>
        <p className="text-sm font-black text-amber-100">Your clock is running — move within {secondsLeft}s</p>
        <p className="text-[11px] text-white/55">Stalling forfeits the match. The server clock never pauses.</p>
      </div>
    </div>
  </div>;
}

/** Integrity pause — risk engine flagged the match; play is held. */
export function IntegrityPause({ reasons, onContinue }: { reasons: string[]; onContinue: () => void }) {
  return <div className="fixed inset-0 z-[1700] grid place-items-center bg-black/80 p-4 backdrop-blur-sm" role="alertdialog" aria-label="Integrity check" data-testid="warn-integrity">
    <div className="w-full max-w-md rounded-3xl border border-sky-300/40 bg-[#081018] p-6">
      <ShieldAlert className="mx-auto h-10 w-10 text-sky-300" />
      <h2 className="mt-3 text-center text-2xl font-black">Integrity check in progress</h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-white/60">
        Our fair-play engine has paused this match while it reviews play patterns. No entries are lost during a review.
      </p>
      {reasons.length > 0 && <ul className="mt-4 space-y-1.5 rounded-xl border border-white/10 bg-black/30 p-3">
        {reasons.map((r) => <li key={r} className="flex items-start gap-2 text-[11px] text-white/60"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-300" />{r}</li>)}
      </ul>}
      <button onClick={onContinue} className="mt-5 w-full rounded-xl border border-sky-300/40 bg-sky-400/15 px-4 py-3 text-sm font-black text-sky-100 transition hover:bg-sky-400/25">
        Understood
      </button>
      <p className="mt-3 text-center text-[10px] text-white/40">Repeated flags escalate: shadow flag → match kill → hardware ban.</p>
    </div>
  </div>;
}

/** Match kill — blatant violation; opponent wins. */
export function MatchKillNotice({ reasons, onExit }: { reasons: string[]; onExit: () => void }) {
  return <div className="fixed inset-0 z-[1700] grid place-items-center bg-black/85 p-4 backdrop-blur" role="alertdialog" aria-label="Match terminated" data-testid="warn-match-kill">
    <div className="w-full max-w-md rounded-3xl border border-red-400/60 bg-[#1c0705] p-6 text-center">
      <ShieldX className="mx-auto h-10 w-10 text-red-300" />
      <h2 className="mt-3 text-2xl font-black text-red-100">Match terminated</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        Fair-play systems detected a violation. Your opponent has been awarded the win and their entry back; your entry is frozen pending review.
      </p>
      {reasons.length > 0 && <ul className="mt-4 space-y-1.5 rounded-xl border border-red-400/25 bg-black/30 p-3 text-left">
        {reasons.map((r) => <li key={r} className="flex items-start gap-2 text-[11px] text-red-100/80"><ShieldX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-300" />{r}</li>)}
      </ul>}
      <button onClick={onExit} className="mt-5 w-full rounded-xl bg-gradient-to-b from-red-400 to-red-600 px-4 py-3 text-sm font-black text-white shadow-lg transition active:scale-95">
        Return to arena
      </button>
      <p className="mt-3 text-[10px] text-white/40">Appeal via support — human review confirms every match kill before any ban.</p>
    </div>
  </div>;
}

/** Hardware lock — confirmed cheating; device + payout blacklisted. */
export function HardwareLockNotice() {
  return <div className="fixed inset-0 z-[1800] grid place-items-center bg-black/95 p-4" role="alertdialog" aria-label="Account locked" data-testid="warn-hardware-lock">
    <div className="w-full max-w-md rounded-3xl border border-red-500/70 bg-[#120404] p-6 text-center">
      <ShieldX className="mx-auto h-12 w-12 text-red-400" />
      <h2 className="mt-3 text-2xl font-black text-red-100">Account permanently locked</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        A human review confirmed engine-assisted play. This account, this device, and the linked payout details are blacklisted
        from all prize play. Any frozen entries and Prize Points are void.
      </p>
      <p className="mt-4 text-[11px] text-white/40">If you believe this is an error, contact support with your account email.</p>
    </div>
  </div>;
}
