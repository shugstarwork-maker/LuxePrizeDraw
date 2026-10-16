import { useEffect, useState } from 'react';
import { countdownSeconds, ticketProgress } from '../lib/ticketProgress';
type Status = { state: string; tickets: number | null; target: number | null; dueAt: string | null; serverTime: number; resultRecorded?: boolean };
export function TicketDrawProgress({ drawId, proposedTarget }: { drawId: string; proposedTarget?: number | null }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [clock, setClock] = useState({ server: 0, received: 0 });
  const [now, setNow] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let stopped = false;
    const controller = new AbortController();
    const poll = async () => {
      try {
        const response = await fetch(`/api/ticket-draws/status?drawId=${encodeURIComponent(drawId)}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!stopped) { setStatus(data); setClock({ server: data.serverTime, received: performance.now() }); setFailed(false); }
      } catch { if (!stopped) setFailed(true); }
    };
    setStatus(null); void poll();
    const refresh = setInterval(poll, 2000);
    const tick = setInterval(() => setNow(performance.now()), 200);
    return () => { stopped = true; controller.abort(); clearInterval(refresh); clearInterval(tick); };
  }, [drawId]);
  const percent = failed ? null : ticketProgress(status?.tickets ?? null, status?.target ?? null);
  const seconds = !failed && status?.state === 'COUNTDOWN' && status.dueAt ? countdownSeconds(status.dueAt, clock.server + Math.max(0, now - clock.received)) : null;
  return <section className="mt-4 rounded-xl border border-amber-200/25 bg-black/60 p-3">
    <p className="text-sm font-black text-amber-100">Tickets {status?.target ? `${status.tickets ?? '—'} / ${status.target.toLocaleString('en-GB')}` : proposedTarget ? `— / ${proposedTarget.toLocaleString('en-GB')} proposed` : '— target pending'}</p>
    <div role="progressbar" aria-label="Verified ticket progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent ?? undefined} aria-valuetext={percent === null ? 'Verified tickets unavailable' : `${percent.toFixed(1)}%`} className="mt-2 h-3 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-gradient-to-r from-amber-300 to-emerald-300" style={{ width: `${percent ?? 0}%` }} /></div>
    <p role="status" className="mt-2 text-sm text-amber-100">{failed ? 'Live ticket status unavailable.' : status?.state === 'DRAWN' ? 'Draw result recorded. Winner publication pending verification.' : seconds !== null ? seconds > 0 ? `Automatic draw in ${seconds}` : '0 · Awaiting recorded draw result' : 'Approval pending or draw not ready.'}</p>
    <p className="mt-1 text-xs text-white/65">Proposed targets are not confirmed entry caps. No browser-generated sales or winners.</p>
  </section>;
}
