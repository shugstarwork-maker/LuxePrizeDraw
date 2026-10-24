import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CircleDot, MessageSquareText, Mic, MicOff, MonitorPlay, Radio, RotateCcw, ScanLine, Send, Users, Video, VideoOff } from "lucide-react";
import { STUDIO_CAMERAS, loadBroadcast, onBroadcastChange, pushChat, pushOcrRead, resetBroadcast, saveBroadcast, type StudioBroadcast } from "../lib/studioBroadcast";

const timeNow = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function LiveClock() {
  const [now, setNow] = useState(timeNow());
  useEffect(() => { const t = window.setInterval(() => setNow(timeNow()), 1000); return () => window.clearInterval(t); }, []);
  return <span className="font-mono text-xs text-white/60">{now}</span>;
}

export function StudioPanel() {
  const [b, setB] = useState<StudioBroadcast>(() => loadBroadcast());
  const [micOn, setMicOn] = useState(true);
  const [autoOcr, setAutoOcr] = useState(true);
  const [chatDraft, setChatDraft] = useState("");
  const ocrTimer = useRef<number | null>(null);

  // Stay in sync with other tabs (the table view listens too).
  useEffect(() => onBroadcastChange(() => setB(loadBroadcast())), []);

  const update = (next: StudioBroadcast) => { setB(next); saveBroadcast(next); };

  // Simulated OCR shoe: while live with auto-scan on, read a card every ~4s.
  useEffect(() => {
    if (!b.live || !autoOcr) return;
    ocrTimer.current = window.setInterval(() => {
      setB((cur) => { const next = pushOcrRead(loadBroadcast()); saveBroadcast(next); return next; });
    }, 4000);
    return () => { if (ocrTimer.current) window.clearInterval(ocrTimer.current); };
  }, [b.live, autoOcr]);

  const goLive = () => update({ ...b, live: true, startedAt: Date.now(), note: `On air — ${b.camera} broadcasting to the table canvas.` });
  const cut = () => update({ ...b, live: false, startedAt: null, note: "Stream cut — table canvas back to scenery." });

  const onAirSeconds = useMemo(() => (b.live && b.startedAt ? Math.max(0, Math.floor((Date.now() - b.startedAt) / 1000)) : 0), [b.live, b.startedAt, b.reads.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendChat = () => {
    const text = chatDraft.trim();
    if (!text) return;
    setChatDraft("");
    update(pushChat(b, "Studio", text));
  };

  return <div className="min-h-screen bg-[#070503] px-4 pb-28 pt-6 text-white sm:px-6">
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-amber-200"><MonitorPlay className="h-3.5 w-3.5" /> Luxe Studio — demo panel</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Broadcast control</h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/55">Demo of the live-dealer pipeline from the architecture reference: start a stream, scan cards through the shoe cam, and watch the poker table canvas receive it. No real video, dealers or players — simulation only.</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveClock />
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${b.live ? "border-red-400/60 bg-red-500/15 text-red-200" : "border-white/15 bg-white/5 text-white/50"}`}>
            <CircleDot className={`h-3 w-3 ${b.live ? "animate-pulse" : ""}`} />{b.live ? `On air · ${onAirSeconds}s` : "Off air"}
          </span>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        {/* Stream control + monitor */}
        <section className="rounded-3xl border border-white/12 bg-white/[.03] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-100"><Video className="h-4 w-4" /> Stream control</h2>
            <div className="flex gap-2">
              {!b.live
                ? <button onClick={goLive} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-red-400 to-red-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95"><Radio className="h-4 w-4" /> Go live</button>
                : <button onClick={cut} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/80 active:scale-95"><VideoOff className="h-4 w-4" /> Cut stream</button>}
              <button onClick={() => { update(resetBroadcast()); setChatDraft(""); }} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-white/60 active:scale-95"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Camera select">
            {STUDIO_CAMERAS.map((cam) => <button key={cam} onClick={() => update({ ...b, camera: cam, note: `Switched to ${cam}.` })} className={`rounded-xl border px-2 py-2.5 text-[11px] font-black uppercase tracking-wider transition ${b.camera === cam ? "border-amber-300/70 bg-amber-300/15 text-amber-100" : "border-white/10 bg-black/30 text-white/50 hover:border-white/30"}`}><Camera className="mx-auto mb-1 h-4 w-4" />{cam}</button>)}
          </div>

          {/* Dealer monitor mock */}
          <div className={`relative mt-4 overflow-hidden rounded-2xl border ${b.live ? "border-red-400/40" : "border-white/10"} bg-black`}>
            <div className="studio-monitor relative aspect-video">
              {b.live
                ? <><div className="studio-scanlines absolute inset-0" aria-hidden="true" />
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Live · {b.camera}</div>
                    <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 font-mono text-[10px] text-white/70">{b.reads.length} reads</div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                      <p className="text-xs font-black text-amber-100">Demo feed — simulated studio floor</p>
                      <p className="mt-1 text-[10px] text-white/55">Latest read: {b.reads[0] ? `${b.reads[0].card} · ${b.reads[0].confidence}% confidence` : "waiting for first card…"}</p>
                    </div></>
                : <div className="grid h-full place-items-center text-center"><div><VideoOff className="mx-auto h-8 w-8 text-white/25" /><p className="mt-2 text-xs font-bold text-white/40">Stream off air</p><p className="mt-1 text-[10px] text-white/30">Press Go live to start the demo broadcast.</p></div></div>}
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-[11px] text-white/55" aria-live="polite"><b className="text-amber-100">Director:</b> {b.note}</p>
        </section>

        {/* OCR shoe + chat */}
        <div className="space-y-4">
          <section className="rounded-3xl border border-white/12 bg-white/[.03] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-100"><ScanLine className="h-4 w-4" /> Shoe cam · OCR</h2>
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/55"><input type="checkbox" checked={autoOcr} onChange={(e) => setAutoOcr(e.target.checked)} className="accent-amber-300" /> Auto-scan</label>
            </div>
            <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto pr-1">
              {b.reads.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-3 text-center text-[11px] text-white/40">No card reads yet — go live and scan a card.</p>}
              {b.reads.map((r) => <div key={r.at + r.card} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <span className="text-lg font-black tracking-widest text-white">{r.card}</span>
                <span className="text-[10px] font-bold text-emerald-300">{r.confidence}%</span>
                <span className="font-mono text-[10px] text-white/40">{new Date(r.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              </div>)}
            </div>
            <button disabled={!b.live} onClick={() => update(pushOcrRead(b))} className="mt-3 w-full rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-amber-100 transition active:scale-95 disabled:opacity-40">Scan next card (demo)</button>
          </section>

          <section className="rounded-3xl border border-white/12 bg-white/[.03] p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-amber-100"><MessageSquareText className="h-4 w-4" /> Table chat · demo</h2>
            <div className="mt-3 max-h-36 space-y-1.5 overflow-y-auto pr-1">
              {b.chat.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-3 text-center text-[11px] text-white/40">Chat is quiet. Send a line as the studio.</p>}
              {b.chat.map((m) => <p key={m.at + m.text} className="rounded-xl bg-black/30 px-3 py-2 text-[11px] text-white/75"><b className="text-amber-100">{m.from}:</b> {m.text}</p>)}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }} placeholder="Message the table…" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-amber-300/60 focus:outline-none" />
              <button onClick={sendChat} aria-label="Send chat" className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-3 text-black active:scale-95"><Send className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
              <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Simulated table link — players see this on the felt</span>
              <button onClick={() => setMicOn((v) => !v)} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 font-bold uppercase tracking-wider">{micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}{micOn ? "Mic on" : "Muted"}</button>
            </div>
          </section>
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] leading-relaxed text-white/40">Demo studio panel — pre-launch simulation. No live video, no real dealers, no real players. Any live-dealer or live-draw format stays gated behind legal approval per the launch register.</p>
    </div>
  </div>;
}
