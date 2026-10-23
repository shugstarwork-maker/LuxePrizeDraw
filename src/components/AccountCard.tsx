// Player account panel — free-play identity (sign up / sign in / sign out).
// Accounts protect league integrity and sync chips across devices. No cash value.
import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { useAccount } from "../lib/useAccount";

export function AccountCard({ chips }: { chips: number }) {
  const acct = useAccount();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try { if (mode === "signup") await acct.signup(email.trim(), password, name.trim()); else await acct.login(email.trim(), password); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-8 rounded-[1.75rem] border border-sky-200/25 bg-[linear-gradient(145deg,#081826,#060d12_70%)] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-sky-200">Your account · free-play identity</p>
          <p className="mt-1 text-xs text-white/55">One identity per player keeps the league fair — and carries your chips across devices.</p>
        </div>
        <UserRound className="h-5 w-5 shrink-0 text-sky-200/70" />
      </div>

      {acct.profile ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-sky-200/20 bg-black/30 p-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white/90">{acct.profile.name || acct.profile.email}</p>
            <p className="mt-0.5 font-mono text-[10px] text-sky-200/70">{acct.profile.id} · {acct.profile.chips.toLocaleString()} chips saved · {chips.toLocaleString()} on this device</p>
          </div>
          <button onClick={() => acct.logout()} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-black text-white/70 active:scale-[.97]"><LogOut className="h-3.5 w-3.5" />Sign out</button>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex gap-2">
            <button onClick={() => setMode("signin")} className={`flex-1 rounded-xl border px-3 py-2 text-[11px] font-black ${mode === "signin" ? "border-sky-300/50 bg-sky-300/15 text-sky-100" : "border-white/10 bg-white/5 text-white/50"}`}>Sign in</button>
            <button onClick={() => setMode("signup")} className={`flex-1 rounded-xl border px-3 py-2 text-[11px] font-black ${mode === "signup" ? "border-sky-300/50 bg-sky-300/15 text-sky-100" : "border-white/10 bg-white/5 text-white/50"}`}>Create account</button>
          </div>
          <div className="mt-3 space-y-2">
            {mode === "signup" && <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" autoComplete="nickname" className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30" />}
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" autoComplete="email" className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "signup" ? "Password (8+ characters)" : "Password"} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30" />
            <button onClick={() => void submit()} disabled={busy || !email.includes("@") || password.length < 8 || (mode === "signup" && !name.trim())} className="w-full rounded-xl bg-gradient-to-b from-sky-300 to-sky-500 px-4 py-2.5 text-sm font-black text-black shadow-lg disabled:opacity-40 active:scale-[.98]">{busy ? "One moment…" : mode === "signup" ? "Create free account" : "Sign in"}</button>
          </div>
          {acct.error && <p role="alert" className="mt-2 text-[11px] text-rose-200">{acct.error}</p>}
        </div>
      )}

      <p className="mt-3 text-[10px] text-white/35">Free-play account — your password is stored as a salted hash on this device. No deposits, no cash wagering, ever.</p>
    </div>
  );
}
