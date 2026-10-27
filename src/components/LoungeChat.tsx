// Lounge chat with safety controls. Off until the server switches it on. Players confirm they
// are 18 or over before their first message, and can report or block any message.
import { useEffect, useState } from "react";
import { accountToken } from "../lib/useAccount";

type ChatMessage = { id: string; authorId: string; authorName: string; text: string; at: number };

const headers = (json = false): Record<string, string> => {
  const token = accountToken();
  return { ...(json ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) };
};

const ERRORS: Record<string, string> = {
  chat_disabled: "Chat is not switched on yet.",
  not_signed_in: "Sign in to chat.",
  age_not_confirmed: "Confirm you are 18 or over to chat.",
  banned: "Your chat access has been suspended.",
  blocked_words: "That message breaks the house rules.",
  slow_down: "Slow down. Wait a moment before posting again.",
  too_long: "Keep messages under 200 characters.",
  empty_message: "Type a message first.",
};

export function LoungeChat() {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [off, setOff] = useState(false);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const [needsAge, setNeedsAge] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const load = () => {
    void fetch("/api/chat/messages", { headers: headers() })
      .then(async (r) => {
        if (r.status === 503) { setOff(true); return null; }
        return (await r.json()) as { messages: ChatMessage[] };
      })
      .then((data) => { if (data) setMessages(data.messages); })
      .catch(() => setNotice("Chat could not be loaded."));
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 4000);
    return () => window.clearInterval(id);
  }, []);

  const confirmAgeAndSend = async () => {
    const r = await fetch("/api/chat/age", { method: "POST", headers: headers(true), body: JSON.stringify({ over18: true }) });
    if (!r.ok) return setNotice("Age confirmation failed. Try again.");
    setNeedsAge(false);
    send();
  };

  const send = async () => {
    const r = await fetch("/api/chat/messages", { method: "POST", headers: headers(true), body: JSON.stringify({ text }) });
    const data = (await r.json()) as Record<string, unknown>;
    if (!r.ok) {
      const code = String(data.error ?? "");
      if (code === "age_not_confirmed") { setNeedsAge(true); return setNotice(""); }
      return setNotice(ERRORS[code] ?? "Message not sent.");
    }
    setText(""); setNotice(""); load();
  };

  const report = async (m: ChatMessage) => {
    const r = await fetch("/api/chat/report", { method: "POST", headers: headers(true), body: JSON.stringify({ messageId: m.id, reason: "Reported by player" }) });
    setNotice(r.ok ? "Thanks. A moderator will review it." : "The report could not be sent.");
  };

  const block = async (m: ChatMessage) => {
    await fetch("/api/chat/block", { method: "POST", headers: headers(true), body: JSON.stringify({ authorId: m.authorId }) });
    setNotice(`${m.authorName} is hidden for you.`);
    load();
  };

  if (off) return <div className="mt-8 text-center"><p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Lounge chat</p><p className="mx-auto mt-3 max-w-md text-sm text-white/60">Chat is not switched on yet.</p></div>;

  return <div className="mt-8 space-y-3">
    <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-200">Lounge chat · 18+ · be kind</p>
    <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-white/15 bg-black/40 p-3" aria-live="polite">
      {messages === null && <p className="text-sm text-white/50">Loading…</p>}
      {messages?.length === 0 && <p className="text-sm text-white/50">No messages yet.</p>}
      {messages?.map((m) => <div key={m.id} className="rounded-lg bg-white/5 p-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <b className="text-amber-100">{m.authorName}</b>
          <span className="flex gap-2 text-[10px] font-black uppercase tracking-wider">
            <button type="button" onClick={() => void report(m)} className="text-rose-200 underline">Report</button>
            <button type="button" onClick={() => void block(m)} className="text-white/60 underline">Block</button>
          </span>
        </div>
        <p className="mt-1 break-words text-white/80">{m.text}</p>
      </div>)}
    </div>
    {needsAge && <label className="flex items-start gap-2 rounded-lg border border-amber-200/30 bg-amber-300/10 p-3 text-xs text-amber-50">
      <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="mt-0.5" />
      <span>I confirm I am 18 or over. Chat is for adults only.</span>
    </label>}
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (needsAge) { if (ageConfirmed) void confirmAgeAndSend(); else setNotice("Tick the box to confirm your age."); } else void send(); }}>
      <input value={text} onChange={(e) => setText(e.target.value)} maxLength={200} aria-label="Message" placeholder="Say something kind" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm" />
      <button type="submit" disabled={!text.trim()} className="rounded-lg bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-wider text-black disabled:opacity-40">Send</button>
    </form>
    {notice && <p role="status" className="text-xs text-amber-100">{notice}</p>}
  </div>;
}
